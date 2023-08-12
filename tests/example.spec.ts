import { db } from "../src/lib/database";
import { slugify } from "../src/lib/utils";
import { test } from "@playwright/test";

test("login page", async ({ page }) => {
  page.on("console", console.log);
  const email = `jdoe@example.com`;
  await page.goto("/login");
  await page.getByPlaceholder("email").fill(email);
  await page.getByPlaceholder("password").fill("password");
  await page.locator("button", { hasText: "Login" }).click();
  await page.waitForURL("/dashboard");
});

test("sign up page", async ({ page }) => {
  page.on("console", console.log);
  const time = Date.now();
  const username = `user${time}`;
  const email = `${username}@test.com`;
  await page.goto("/signup");
  await page.getByPlaceholder("email").fill(email);
  await page.getByPlaceholder("password").fill("testpassword");
  await page.locator("button", { hasText: "Submit" }).click();
  await page.waitForURL("/dashboard");
});

test("create posts", async ({ page }) => {
  page.on("console", console.log);
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
  // Edit the post
  await page.locator("#menu-actions-button").click();
  await page.locator("a", { hasText: "Edit" }).click();
  await page.waitForURL(/\/posts\/hello-world-\d*\/edit/);
  await page.getByLabel("Body").fill("Hello World Edit");
  await page.locator("button", { hasText: "Submit" }).click();
  await page.waitForURL(/\/posts\/hello-world-\d*/);
  await page.locator("#post-body", { hasText: "Hello World Edit" }).waitFor();
});

test("draft posts are not viewable by anonymous users", async ({ page }) => {
  const title = `Hello World Draft ${Date.now()}`;
  const user = await db
    .selectFrom("users")
    .where("email", "=", "jdoe@example.com")
    .select(["id"])
    .executeTakeFirstOrThrow();
  const post = await db
    .insertInto("posts")
    .values({
      title,
      user_id: user.id,
      slug: slugify(title),
      body: "test",
      description: "",
    })
    .returning("slug")
    .executeTakeFirstOrThrow();
  await page.goto(`/posts/${post.slug}`);
  await page.locator("h1", { hasText: "404" }).waitFor();
});
