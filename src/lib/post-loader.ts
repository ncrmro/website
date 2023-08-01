import { db, sql, sqlite } from "./database";
import {
  getDocumentBySlug,
  getDocumentSlugs,
  getDocuments,
} from "@quiescent/server";

async function main() {
  const user = await db
    .selectFrom("users")
    .select(["id"])
    .where("username", "=", "ncrmro")
    .executeTakeFirstOrThrow();
  const docs = await getDocuments("posts", "dynamic");
  const tags = new Map<string, string>();
  for (const doc of docs) {
    console.log("inserting post", doc.slug);
    const post = await db
      .insertInto("posts")
      .values({
        user_id: user.id,
        title: doc.title,
        body: doc.content,
        slug: doc.slug,
      })
      .returning(["id"])
      .executeTakeFirstOrThrow();

    if (doc.tags) {
      console.log("inserting tags", doc.tags);
      for (const tag of doc.tags) {
        if (!tags.has(tag)) {
          const tagRow = await db
            .insertInto("tags")
            .values({
              value: tag,
            })
            .returning(["id"])
            .executeTakeFirstOrThrow();
          tags.set(tag, tagRow.id);
        }
      }
      console.log("linking post tags");
      await db
        .insertInto("posts_tags")
        .values(
          doc.tags.map((tag) => ({
            tag_id: tags.get(tag)!,
            post_id: post.id,
          }))
        )
        .onConflict((oc) => oc.doNothing())
        .execute();
    }
  }
  await db.destroy();
}

main();
