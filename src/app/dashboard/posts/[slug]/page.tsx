import PostForm from "@/app/dashboard/posts/form";
import { selectSessionViewer } from "@/lib/auth";
import { db } from "@/lib/database";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
export const dynamicParams = true;

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const viewer = await selectSessionViewer();
  if (!viewer)
    redirect(
      `/login?${new URLSearchParams({
        redirect: `/posts/${slug}/edit`,
      }).toString()}`
    );
  // Kysely has a better function to aggregate sub query but sqlite version wasn't exported?
  // https://github.com/kysely-org/kysely/issues/628
  const [post, tags] = await Promise.all([
    db
      .selectFrom("posts")
      .select([
        "id",
        "title",
        "description",
        "body",
        "slug",
        "published",
        "publish_date",
      ])
      .where("slug", "=", slug)
      .executeTakeFirstOrThrow(),
    db
      .selectFrom("tags")
      .select(["tags.id", "tags.value"])
      .innerJoin("posts_tags", "posts_tags.tag_id", "tags.id")
      .innerJoin("posts", "posts.id", "posts_tags.post_id")
      .where("posts.slug", "=", slug)
      .distinct()
      .execute(),
  ]);

  async function editPost(data: FormData) {
    "use server";
    if (!viewer)
      throw new Error("Viewer must not be null when creating a post");

    data.forEach(console.log);

    const updatedPost = await db
      .updateTable("posts")
      .set({
        title: data.get("title") as string,
        description: data.get("description") as string,
        body: data.get("body") as string,
        published: data.get("published") ? 1 : 0,
        publish_date: data.get("publish_date") as string,
        slug: data.get("slug") as string,
        // user_id: viewer.id,
      })
      .where("slug", "=", slug)
      .returning(["slug"])
      .executeTakeFirstOrThrow();
    // TODO this revalidate is not working
    // https://github.com/vercel/next.js/issues/49387
    revalidatePath(`/posts/[slug]`);
    revalidatePath(`/dashboard/posts/[slug]`);
    revalidatePath(`/`);
    redirect(`/dashboard/posts/${updatedPost.slug}`);
  }

  return <PostForm action={editPost} post={{ ...post, tags }} />;
}
