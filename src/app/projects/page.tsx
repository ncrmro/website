import Navbar from "@/components/Navbar";
import Link from "next/link";
import React from "react";

const projects = [
  {
    slug: "meze",
    title: "Meze",
    description: "meze.fyi",
    url: "https://meze.fyi",
  },
  {
    slug: "keystone",
    title: "Keystone",
    description: "GitHub ncrmro/keystone",
    url: "https://github.com/ncrmro/keystone",
  },
  {
    slug: "catalyst",
    title: "Catalyst",
    description: "GitHub ncrmro/catalyst",
    url: "https://github.com/ncrmro/catalyst",
  },
  {
    slug: "latinum",
    title: "Latinum",
    description: "latinum.space",
    url: "https://latinum.space",
  },
];

export default function ProjectsPage() {
  return (
    <main className="w-full flex flex-col items-center p-4">
      <Navbar />
      <div className="w-full md:max-w-4xl pt-6">
        <h1 className="text-xl font-semibold leading-6 text-gray-900 dark:text-white pb-4">
          Projects
        </h1>
        <div className="grid gap-4">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {project.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {project.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
