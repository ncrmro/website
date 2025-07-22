import { Posts } from "@/app/posts/Posts";
import Navbar from "@/components/Navbar";
import React from "react";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await Posts();
  return (
    <main className="w-full flex flex-col items-center p-4">
      <Navbar />
      {posts}
    </main>
  );
}
