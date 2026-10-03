import { marked } from "marked";
import type { DocumentDraft } from "@quiescent/server/contracts";

export function postDate(draft: DocumentDraft): string {
  const date = draft.document.frontmatter.publish_date;
  return typeof date === "string" && Number.isFinite(Date.parse(date))
    ? date
    : draft.document.createdAt;
}
export function newestFirst(a: DocumentDraft, b: DocumentDraft): number {
  return Date.parse(postDate(b)) - Date.parse(postDate(a)) || a.document.id.localeCompare(b.document.id);
}
export function coverFilename(draft: DocumentDraft): string | undefined {
  const local = (value: unknown): value is string =>
    typeof value === "string" && value.length > 0 && !/[\\/]/.test(value) && !value.startsWith(".");
  const header = draft.document.frontmatter.headerImage;
  if (local(header)) return header;
  let first: string | undefined;
  marked.walkTokens(marked.lexer(draft.document.body), token => {
    if (!first && token.type === "image" && local(token.href)) first = token.href;
  });
  return first;
}
export function thumbnailUrl(collection: string, draft: DocumentDraft): string | undefined {
  if (!draft.headSha) return;
  const filename = coverFilename(draft);
  if (!filename) return;
  const query = new URLSearchParams({ filename, v: draft.headSha });
  if (draft.branch) query.set("branch", draft.branch);
  return `/api/documents/${encodeURIComponent(collection)}/${encodeURIComponent(draft.document.id)}/thumbnail?${query}`;
}
