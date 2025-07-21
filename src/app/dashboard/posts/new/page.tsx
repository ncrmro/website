import { db } from "@/lib/database";
import { selectSessionViewer, selectViewer } from "@/lib/auth";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";
import PostForm from "@/app/dashboard/posts/form";

// Would be good to debounce and check the title for uniqueness

async function createPost(data: FormData) {
  "use server";
  const viewer = await selectSessionViewer();
  if (!viewer) throw new Error("Viewer must not be null when creating a post");
  const title = data.get("title");
  if (typeof title !== "string") throw new Error("Title must be a string");

  const post = await db
    .insertInto("posts")
    .values({
      title: data.get("title") as string,
      description: data.get("description") as string,
      body: data.get("body") as string,
      published: data.get("published") ? 1 : 0,
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
