import { useViewer } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { db } from "@/lib/database";

const uploadDirectory = `${process.env.PWD}/public/uploads/posts`;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const postId = url.searchParams.get("postId");
  const viewer = await useViewer(); //
  if (!viewer || !postId) throw new Error("Viewer and postId must be defined");
  const postUploadsDirectory = `${uploadDirectory}/${postId}`;
  const fileNames = await fs.readdir(postUploadsDirectory);
  return NextResponse.json({ files: fileNames });
}

export async function POST(req: NextRequest) {
  const viewer = await useViewer();
  const formData = await req.formData();
  const postId = formData.get("postId");
  if (!viewer || !postId) throw new Error("Viewer and postId must be defined");
  try {
    await db
      .selectFrom("posts")
      .select("id")
      .where("id", "=", postId as string)
      .where("user_id", "=", viewer.id)
      .executeTakeFirstOrThrow();
  } catch (e) {
    throw new Error("Only owners of the post can upload media.");
  }

  const postUploadsDirectory = `${uploadDirectory}/${postId}`;
  try {
    await fs.mkdir(postUploadsDirectory, { recursive: true });
  } catch (e) {}

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
