import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { normalizeStringArray } from "./frontmatter";
import type { JobDoc } from "./types";

const JOBS_DIR = path.join(process.cwd(), "content/jobs");

function assertString(value: unknown, fieldName: string, sourcePath: string) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid ${fieldName} in ${sourcePath}`);
  }

  return value.trim();
}

async function readJob(slug: string): Promise<JobDoc> {
  const sourcePath = path.join(JOBS_DIR, slug, "index.md");
  const raw = await fs.readFile(sourcePath, "utf8");
  const { data: frontmatter, content: body } = matter(raw);

  const job: JobDoc = {
    docType: "job",
    slug: assertString(frontmatter.slug ?? slug, "slug", sourcePath),
    title: assertString(frontmatter.title, "title", sourcePath),
    description:
      typeof frontmatter.description === "string"
        ? frontmatter.description
        : "",
    body: body.trim(),
    date: assertString(frontmatter.date, "date", sourcePath),
    sourcePath,
    role: assertString(frontmatter.role, "role", sourcePath),
    employmentType: assertString(
      frontmatter.employmentType,
      "employmentType",
      sourcePath,
    ),
    start: assertString(frontmatter.start, "start", sourcePath),
    tech: normalizeStringArray(frontmatter.tech),
  };

  if (typeof frontmatter.end === "string" && frontmatter.end.trim() !== "") {
    job.end = frontmatter.end.trim();
  }

  if (typeof frontmatter.url === "string" && frontmatter.url.trim() !== "") {
    job.url = frontmatter.url.trim();
  }

  if (
    typeof frontmatter.favicon === "string" &&
    frontmatter.favicon.trim() !== ""
  ) {
    job.favicon = frontmatter.favicon.trim();
  }

  return job;
}

export const getAllJobs = cache(async (): Promise<JobDoc[]> => {
  const entries = await fs.readdir(JOBS_DIR, { withFileTypes: true });
  const slugs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const jobs = await Promise.all(slugs.map(readJob));

  return jobs.sort((a, b) => b.start.localeCompare(a.start));
});
