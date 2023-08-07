import "./globals.css";
import GithubIcon from "@/components/Icons/Github";
import InstagramIcon from "@/components/Icons/Instagram";
import LinkedinIcon from "@/components/Icons/Linkedin";
import TwitterIcon from "@/components/Icons/Twitter";
import { headers } from "next/headers";
import Link from "next/link";
import React from "react";
import { useViewer } from "@/lib/auth";

export const metadata = {
  title: "Vercel Postgres Demo with Kysely",
  description:
    "A simple Next.js app with Vercel Postgres as the database and Kysely as the ORM",
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const viewer = await useViewer();
  const headersList = headers();
  const activePath = headersList.get("x-invoke-path");
  const isHome = activePath?.split("/").length === 2;

  return (
    <html lang="en">
      <body>
        <nav id="navbar" className="flex flex-col gap-2 items-center">
          <Link href="/" className="uppercase min-w-[10rem] border-b py-2	">
            {isHome ? "Nicholas Romero" : "Home"}
          </Link>
          {isHome && (
            <div className="flex justify-center gap-4 uppercase">
              <Link href="/posts/tech">Tech</Link>
              <Link href="/about">About</Link>
              <Link href="/posts/travel">Travel</Link>
              <Link href="/posts/food">Food</Link>
              <Link href="/resume">Resume</Link>
            </div>
          )}
          {isHome && (
            <div className="flex justify-center gap-4">
              <a
                href="https://www.linkedin.com/in/ncrmro/"
                aria-label="Linkedin profile"
              >
                <LinkedinIcon className="fill-current text-gray-300" />
              </a>
              <a href="https://github.com/ncrmro" aria-label="Github profile">
                <GithubIcon className="fill-current text-gray-300" />
              </a>
              <a href="https://twitter.com/ncrmro" aria-label="Twitter profile">
                <TwitterIcon className="fill-current text-gray-300" />
              </a>
              <a
                href="https://www.instagram.com/ncrmro"
                aria-label="Instagram profile"
              >
                <InstagramIcon className="fill-current text-gray-300" />
              </a>
            </div>
          )}
        </nav>
        <main className="w-full flex-col items-center p-4">
          {props.children}
        </main>
      </body>
    </html>
  );
}
