// https://stackoverflow.com/a/1054862/4289267

export default function slugify(Text: string): string {
  return Text.toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}
