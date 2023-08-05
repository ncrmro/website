import "./globals.css";
import { headers } from "next/headers";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useViewer } from "@/lib/auth";

export const metadata = {
  title: "Vercel Postgres Demo with Kysely",
  description:
    "A simple Next.js app with Vercel Postgres as the database and Kysely as the ORM",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await useViewer();

  const referer = headers();
  console.log(referer);
  return (
    <html lang="en">
      <body>
        <nav id="navbar" className="flex justify-center items-center h-16">
          <Link href="/">NCRMRO</Link>
          {/*<div>*/}
          {/*  <Link href="/posts">Posts</Link>*/}
          {/*  {!viewer && <Link href="/login">Sign in</Link>}*/}
          {/*</div>*/}
        </nav>
        <main className="w-full flex-col items-center p-4">{children}</main>
      </body>
    </html>
  );
}
