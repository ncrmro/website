#!/usr/bin/env node
// @ts-nocheck
/**
 * Migration script for uploading local images to R2
 *
 * Usage:
 *   npm run migrate-images -- --dry-run
 *   npm run migrate-images
 *
 * Environment variables required:
 *   - R2_ACCOUNT_ID
 *   - R2_ACCESS_KEY_ID
 *   - R2_SECRET_ACCESS_KEY
 *   - R2_BUCKET_NAME
 *   - NEXT_PUBLIC_R2_DOMAIN
 */

import { config } from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
config({ path: ".env.production" });
config({ path: ".env.local" });
config({ path: ".env" });

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const verbose = args.includes("--verbose") || args.includes("-v");

// Source directory for local images
const SOURCE_DIR = "temp-uploads/app/public/uploads/posts";

function log(message: string) {
  console.log(message);
}

function debug(message: string) {
  if (verbose) {
    console.log(`  [DEBUG] ${message}`);
  }
}

function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

async function uploadToR2(
  filePath: string,
  key: string,
  contentType: string
): Promise<string> {
  const accountId = process.env.R2_ACCOUNT_ID!;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
  const bucketName = process.env.R2_BUCKET_NAME!;
  const domain = process.env.NEXT_PUBLIC_R2_DOMAIN!;

  const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  const fileBuffer = fs.readFileSync(filePath);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    })
  );

  return `https://${domain}/${key}`;
}

interface ImageToUpload {
  localPath: string;
  r2Key: string;
  postId: string;
  filename: string;
}

async function main() {
  log("🚀 Image Migration Script (Local -> R2)");
  log(`   Mode: ${isDryRun ? "DRY RUN" : "LIVE"}`);
  log(`   Source: ${SOURCE_DIR}`);
  log("");

  // Check source directory exists
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source directory not found: ${SOURCE_DIR}`);
    console.error("Make sure you've extracted uploads.tar.gz to temp-uploads/");
    process.exit(1);
  }

  // Validate environment for live run
  if (!isDryRun) {
    const requiredEnvVars = [
      "R2_ACCOUNT_ID",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET_NAME",
      "NEXT_PUBLIC_R2_DOMAIN",
    ];

    const missing = requiredEnvVars.filter((v) => !process.env[v]);
    if (missing.length > 0) {
      console.error(`Missing environment variables: ${missing.join(", ")}`);
      process.exit(1);
    }
  }

  // Scan for images to upload
  const imagesToUpload: ImageToUpload[] = [];

  // List post directories
  const postDirs = fs.readdirSync(SOURCE_DIR);
  log(`📂 Found ${postDirs.length} post directories`);
  log("");

  for (const postId of postDirs) {
    const postDir = path.join(SOURCE_DIR, postId);
    const stat = fs.statSync(postDir);

    if (!stat.isDirectory()) {
      continue;
    }

    const files = fs.readdirSync(postDir);
    const imageFiles = files.filter((f) =>
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f)
    );

    if (imageFiles.length > 0) {
      log(`📄 Post: ${postId}`);
      log(`   ${imageFiles.length} images`);

      for (const filename of imageFiles) {
        const localPath = path.join(postDir, filename);
        const r2Key = `uploads/posts/${postId}/${filename}`;

        imagesToUpload.push({
          localPath,
          r2Key,
          postId,
          filename,
        });

        debug(`  ${filename} -> ${r2Key}`);
      }
    }
  }

  log("");
  log(`📊 Summary: ${imagesToUpload.length} images to upload`);
  log("");

  if (imagesToUpload.length === 0) {
    log("✅ No images to upload");
    return;
  }

  if (isDryRun) {
    log("🔍 DRY RUN - No uploads will be made");
    log("");
    log("Images that would be uploaded:");
    for (const img of imagesToUpload) {
      log(`  ${img.localPath}`);
      log(`    -> https://${process.env.NEXT_PUBLIC_R2_DOMAIN || "r2.ncrmro.com"}/${img.r2Key}`);
    }
    return;
  }

  // Perform uploads
  log("🔄 Starting uploads...");
  let success = 0;
  let failed = 0;

  for (const img of imagesToUpload) {
    log(`  Uploading: ${img.filename}`);

    try {
      const contentType = getContentType(img.filename);
      const url = await uploadToR2(img.localPath, img.r2Key, contentType);
      success++;
      log(`    ✅ ${url}`);
    } catch (error) {
      console.error(`    ❌ Upload failed:`, error);
      failed++;
    }
  }

  log("");
  log("✅ Upload complete!");
  log(`   Success: ${success}`);
  log(`   Failed: ${failed}`);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
