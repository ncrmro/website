import { test } from "../playwright.fixtures";

test("contacts page requires auth", async ({ page }) => {
    await page.goto("/dashboard/contacts");
    await page.waitForURL((url) =>
        url.toString().includes("/login?redirect=%2Fdashboard")
    );
});

test("create new contact page", async ({page})=> {
    await page.goto("/dashboard/contacts/new");

})
