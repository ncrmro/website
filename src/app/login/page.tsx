import ClientTimezoneInput from "@/app/login/ClientTimezoneInput";
import { handleSession, Passwords, selectViewer } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/database";
import { headers } from "next/headers";
import React from "react";

async function loginUser(data: Map<string, string>) {
  "use server";
  const email = data.get("email")!;
  const password = data.get("password")!;
  const timezone = data.get("timezone")!;
  try {
    const user = await db
      .selectFrom("users")
      .select(["id", "email", "password"])
      .where("email", "=", email)
      .executeTakeFirstOrThrow();
    const match = await Passwords.compare(user.password, password);
    if (!match) {
      redirect("/login?error=AUTH_INVALID_PASSWORD");
    } else await handleSession(user.id, timezone);
  } catch (e) {
    redirect("/login?error=AUTH_INVALID_USER");
  }
}

async function parseRedirectParam() {
  const referer = (await headers()).get("referer");
  if (referer) {
    const url = new URL(referer);
    return url.searchParams.get("redirect");
  }
}

export default async function LoginPage() {
  const viewer = await selectViewer();
  const redirectPram = await parseRedirectParam();
  if (viewer && redirectPram) {
    redirect(redirectPram);
  } else if (viewer) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      {/* @ts-ignore */}
      <form action={loginUser} className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Login</h1>
        <div className="flex flex-col gap-4 mb-6">
          <ClientTimezoneInput />
          <input
            name="email"
            placeholder="Email"
            autoComplete="email"
            type="email"
            required
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <input
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            type="password"
            required
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
