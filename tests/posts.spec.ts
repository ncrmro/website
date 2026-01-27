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
    await page.getByLabel("Description").fill("Test description");
    await page.locator("button", { hasText: "Save" }).click();
    // Should redirect to edit page after creation
    await page.waitForURL(/\/dashboard\/posts\/hello-world-\d*/);
    await page.locator("span", { hasText: "Draft" });
});

test("edit post body from post page", async ({ page, post }) => {
    await page.goto(`/posts/${post.slug}`);
    await page.locator("#menu-actions-button").click();
    await page.locator("a", { hasText: "Edit" }).click();
    await page.waitForURL(`/dashboard/posts/${post.slug}`);
    await page.getByLabel("Body").fill("Hello World Edit");
    await page.locator("button", { hasText: "Update" }).click();
    await page.waitForURL(`/dashboard/posts/${post.slug}`);
    // TODO reload is only needed here because nextjs cache invalidation doesn't work right now
    // https://github.com/vercel/next.js/issues/49387
    await page.reload();
    await page.locator("#body", { hasText: "Hello World Edit" }).waitFor();
});

test("edit post slug", async ({ page, post }) => {
    await page.goto(`/dashboard/posts/${post.slug}`);
    
    // Expand metadata section to access slug field
    const editDetailsButton = page.locator("button", { hasText: "Edit Details" });
    if (await editDetailsButton.isVisible()) {
        await editDetailsButton.click();
    }
    
    await page.locator("#slug").fill(`${post.slug}-edit`);
    await page.locator("button", { hasText: "Update" }).click();
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
    await page.locator("button", { hasText: "Update" }).click();
    await page.waitForURL(`/dashboard/posts/${post.slug}`);
    const checkbox = await page.getByLabel("Published", { exact: true })
    test.expect(await checkbox.isChecked()).toBeTruthy()
    await page.goto(`/posts/${post.slug}`);
    await page.locator("span", { hasText: "Published" }).waitFor();
});

test("set post date", async ({page, post}) => {
    await page.goto(`/dashboard/posts/${post.slug}`);
    
    // Expand metadata section to access date field
    const editDetailsButton = page.locator("button", { hasText: "Edit Details" });
    if (await editDetailsButton.isVisible()) {
        await editDetailsButton.click();
    }
    
    const date = await page.getByLabel("Publish Date", { exact: true })
    test.expect(await date.inputValue()).toBe("")
    await date.fill("2023-12-17")
    await page.locator("button", { hasText: "Update" }).click();
    await page.waitForURL(`/dashboard/posts/${post.slug}`);
    await page.goto(`/posts/${post.slug}`);
    await page.locator("text=December 17, 2023").waitFor();
})

test("save new post with required fields", async ({ page }) => {
    await page.goto("/dashboard/posts/new");
    
    // Fill in required fields
    const postTitle = `Test Post Save ${Date.now()}`;
    await page.getByLabel("Title").fill(postTitle);
    await page.getByLabel("Description").fill("This is a test post description");
    
    // Verify unsaved indicator is showing
    await page.locator("span", { hasText: "Unsaved" }).waitFor();
    
    // Click save button
    await page.locator("button", { hasText: "Save" }).click();
    
    // Should redirect to edit page after successful save
    const expectedSlug = slugify(postTitle);
    await page.waitForURL(`/dashboard/posts/${expectedSlug}`);
    
    // Verify saved indicator appears
    await page.locator("span", { hasText: "Saved" }).waitFor({ timeout: 5000 });
});

test("save existing post shows success feedback", async ({ page, post }) => {
    await page.goto(`/dashboard/posts/${post.slug}`);
    
    // Make a change to the body
    await page.getByLabel("Body").fill("Updated content for testing save");
    
    // Verify unsaved changes indicator appears
    await page.locator("span", { hasText: "Unsaved" }).waitFor();
    
    // Save the changes
    await page.locator("button", { hasText: "Update" }).click();
    
    // Stay on the same page after save
    await page.waitForURL(`/dashboard/posts/${post.slug}`);
    
    // Verify saved indicator appears
    await page.locator("span", { hasText: "Saved" }).waitFor({ timeout: 5000 });
    
    // Verify the content was actually saved by reloading
    await page.reload();
    const bodyContent = await page.getByLabel("Body").inputValue();
    test.expect(bodyContent).toBe("Updated content for testing save");
});

test("save post validates required fields", async ({ page }) => {
    await page.goto("/dashboard/posts/new");
    
    // Try to submit without filling required fields
    await page.locator("button", { hasText: "Save" }).click();
    
    // Should show validation error and stay on same page
    await page.locator("text=Title is required").waitFor({ timeout: 3000 });
    
    // URL should not change (still on new post page)
    test.expect(page.url()).toContain("/dashboard/posts/new");
});

test("save post with all metadata fields", async ({ page, post }) => {
    await page.goto(`/dashboard/posts/${post.slug}`);
    
    // Expand metadata section if collapsed
    const editDetailsButton = page.locator("button", { hasText: "Edit Details" });
    if (await editDetailsButton.isVisible()) {
        await editDetailsButton.click();
    }
    
    // Update all metadata fields
    await page.getByLabel("Title").fill("Updated Title Test");
    await page.getByLabel("Description").fill("Updated description");
    await page.getByLabel("Slug").fill("updated-slug-test");
    await page.getByLabel("Publish Date").fill("2024-01-15");
    
    // Update body content
    await page.getByLabel("Body").fill("Updated body content");
    
    // Save the post
    await page.locator("button", { hasText: "Update" }).click();
    
    // Should redirect to new slug
    await page.waitForURL("/dashboard/posts/updated-slug-test");
    
    // Verify saved indicator
    await page.locator("span", { hasText: "Saved" }).waitFor({ timeout: 5000 });
    
    // Reload and verify all fields persisted
    await page.reload();
    
    // Expand metadata to check fields
    const editDetailsBtn = page.locator("button", { hasText: "Edit Details" });
    if (await editDetailsBtn.isVisible()) {
        await editDetailsBtn.click();
    }
    
    test.expect(await page.getByLabel("Title").inputValue()).toBe("Updated Title Test");
    test.expect(await page.getByLabel("Description").inputValue()).toBe("Updated description");
    test.expect(await page.getByLabel("Slug").inputValue()).toBe("updated-slug-test");
    test.expect(await page.getByLabel("Publish Date").inputValue()).toBe("2024-01-15");
    test.expect(await page.getByLabel("Body").inputValue()).toBe("Updated body content");
});

test("preview tab shows rendered markdown", async ({ page, post }) => {
    await page.goto(`/dashboard/posts/${post.slug}`);
    
    // Add markdown content to the body
    const markdownContent = "## Test Heading\n\nThis is a test paragraph with **bold** text.";
    await page.getByLabel("Body").fill(markdownContent);
    
    // Click the Preview tab - the serialization will happen when the tab is clicked
    await page.locator("#post-edit-tab-preview").click();
    
    // Wait for the preview panel to be active
    await page.waitForURL(`/dashboard/posts/${post.slug}?preview=1`);
    
    // Verify the preview panel is displayed
    await page.locator("#post-edit-panel-preview").waitFor({ state: "visible" });
    
    // Verify rendered content appears (check for the heading and bold text)
    // The serialization should have completed by the time the preview panel is visible
    await page.locator("#post-body h2", { hasText: "Test Heading" }).waitFor();
    await page.locator("#post-body strong", { hasText: "bold" }).waitFor();
});