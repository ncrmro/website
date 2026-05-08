import { expect, test } from "@playwright/test";

test("home page renders published posts", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("#navbar")).toContainText("Posts");
  await expect(page.getByRole("link", { name: "New site stack" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Hello World - 2019" }),
  ).toHaveCount(0);
});

test("post detail renders migrated markdown and media", async ({ page }) => {
  await page.goto("/posts/writing-a-gear-torque-calculator");

  await expect(
    page.getByRole("heading", { name: "Writing a gear torque calculator" }),
  ).toBeVisible();
  await expect(page.locator("#post-body")).toContainText("NEMA Motors");
  await expect(page.locator("#post-body img")).toHaveAttribute(
    "src",
    /https:\/\/r2\.ncrmro\.com\/uploads\/posts\/[0-9a-f-]+\/gear_in_opencad\.png/,
  );
});

test("post detail falls back to local media when R2 asset is missing", async ({ page }) => {
  await page.goto("/posts/apollo-cache-overview");

  await expect(page.getByRole("heading", { name: "Apollo Cache Overview" })).toBeVisible();
  await expect(page.locator("#post-body img")).toHaveAttribute(
    "src",
    "/posts/apollo-cache-overview/media/mutation_example.gif",
  );
});

test("draft posts return 404", async ({ page }) => {
  const response = await page.goto("/posts/hello-world-2019");

  expect(response?.status()).toBe(404);
});

test("resume page renders markdown-backed jobs", async ({ page }) => {
  await page.goto("/resume");

  await expect(page.getByRole("heading", { name: "Platform Engineer" })).toBeVisible();
  await expect(page.getByText("Merck")).toBeVisible();
  await expect(page.getByRole("link", { name: "Backstage" }).first()).toBeVisible();
});
