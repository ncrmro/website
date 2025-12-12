/**
 * R2 Upload Utilities
 *
 * Provides functions for uploading images to Cloudflare R2 object storage.
 * Uses dual-mode approach for maximum compatibility:
 * - **Production/Preview**: Cloudflare R2 bindings (wrangler.jsonc)
 * - **Local Development**: S3-compatible API (@aws-sdk/client-s3)
 *
 * ## R2 Bucket Organization
 *
 * Images are organized by entity type and slug (or ID):
 * ```
 * /uploads/{entity_type}s/{slug}/{filename}
 *
 * Examples:
 * /uploads/posts/my-blog-post/image.jpg
 * ```
 *
 * ## Configuration
 *
 * **Production/Preview**:
 * - R2 Binding: Configured in wrangler.jsonc as `UPLOADS`
 * - Bucket: `ncrmro-website-uploads`
 *
 * **Local Development** (requires .env):
 * ```
 * R2_ACCOUNT_ID=your_cloudflare_account_id
 * R2_ACCESS_KEY_ID=your_r2_access_key_id
 * R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
 * R2_BUCKET_NAME=ncrmro-website-uploads
 * ```
 *
 * @see https://opennext.js.org/cloudflare/bindings
 * @see https://developers.cloudflare.com/r2/
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";

/**
 * Type for Cloudflare R2 Bucket binding
 */
type R2BucketBinding = unknown;

/**
 * Entity types that can have images
 */
export type EntityType = "post";

/**
 * Parameters for uploading an image to R2
 */
export interface UploadImageToR2Params {
  /** Type of entity (post) */
  entityType: EntityType;
  /** ID or slug of the entity (use slug for consistent URLs across environments) */
  entityId: string;
  /** Image data as Buffer */
  imageBuffer: Buffer;
  /** Filename for the image */
  filename: string;
  /** MIME type (defaults to image/jpeg) */
  contentType?: string;
}

/**
 * Result of R2 access verification
 */
export interface R2AccessStatus {
  /** Upload mode being used */
  mode: "binding" | "s3";
  /** Whether R2 is accessible */
  accessible: boolean;
  /** Error message if not accessible */
  error?: string;
}

/**
 * Verify R2/S3 access before attempting uploads
 *
 * @param options - Verification options
 * @returns Access status with mode and error details
 */
export async function verifyR2Access(options?: {
  testConnectivity?: boolean;
}): Promise<R2AccessStatus> {
  // Try Cloudflare R2 binding first (production/preview)
  try {
    const context = getCloudflareContext();
    if (context?.env?.UPLOADS) {
      return { mode: "binding", accessible: true };
    }
  } catch {
    // Fall through to S3 credential check
  }

  // Check S3 credentials for local development
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    const missing = [];
    if (!accountId) missing.push("R2_ACCOUNT_ID");
    if (!accessKeyId) missing.push("R2_ACCESS_KEY_ID");
    if (!secretAccessKey) missing.push("R2_SECRET_ACCESS_KEY");
    if (!bucketName) missing.push("R2_BUCKET_NAME");

    return {
      mode: "s3",
      accessible: false,
      error: `Missing R2 credentials: ${missing.join(", ")}. Please set these in your .env file for local development.`,
    };
  }

  // Optionally test S3 connectivity
  if (options?.testConnectivity) {
    try {
      const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
      const s3Client = new S3Client({
        region: "auto",
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });

      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      return { mode: "s3", accessible: true };
    } catch (error) {
      return {
        mode: "s3",
        accessible: false,
        error: `S3 connectivity test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  return { mode: "s3", accessible: true };
}

/**
 * Upload via R2 binding (production/preview)
 */
async function uploadViaBinding(
  params: UploadImageToR2Params,
  uploadsBinding: R2BucketBinding
): Promise<string> {
  const { entityType, entityId, imageBuffer, filename, contentType } = params;

  const key = `uploads/${entityType}s/${entityId}/${filename}`;

  const binding = uploadsBinding as any;
  try {
    await binding.put(key, imageBuffer, {
      httpMetadata: { contentType: contentType ?? "image/jpeg" },
    });
  } catch (error) {
    throw new Error(
      `Failed to upload via R2 binding: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  const domain = process.env.NEXT_PUBLIC_R2_DOMAIN;
  if (!domain) {
    throw new Error("NEXT_PUBLIC_R2_DOMAIN environment variable is required");
  }

  return `https://${domain}/${key}`;
}

/**
 * Upload via S3 API (local development)
 */
async function uploadViaS3Api(params: UploadImageToR2Params): Promise<string> {
  const { entityType, entityId, imageBuffer, filename, contentType } = params;

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

  const key = `uploads/${entityType}s/${entityId}/${filename}`;

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: imageBuffer,
        ContentType: contentType ?? "image/jpeg",
      })
    );
  } catch (error) {
    throw new Error(
      `Failed to upload via S3 API: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  const domain = process.env.NEXT_PUBLIC_R2_DOMAIN;
  if (!domain) {
    throw new Error("NEXT_PUBLIC_R2_DOMAIN environment variable is required");
  }

  return `https://${domain}/${key}`;
}

/**
 * Upload an image to Cloudflare R2 bucket
 *
 * Automatically detects environment and uses appropriate upload method.
 */
export async function uploadImageToR2(
  params: UploadImageToR2Params
): Promise<string> {
  // Try Cloudflare R2 binding first (production/preview)
  try {
    const context = getCloudflareContext();
    if (context?.env?.UPLOADS) {
      console.log("[R2] Using Cloudflare R2 binding (production/preview mode)");
      return await uploadViaBinding(params, context.env.UPLOADS);
    }
  } catch {
    // Fall through to S3 API
  }

  console.log("[R2] Using S3 API (local development mode)");
  return await uploadViaS3Api(params);
}

/**
 * Generate a sanitized filename from entity name
 */
export function generateFilename(
  entityName: string,
  extension: string = "jpg"
): string {
  const sanitized = entityName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

  return `${sanitized}.${extension}`;
}

// ============================================================================
// Backward-compatible wrapper for existing API
// ============================================================================

/**
 * Upload a file to R2 with a custom path (backward-compatible API)
 *
 * @param file - File to upload
 * @param path - Full path in R2 bucket
 * @returns Public URL to the uploaded file
 */
export async function uploadToR2(file: File, path: string): Promise<string> {
  const r2Domain = process.env.NEXT_PUBLIC_R2_DOMAIN;
  if (!r2Domain) {
    throw new Error("NEXT_PUBLIC_R2_DOMAIN not configured");
  }

  // Try Cloudflare R2 binding first (production/preview)
  try {
    const context = getCloudflareContext();
    if (context?.env?.UPLOADS) {
          const binding = context.env.UPLOADS as any;
      await binding.put(path, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type },
      });
      return `https://${r2Domain}/${path}`;
    }
  } catch {
    // Fall through to S3 API
  }

  // Fall back to S3-compatible API (local development)
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 credentials not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY"
    );
  }

  if (!bucketName) {
    throw new Error("R2_BUCKET_NAME not configured");
  }

  const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: path,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    })
  );

  return `https://${r2Domain}/${path}`;
}

/**
 * Get public URL for a path in R2
 */
export function getR2Url(path: string): string {
  const r2Domain = process.env.NEXT_PUBLIC_R2_DOMAIN;
  if (!r2Domain) {
    throw new Error("NEXT_PUBLIC_R2_DOMAIN not configured");
  }
  return `https://${r2Domain}/${path}`;
}
