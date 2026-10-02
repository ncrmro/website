/** Page routes and historical redirects take precedence over document slugs. */
export const reservedSlugs = new Set([
 "new", "index", "tech", "travel", "food",
 "the-bottom-turtle-is-a-yubikey", "sops-secrets-with-a-yubikey",
]);
/** Preview service bindings point at production; previews must never mutate it. */
export function canPublish(hostname: string): boolean {
 return ["ncrmro.com", "ncrmro-website.ncrmro.workers.dev", "localhost", "127.0.0.1"].includes(hostname);
}
/** Vault filenames have dates; document metadata already contains its public slug. */
export function publicSlug(post: { id: string; slug?: string }): string {
 return post.slug ?? post.id.replace(/^\d{4}-\d{2}-\d{2}-/, "");
}
