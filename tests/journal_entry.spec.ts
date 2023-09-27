import { test } from "../playwright.fixtures";

test("create journal entry", async ({ page, viewer }) => {
  await page.goto("/dashboard");
  await page.locator("a", { hasText: "Journal" }).click();
  await page.getByLabel("Today").fill("Hello World");
  await page.locator("button", { hasText: "Submit" }).click();
  await page.goto("/dashboard/journal");
  await page.locator("#body", { hasText: "Hello World" });
});
