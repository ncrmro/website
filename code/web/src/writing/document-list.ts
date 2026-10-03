import { cacheLabel, fetchListing, matchesSearch } from "./listing-view";
import { documentEditPath } from "./navigation";
import { localDrafts } from "@quiescent/editor/local-drafts";
import type { DocumentDraft } from "@quiescent/server/contracts";
import { newestFirst, postDate, thumbnailUrl } from "./admin-posts";

const dates = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" });
function postRow(collection: string, draft: DocumentDraft): HTMLLIElement {
  const item = document.createElement("li");
  const link = document.createElement("a");
  link.href = documentEditPath(collection, draft.document.id);
  const imageUrl = thumbnailUrl(collection, draft);
  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = "";
    image.width = 160;
    image.height = 112;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => image.remove(), { once: true });
    link.appendChild(image);
  }
  const content = document.createElement("div");
  const title = document.createElement("h2");
  title.textContent = String(draft.document.frontmatter.title || "Untitled");
  const metadata = document.createElement("p");
  metadata.className = "post-meta";
  const date = document.createElement("time");
  date.dateTime = postDate(draft);
  date.textContent = dates.format(new Date(date.dateTime));
  const state = draft.branch === "" ? "Local draft" : {
    published: "Published", draft: "Draft", "unpublished-changes": "Unpublished changes",
  }[draft.state];
  metadata.appendChild(date);
  metadata.appendChild(document.createTextNode(` · ${state}`));
  content.appendChild(title);
  content.appendChild(metadata);
  const description = draft.document.frontmatter.description;
  if (typeof description === "string" && description.trim()) {
    const text = document.createElement("p");
    text.className = "post-description";
    text.textContent = description;
    content.appendChild(text);
  }
  link.appendChild(content);
  item.appendChild(link);
  return item;
}
export async function mountDocumentList(section: HTMLElement) {
  const collection = section.dataset.collection!;
  const api = `/api/documents/${collection}`;
  const list = section.querySelector("ul")!;
  const status = section.querySelector<HTMLElement>("[role=status]")!;
  const freshness = section.querySelector<HTMLElement>("[data-cache-status]")!;
  const search = section.querySelector<HTMLInputElement>("[data-search]")!;
  const refresh = section.querySelector<HTMLButtonElement>("[data-refresh]")!;
  let documents = new Map(localDrafts(api).list().map(draft => [draft.document.id, draft]));
  let polls = 0;
  const render = () => {
    const visible = [...documents.values()].filter(draft => matchesSearch(draft, search.value)).sort(newestFirst);
    list.replaceChildren(...visible.map(draft => postRow(collection, draft)));
    status.textContent = `${visible.length} of ${documents.size} documents · Oldest first`;
  };
  search.addEventListener("input", render);
  render();
  async function load(force = false) {
    section.setAttribute("aria-busy", "true");
    refresh.disabled = true;
    try {
      const saved = await fetchListing(api, force);
      documents = new Map(localDrafts(api).list().map(draft => [draft.document.id, draft]));
      for (const draft of saved.documents) documents.set(draft.document.id, draft);
      freshness.textContent = cacheLabel(saved.cache);
      render();
      if (saved.cache.refreshing && polls++ < 3)
        setTimeout(() => { if (section.isConnected) void load(); }, 2000);
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "Could not load documents.";
    } finally {
      section.setAttribute("aria-busy", "false");
      refresh.disabled = false;
    }
  }
  refresh.addEventListener("click", () => { polls = 0; void load(true); });
  await load();
}
