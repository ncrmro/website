// https://stackoverflow.com/a/1054862/4289267

export default function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}
