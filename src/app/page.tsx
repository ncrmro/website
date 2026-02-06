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
    images: [
      {
        url: "https://ncrmro.com/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Nicholas Romero",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Nicholas Romero - Software Engineer",
    description: "Personal site and blog of Nicholas Romero - Software Engineer, Full Stack Developer, and Technology Enthusiast",
    images: ["https://ncrmro.com/android-chrome-512x512.png"],
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
