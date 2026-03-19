import { test, expect } from "@playwright/test";

test("home page shows published posts list", async ({ page }) => {
  await page.goto("/");
  // The posts list should be visible
  const postsList = page.locator("ul[role='list']");
  await expect(postsList).toBeVisible();
  // Should have at least one post item
  const items = postsList.locator("li");
  await expect(items.first()).toBeVisible();
});

test("posts page shows published posts list", async ({ page }) => {
  await page.goto("/posts");
  const postsList = page.locator("ul[role='list']");
  await expect(postsList).toBeVisible();
  const items = postsList.locator("li");
  await expect(items.first()).toBeVisible();
});

test("individual post page renders content", async ({ page }) => {
  // Use a known published post slug
  await page.goto("/posts/new-site-stack");
  await expect(page.locator("h1#message-heading")).toBeVisible();
  await expect(page.locator("#post-body")).toBeVisible();
});

test("dashboard route does not exist", async ({ page }) => {
  const response = await page.goto("/dashboard");
  // Should be a 404 since the dashboard has been removed
  expect(response?.status()).toBe(404);
});
