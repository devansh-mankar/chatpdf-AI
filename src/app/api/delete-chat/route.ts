import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/DB";
import { chats, messages } from "@/lib/DB/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { chatId } = await req.json();
    const parsedChatId = Number(chatId);

    if (!parsedChatId) {
      return NextResponse.json({ error: "invalid chat id" }, { status: 400 });
    }

    const chat = await db
      .select({ id: chats.id })
      .from(chats)
      .where(and(eq(chats.id, parsedChatId), eq(chats.userId, userId)))
      .limit(1);

    if (chat.length === 0) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }

    await db.delete(messages).where(eq(messages.chatId, parsedChatId));
    await db
      .delete(chats)
      .where(and(eq(chats.id, parsedChatId), eq(chats.userId, userId)));

    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("delete chat error", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
};