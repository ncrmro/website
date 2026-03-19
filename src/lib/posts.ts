import fs from "fs";
import path from "path";
import YAML from "yaml";

const POSTS_DIR = path.join(process.cwd(), "public", "posts");

export interface PostFrontmatter {
  title?: string;
  description?: string;
  tags?: string;
  state?: string;
  date?: string;
}

export interface PostData {
  slug: string;
  dirName: string;
  title: string;
  description: string;
  publishDate: string | null;
  tags: string[];
  content: string;
}

function getDateFromName(name: string): string | null {
  const match = name.match(/^(\d{4})_(\d{2})_(\d{2})_/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function getSlugFromName(name: string): string {
  return name.replace(/^\d{4}_\d{2}_\d{2}_/, "");
}

function parseFrontmatter(content: string): {
  frontmatter: PostFrontmatter;
  body: string;
} {
  if (!content.startsWith("---")) {
    return { frontmatter: {}, body: content };
  }
  const end = content.indexOf("---", 3);
  if (end === -1) {
    return { frontmatter: {}, body: content };
  }
  const yamlStr = content.slice(3, end).trim();
  const body = content.slice(end + 3).trim();
  const frontmatter = (YAML.parse(yamlStr) as PostFrontmatter) ?? {};
  return { frontmatter, body };
}

export function getAllPosts(): PostData[] {
  const entries = fs.readdirSync(POSTS_DIR);
  const posts: PostData[] = [];

  for (const entry of entries) {
    const fullPath = path.join(POSTS_DIR, entry);
    const stat = fs.statSync(fullPath);

    let slug: string;
    let dirName: string;
    let content: string;
    let baseDate: string | null;

    if (stat.isDirectory()) {
      const docPath = path.join(fullPath, "document.md");
      if (!fs.existsSync(docPath)) continue;
      content = fs.readFileSync(docPath, "utf-8");
      dirName = entry;
      slug = getSlugFromName(entry);
      baseDate = getDateFromName(entry);
    } else if (entry.endsWith(".md")) {
      content = fs.readFileSync(fullPath, "utf-8");
      dirName = entry.replace(/\.md$/, "");
      slug = getSlugFromName(entry.replace(/\.md$/, ""));
      baseDate = getDateFromName(entry);
    } else {
      continue;
    }

    const { frontmatter, body } = parseFrontmatter(content);

    // Only include published posts
    if (frontmatter.state !== "published") continue;

    posts.push({
      slug,
      dirName,
      title: frontmatter.title ?? slug,
      description: frontmatter.description ?? "",
      publishDate: frontmatter.date ?? baseDate,
      tags: frontmatter.tags
        ? frontmatter.tags.split(",").map((t) => t.trim())
        : [],
      content: body,
    });
  }

  return posts.sort((a, b) => {
    if (!a.publishDate) return 1;
    if (!b.publishDate) return -1;
    return b.publishDate.localeCompare(a.publishDate);
  });
}

export function getPostBySlug(slug: string): PostData | null {
  const all = getAllPosts();
  return all.find((p) => p.slug === slug) ?? null;
}
