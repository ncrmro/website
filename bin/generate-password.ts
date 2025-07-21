#!/usr/bin/env node

import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { Kysely, SqliteDialect } from 'kysely';
import SQLiteDatabase from 'better-sqlite3';

// Database setup
const scryptAsync = promisify(scrypt);
const databasePath = process.env.DATABASE_PATH || "./database/sqlite3.db";
const sqlite = new SQLiteDatabase(databasePath);

// Basic DB interface for our needs
interface Database {
  users: {
    id: string;
    email: string;
    password: string;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
  };
}

const db = new Kysely<Database>({
  dialect: new SqliteDialect({
    database: sqlite,
  }),
});

interface CLIOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  count: number;
  userEmail?: string;
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

function generatePassword(options: CLIOptions): string {
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

function showHelp(): void {
  console.log(`
Password Generator CLI

Usage: npm run generate-password [options]

Options:
  -l, --length <number>      Password length (default: 16)
  -U, --no-uppercase         Exclude uppercase letters
  -L, --no-lowercase         Exclude lowercase letters  
  -N, --no-numbers           Exclude numbers
  -S, --no-symbols           Exclude symbols
  -x, --exclude-similar      Exclude similar characters (0/O, 1/l/I, etc.)
  -c, --count <number>       Generate multiple passwords (default: 1)
  -u, --user <email>         Update password for user with this email
  -h, --help                 Show this help message

Examples:
  npm run generate-password
  npm run generate-password -- -l 20 -x
  npm run generate-password -- --no-symbols --length 12
  npm run generate-password -- -c 5 -l 10
  npm run generate-password -- --user user@example.com -l 16

Note: When using --user, only one password will be generated and updated in the database.
`);
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    count: 1,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
        
      case '-l':
      case '--length':
        options.length = parseInt(args[++i]);
        if (isNaN(options.length) || options.length < 1) {
          console.error('Error: Length must be a positive number');
          process.exit(1);
        }
        break;
        
      case '-U':
      case '--no-uppercase':
        options.includeUppercase = false;
        break;
        
      case '-L':
      case '--no-lowercase':
        options.includeLowercase = false;
        break;
        
      case '-N':
      case '--no-numbers':
        options.includeNumbers = false;
        break;
        
      case '-S':
      case '--no-symbols':
        options.includeSymbols = false;
        break;
        
      case '-x':
      case '--exclude-similar':
        options.excludeSimilar = true;
        break;
        
      case '-c':
      case '--count':
        options.count = parseInt(args[++i]);
        if (isNaN(options.count) || options.count < 1) {
          console.error('Error: Count must be a positive number');
          process.exit(1);
        }
        break;

      case '-u':
      case '--user':
        options.userEmail = args[++i];
        if (!options.userEmail) {
          console.error('Error: User email is required');
          process.exit(1);
        }
        // Validate email format
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(options.userEmail)) {
          console.error('Error: Invalid email format');
          process.exit(1);
        }
        break;
        
      default:
        if (arg.startsWith('-')) {
          console.error(`Error: Unknown option '${arg}'`);
          console.log('Use --help for usage information');
          process.exit(1);
        }
    }
  }
  
  return options;
}

async function updateUserPassword(email: string, newPassword: string): Promise<void> {
  try {
    // Check if user exists
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'first_name', 'last_name'])
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user) {
      console.error(`Error: User with email '${email}' not found`);
      process.exit(1);
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the user's password
    await db
      .updateTable('users')
      .set({ password: hashedPassword })
      .where('email', '=', email)
      .execute();

    console.log(`✅ Password updated successfully for user: ${user.first_name || user.email}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 New password: ${newPassword}`);
    console.log(`🔐 Password hash: ${hashedPassword}`);

  } catch (error) {
    console.error(`Error updating user password: ${(error as Error).message}`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    return;
  }
  
  try {
    const options = parseArgs(args);
    
    // Validate that at least one character type is selected
    if (!options.includeUppercase && !options.includeLowercase && 
        !options.includeNumbers && !options.includeSymbols) {
      console.error('Error: At least one character type must be included');
      process.exit(1);
    }
    
    if (options.userEmail) {
      // Update user password mode
      const password = generatePassword(options);
      await updateUserPassword(options.userEmail, password);
    } else {
      // Generate passwords mode
      for (let i = 0; i < options.count; i++) {
        const password = generatePassword(options);
        console.log(password);
      }
    }
    
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  } finally {
    // Close database connection
    sqlite.close();
  }
}

if (require.main === module) {
  main();
} 