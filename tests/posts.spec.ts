import { slugify } from '../src/lib/utils'
import { test as base } from '../playwright.fixtures'

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

test("create posts", async ({ page }) => {
    await page.goto("/dashboard/posts/new");
    await page.waitForURL((url) =>
        url.toString().includes("/login?redirect=%2Fdashboard")
    );
    const email = `ncrmro@gmail.com`;
    await page.getByPlaceholder("email").fill(email);
    await page.getByPlaceholder("password").fill("password");
    await page.locator("button", { hasText: "Login" }).click();
    // Create a new post
    await page.waitForURL("/dashboard");
    await page.goto("/dashboard/posts/new");
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
    await page.waitForURL(`/dashboard/posts/${post.slug}`);
    await page.getByLabel("Body").fill("Hello World Edit");
    await page.locator("button", { hasText: "Submit" }).click();
    await page.waitForURL(`/dashboard/posts/${post.slug}`);
    // TODO reload is only needed here because nextjs cache invalidation doesn't work right now
    // https://github.com/vercel/next.js/issues/49387
    await page.reload();
    await page.locator("#body", { hasText: "Hello World Edit" }).waitFor();
});

test("edit post slug", async ({ page, post }) => {
    await page.goto(`/dashboard/posts/${post.slug}`);
    await page.locator("#slug").fill(`${post.slug}-edit`);
    await page.locator("button", { hasText: "Submit" }).click();
    await page.waitForURL(`/dashboard/posts/${post.slug}-edit`);
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
    await page.goto(`/dashboard/posts/${post.slug}`);
    const preClickCheckbox = await page.getByLabel("Published", { exact: true })
    test.expect(await preClickCheckbox.isChecked()).toBeFalsy()
    await preClickCheckbox.check()
    await page.locator("button", { hasText: "Submit" }).click();
    await page.waitForURL(`/dashboard/posts/${post.slug}`);
    const checkbox = await page.getByLabel("Published", { exact: true })
    test.expect(await checkbox.isChecked()).toBeTruthy()
    await page.goto(`/posts/${post.slug}`);
    await page.locator("span", { hasText: "Published" }).waitFor();
});

test("set post date", async ({page, post}) => {
    await page.goto(`/dashboard/posts/${post.slug}`);
    const date = await page.getByLabel("Date", { exact: true })
    test.expect(await date.inputValue()).toBe("")
    await date.fill("2003-12-17")
    await page.locator("button", { hasText: "Submit" }).click();
    await page.waitForURL(`/dashboard/posts/${post.slug}`);
    await page.goto(`/posts/${post.slug}`);
    await page.locator("December 17, 2023")
})

test("draft posts appear before published posts", async ({ page, db, viewer }) => {
    // Create a published post with an older date
    const publishedTitle = `Published Post ${Date.now()}`;
    const publishedPost = await db
        .insertInto("posts")
        .values({
            title: publishedTitle,
            user_id: viewer.id,
            slug: slugify(publishedTitle),
            body: "published",
            description: "published post",
            published: true,
            publish_date: "2024-01-01",
        })
        .returning(["id", "slug"])
        .executeTakeFirstOrThrow();

    // Create a draft post with a newer date
    const draftTitle = `Draft Post ${Date.now()}`;
    const draftPost = await db
        .insertInto("posts")
        .values({
            title: draftTitle,
            user_id: viewer.id,
            slug: slugify(draftTitle),
            body: "draft",
            description: "draft post",
            published: false,
            publish_date: "2024-12-01",
        })
        .returning(["id", "slug"])
        .executeTakeFirstOrThrow();

    // Go to dashboard posts page
    await page.goto("/dashboard/posts");

    // Get all post items
    const postItems = page.locator("ul[role='list'] li");
    const count = await postItems.count();
    
    // Find positions of our test posts
    let draftIndex = -1;
    let publishedIndex = -1;
    
    for (let i = 0; i < count; i++) {
        const item = postItems.nth(i);
        const text = await item.textContent();
        if (text?.includes(draftTitle)) {
            draftIndex = i;
        }
        if (text?.includes(publishedTitle)) {
            publishedIndex = i;
        }
    }
    
    // Verify draft appears before published
    test.expect(draftIndex).toBeGreaterThanOrEqual(0);
    test.expect(publishedIndex).toBeGreaterThanOrEqual(0);
    test.expect(draftIndex).toBeLessThan(publishedIndex);

    // Cleanup
    await db.deleteFrom("posts").where("id", "=", publishedPost.id).execute();
    await db.deleteFrom("posts").where("id", "=", draftPost.id).execute();
})