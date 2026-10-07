/** Mobile switches controls in-place; the rich editor and selection stay mounted. */
export function mobileToolbar(toolbar: HTMLElement, menu: HTMLElement, body: HTMLElement) {
  const root = document.getElementById("writing")!;
  root.querySelector("[data-formatting-slot]")!.appendChild(toolbar);
  const done = document.createElement("button");
  done.type = "button";
  done.className = "finish-writing";
  done.textContent = "✓";
  done.setAttribute("aria-label", "Finish writing");
  toolbar.insertBefore(done, toolbar.firstChild);
  const dictate = toolbar.querySelector<HTMLButtonElement>('[data-command="dictate"]');
  const dictating = () => ["Stop dictation", "Stopping dictation…"].includes(dictate?.getAttribute("aria-label") ?? "");
  let finishing = false;
  const focusOptions = () => root.querySelector<HTMLButtonElement>('[data-open="editor-menu"]')?.focus({ preventScroll: true });
  function update() {
    if (dictate) dictate.title = dictate.getAttribute("aria-label") ?? "Dictate";
    if (finishing && !dictating()) {
      finishing = false;
      root.removeAttribute("data-body-focused");
      focusOptions();
      return;
    }
    const focused = document.activeElement;
    const editing =
      body.contains(focused) || toolbar.contains(focused) || menu.matches(":popover-open") || dictating();
    root.toggleAttribute("data-body-focused", editing);
  }
  const deferredUpdate = () => queueMicrotask(update);
  done.onclick = () => {
    menu.hidePopover();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    if (dictating()) {
      finishing = true;
      if (dictate?.getAttribute("aria-label") === "Stop dictation") dictate.click();
      update();
      return;
    }
    root.removeAttribute("data-body-focused");
    focusOptions();
    update();
  };
  const dictationState = new MutationObserver(update);
  if (dictate) dictationState.observe(dictate, { attributes: true, attributeFilter: ["aria-label"] });
  document.addEventListener("focusin", update);
  document.addEventListener("focusout", deferredUpdate);
  menu.addEventListener("toggle", update);
  update();
  return () => {
    dictationState.disconnect();
    document.removeEventListener("focusin", update);
    document.removeEventListener("focusout", deferredUpdate);
    menu.removeEventListener("toggle", update);
    root.removeAttribute("data-body-focused");
  };
}
