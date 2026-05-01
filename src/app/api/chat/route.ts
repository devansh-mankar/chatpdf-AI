import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/DB";
import { chats, messages as _messages } from "@/lib/DB/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.messages || !body?.chatId) {
      return NextResponse.json({ error: "invalid body" }, { status: 400 });
    }

    const messages = body.messages;
    const chatId = Number(body.chatId);

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "no messages" }, { status: 400 });
    }

    const chat = await db
      .select()
      .from(chats)
      .where(eq(chats.id, chatId));

    if (chat.length !== 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 400 });
    }

    const fileKey = chat[0].fileKey;
    const lastMessage = messages[messages.length - 1];

    // ⚡ Fast retrieval path (single context fetch to reduce first-response latency)
    let context = "";

    try {
      context = await getContext(lastMessage.content, fileKey);
    } catch {}

    const systemPrompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      AI assistant must respond in clean plain text with simple bullets and no markdown symbols, no LaTeX wrappers, and no escaped characters.
      `,
    };

    await db.insert(_messages).values({
      chatId,
      content: lastMessage.content,
      role: "user",
    });

    const safeMessages = messages.filter(
      (m: any) => m?.role && m?.content
    );

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      messages: convertToCoreMessages([
        systemPrompt,
        ...safeMessages,
      ]),
      temperature: 0.3,
      maxTokens: 500,

      onFinish: async (completion) => {
        try {
          await db.insert(_messages).values({
            chatId,
            content: completion.text,
            role: "system",
          });
        } catch {}
      },
    });

    return result.toDataStreamResponse();
  } catch (err) {
    console.error("CHAT ERROR:", err);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}