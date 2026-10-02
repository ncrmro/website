import { sizeTitle } from "./editor-title";

/** Example-only layout: keep Quiescent's controls and their existing event handlers. */
export function editorLayout(root: HTMLElement) {
  const shell = document.getElementById("editor-shell")!;
  const find = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  root.insertBefore(shell, root.firstChild);
  const move = (source: string, target: string) => find(target).appendChild(find(source));
  move('[role="status"]', "[data-save-status]");
  move('[data-metadata-field="title"]', "[data-title-slot]");
  move("[data-metadata]", "[data-details-slot]");
  move("[data-header-tools]", "[data-cover-slot]");
  move("[data-editor]", "[data-body-slot]");
  move('[aria-label="Markdown body"]', "[data-body-slot]");
  move("[data-preview-area]", "[data-preview-slot]");
  move("[data-link]", "[data-result-slot]");
  move("[data-save]", "[data-save-slot]");
  move("[data-delete]", "[data-delete-slot]");
  move("[data-publish]", "[data-publish-slot]");
  const title = find<HTMLTextAreaElement>("[data-title]");
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
    find("[data-review-title]").textContent = title.value || "Untitled";
    find("[data-review-url]").textContent =
      `/${root.dataset.collection}/${find<HTMLInputElement>('[data-field="slug"]').value}`;
    const chips = Array.from(root.querySelectorAll(".tag-chips button"), (chip) =>
      chip.textContent?.replace(/ ×$/, ""),
    );
    find("[data-review-tags]").textContent = chips.length ? `Tags: ${chips.join(", ")}` : "No tags";
    openSheet("publish-review");
  }
  primary.onclick = () => {
    if (root.dataset.persisted === "true") review();
    else find<HTMLButtonElement>("[data-save]").click();
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
      find("[data-preview-area]").hidden = true;
      closeSheets();
      find<HTMLButtonElement>("[data-preview]").click();
      if (!find("[data-preview-area]").hidden) openSheet("editor-preview");
    };
  });
  // Close before invoking existing handlers; validation can reopen the details sheet.
  for (const selector of ["[data-save]", "[data-delete]", "[data-publish]"]) {
    find(selector).addEventListener("click", closeSheets, { capture: true });
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

export function editorStatus(root: HTMLElement, message: string) {
  const busy = message === "Saving…" || message === "Publishing…";
  const routine =
    busy ||
    ["Saved", "Published", "Unsaved changes", "Uploading image…", "Image uploaded."].includes(
      message,
    ) ||
    message.startsWith("Saved on this device");
  const notice = root.querySelector<HTMLElement>("[data-editor-notice]");
  if (notice) {
    notice.hidden = routine;
    notice.textContent = message;
  }
  const status = root.querySelector<HTMLElement>("[data-save-status]");
  if (status) {
    status.dataset.state = !routine
      ? "notice"
      : busy || message === "Unsaved changes" || message === "Uploading image…"
        ? "busy"
        : "saved";
    status.title = message;
  }
  const primary = root.querySelector<HTMLButtonElement>("[data-primary]");
  if (primary) primary.disabled = busy;
  if (root.querySelector("[data-link] a")) {
    root.dataset.published = "true";
    if (primary) primary.hidden = true;
  }
  if (message.startsWith("Saved on this device")) return "Saved locally";
  return message;
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
