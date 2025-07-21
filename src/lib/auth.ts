import { scrypt, randomBytes, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";
// Keep this as local import rather than alias as playwirght doesn't know about aliases
import { db } from "./database";
import { cookies } from "next/headers";

export namespace Passwords {
  // scrypt is callback based so with promisify we can await it
  const scryptAsync = promisify(scrypt);

  export interface GenerateOptions {
    length?: number;
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
    excludeSimilar?: boolean;
  }

  export function generate(options: GenerateOptions = {}): string {
    const {
      length = 16,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = false,
    } = options;

    let chars = "";
    
    if (includeUppercase) {
      chars += excludeSimilar ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
    if (includeLowercase) {
      chars += excludeSimilar ? "abcdefghjkmnpqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
    }
    if (includeNumbers) {
      chars += excludeSimilar ? "23456789" : "0123456789";
    }
    if (includeSymbols) {
      chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    }

    if (chars.length === 0) {
      throw new Error("At least one character type must be included");
    }

    let password = "";
    const bytes = randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      password += chars[bytes[i] % chars.length];
    }

    return password;
  }

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
    return timingSafeEqual(
      new Uint8Array(hashedPasswordBuf), 
      new Uint8Array(suppliedPasswordBuf)
    );
  }
}

export async function handleSession(userId: string, timezone: string) {
  const session = await db
    .insertInto("sessions")
    .values({ user_id: userId })
    .returning("id")
    .executeTakeFirstOrThrow();
  (await cookies()).set({
    name: "viewer_session",
    value: session.id,
  });
  (await cookies()).set({ name: "viewer_timezone", value: timezone });
}

export async function selectSessionViewer() {
  const session = (await cookies()  ).get("viewer_session")?.value;
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

export async function selectViewer(): Promise<Viewer | undefined> {
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
