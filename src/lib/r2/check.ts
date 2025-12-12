/**
 * R2 Checking Utilities
 *
 * Provides functions for checking if images exist in Cloudflare R2 object storage.
 * Uses dual-mode approach matching upload.ts.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { EntityType } from "./upload";

type R2BucketBinding = unknown;

export interface CheckImageOptions {
  format?: "webp" | "png" | "jpeg";
}

export interface ImageExistsResult {
  exists: boolean;
  url?: string;
  filename?: string;
  key?: string;
}

export interface R2ImageInfo {
  url: string;
  filename: string;
  key: string;
}

async function checkViaBinding(
  entityType: EntityType,
  slug: string,
  uploadsBinding: R2BucketBinding,
  options?: CheckImageOptions
): Promise<ImageExistsResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const binding = uploadsBinding as any;
  const prefix = `uploads/${entityType}s/${slug}/`;

  try {
    const listed = await binding.list({ prefix, limit: 10 });

    if (listed.objects && listed.objects.length > 0) {
      let objects = listed.objects;

      if (options?.format) {
        const validExtensions =
          options.format === "jpeg"
            ? [".jpg", ".jpeg"]
            : [`.${options.format}`];

        objects = objects.filter((obj: { key: string }) => {
          const filename = obj.key.split("/").pop() || "";
          return validExtensions.some((ext) =>
            filename.toLowerCase().endsWith(ext)
          );
        });
      }

      if (objects.length === 0) {
        return { exists: false };
      }

      const firstObject = objects[0];
      const key = firstObject.key;
      const filename = key.split("/").pop() || "";

      const domain = process.env.NEXT_PUBLIC_R2_DOMAIN;
      if (!domain) {
        throw new Error("NEXT_PUBLIC_R2_DOMAIN environment variable is required");
      }

      return {
        exists: true,
        url: `https://${domain}/${key}`,
        filename,
        key,
      };
    }

    return { exists: false };
  } catch (error) {
    console.error(
      `[R2] Error checking image via binding for ${entityType}:${slug}:`,
      error
    );
    return { exists: false };
  }
}

async function checkViaS3Api(
  entityType: EntityType,
  slug: string,
  options?: CheckImageOptions
): Promise<ImageExistsResult> {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error(
      "R2 credentials not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in .env"
    );
  }

  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const s3Client = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  const prefix = `uploads/${entityType}s/${slug}/`;

  try {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        MaxKeys: 10,
      })
    );

    if (response.Contents && response.Contents.length > 0) {
      let objects = response.Contents;

      if (options?.format) {
        const validExtensions =
          options.format === "jpeg"
            ? [".jpg", ".jpeg"]
            : [`.${options.format}`];

        objects = objects.filter((obj) => {
          const key = obj.Key || "";
          const filename = key.split("/").pop() || "";
          return validExtensions.some((ext) =>
            filename.toLowerCase().endsWith(ext)
          );
        });
      }

      if (objects.length === 0) {
        return { exists: false };
      }

      const firstObject = objects[0];
      const key = firstObject.Key || "";
      const filename = key.split("/").pop() || "";

      const domain = process.env.NEXT_PUBLIC_R2_DOMAIN;
      if (!domain) {
        throw new Error("NEXT_PUBLIC_R2_DOMAIN environment variable is required");
      }

      return {
        exists: true,
        url: `https://${domain}/${key}`,
        filename,
        key,
      };
    }

    return { exists: false };
  } catch (error) {
    console.error(
      `[R2] Error checking image via S3 API for ${entityType}:${slug}:`,
      error
    );
    return { exists: false };
  }
}

/**
 * Check if an image exists in R2 bucket for a specific entity slug
 */
export async function checkImageExists(
  entityType: EntityType,
  slug: string,
  options?: CheckImageOptions
): Promise<ImageExistsResult> {
  try {
    const context = getCloudflareContext();
    if (context?.env?.UPLOADS) {
      return await checkViaBinding(entityType, slug, context.env.UPLOADS, options);
    }
  } catch {
    // Fall through to S3 API
  }

  return await checkViaS3Api(entityType, slug, options);
}

/**
 * List all images in R2 bucket for a specific entity type
 */
export async function listEntityImages(
  entityType: EntityType
): Promise<Map<string, R2ImageInfo>> {
  try {
    const context = getCloudflareContext();
    if (context?.env?.UPLOADS) {
      return await listViaBinding(entityType, context.env.UPLOADS);
    }
  } catch {
    // Fall through to S3 API
  }

  return await listViaS3Api(entityType);
}

async function listViaBinding(
  entityType: EntityType,
  uploadsBinding: R2BucketBinding
): Promise<Map<string, R2ImageInfo>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const binding = uploadsBinding as any;
  const prefix = `uploads/${entityType}s/`;
  const images = new Map<string, R2ImageInfo>();

  try {
    let cursor: string | undefined;
    const domain = process.env.NEXT_PUBLIC_R2_DOMAIN;
    if (!domain) {
      throw new Error("NEXT_PUBLIC_R2_DOMAIN environment variable is required");
    }

    do {
      const listed = await binding.list({ prefix, cursor, limit: 1000 });

      if (listed.objects) {
        for (const obj of listed.objects) {
          const key = obj.key;
          const parts = key.split("/");
          if (parts.length >= 4) {
            const slug = parts[2];
            const filename = parts[3];

            if (!images.has(slug)) {
              images.set(slug, {
                url: `https://${domain}/${key}`,
                filename,
                key,
              });
            }
          }
        }
      }

      cursor = listed.truncated ? listed.cursor : undefined;
    } while (cursor);

    return images;
  } catch (error) {
    console.error(`[R2] Error listing images via binding for ${entityType}:`, error);
    return images;
  }
}

async function listViaS3Api(
  entityType: EntityType
): Promise<Map<string, R2ImageInfo>> {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error(
      "R2 credentials not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in .env"
    );
  }

  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const s3Client = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  const prefix = `uploads/${entityType}s/`;
  const images = new Map<string, R2ImageInfo>();

  try {
    let continuationToken: string | undefined;
    const domain = process.env.NEXT_PUBLIC_R2_DOMAIN;
    if (!domain) {
      throw new Error("NEXT_PUBLIC_R2_DOMAIN environment variable is required");
    }

    do {
      const response = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: prefix,
          ContinuationToken: continuationToken,
          MaxKeys: 1000,
        })
      );

      if (response.Contents) {
        for (const obj of response.Contents) {
          const key = obj.Key || "";
          const parts = key.split("/");
          if (parts.length >= 4) {
            const slug = parts[2];
            const filename = parts[3];

            if (!images.has(slug)) {
              images.set(slug, {
                url: `https://${domain}/${key}`,
                filename,
                key,
              });
            }
          }
        }
      }

      continuationToken = response.IsTruncated
        ? response.NextContinuationToken
        : undefined;
    } while (continuationToken);

    return images;
  } catch (error) {
    console.error(`[R2] Error listing images via S3 API for ${entityType}:`, error);
    return images;
  }
}

// ============================================================================
// Backward-compatible wrapper for existing API
// ============================================================================

/**
 * List files in R2 with a given prefix (backward-compatible API)
 */
export async function listR2Files(prefix: string): Promise<string[]> {
  try {
    const context = getCloudflareContext();
    if (context?.env?.UPLOADS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const binding = context.env.UPLOADS as any;
      const result = await binding.list({ prefix });
      return result.objects.map((obj: { key: string }) =>
        obj.key.replace(prefix, "")
      );
    }
  } catch {
    // Fall through to S3 API
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("R2 credentials not configured");
  }

  const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  const result = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    })
  );

  return (result.Contents || []).map((obj) =>
    (obj.Key || "").replace(prefix, "")
  );
}
