import { Posts } from "@/app/posts/Posts";
import Navbar from "@/components/Navbar";
import React from "react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home",
  description: "Personal site and blog of Nicholas Romero - Software Engineer, Full Stack Developer, and Technology Enthusiast",
  openGraph: {
    title: "Nicholas Romero - Software Engineer",
    description: "Personal site and blog of Nicholas Romero - Software Engineer, Full Stack Developer, and Technology Enthusiast",
    type: "website",
    url: "https://ncrmro.com",
  },
  twitter: {
    card: "summary",
    title: "Nicholas Romero - Software Engineer",
    description: "Personal site and blog of Nicholas Romero - Software Engineer, Full Stack Developer, and Technology Enthusiast",
  },
};

export default async function Home() {
  const posts = await Posts();
  return (
    <main className="w-full flex flex-col items-center p-4">
      <Navbar />
      {posts}
    </main>
  );
}
