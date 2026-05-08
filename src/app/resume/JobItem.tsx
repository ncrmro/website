import SmallBadge from "@/components/SmallBadge";
import type { JobDoc } from "@/content/types";
import Image from "next/image";
import React from "react";
import Markdown from "react-markdown";

export const TechUrls: Record<string, string> = {
  React: "https://reactjs.org",
  "React Native": "https://reactnative.dev",
  "Next.JS": "https://nextjs.org",
  "Apollo GraphQL": "https://www.apollographql.com",
  Relay: "https://relay.dev",
  Typescript: "https://www.typescriptlang.org",
  Docker: "https://www.docker.com",
  GraphQL: "https://graphql.org",
  Graphene: "https://graphene-python.org",
  Node: "https://nodejs.org",
  Python: "https://www.python.org",
  Django: "https://www.djangoproject.com",
  Rust: "https://www.rust-lang.org",
  "C/C++": "https://en.wikipedia.org/wiki/C_(programming_language)",
  Kubernetes: "https://kubernetes.io",
  GCP: "https://cloud.google.com",
  AWS: "https://aws.amazon.com",
  Azure: "https://azure.microsoft.com",
  Postgres: "https://www.postgresql.org",
  PostGIS: "https://postgis.net",
  SQL: "https://en.wikipedia.org/wiki/SQL",
  Playwright: "https://playwright.dev",
  Jest: "https://jestjs.io",
  "Gitlab CI": "https://docs.gitlab.com/ce/ci",
  "Travis CI": "https://www.travis-ci.com",
  Backstage: "https://backstage.io",
  Hipaa:
    "https://en.wikipedia.org/wiki/Health_Insurance_Portability_and_Accountability_Act",
  "Unreal Engine": "https://www.unrealengine.com",
  Selenium: "https://www.selenium.dev",
  Go: "https://golang.org",
  WordPress: "https://wordpress.org",
};

const components = {
  a: (props: any) => <a {...props} className="text-blue-700" />,
  ul: (props: any) => <ul className="list-disc px-4 py-2" {...props} />,
  p: (props: any) => <p className="py-1" {...props} />,
};

function normalizeFaviconPath(pathname: string | undefined) {
  if (!pathname) {
    return "/favicon.png";
  }

  if (pathname.startsWith("/uploads/resume/")) {
    return pathname.replace("/uploads/resume/", "/resume/");
  }

  return pathname;
}

export default function JobDocument({ job }: { job: JobDoc }) {
  return (
    <li key={job.slug} className="flex flex-col gap-4 pl-12 pb-12 relative">
      <div className="flex">
        <Image
          className="absolute rounded-full left-0 top-4"
          width={40}
          height={40}
          unoptimized
          src={normalizeFaviconPath(job.favicon)}
          alt={`${job.title} Icon`}
        />
        <span
          className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 -z-10"
          aria-hidden="true"
        />
      </div>
      <div className="flex flex-col justify-between">
        <div>
          <h2>{job.role}</h2>
          <h3>{job.url ? <a href={job.url}>{job.title}</a> : job.title}</h3>
        </div>
        <div>
          {job.start} {job.end}
        </div>
      </div>
      <div>
        <Markdown components={components}>{job.body}</Markdown>
      </div>
      <div className="flex flex-wrap gap-2">
        {job.tech.map((tech) => (
          <SmallBadge key={tech}>
            <a href={TechUrls[tech]}>{tech}</a>
          </SmallBadge>
        ))}
      </div>
    </li>
  );
}
