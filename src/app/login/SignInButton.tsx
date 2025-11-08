'use client';

import { signIn } from 'next-auth/react';
import { ReactNode } from 'react';

interface SignInButtonProps {
  provider: string;
  callbackUrl?: string;
  credentials?: Record<string, string>;
  children: ReactNode;
}

export function SignInButton({
  provider,
  callbackUrl = '/dashboard',
  credentials,
  children,
}: SignInButtonProps) {
  const handleSignIn = async () => {
    await signIn(provider, { callbackUrl }, credentials);
  };

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center justify-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
    >
      {children}
    </button>
  );
}
