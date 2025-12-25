import Navbar from "@/components/Navbar";
import Link from "next/link";
import React from "react";

interface ProjectLayoutProps {
  title: string;
  description: string;
  url: string;
  children: React.ReactNode;
}

export default function ProjectLayout({
  title,
  description,
  url,
  children,
}: ProjectLayoutProps) {
  return (
    <main className="w-full flex flex-col items-center p-4">
      <Navbar />
      <div className="w-full md:max-w-4xl">
        <div className="pt-6 pb-5">
          <div className="sm:flex sm:items-baseline sm:justify-between">
            <div className="sm:w-0 sm:flex-1">
              <h1 className="text-xl font-semibold leading-6 text-gray-900 dark:text-white">
                {title}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {url}
              </a>
            </div>
          </div>
        </div>
        <div className="pt-6 pb-3 text-gray-500 dark:text-gray-400">
          {children}
        </div>
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/projects"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            &larr; Back to Projects
          </Link>
        </div>
      </div>
    </main>
  );
}
