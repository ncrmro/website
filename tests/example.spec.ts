import { test } from "../playwright.fixtures";

test("login page", async ({ page }) => {
  const email = `ncrmro@gmail.com`;
  await page.goto("/login");
  await page.getByPlaceholder("email").fill(email);
  await page.getByPlaceholder("password").fill("password");
  await page.locator("button", { hasText: "Login" }).click();
  await page.waitForURL("/dashboard");
});
