import { db } from "./src/lib/database";
import { Passwords } from "./src/lib/auth";
import { test as base } from "@playwright/test";
import { Kysely } from "kysely";
import { DB } from "kysely-codegen";

export { expect } from "@playwright/test";

type TestFixtures = {
  db: Kysely<DB>;
  viewer: { id: string; email: string; username: string | null };
};

export const test = base.extend<TestFixtures>({
  async db({}, use) {
    await use(db);
  },
  viewer: async ({ db, context }, use, testInfo) => {
    const time = Date.now();
    const username = `user${testInfo.workerIndex}${time}`;
    const email = `${username}@test.com`;
    const password = "password";
    const user = await db
      .insertInto("users")
      .values({ email, password: await Passwords.hash(password) })
      .returning(["id", "email", "username"])
      .executeTakeFirstOrThrow();
    const session = await db
      .insertInto("sessions")
      .values({ user_id: user.id })
      .returning("id")
      .executeTakeFirstOrThrow();
    // TODO look at how supabase issues cookies...
    await context.addCookies([
      {
        name: "viewer_session",
        value: session.id,
        domain: "localhost",
        path: "/",
      },
    ]);
    await use(user);
    await db.deleteFrom("sessions").where("user_id", "=", user.id).execute();
    // TODO don't nuke entire history, delete plus join didn't work
    await db.deleteFrom("journal_entry_history").execute();
    await db
      .deleteFrom("journal_entries")
      .where("user_id", "=", user.id)
      .execute();
    await db.deleteFrom("users").where("id", "=", user.id).execute();
  },
});
