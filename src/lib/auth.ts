import { scrypt, randomBytes, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";

/**
 * Password utility functions for hashing and validation
 * Note: Session management is now handled by NextAuth (see src/app/auth.ts)
 */

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

/**
 * Generate Gravatar URL from email
 */
export function getGravatarUrl(email: string): string {
  const hash = createHash("md5");
  hash.update(email.trim().toLowerCase());
  const md5 = hash.digest("hex");
  return `https://www.gravatar.com/avatar/${md5}`;
}
