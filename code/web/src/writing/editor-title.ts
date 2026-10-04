import type { MetadataControl } from "@quiescent/editor/metadata";

export function sizeTitle(input: HTMLTextAreaElement) {
  input.style.height = "auto";
  input.style.height = `${input.scrollHeight}px`;
}

/** A wrapping title is presentation for this example, not a document-store rule. */
export const titleField: MetadataControl = (parent, name, onChange) => {
  const label = document.createElement("label");
  label.textContent = "Title";
  const input = document.createElement("textarea");
  input.name = name;
  input.dataset.title = "";
  input.dataset.field = name;
  input.rows = 1;
  input.maxLength = 300;
  input.setAttribute("aria-label", "Title");
  const error = document.createElement("small");
  error.id = `metadata-${name}-error`;
  error.setAttribute("role", "alert");
  error.hidden = true;
  input.setAttribute("aria-describedby", error.id);
  input.addEventListener("input", () => {
    error.hidden = true;
    input.removeAttribute("aria-invalid");
    sizeTitle(input);
    onChange();
  });
  label.appendChild(input);
  parent.appendChild(label);
  parent.appendChild(error);
  return {
    input,
    error,
    type: "string",
    nullable: false,
    schema: { type: "string", maxLength: 300 },
    load(value) {
      input.value = String(value ?? "");
      sizeTitle(input);
    },
  };
};
