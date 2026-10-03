import type { DocumentDraft, DocumentListing } from "@quiescent/server";

/** App presentation: cache mechanics and freshness metadata come from Quiescent. */
export function matchesSearch(draft: DocumentDraft, query: string): boolean {
  const metadata = draft.document.frontmatter;
  const text = [metadata.title, metadata.description, metadata.tags, draft.document.body]
    .flat().filter(value => typeof value === "string").join(" ").toLocaleLowerCase();
  return query.trim().toLocaleLowerCase().split(/\s+/).every(term => text.includes(term));
}
export function cacheLabel(cache: DocumentListing["cache"]): string {
  const checked = cache.fetchedAt ? new Date(cache.fetchedAt).toLocaleString() : "not yet fetched";
  const updated = cache.updatedAt && cache.updatedAt !== cache.fetchedAt
    ? ` · Updated ${new Date(cache.updatedAt).toLocaleString()}` : "";
  const state = cache.error ? " · Refresh failed; showing saved listing"
    : cache.refreshing ? " · Refreshing…" : cache.stale ? " · Refresh due" : "";
  return `Last GitHub fetch: ${checked}${updated}${state}`;
}

export async function fetchListing(api: string, force: boolean): Promise<DocumentListing> {
  const response = await fetch(`${api}/listing${force ? "/refresh" : ""}`, {
    method: force ? "POST" : "GET",
  });
  if (!response.ok) throw new Error("Could not load saved documents. Your displayed listing is unchanged.");
  return response.json();
}
