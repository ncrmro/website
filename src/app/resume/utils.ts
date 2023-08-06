"use server";
import fs from "fs/promises";
import { serialize } from "next-mdx-remote/serialize";
function parseDocumentFilename(documentFilename: string) {
  const documentMatch = documentFilename.match(
    /(?<year>\d{4})_(?<month>\d{2})_(?<date>\d{2})_(?<slug>[A-Za-z0-9-]*)[\.md]?/
  );
  if (!documentMatch?.groups)
    throw `Document file name does not match YYYY_MM_DD-document-slug ${documentFilename}`;
  const { year, month, date, slug } = documentMatch.groups;
  return { year, month, date, slug };
}

export async function parseDocument(documentFilename: string) {
  const { year, month, date, slug } = parseDocumentFilename(documentFilename);

  // If document is in a folder with assets
  if (!documentFilename.includes(".md")) {
    documentFilename = `${documentFilename}/document.md`;
  }
  let content = await fs.readFile(`public/jobs/${documentFilename}`, "utf8");

  // Extract the header from the file contents
  const match = content.match(/---\n((\w*:) .*\n)*---/)?.[0];
  if (!match) throw new Error(`Unable to parse header for ${documentFilename}`);

  const document: Record<string, string | string[]> = {
    slug,
    date: `${year}-${month}-${date}`,
    // Remove the header from markdown file contents
    content: content.replace(match, ""),
  };

  // For each attribute in the header file add to the post object
  // @ts-ignore
  for (const [_, k, v] of match.matchAll(/^(?<key>\w*): (?<value>.*)$/gm)) {
    // Make sure only keys defined in the config are allowed
    document[k] = v;
  }
  if (typeof document.tags === "string") {
    document.tags = document.tags?.split(",") || [];
  }
  // @ts-ignore
  document.compiledSource = await serialize(document.content);
  return document;
}

export async function parseJobFiles() {
  const jobFiles = await fs.readdir("public/jobs");
  return await Promise.all(jobFiles.map(parseDocument));
}
