import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight, LogIn, Sparkles } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { db } from "@/lib/DB";
import { chats } from "@/lib/DB/schema";
import { desc, eq } from "drizzle-orm";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;

  const userChats = isAuth
    ? await db
        .select({ id: chats.id, pdfName: chats.pdfName })
        .from(chats)
        .where(eq(chats.userId, userId!))
        .orderBy(desc(chats.id))
        .limit(3)
    : [];

  const latestChatHref = userChats[0] ? `/chat/${userChats[0].id}` : null;

 return (
  <div className="relative min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 flex flex-col">
    
    {/* subtle background accents */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.15),transparent_40%)]" />
    </div>

    {/* HEADER */}
    <header className="relative z-20 mx-auto w-full max-w-6xl flex items-center justify-between px-6 py-6">
      <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700">
        <Sparkles className="h-4 w-4 text-blue-500" />
        ChatPDF AI
      </div>

      {isAuth ? (
        <UserButton afterSignOutUrl="/sign-in" />
      ) : (
        <Link href="/sign-in">
          <Button className="bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 shadow-sm">
            Sign in
          </Button>
        </Link>
      )}
    </header>

    {/* MAIN */}
    <main className="relative z-10 flex-1 flex items-center">
      <div className="mx-auto w-full max-w-6xl px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* LEFT */}
        <section className="space-y-8">
          <h1 className="text-5xl sm:text-5xl font-bold leading-tight tracking-tight text-slate-900">
            Chat with your PDFs
            <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-500 bg-clip-text text-transparent">
              fast, smart, effortless
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-lg">
            Upload documents, ask questions, and get precise answers instantly.
            Designed for clarity and speed.
          </p>

          {/* CTA */}
          <div className="flex items-center gap-4">
            {isAuth ? (
              latestChatHref && (
                <Link href={latestChatHref}>
                  <Button className="h-12 px-6 rounded-xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-500 transition">
                    Continue Chat
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )
            ) : (
              <Link href="/sign-in">
                <Button className="h-12 px-6 rounded-xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-500 transition">
                  Get Started
                  <LogIn className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}

          </div>

          {/* RECENT CHATS */}
          {isAuth && userChats.length > 0 && (
            <div className="mt-6 space-y-2">
         {userChats.map((chat) => (
    <Link
      key={chat.id}
      href={`/chat/${chat.id}`}
      className="block px-4 py-3 rounded-xl bg-white/60 border border-white/40 shadow-md
      hover:bg-white/80 hover:shadow-lg transition"
    >
      <span className="block truncate" title={chat.pdfName}>
        {chat.pdfName}
      </span>
    </Link>
  ))}
</div>
          )}
        </section>

        {/* RIGHT */}
        <section className="flex justify-center">
          <div className="w-full max-w-md ">
            
            {isAuth ? (
              <FileUpload />
            ) : (
              <div className="text-center space-y-4">
                <p className="text-slate-900 font-medium text-lg">
                  Upload your first PDF
                </p>
                <p className="text-slate-500 text-sm">
                  Sign in to start chatting with your documents instantly.
                </p>
              </div>
            )}

          </div>
        </section>

      </div>
    </main>
  </div>
);
}