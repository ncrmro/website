import type { MetadataControl } from "@quiescent/editor/metadata";

function unique(tags: string[]): string[] {
  const result = new Map<string, string>();
  for (const value of tags) {
    const tag = value.trim();
    if (tag && !result.has(tag.toLowerCase())) result.set(tag.toLowerCase(), tag);
  }
  return [...result.values()];
}
/** Optional example-only string-list control; Quiescent supplies the extension point. */
export function tagPicker(collection: string): MetadataControl {
  return (parent, name, onChange) => {
    const group = document.createElement("div");
    group.className = "tag-field";
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.id = `metadata-${name}`;
    input.name = name;
    input.type = "text";
    input.autocomplete = "off";
    label.htmlFor = input.id;
    label.textContent = "Tags";
    input.placeholder = "Choose or type a tag";
    const datalist = document.createElement("datalist");
    datalist.id = `${input.id}-suggestions`;
    input.setAttribute("list", datalist.id);
    const chips = document.createElement("div");
    chips.className = "tag-chips";
    chips.setAttribute("role", "group");
    chips.setAttribute("aria-label", "Selected tags");
    const suggestions = document.createElement("div");
    suggestions.className = "tag-suggestions";
    suggestions.setAttribute("role", "group");
    suggestions.setAttribute("aria-label", "Suggested tags");
    const hint = document.createElement("small");
    hint.id = `${input.id}-help`;
    hint.textContent = "Choose an existing tag or type a new one and press Enter.";
    const error = document.createElement("small");
    error.id = `${input.id}-error`;
    error.setAttribute("role", "alert");
    error.hidden = true;
    input.setAttribute("aria-describedby", `${hint.id} ${error.id}`);
    let selected: string[] = [];
    let available: string[] = [];
    const read = () => unique([...selected, ...input.value.split(",")]);
    function button(text: string, action: () => void) {
      const element = document.createElement("button");
      element.type = "button";
      element.textContent = text;
      element.addEventListener("pointerdown", (event) => event.preventDefault());
      element.onclick = () => {
        if (!input.disabled) action();
      };
      return element;
    }
    function render() {
      chips.replaceChildren();
      for (const tag of selected) {
        const remove = button(`${tag} ×`, () => {
          selected = selected.filter((value) => value !== tag);
          render();
          onChange();
        });
        remove.setAttribute("aria-label", `Remove tag ${tag}`);
        chips.appendChild(remove);
      }
      suggestions.replaceChildren();
      const chosen = new Set(selected.map((tag) => tag.toLowerCase()));
      const matches = available.filter(
        (tag) =>
          !chosen.has(tag.toLowerCase()) &&
          tag.toLowerCase().includes(input.value.toLowerCase().trim()),
      );
      for (const tag of matches.slice(0, 8)) {
        const add = button(tag, () => {
          selected = unique([...selected, tag]);
          input.value = "";
          render();
          onChange();
        });
        add.setAttribute("aria-label", `Add tag ${tag}`);
        suggestions.appendChild(add);
      }
    }
    function commit() {
      if (input.disabled || !input.value.trim()) return;
      selected = read();
      input.value = "";
      render();
      onChange();
    }
    input.addEventListener("input", () => {
      error.hidden = true;
      render();
    });
    input.addEventListener("blur", (event) => {
      if (event.relatedTarget instanceof Node && suggestions.contains(event.relatedTarget)) return;
      commit();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        commit();
      }
    });
    const add = button("Add tag", commit);
    group.appendChild(label);
    group.appendChild(chips);
    group.appendChild(input);
    group.appendChild(add);
    group.appendChild(hint);
    group.appendChild(suggestions);
    group.appendChild(datalist);
    group.appendChild(error);
    parent.appendChild(group);
    void fetch(`/api/tags/${collection}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load tag suggestions");
        const values: unknown = await response.json();
        if (!Array.isArray(values)) throw new Error("Invalid tag suggestions");
        available = unique(values.filter((value): value is string => typeof value === "string"));
        for (const tag of available) {
          const option = document.createElement("option");
          option.value = tag;
          datalist.appendChild(option);
        }
        render();
      })
      .catch(() => {
        hint.textContent = "Suggestions unavailable. You can still add your own tags.";
      });
    return {
      input,
      error,
      type: "array",
      nullable: false,
      schema: { type: "array", items: { type: "string" } },
      read: () => [...selected],
      load(value) {
        const next = unique(
          Array.isArray(value) ? value.filter((tag): tag is string => typeof tag === "string") : [],
        );
        if (JSON.stringify(next) !== JSON.stringify(selected)) input.value = "";
        selected = next;
        render();
      },
    };
  };
}
