import 'next-auth';
import 'next-auth/jwt';

/**
 * Extend NextAuth types to include custom fields
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      admin: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    admin: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    admin: boolean;
  }
}
