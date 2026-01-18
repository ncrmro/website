import PostForm from "@/app/dashboard/posts/form";
import { auth } from "@/app/auth";
import { db, posts, tags, postsTags } from "@/database";
import { eq } from "drizzle-orm";
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
  const session = await auth();
  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=/dashboard/posts/${slug}`);
  }

  const [postResult, tagsResult] = await Promise.all([
    db
      .select({
        id: posts.id,
        title: posts.title,
        description: posts.description,
        body: posts.body,
        slug: posts.slug,
        published: posts.published,
        publishDate: posts.publishDate,
      })
      .from(posts)
      .where(eq(posts.slug, slug)),
    db
      .selectDistinct({
        id: tags.id,
        value: tags.value,
      })
      .from(tags)
      .innerJoin(postsTags, eq(postsTags.tagId, tags.id))
      .innerJoin(posts, eq(posts.id, postsTags.postId))
      .where(eq(posts.slug, slug)),
  ]);

  const post = postResult[0];
  if (!post) {
    redirect("/dashboard/posts");
  }

  async function editPost(prevState: any, data: FormData) {
    "use server";
    const currentSession = await auth();
    if (!currentSession?.user)
      return { success: false, error: "Viewer must not be null when creating a post" };

    // Check if user has admin privileges
    if (!currentSession.user.admin) {
      return { success: false, error: "Only admin users can edit posts" };
    }

    try {
      const title = data.get("title") as string;
      const slugValue = data.get("slug");
      const finalSlug = (slugValue && typeof slugValue === "string" && slugValue.trim())
        ? slugValue.trim()
        : slugify(title);

      await db
        .update(posts)
        .set({
          title: title,
          description: data.get("description") as string,
          body: (data.get("body") as string) || "",
          published: Boolean(Number(data.get("published"))),
          publishDate: (data.get("publish_date") as string) || null,
          slug: finalSlug,
        })
        .where(eq(posts.slug, slug));

      revalidatePath(`/posts/${slug}`);
      revalidatePath(`/dashboard/posts/${slug}`);
      revalidatePath(`/`);

      return { success: true };
    } catch (error) {
      console.error("Failed to update post:", error);
      return { success: false, error: "Failed to update post" };
    }
  }

  return <PostForm action={editPost} post={{ ...post, tags: tagsResult }} />;
}
