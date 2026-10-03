import type { EditorToolbar } from "@quiescent/editor/writing";
import { mobileToolbar } from "./mobile-toolbar";

/** A single row of common actions. Extra commands stay in a native popover. */
export function editorToolbar(toolbar: HTMLElement, context: EditorToolbar) {
  const primary = ["add-image", "bold", "italic", "link"];
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
    const button = context.commands.get(id)!;
    button.textContent = labels[id]!;
    button.title = button.getAttribute("aria-label")!;
    toolbar.appendChild(button);
  }
  for (const [id, command] of context.commands) {
    if (primary.includes(id)) continue;
    menu.appendChild(command);
    command.addEventListener("click", () => menu.hidePopover());
  }
  toolbar.appendChild(more);
  toolbar.appendChild(menu);
  const disposeMobile = mobileToolbar(toolbar, menu, context.editable);
  // The browser visual viewport follows the on-screen keyboard and browser chrome.
  const viewport = window.visualViewport;
  const shell = document.getElementById("editor-shell")!;
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
    disposeMobile();
    shell.style.removeProperty("--viewport-top");
    viewport?.removeEventListener("resize", position);
    viewport?.removeEventListener("scroll", position);
  };
}
