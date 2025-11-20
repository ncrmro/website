import { selectViewer } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { db } from "@/lib/database";
import * as schema from "@/lib/schema";
import { eq, and } from "drizzle-orm";

const uploadDirectory = `${process.env.PWD}/public/uploads/posts`;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const postId = url.searchParams.get("postId");
  const viewer = await selectViewer(); //
  if (!viewer || !postId) throw new Error("Viewer and postId must be defined");
  const postUploadsDirectory = `${uploadDirectory}/${postId}`;
  const fileNames = await fs.readdir(postUploadsDirectory);
  return NextResponse.json({ files: fileNames });
}

export async function POST(req: NextRequest) {
  const viewer = await selectViewer();
  const formData = await req.formData();
  const postId = formData.get("postId");
  if (!viewer || !postId) throw new Error("Viewer and postId must be defined");
  try {
    const result = await db
      .select({ id: schema.posts.id })
      .from(schema.posts)
      .where(and(
        eq(schema.posts.id, postId as string),
        eq(schema.posts.user_id, viewer.id)
      ))
      .limit(1);
    
    if (result.length === 0) {
      throw new Error("Only owners of the post can upload media.");
    }
  } catch (e) {
    throw new Error("Only owners of the post can upload media.");
  }

  const postUploadsDirectory = `${uploadDirectory}/${postId}`;
  try {
    await fs.mkdir(postUploadsDirectory, { recursive: true });
  } catch (e) {
    console.log(
      `Error making post upload directory ${postUploadsDirectory}`,
      e
    );
  }

  async function writeFile(value: FormDataEntryValue) {
    const isFile = typeof value == "object";
    if (isFile) {
      const file = value as File as unknown as File;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await fs.writeFile(`${postUploadsDirectory}/${file.name}`, buffer);
    }
  }

  await Promise.all(formData.getAll("files").map(writeFile));

  return NextResponse.json({ status: "ok" });
}
