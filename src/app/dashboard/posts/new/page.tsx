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
  if (typeof title !== "string" || !title) {
    return { success: false, error: "Title is required" };
  }

  try {
    const post = await db
      .insertInto("posts")
      .values({
        title: data.get("title") as string,
        description: data.get("description") as string,
        body: data.get("body") as string,
        published: Number(data.get("published")) || 0,
        user_id: viewer.id,
        slug: slugify(title),
      })
      .returning(["title", "slug", "published"])
      .executeTakeFirstOrThrow();

    if (data.get("published")) {
      redirect(`/posts/${post.slug}`);
    } else {
      redirect(`/dashboard/posts/${post.slug}`);
    }
  } catch (error) {
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
