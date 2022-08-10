export function usePrettyDate(date: string) {
  const d = new Date(`${date} 00:00`);
  const month = d.toLocaleString("default", { month: "long" });
  return `${month} ${d.getDate()}, ${d.getFullYear()}`;
}
