import { handleSession, Passwords, useViewer } from "@/lib/auth";
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
  console.log(timezone);
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

function parseRedirectParam() {
  const referer = headers().get("referer");
  if (referer) {
    const url = new URL(referer);
    return url.searchParams.get("redirect");
  }
}

export default async function LoginPage() {
  const viewer = await useViewer();
  const redirectPram = parseRedirectParam();
  if (viewer && redirectPram) {
    redirect(redirectPram);
  } else if (viewer) {
    redirect("/dashboard");
  }

  return (
    // @ts-ignore
    <form action={loginUser} className="flex flex-col">
      <h1>Login</h1>
      <div className="flex flex-col gap-4">
        <input
          type="hidden"
          name="timezone"
          value={Intl.DateTimeFormat().resolvedOptions().timeZone}
        />
        <input
          name="email"
          placeholder="Email"
          autoComplete="email"
          type="email"
          required
        />
        <input
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          type="password"
          required
        />
      </div>
      <div className="flex-col gap-4">
        <button type="submit" style={{ float: "right" }}>
          Login
        </button>
      </div>
    </form>
  );
}
