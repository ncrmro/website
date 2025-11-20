import PostForm from "@/app/dashboard/posts/form";
import { selectSessionViewer } from "@/lib/auth";
import { db } from "@/lib/database";
import * as schema from "@/lib/schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";
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

  const [postResult, tags] = await Promise.all([
    db
      .select({
        id: schema.posts.id,
        title: schema.posts.title,
        description: schema.posts.description,
        body: schema.posts.body,
        slug: schema.posts.slug,
        published: schema.posts.published,
        publish_date: schema.posts.publish_date,
      })
      .from(schema.posts)
      .where(eq(schema.posts.slug, slug))
      .limit(1),
    db
      .select({
        id: schema.tags.id,
        value: schema.tags.value,
      })
      .from(schema.tags)
      .innerJoin(schema.posts_tags, eq(schema.posts_tags.tag_id, schema.tags.id))
      .innerJoin(schema.posts, eq(schema.posts.id, schema.posts_tags.post_id))
      .where(eq(schema.posts.slug, slug)),
  ]);

  const post = postResult[0];
  if (!post) {
    redirect("/dashboard/posts");
  }

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
        .update(schema.posts)
        .set({
          title: title,
          description: data.get("description") as string,
          body: (data.get("body") as string) || "",
          published: Number(data.get("published")) === 1,
          publish_date: (data.get("publish_date") as string) || null,
          slug: finalSlug,
        })
        .where(eq(schema.posts.slug, slug));

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
