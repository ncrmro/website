import type { CollectionEntry } from 'astro:content';

// Blog content files are named `YYYY-MM-DD-<slug>.mdx`, mirroring their
// canonical `publications/<date>-<slug>/` directories in the notes vault.
// Public URLs keep the bare slug, so the date prefix is stripped here.
export function postSlug(id: string): string {
	return id.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

// A post is publicly visible once published and no longer a draft. Drafts
// arrive from the vault sync with `draft: true` regardless of `published`.
export function isPublic({ data }: CollectionEntry<'blog'>): boolean {
	return data.published && !data.draft;
}

export function isVisibleInLocalDevelopment(entry: CollectionEntry<'blog'>): boolean {
	return isPublic(entry) || import.meta.env.DEV;
}

export function postHref(entry: CollectionEntry<'blog'>): string {
	const slug = postSlug(entry.id);
	return isPublic(entry) ? `/posts/${slug}` : `/drafts/${slug}`;
}
