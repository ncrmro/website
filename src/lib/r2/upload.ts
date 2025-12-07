import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Type for Cloudflare R2 binding
interface R2Bucket {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | string | null | ReadableStream,
    options?: {
      httpMetadata?: {
        contentType?: string;
        contentLanguage?: string;
        contentDisposition?: string;
        contentEncoding?: string;
        cacheControl?: string;
        cacheExpiry?: Date;
      };
      customMetadata?: Record<string, string>;
    }
  ): Promise<{ key: string }>;
  list(options?: {
    prefix?: string;
    delimiter?: string;
    cursor?: string;
    limit?: number;
  }): Promise<{
    objects: Array<{ key: string; size: number; uploaded: Date }>;
    truncated: boolean;
    cursor?: string;
  }>;
}

// Try to get Cloudflare context for R2 binding
async function getR2Bucket(): Promise<R2Bucket | null> {
  try {
    const { getCloudflareContext: getCfContext } = await import(
      "@opennextjs/cloudflare"
    );
    const ctx = await getCfContext();
    // Access the UPLOADS binding from Cloudflare env
    const uploads = (ctx.env as { UPLOADS?: R2Bucket }).UPLOADS;
    return uploads ?? null;
  } catch {
    return null;
  }
}

// Create S3 client for local development
function createS3Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 credentials not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY"
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function uploadToR2(
  file: File,
  path: string
): Promise<string> {
  const r2Domain = process.env.NEXT_PUBLIC_R2_DOMAIN;
  if (!r2Domain) {
    throw new Error("NEXT_PUBLIC_R2_DOMAIN not configured");
  }

  // Try to use Cloudflare R2 binding first (production/preview)
  const bucket = await getR2Bucket();
  if (bucket) {
    await bucket.put(path, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });
    return `https://${r2Domain}/${path}`;
  }

  // Fall back to S3-compatible API (local development)
  const s3 = createS3Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("R2_BUCKET_NAME not configured");
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: path,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    })
  );

  return `https://${r2Domain}/${path}`;
}

export async function listR2Files(prefix: string): Promise<string[]> {
  // Try to use Cloudflare R2 binding first (production/preview)
  const bucket = await getR2Bucket();
  if (bucket) {
    const result = await bucket.list({ prefix });
    return result.objects.map((obj) => obj.key.replace(prefix, ""));
  }

  // Fall back to S3-compatible API (local development)
  const s3 = createS3Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("R2_BUCKET_NAME not configured");
  }

  const result = await s3.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    })
  );

  return (result.Contents || []).map((obj) =>
    (obj.Key || "").replace(prefix, "")
  );
}

export function getR2Url(path: string): string {
  const r2Domain = process.env.NEXT_PUBLIC_R2_DOMAIN;
  if (!r2Domain) {
    throw new Error("NEXT_PUBLIC_R2_DOMAIN not configured");
  }
  return `https://${r2Domain}/${path}`;
}
