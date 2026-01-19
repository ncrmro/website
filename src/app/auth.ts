import NextAuth, { DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/database';
import { users } from '@/database/schema.users';
import { eq } from 'drizzle-orm';
import { authConfig } from '@/lib/auth.config';
import { Passwords } from '@/lib/auth';
import { randomUUID } from 'crypto';

// Redirect URL for authenticated users
export const AUTHENTICATED_USER_REDIRECT_URL = '/dashboard';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      admin: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    admin: boolean;
  }

  interface JWT {
    id: string;
    admin: boolean;
  }
}

// Development credentials provider (requires database, cannot be in auth.config.ts)
if (process.env.NODE_ENV === 'development') {
  authConfig.providers.push(
    Credentials({
      id: 'password',
      name: 'Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = credentials.email as string;
        const password = credentials.password as string;

        if (!email || !password) {
          return null;
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (!user || !user.password) {
          return null;
        }

        const match = await Passwords.compare(user.password, password);
        if (!match) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.firstName
            ? `${user.firstName} ${user.lastName || ''}`.trim()
            : null,
          image: user.image,
          admin: user.admin,
        };
      },
    }),
  );
}

/**
 * Pure JWT session strategy for all environments
 * Extends the edge-safe auth.config.ts with database-dependent callbacks
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: undefined, // No adapter - pure JWT strategy
  callbacks: {
    /**
     * JWT Callback
     *
     * Called whenever a JWT is created (at sign in) or updated (when session is accessed).
     * We look up the user in the database and store their ID and admin status in the token.
     */
    async jwt({ token, user }) {
      // On sign-in with Credentials provider, user object is fully populated
      if (user && user.id) {
        token.id = user.id;
        token.admin = user.admin;
        return token;
      }

      // For OAuth providers (Google) or token refresh, look up user by email
      const { email, name, picture: image } = token;
      if (!email) {
        throw new Error('No email found during JWT callback');
      }

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        token.id = existingUser.id;
        token.admin = existingUser.admin;
        return token;
      }

      // Create new user for OAuth sign-ins (production only)
      // Split name into firstName/lastName
      const nameParts = (name as string | null)?.split(' ') || [];
      const firstName = nameParts[0] || null;
      const lastName = nameParts.slice(1).join(' ') || null;

      const [newUser] = await db
        .insert(users)
        .values({
          id: randomUUID(),
          email,
          firstName,
          lastName,
          image: image as string | null,
          admin: false,
        })
        .returning();

      token.id = newUser.id;
      token.admin = newUser.admin;
      return token;
    },

    /**
     * Session Callback
     *
     * Called whenever a session is checked (getSession, useSession, etc).
     * Forward token data to the session object.
     */
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.admin = token.admin as boolean;
      return session;
    },
  },
});

/**
 * Wrapped auth function that throws if not authenticated
 * Use this in server actions that require authentication
 * For server components/pages, use authRedirect() instead
 */
export async function authRequired() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Not authenticated!');
  }
  return session;
}

/**
 * Auth function for server-side components (pages)
 * Redirects to sign-in page if not authenticated instead of throwing an error
 * Use this in server components/pages. For server actions, use authRequired() instead.
 */
export async function authRedirect() {
  const session = await auth();
  if (!session?.user) {
    return signIn();
  }
  return session;
}
