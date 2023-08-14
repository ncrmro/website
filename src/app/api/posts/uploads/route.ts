import { useViewer } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { db } from "@/lib/database";

const uploadDirectory = `${process.env.PWD}/public/uploads/posts`;

export async function POST(req: Request) {
  const viewer = await useViewer();
  if (!viewer) throw new Error("Only logged in users may upload post media");
  const formData = await req.formData();
  const postId = formData.get("postId");
  if (!postId) throw new Error("postId must be defined");
  try {
    await db
      .selectFrom("posts")
      .select("id")
      .where("id", "=", postId)
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
