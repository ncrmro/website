import { db } from "./src/lib/database";
import { Passwords } from "./src/lib/auth";
import { test as base } from "@playwright/test";
import { Database, users, sessions, journalEntries, journalEntryHistory } from "./src/database";
import { eq } from "drizzle-orm";

export { expect } from "@playwright/test";

type TestFixtures = {
  db: Database;
  viewer: { id: string; email: string; username: string | null };
};

export const test = base.extend<TestFixtures>({
  async db({}, use) {
    await use(db);
  },
  viewer: async ({ db, context, page }, use, testInfo) => {
    const time = Date.now();
    const username = `user${testInfo.workerIndex}${time}`;
    const email = `${username}@test.com`;
    const password = "password";
    
    // Generate UUIDs manually since libsql doesn't have uuid() function by default
    const { randomUUID } = await import("crypto");
    const userId = randomUUID();
    
    // Create user in database
    const [user] = await db
      .insert(users)
      .values({ id: userId, email, password: await Passwords.hash(password) })
      .returning({ id: users.id, email: users.email, username: users.username });
    
    // Sign in through NextAuth UI with callback URL to dashboard
    await page.goto("/api/auth/signin?callbackUrl=/dashboard");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in with Password" }).click();
    
    // Wait for sign-in to complete (either dashboard or home page is fine)
    await page.waitForURL((url) => url.pathname === "/dashboard" || url.pathname === "/", { timeout: 10000 });
    
    await use(user);
    
    // Cleanup
    await db.delete(sessions).where(eq(sessions.userId, user.id));
    await db.delete(journalEntryHistory);
    await db.delete(journalEntries).where(eq(journalEntries.userId, user.id));
    await db.delete(users).where(eq(users.id, user.id));
  },
});
