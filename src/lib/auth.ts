import { scrypt, randomBytes, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";
import { db, sessions, users, getResultArray } from "@/database";
import { eq } from "drizzle-orm";
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
  const result = await db
    .insert(sessions)
    .values({ userId })
    .returning({ id: sessions.id });
  const sessionRows = getResultArray(result);
  const session = sessionRows[0];
  if (!session) throw new Error("Failed to create session");
  (await cookies()).set({
    name: "viewer_session",
    value: session.id,
  });
  (await cookies()).set({ name: "viewer_timezone", value: timezone });
}

export async function selectSessionViewer() {
  const sessionId = (await cookies()).get("viewer_session")?.value;
  if (sessionId) {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        image: users.image,
      })
      .from(users)
      .innerJoin(sessions, eq(sessions.userId, users.id))
      .where(eq(sessions.id, sessionId));
    return result[0];
  }
}

export interface Viewer {
  id: string;
  email: string;
  image: string | null;
  firstName: string | null;
  lastName: string | null;
}

export async function selectViewer(): Promise<Viewer | undefined> {
  if (typeof window === "undefined") {
    const viewer = await selectSessionViewer();
    if (viewer) {
      let image = viewer.image;
      if (!image) {
        const hash = createHash("md5");
        hash.update(viewer.email);
        const md5 = hash.digest("hex");
        image = `https://www.gravatar.com/avatar/${md5}`;
      }

      return {
        id: viewer.id,
        email: viewer.email,
        image,
        firstName: viewer.firstName,
        lastName: viewer.lastName,
      };
    }
  }
}
