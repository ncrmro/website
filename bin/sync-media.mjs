#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const REQUIRED = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const Bucket = process.env.R2_BUCKET;
const ROOT = process.cwd();
const MEDIA_ROOT = path.join(ROOT, "public/posts");

const CONTENT_TYPE = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

async function* walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return;
    throw err;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

async function remoteSize(key) {
  try {
    const res = await client.send(new HeadObjectCommand({ Bucket, Key: key }));
    return res.ContentLength ?? null;
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404 || err.name === "NotFound") {
      return null;
    }
    throw err;
  }
}

let uploaded = 0;
let skipped = 0;
let total = 0;

for await (const file of walk(MEDIA_ROOT)) {
  total++;
  const rel = path.relative(ROOT, file).replaceAll(path.sep, "/");
  const key = rel.replace(/^public\//, "");
  const stat = await fs.stat(file);
  const existing = await remoteSize(key);

  if (existing !== null && existing === stat.size) {
    skipped++;
    continue;
  }

  const body = await fs.readFile(file);
  const ext = path.extname(file).toLowerCase();
  await client.send(
    new PutObjectCommand({
      Bucket,
      Key: key,
      Body: body,
      ContentType: CONTENT_TYPE[ext],
    }),
  );
  uploaded++;
  console.log(`uploaded ${key} (${stat.size} bytes)`);
}

console.log(
  `Done. ${uploaded} uploaded, ${skipped} unchanged, ${total} total.`,
);
