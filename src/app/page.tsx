import { Posts } from "@/components/Posts";
import Navbar from "@/components/Navbar";
import React from "react";

export default async function Home() {
  const posts = await Posts();
  return (
    <main className="w-full flex flex-col items-center p-4">
      <Navbar />
      {posts}
    </main>
  );
}
