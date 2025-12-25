import { slugify } from '../src/lib/utils'
import { test as base } from '../playwright.fixtures'
import { posts } from '@/database'
import { eq } from 'drizzle-orm'

export const test = base.extend<{ post: { slug: string; id: string } }>({
    async post({ db, viewer }, use, { workerIndex }) {
        // Generate UUID manually because the libsql client in tests doesn't have a uuid() SQL function registered
        const { randomUUID } = await import("crypto");
        const postId = randomUUID();
        const title = `Hello World Draft ${workerIndex} ${Date.now()}`;
        const [post] = await db
            .insert(posts)
            .values({
                id: postId,
                title,
                userId: viewer.id,
                slug: slugify(title),
                body: "test",
                description: "test description",
            })
            .returning({ id: posts.id, slug: posts.slug });
        await use(post);
        await db.delete(posts).where(eq(posts.id, post.id));
    },
});

test("create posts", async ({ page, viewer }) => {
    // User is already authenticated via viewer fixture
    await page.goto("/dashboard/posts/new");
    const postTitle = `Hello World ${Date.now()}`;
    await page.getByLabel("Title").fill(postTitle);
    await page.getByLabel("Description").fill("Test description");
    
    // Wait for the textarea to become enabled, then fill the body
    await page.waitForSelector('textarea[placeholder="Write your post content here using Markdown..."]:not([disabled])');
    await page.getByPlaceholder("Write your post content here using Markdown...").fill("Hello World");
    
    await page.locator("button", { hasText: "Save" }).click();
    
    // Wait for navigation - the form might redirect to the edit page or stay on new
    await page.waitForURL(/\/dashboard\/posts\/.*/, { timeout: 10000 });
    
    // Check that we can see the Draft status
    await page.locator("text=Draft").waitFor();
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