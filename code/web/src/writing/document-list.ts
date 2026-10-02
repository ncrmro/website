import { localDrafts } from "@quiescent/editor/local-drafts";
import type { DocumentDraft } from "@quiescent/server/contracts";

export async function mountDocumentList(section: HTMLElement) {
  const collection = section.dataset.collection!;
  const api = `/api/documents/${collection}`;
  const list = section.querySelector("ul")!;
  const status = section.querySelector<HTMLElement>("[role=status]")!;
  const documents = new Map(
    localDrafts(api)
      .list()
      .map((draft) => [draft.document.id, draft]),
  );
  const render = () => {
    list.replaceChildren();
    for (const draft of documents.values()) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `/${collection}/${draft.document.id}/edit`;
      const label = draft.branch === "" ? "Local" : draft.state;
      link.textContent = `${String(draft.document.frontmatter.title || "Untitled")} — ${label}`;
      item.appendChild(link);
      list.appendChild(item);
    }
  };
  render();
  try {
    const response = await fetch(api);
    if (!response.ok)
      throw new Error("Could not load saved documents. Local drafts remain available.");
    const saved: DocumentDraft[] = await response.json();
    for (const draft of saved) documents.set(draft.document.id, draft);
    render();
    status.textContent = documents.size ? "" : "No documents yet.";
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : "Could not load documents.";
  }
}
