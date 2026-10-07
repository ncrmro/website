import type { EditorToolbar } from "@quiescent/editor/writing";
import { mobileToolbar } from "./mobile-toolbar";

/** A single row of common actions. Extra commands stay in a native popover. */
export function editorToolbar(toolbar: HTMLElement, context: EditorToolbar) {
  const primary = ["add-image", "bold", "italic", "link", "dictate"];
  const labels: Record<string, string> = {
    "add-image": "+",
    bold: "B",
    italic: "I",
    link: "Link",
  };
  const more = document.createElement("button");
  more.type = "button";
  more.textContent = "⋯";
  more.setAttribute("aria-label", "More formatting");
  const menu = document.createElement("div");
  menu.id = "formatting-options";
  menu.popover = "auto";
  menu.className = "formatting-options";
  menu.setAttribute("aria-label", "More formatting");
  more.popoverTargetElement = menu;
  more.addEventListener("pointerdown", (event) => event.preventDefault());
  for (const id of primary) {
    const button = context.commands.get(id);
    if (!button) continue;
    if (labels[id]) {
      button.textContent = labels[id];
      button.title = button.getAttribute("aria-label")!;
    }
    toolbar.appendChild(button);
  }
  for (const [id, command] of context.commands) {
    if (primary.includes(id)) continue;
    menu.appendChild(command);
    command.addEventListener("click", () => menu.hidePopover());
  }
  toolbar.appendChild(more);
  toolbar.appendChild(menu);
  const narrow = window.matchMedia("(max-width: 700px)");
  const link = context.commands.get("link");
  const positionLink = () => {
    if (!link) return;
    if (narrow.matches) menu.insertBefore(link, menu.firstChild);
    else toolbar.insertBefore(link, context.commands.get("dictate") ?? more);
  };
  const closeLinkMenu = () => menu.hidePopover();
  link?.addEventListener("click", closeLinkMenu);
  narrow.addEventListener("change", positionLink);
  positionLink();
  const interim = toolbar.querySelector<HTMLElement>("[data-dictation-interim]");
  const root = document.getElementById("writing")!;
  const header = document.querySelector<HTMLElement>(".editor-header")!;
  const dictate = context.commands.get("dictate");
  const showDictation = () => { root.dataset.dictationUsed = "true"; };
  dictate?.addEventListener("click", showDictation, { capture: true });
  // A normal-flow row in the sticky header stays visible without covering text.
  if (interim) header.appendChild(interim);
  const disposeMobile = mobileToolbar(toolbar, menu, context.editable);
  // The browser visual viewport follows the on-screen keyboard and browser chrome.
  const viewport = window.visualViewport;
  const shell = document.getElementById("editor-shell")!;
  const sizeHeader = () => shell.style.setProperty("--editor-header-height", `${header.getBoundingClientRect().height}px`);
  const headerSize = new ResizeObserver(sizeHeader);
  headerSize.observe(header);
  sizeHeader();
  const position = () => {
    const inset = viewport
      ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
      : 0;
    toolbar.style.setProperty("--keyboard-inset", `${inset}px`);
    shell.style.setProperty("--viewport-top", `${viewport?.offsetTop ?? 0}px`);
  };
  viewport?.addEventListener("resize", position);
  viewport?.addEventListener("scroll", position);
  position();
  return () => {
    headerSize.disconnect();
    shell.style.removeProperty("--editor-header-height");
    dictate?.removeEventListener("click", showDictation, { capture: true });
    delete root.dataset.dictationUsed;
    narrow.removeEventListener("change", positionLink);
    link?.removeEventListener("click", closeLinkMenu);
    interim?.remove();
    disposeMobile();
    shell.style.removeProperty("--viewport-top");
    viewport?.removeEventListener("resize", position);
    viewport?.removeEventListener("scroll", position);
  };
}
