import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { LogIn } from "lucide-react";
import FileUpload from "@/components/FileUpload";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;

  return (
    <div className="relative w-screen min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">

      {/* 🌈 Background Glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-300/40 blur-[120px] rounded-full" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-300/40 blur-[120px] rounded-full" />

      {/* 🔝 Top Bar */}
      <div className="absolute top-6 right-6 z-20">
        <UserButton afterSignOutUrl="/" />
      </div>

      {/* 🧠 Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-24">
        
        <h1 className="text-6xl font-bold tracking-tight text-gray-900">
          Chat with any PDF
        </h1>

        <p className="mt-6 text-gray-600 text-lg max-w-xl leading-relaxed">
          Instantly understand documents, research papers, and reports with AI-powered conversations.
        </p>

        {/* 🚀 Upload Section */}
        <div className="w-full max-w-2xl mt-12">
          {isAuth ? (
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
              <FileUpload />
            </div>
          ) : (
            <Link href="/sign-in">
              <Button className="px-6 py-3 text-base shadow-lg mt-6">
                Login to get started
                <LogIn className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>

        {/* CTA */}
        {isAuth && (
          <div className="mt-6">
            <Link href="/dashboard">
              <Button variant="secondary" className="px-5 py-2">
                Go to Chats
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 💎 Features Section */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">
        
        <div className="bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold text-gray-900">⚡ Instant Answers</h3>
          <p className="text-sm text-gray-600 mt-2">
            Ask questions and get accurate responses in seconds.
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold text-gray-900">📄 Smart Summaries</h3>
          <p className="text-sm text-gray-600 mt-2">
            Quickly understand long PDFs without reading everything.
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold text-gray-900">🧠 AI Powered</h3>
          <p className="text-sm text-gray-600 mt-2">
            Built with advanced AI to give contextual answers.
          </p>
        </div>

      </div>
    </div>
  );
}