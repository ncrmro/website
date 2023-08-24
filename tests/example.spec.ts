import { slugify } from "../src/lib/utils";
import { test as base } from "../playwright.fixtures";

export const test = base.extend<{ post: { slug: string } }>({
  async post({ db, viewer }, use, { workerIndex }) {
    const title = `Hello World Draft ${workerIndex} ${Date.now()}`;
    const post = await db
      .insertInto("posts")
      .values({
        title,
        user_id: viewer.id,
        slug: slugify(title),
        body: "test",
        description: "",
      })
      .returning(["id", "slug"])
      .executeTakeFirstOrThrow();
    await use(post);
    await db.deleteFrom("posts").where("id", "=", post.id).execute();
  },
});
test("login page", async ({ page }) => {
  const email = `jdoe@example.com`;
  await page.goto("/login");
  await page.getByPlaceholder("email").fill(email);
  await page.getByPlaceholder("password").fill("password");
  await page.locator("button", { hasText: "Login" }).click();
  await page.waitForURL("/dashboard");
});

test("create posts", async ({ page }) => {
  await page.goto("/posts/new");
  await page.waitForURL((url) =>
    url.toString().includes("/login?redirect=%2Fposts%2Fnew")
  );
  const email = `jdoe@example.com`;
  await page.getByPlaceholder("email").fill(email);
  await page.getByPlaceholder("password").fill("password");
  await page.locator("button", { hasText: "Login" }).click();
  // Create a new post
  await page.waitForURL("/posts/new");
  const postTitle = `Hello World ${Date.now()}`;
  await page.getByLabel("Title").fill(postTitle);
  await page.getByLabel("Body").fill("Hello World");
  await page.locator("button", { hasText: "Submit" }).click();
  await page.waitForURL(/\/posts\/hello-world-\d*/);
  await page.locator("span", { hasText: "Draft" });
});

test("edit post body from post page", async ({ page, post }) => {
  await page.goto(`/posts/${post.slug}`);
  await page.locator("#menu-actions-button").click();
  await page.locator("a", { hasText: "Edit" }).click();
  await page.waitForURL(`/posts/${post.slug}/edit`);
  await page.getByLabel("Body").fill("Hello World Edit");
  await page.locator("button", { hasText: "Submit" }).click();
  await page.waitForURL(`/posts/${post.slug}`);
  // TODO reload is only needed here because nextjs cache invalidation doesn't work right now
  // https://github.com/vercel/next.js/issues/49387
  await page.reload();
  await page.locator("#post-body", { hasText: "Hello World Edit" }).waitFor();
});

test("edit post slug", async ({ page, post }) => {
  await page.goto(`/posts/${post.slug}/edit`);
  await page.locator("#slug").fill(`${post.slug}-edit`);
  await page.locator("button", { hasText: "Submit" }).click();
  await page.waitForURL(`/posts/${post.slug}-edit`);
});

test("draft posts are not viewable by anonymous users", async ({
  page,
  post,
  context,
}) => {
  // Log user out
  await context.clearCookies();
  await page.goto(`/posts/${post.slug}`);
  await page.locator("h1", { hasText: "404" }).waitFor();
});

test("publish posts", async ({ page, post, context }) => {
  await page.goto(`/posts/${post.slug}/edit`);
  await page.getByLabel("Published", { exact: true }).click();
  await page.locator("button", { hasText: "Submit" }).click();
  await page.waitForURL(`/posts/${post.slug}`);
  await page.locator("span", { hasText: "Published" }).waitFor();
});
