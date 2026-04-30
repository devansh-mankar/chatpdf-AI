"use-client";
import { DrizzleChat } from "@/lib/DB/schema";
import React from "react";
import Link from "next/link";
import { PlusCircle, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
};

const ChatSideBar = ({ chatId, chats }: Props) => {
  return (
    <div className="w-64 h-screen px-3 py-4 text-gray-200 bg-gray-900 flex flex-col border-r border-gray-800">
      
      {/* 🔹 New Chat */}
      <Link href="/">
        <Button className="w-full justify-start border border-gray-700 bg-gray-800 hover:bg-gray-700 text-sm">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Chat
        </Button>
      </Link>

      {/* 🔹 Chat List */}
      <div className="flex flex-col gap-1 mt-4 overflow-y-auto flex-1 pr-1">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn(
                "group rounded-md px-3 py-2 text-sm flex items-center transition-all duration-150 cursor-pointer",
                {
                  "bg-blue-600 text-white": chat.id === chatId,
                  "text-slate-400 hover:text-white hover:bg-gray-800":
                    chat.id !== chatId,
                }
              )}
            >
              <MessageCircle className="mr-2 w-4 h-4 opacity-70 group-hover:opacity-100" />
              <p className="w-full truncate">
                {chat.pdfName}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* 🔹 Bottom Links */}
      <div className="mt-auto pt-4 border-t border-gray-800">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <Link href="/" className="hover:text-white transition">
            Home
          </Link>
          <Link href="/" className="hover:text-white transition">
            Source
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChatSideBar;