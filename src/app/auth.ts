import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '@/lib/auth.config';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Add Credentials provider for development
 */
if (process.env.NODE_ENV === 'development') {
  authConfig.providers.push(
    Credentials({
      id: 'password',
      name: 'Password',
      credentials: {
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const password = credentials.password as string;
        const passwordMatch = password.match(/^(password|admin)(?:-.*)?$/);
        if (!passwordMatch) return null;

        const [, baseType] = passwordMatch;
        const email =
          baseType === 'admin' ? 'admin@example.com' : 'bob@alice.com';

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) return null;

        return {
          ...user,
          id: user.id.toString(),
          admin: user.admin ?? false,
        };
      },
    }),
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: undefined, // Pure JWT - NO database adapter
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // On sign-in: populate token with user data
      if (user?.id) {
        token.id = user.id;
        token.admin = (user as any).admin ?? false;
        return token;
      }

      // On token refresh: look up user by email
      const { email, name, picture } = token;
      if (!email) return token;

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        token.id = existingUser.id.toString();
        token.admin = existingUser.admin ?? false;
        return token;
      }

      // Create new user for OAuth (auto-registration)
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          name: name ?? 'User',
          image: picture,
          admin: false,
        })
        .returning();

      token.id = newUser.id.toString();
      token.admin = newUser.admin ?? false;
      return token;
    },

    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
        session.user.admin = token.admin as boolean;
      }
      return session;
    },
  },
});

/**
 * Server-side auth helper that throws if not authenticated
 */
export async function authRequired() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Authentication required');
  }
  return session;
}
