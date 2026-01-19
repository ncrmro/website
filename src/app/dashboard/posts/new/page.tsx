import { db, posts, getResultArray } from "@/database";
import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";
import PostForm from "@/app/dashboard/posts/form";

// Would be good to debounce and check the title for uniqueness

async function createPost(prevState: any, data: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Viewer must not be null when creating a post" };
  }

  // Check if user has admin privileges
  if (!session.user.admin) {
    return { success: false, error: "Only admin users can create posts" };
  }

  const title = data.get("title");
  if (typeof title !== "string" || !title.trim()) {
    return { success: false, error: "Title is required" };
  }

  const description = data.get("description");
  if (typeof description !== "string" || !description.trim()) {
    return { success: false, error: "Description is required" };
  }

  try {
    const slugValue = data.get("slug");
    const finalSlug = (slugValue && typeof slugValue === "string" && slugValue.trim())
      ? slugValue.trim()
      : slugify(title);

    const result = await db
      .insert(posts)
      .values({
        title: title.trim(),
        description: description.trim(),
        body: (data.get("body") as string) || "",
        published: Boolean(Number(data.get("published"))),
        publishDate: (data.get("publish_date") as string) || null,
        userId: session.user.id,
        slug: finalSlug,
      })
      .returning({
        title: posts.title,
        slug: posts.slug,
        published: posts.published,
      });

    const postRows = getResultArray(result);
    const post = postRows[0];
    if (!post) throw new Error("Failed to create post");

    redirect(`/dashboard/posts/${post.slug}`);
  } catch (error) {
    // Re-throw redirect errors - they're not actual errors
    // Next.js redirects work by throwing errors with a special digest
    if (error && typeof error === "object" && "digest" in error &&
        typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Failed to create post:", error);
    return { success: false, error: "Failed to create post" };
  }
}

export default async function CreatePost() {
  const session = await auth();
  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=/dashboard/posts/new`);
  }
  return <PostForm action={createPost} />;
}
