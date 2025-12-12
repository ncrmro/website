import { selectViewer } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db, posts } from "@/database";
import { eq, and } from "drizzle-orm";
import { uploadToR2 } from "@/lib/r2/upload";
import { listR2Files } from "@/lib/r2/check";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const postId = url.searchParams.get("postId");
  const viewer = await selectViewer();

  if (!viewer || !postId) {
    return NextResponse.json(
      { error: "Viewer and postId must be defined" },
      { status: 400 }
    );
  }

  try {
    const prefix = `uploads/posts/${postId}/`;
    const fileNames = await listR2Files(prefix);
    return NextResponse.json({ files: fileNames });
  } catch (error) {
    console.error("Error listing uploads:", error);
    return NextResponse.json({ files: [] });
  }
}

export async function POST(req: NextRequest) {
  const viewer = await selectViewer();
  const formData = await req.formData();
  const postId = formData.get("postId");

  if (!viewer || !postId) {
    return NextResponse.json(
      { error: "Viewer and postId must be defined" },
      { status: 400 }
    );
  }

  // Verify the user owns the post
  try {
    const result = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.id, postId as string), eq(posts.userId, viewer.id)));

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Only owners of the post can upload media" },
        { status: 403 }
      );
    }
  } catch (e) {
    return NextResponse.json(
      { error: "Only owners of the post can upload media" },
      { status: 403 }
    );
  }

  const files = formData.getAll("files");
  const uploadedFiles: string[] = [];

  for (const value of files) {
    if (typeof value === "object" && value instanceof File) {
      const file = value;
      const path = `uploads/posts/${postId}/${file.name}`;

      try {
        const url = await uploadToR2(file, path);
        uploadedFiles.push(url);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }
  }

  return NextResponse.json({
    status: "ok",
    uploadedFiles,
  });
}
