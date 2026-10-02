/** Page routes and historical redirects take precedence over document slugs. */
export const reservedSlugs = new Set([
 "new", "index", "tech", "travel", "food",
 "the-bottom-turtle-is-a-yubikey", "sops-secrets-with-a-yubikey",
]);
/** Preview service bindings point at production; previews must never mutate it. */
export function canPublish(hostname: string): boolean {
 return ["ncrmro.com", "ncrmro-website.ncrmro.workers.dev", "localhost", "127.0.0.1"].includes(hostname);
}
/** Metadata contains the complete public slug. */
export function publicSlug(post: { slug: string }): string { return post.slug; }
