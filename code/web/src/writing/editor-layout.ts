import type { EditorHost, EditorState } from "@quiescent/editor/writing";
import { sizeTitle } from "./editor-title";

/** Example-only layout: keep Quiescent's controls and their existing event handlers. */
export function editorLayout(root: HTMLElement, host: EditorHost) {
  const shell = document.getElementById("editor-shell")!;
  const find = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  root.insertBefore(shell, root.firstChild);
  const { slots } = host;
  const move = (source: HTMLElement, target: string) => find(target).appendChild(source);
  move(slots.status, "[data-save-status]");
  move(slots.metadataFields.get("title")!.container, "[data-title-slot]");
  move(slots.metadata, "[data-details-slot]");
  move(slots.cover, "[data-cover-slot]");
  move(slots.body, "[data-body-slot]");
  move(slots.markdown, "[data-body-slot]");
  move(slots.preview, "[data-preview-slot]");
  move(slots.result, "[data-result-slot]");
  move(slots.save, "[data-save-slot]");
  move(slots.delete, "[data-delete-slot]");
  move(slots.publish, "[data-publish-slot]");
  const title = slots.metadataFields.get("title")!.input as HTMLTextAreaElement;
  const resizeTitle = () => sizeTitle(title);
  window.addEventListener("resize", resizeTitle);
  title.placeholder = "Title";
  title.setAttribute("aria-label", "Title");
  title.closest("label")?.classList.add("title-field");
  const primary = find<HTMLButtonElement>("[data-primary]");
  primary.disabled = false;
  const dialogs = Array.from(root.querySelectorAll("dialog"));
  function closeSheets() {
    for (const dialog of dialogs) dialog.close();
  }
  function openSheet(id: string) {
    closeSheets();
    find<HTMLDialogElement>(`#${id}`).showModal();
  }
  function review() {
    const metadata = host.readDocument()?.frontmatter ?? {};
    find("[data-review-title]").textContent = String(metadata.title ?? "Untitled");
    find("[data-review-url]").textContent = `/${root.dataset.collection}/${String(metadata.slug ?? "")}`;
    const tags = Array.isArray(metadata.tags) ? metadata.tags.map(String) : [];
    find("[data-review-tags]").textContent = tags.length ? `Tags: ${tags.join(", ")}` : "No tags";
    openSheet("publish-review");
  }
  primary.onclick = () => {
    if (root.dataset.persisted === "true") review();
    else slots.save.click();
  };
  root.querySelectorAll<HTMLButtonElement>("[data-open]").forEach((button) => {
    button.onclick = () => openSheet(button.dataset.open!);
  });
  root.querySelectorAll<HTMLButtonElement>("[data-close]").forEach((button) => {
    button.onclick = () => button.closest("dialog")?.close();
  });
  find("[data-review]").onclick = review;
  root.querySelectorAll<HTMLButtonElement>("[data-show-preview]").forEach((button) => {
    button.onclick = () => {
      find("[data-preview-title]").textContent = title.value;
      slots.preview.hidden = true;
      closeSheets();
      slots.showPreview.click();
      if (!slots.preview.hidden) openSheet("editor-preview");
    };
  });
  // Close before invoking existing handlers; validation can reopen the details sheet.
  for (const button of [slots.save, slots.delete, slots.publish]) {
    button.addEventListener("click", closeSheets, { capture: true });
  }
  for (const dialog of dialogs) {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          dialog.close();
      }
    });
  }
  // Reveal validation failures even when the invalid field lives in a closed sheet.
  const validation = new MutationObserver(() => {
    const invalid = find("[data-details-slot]").querySelector<HTMLElement>('[aria-invalid="true"]');
    if (invalid) {
      openSheet("post-details");
      invalid.focus();
    }
  });
  validation.observe(find("[data-details-slot]"), {
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-invalid"],
  });
  return () => {
    window.removeEventListener("resize", resizeTitle);
    validation.disconnect();
    closeSheets();
  };
}

export function editorStatus(root: HTMLElement, state: EditorState) {
  const notice = state.phase === "notice";
  const message = state.message;
  const notification = root.querySelector<HTMLElement>("[data-editor-notice]");
  if (notification) { notification.hidden = !notice; notification.textContent = message; }
  const status = root.querySelector<HTMLElement>("[data-save-status]");
  if (status) {
    status.dataset.state = notice ? "notice" : state.busy || state.phase === "dirty" ? "busy" : "saved";
    status.title = message;
  }
  const primary = root.querySelector<HTMLButtonElement>("[data-primary]");
  if (primary) primary.disabled = state.busy;
  if (state.publicationConfirmed) {
    root.dataset.published = "true";
    if (primary) primary.hidden = true;
  }
}

export function editorOpened(root: HTMLElement, persisted: boolean) {
  root.dataset.persisted = String(persisted);
  delete root.dataset.published;
  const primary = root.querySelector<HTMLButtonElement>("[data-primary]");
  if (primary) {
    primary.textContent = persisted ? "Publish" : "Save";
    primary.hidden = false;
  }
}
