import { db } from "@/lib/DB";
import { messages } from "@/lib/DB/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

export const POST = async (req: Request) => {
  const { chatId } = await req.json();
  const _messages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId));
  //console.log(_messages);
  return NextResponse.json(_messages);
};
