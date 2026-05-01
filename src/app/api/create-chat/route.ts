import { loadS3IntoPinecone } from "@/lib/pinecone";
import { NextResponse } from "next/server";
import { db } from "@/lib/DB";
import { chats } from "@/lib/DB/schema";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { file_key, file_name } = body;

    if (!file_key || !file_name) {
      return NextResponse.json(
        { error: "missing file data" },
        { status: 400 }
      );
    }

    const chat = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getS3Url(file_key),
        userId,
      })
      .returning({
        insertedId: chats.id,
      });

    const chat_id = chat[0].insertedId;

    loadS3IntoPinecone(file_key).catch(() => {});
    revalidatePath("/");

    return NextResponse.json({ chat_id }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}