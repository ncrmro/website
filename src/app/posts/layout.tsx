import Navbar from "@/components/Navbar";
import React, { ReactNode } from "react";

export default async function PostsLayout(props: { children: ReactNode }) {
  return (
    <main className="w-full flex flex-col items-center p-4">
      <Navbar />
      {props.children}
    </main>
  );
}
