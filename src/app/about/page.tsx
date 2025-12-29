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
        <div className="text-gray-700 dark:text-gray-300 space-y-4">
          <p>
            Full-stack software engineer based in Houston, TX with experience
            architecting, deploying, and supporting technical solutions at
            scale. I specialize in building web applications and APIs using
            modern technologies including TypeScript, React, Next.js, Node.js,
            GraphQL, and Kubernetes.
          </p>
          <p>
            Throughout my career, I&apos;ve worked on enterprise-scale platforms
            handling billions in annual transactions, developed VR training
            simulators, and built healthcare technology solutions. I&apos;m
            passionate about automation, quality assurance, and cloud
            infrastructure.
          </p>
          <p>
            I&apos;ve spoken at PyCon India and various community meetups,
            sharing knowledge about bridging frontend and backend technologies
            using GraphQL.
          </p>
          <p className="pt-2">
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
