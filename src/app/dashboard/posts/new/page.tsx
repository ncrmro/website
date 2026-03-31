import { db, posts, getResultArray } from "@/database";
import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";
import PostForm from "@/app/dashboard/posts/form";
import { randomUUID } from "crypto";

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

    const isPublished = Boolean(Number(data.get("published")));
    const providedPublishDate = (data.get("publish_date") as string) || null;
    
    // Auto-set publish date if publishing and no date provided
    const publishDate = isPublished && !providedPublishDate
      ? new Date().toISOString().split('T')[0]
      : providedPublishDate;

    const result = await db
      .insert(posts)
      .values({
        id: randomUUID(),
        title: title.trim(),
        description: description.trim(),
        body: (data.get("body") as string) || "",
        published: isPublished,
        publishDate: publishDate,
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

    return { success: true, slug: post.slug };
  } catch (error) {
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
