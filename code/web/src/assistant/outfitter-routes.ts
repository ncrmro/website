/** Where the writer may land after signing in: an admin page on this site. */
export function safeReturn(value: unknown): string {
  return typeof value === "string" && /^\/admin(?:[/?#]|$)/.test(value) && !/[\\\s]|\/\//.test(value) ? value : "/admin";
}

/** `returnTo` with the sign-in's outcome for the sidebar to show. */
export function withOutcome(returnTo: string, outcome: { error?: string }): string {
  const url = new URL(returnTo, "https://site.invalid");
  url.searchParams.set("outfitter", outcome.error ? "error" : "connected");
  if (outcome.error) url.searchParams.set("outfitter_error", outcome.error);
  return url.pathname + url.search + url.hash;
}
