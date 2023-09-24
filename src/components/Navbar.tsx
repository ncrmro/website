"use client";

import GithubIcon from "@/components/Icons/Github";
import InstagramIcon from "@/components/Icons/Instagram";
import LinkedinIcon from "@/components/Icons/Linkedin";
import TwitterIcon from "@/components/Icons/Twitter";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  return (
    <nav
      id="navbar"
      className="flex flex-col gap-2 items-center text-slate-500 dark:text-white mx-auto"
    >
      <Link
        href="/"
        className="uppercase min-w-[10rem] border-b py-2 text-center dark:text-white"
      >
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
          <a
            href="https://github.com/ncrmro"
            aria-label="Github profile"
            rel="me"
          >
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
  );
}
