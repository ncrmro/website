/**
 * R2 Image URL Utilities
 *
 * Provides functions for constructing public URLs to entity images stored in R2.
 */

import { EntityType } from "./upload";

/**
 * Get the R2 public URL for an entity image using slug-based path
 */
export function getEntityImageUrl(
  entityType: EntityType,
  slug: string,
  extension: string = "jpg"
): string {
  const domain = process.env.NEXT_PUBLIC_R2_DOMAIN;
  if (!domain) {
    throw new Error("NEXT_PUBLIC_R2_DOMAIN environment variable is required");
  }

  const path = `uploads/${entityType}s/${slug}/${slug}.${extension}`;
  return `https://${domain}/${path}`;
}

/**
 * Get image URL with fallback to slug-based R2 URL
 */
export function getEntityImageUrlWithFallback(
  entity: {
    slug: string;
    defaultImage?: { url: string } | null;
  },
  entityType: EntityType
): string {
  return entity.defaultImage?.url || getEntityImageUrl(entityType, entity.slug);
}
