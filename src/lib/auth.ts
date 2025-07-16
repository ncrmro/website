import { scrypt, randomBytes, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";
// Keep this as local import rather than alias as playwirght doesn't know about aliases
import { db } from "./database";
import { cookies } from "next/headers";

export namespace Passwords {
  // scrypt is callback based so with promisify we can await it
  const scryptAsync = promisify(scrypt);

  export async function hash(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  export async function compare(
    storedPassword: string,
    suppliedPassword: string
  ): Promise<boolean> {
    // split() returns array
    const [hashedPassword, salt] = storedPassword.split(".");
    // we need to pass buffer values to timingSafeEqual
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    // we hash the new sign-in password
    const suppliedPasswordBuf = (await scryptAsync(
      suppliedPassword,
      salt,
      64
    )) as Buffer;
    // compare the new supplied password with the stored hashed password
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  }
}

export async function handleSession(userId: string, timezone: string) {
  const session = await db
    .insertInto("sessions")
    .values({ user_id: userId })
    .returning("id")
    .executeTakeFirstOrThrow();
  const cookieStore = await cookies();
  cookieStore.set({
    name: "viewer_session",
    value: session.id,
  });
  cookieStore.set({ name: "viewer_timezone", value: timezone });
}

export async function selectSessionViewer() {
  const cookieStore = await cookies();
  const session = cookieStore.get("viewer_session")?.value;
  if (session) {
    return await db
      .selectFrom("users")
      .innerJoin("sessions", "sessions.user_id", "users.id")
      .select(["users.id", "users.email", "first_name", "last_name", "image"])
      .where("sessions.id", "=", session)
      .executeTakeFirst();
  }
}

export interface Viewer {
  id: string;
  email: string;
  image: string;
  first_name: string | null;
  last_name: string | null;
}

export async function useViewer(): Promise<Viewer | undefined> {
  if (typeof window === "undefined") {
    const viewer = await selectSessionViewer();
    if (viewer) {
      if (!viewer.image) {
        const hash = createHash("md5");
        hash.update(viewer.email);
        const md5 = hash.digest("hex");
        viewer.image = `https://www.gravatar.com/avatar/${md5}`;
      }

      return viewer as Viewer;
    }
  }
}
