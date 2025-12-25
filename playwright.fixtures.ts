import { db } from "./src/lib/database";
import { Passwords } from "./src/lib/auth";
import { test as base } from "@playwright/test";
import { Database, users, sessions, journalEntries, journalEntryHistory, posts } from "@/database";
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
    
    // Generate UUID manually because the libsql client in tests doesn't have a uuid() SQL function registered
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
    
    // Wait for sign-in to complete and verify we landed on the dashboard
    await page.waitForURL((url) => url.pathname === "/dashboard", { timeout: 10000 });
    
    await use(user);
    
    // Cleanup - delete in order to respect foreign key constraints
    await db.delete(sessions).where(eq(sessions.userId, user.id));
    
    // Delete journal entry history for this user's entries
    const userJournalEntries = await db
      .select({ id: journalEntries.id })
      .from(journalEntries)
      .where(eq(journalEntries.userId, user.id));
    
    for (const entry of userJournalEntries) {
      await db.delete(journalEntryHistory).where(eq(journalEntryHistory.journalEntryId, entry.id));
    }
    
    await db.delete(journalEntries).where(eq(journalEntries.userId, user.id));
    await db.delete(posts).where(eq(posts.userId, user.id));
    await db.delete(users).where(eq(users.id, user.id));
  },
});
