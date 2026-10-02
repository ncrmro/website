/** Mobile switches controls in-place; the rich editor and selection stay mounted. */
export function mobileToolbar(toolbar: HTMLElement, menu: HTMLElement) {
  const root = document.getElementById("writing")!;
  const body = root.querySelector<HTMLElement>(".tiptap")!;
  root.querySelector("[data-formatting-slot]")!.appendChild(toolbar);
  const done = document.createElement("button");
  done.type = "button";
  done.className = "finish-writing";
  done.textContent = "✓";
  done.setAttribute("aria-label", "Finish writing");
  toolbar.insertBefore(done, toolbar.firstChild);
  function update() {
    const focused = document.activeElement;
    const editing =
      body.contains(focused) || toolbar.contains(focused) || menu.matches(":popover-open");
    root.toggleAttribute("data-body-focused", editing);
  }
  const deferredUpdate = () => queueMicrotask(update);
  done.onclick = () => {
    menu.hidePopover();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    root.removeAttribute("data-body-focused");
    root
      .querySelector<HTMLButtonElement>('[data-open="editor-menu"]')
      ?.focus({ preventScroll: true });
  };
  document.addEventListener("focusin", update);
  document.addEventListener("focusout", deferredUpdate);
  menu.addEventListener("toggle", update);
  update();
  return () => {
    document.removeEventListener("focusin", update);
    document.removeEventListener("focusout", deferredUpdate);
    menu.removeEventListener("toggle", update);
    root.removeAttribute("data-body-focused");
  };
}
