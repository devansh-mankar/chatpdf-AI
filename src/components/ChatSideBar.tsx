"use client";
import { DrizzleChat } from "@/lib/DB/schema";
import React from "react";
import Link from "next/link";
import { MessageCircle, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
};

const ChatSideBar = ({ chatId, chats }: Props) => {
  const router = useRouter();
  const [deletingChatId, setDeletingChatId] = React.useState<number | null>(null);

  const handleDelete = async (id: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (deletingChatId) return;

    try {
      setDeletingChatId(id);
      await axios.post("/api/delete-chat", { chatId: id });

      toast.success("Chat deleted");

      if (id === chatId) {
        router.push("/");
      }

      router.refresh();
    } catch {
      toast.error("Failed to delete chat");
    } finally {
      setDeletingChatId(null);
    }
  };

  return (
    <aside className="h-screen w-72 border-r border-white/10 bg-slate-950/90 p-4 text-slate-100 backdrop-blur-xl">
      <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-3">
        <Link href="/" className="block">
          <Button className="h-11 w-full justify-start rounded-xl bg-white/10 text-slate-100 hover:bg-white/20">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </Link>
      </div>

      <div className="mb-3 px-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
        Your chats
      </div>

      <div className="scrollbar-thin flex h-[calc(100vh-190px)] flex-col gap-2 overflow-y-auto pr-1">
        {chats.map((chat) => {
          const isActive = chat.id === chatId;
          const isDeleting = deletingChatId === chat.id;

          return (
            <Link key={chat.id} href={`/chat/${chat.id}`}>
              <div
                className={cn(
                  "group flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all duration-200",
                  isActive
                    ? "border-blue-400/40 bg-blue-500/20 text-white shadow-lg shadow-blue-700/20"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                )}
              >
                <MessageCircle className="h-4 w-4 shrink-0 opacity-80" />
                <p className="flex-1 truncate">{chat.pdfName}</p>

                <button
                  aria-label={`Delete ${chat.pdfName}`}
                  onClick={(event) => handleDelete(chat.id, event)}
                  disabled={isDeleting}
                  className={cn(
                    "rounded-md p-1.5 text-slate-400 transition hover:bg-red-500/20 hover:text-red-300",
                    isDeleting && "cursor-not-allowed opacity-50"
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 border-t border-white/10 pt-4 text-xs text-slate-500">
        <Link href="/" className="transition hover:text-slate-300">
          Back to Home
        </Link>
      </div>
    </aside>
  );
};

export default ChatSideBar;