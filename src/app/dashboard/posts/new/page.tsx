import { db } from "@/lib/database";
import { selectSessionViewer, selectViewer } from "@/lib/auth";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";
import PostForm from "@/app/dashboard/posts/form";

// Would be good to debounce and check the title for uniqueness

async function createPost(prevState: any, data: FormData) {
  "use server";
  const viewer = await selectSessionViewer();
  if (!viewer) {
    return { success: false, error: "Viewer must not be null when creating a post" };
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

    const post = await db
      .insertInto("posts")
      .values({
        title: title.trim(),
        description: description.trim(),
        body: (data.get("body") as string) || "",
        published: Number(data.get("published")) || 0,
        user_id: viewer.id,
        slug: finalSlug,
      })
      .returning(["title", "slug", "published"])
      .executeTakeFirstOrThrow();

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
  const viewer = await selectViewer();
  if (!viewer)
    redirect(
      `/login?${new URLSearchParams({
        redirect: "/posts/new",
      }).toString()}`
    );
  return <PostForm action={createPost} />;
}
