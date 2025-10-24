import PostForm from "@/app/dashboard/posts/form";
import { selectSessionViewer } from "@/lib/auth";
import { db } from "@/lib/database";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
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

  async function editPost(prevState: any, data: FormData) {
    "use server";
    if (!viewer)
      return { success: false, error: "Viewer must not be null when creating a post" };

    try {
      const title = data.get("title") as string;
      const slugValue = data.get("slug");
      const finalSlug = (slugValue && typeof slugValue === "string" && slugValue.trim())
        ? slugValue.trim()
        : slugify(title);

      await db
        .updateTable("posts")
        .set({
          title: title,
          description: data.get("description") as string,
          body: (data.get("body") as string) || "",
          published: Number(data.get("published")) || 0,
          publish_date: (data.get("publish_date") as string) || null,
          slug: finalSlug,
          // user_id: viewer.id,
        })
        .where("slug", "=", slug)
        .executeTakeFirstOrThrow();

      revalidatePath(`/posts/${slug}`);
      revalidatePath(`/dashboard/posts/${slug}`);
      revalidatePath(`/`);

      return { success: true };
    } catch (error) {
      console.error("Failed to update post:", error);
      return { success: false, error: "Failed to update post" };
    }
  }

  return <PostForm action={editPost} post={{ ...post, tags }} />;
}
