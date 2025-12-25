import Navbar from "@/components/Navbar";
import Link from "next/link";
import React from "react";

export default async function AboutPage() {
  return (
    <main className="w-full flex flex-col items-center p-4">
      <Navbar />
      <div className="w-full md:max-w-4xl pt-6">
        <h1 className="text-xl font-semibold leading-6 text-gray-900 dark:text-white pb-4">
          About
        </h1>
        <div className="text-gray-500 dark:text-gray-400">
          <p className="py-1">
            {/* Add about content here */}
          </p>
          <p className="py-4">
            <Link
              href="/resume"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Resume &rarr;
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
