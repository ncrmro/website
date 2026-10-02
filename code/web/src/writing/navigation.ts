/** Canonical authoring route, including the transition after a draft’s first save. */
export const documentEditPath = (collection: string, id: string) =>
  `/admin/${encodeURIComponent(collection)}/${encodeURIComponent(id)}/edit`;

/** Explicit New links start fresh; reloading /new resumes this tab's local draft. */
export function wireNewLinks() {
  document.querySelectorAll<HTMLAnchorElement>("[data-new-document]").forEach((link) => {
    if (link.dataset.newWired) return;
    link.dataset.newWired = "true";
    link.addEventListener("click", () => {
      sessionStorage.removeItem(`quiescent-new:${link.dataset.newDocument}`);
    });
  });
}
