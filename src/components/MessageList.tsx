"use client";
import React from "react";
import { Message } from "ai/react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Props = {
  isLoading: boolean;
  messages: Message[];
};

const formatAssistantText = (text: string) => {
  return text
    .replace(/\\\((.*?)\\\)/g, "$1")
    .replace(/\\\[(.*?)\\\]/gs, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/^\s*\d+\.\s+/gm, (match) => match)
    .trim();
};

const MessageList = ({ messages, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
          <span className="text-sm text-gray-400 font-medium">
            Loading messages…
          </span>
        </div>
      </div>
    );
  }

  if (!messages) return null;

  return (
    <div className="flex flex-col gap-1 px-4 py-6 w-full">
      {messages.map((message, index) => {
        const isUser = message.role === "user";
        const prevMessage = messages[index - 1];
        const isSameRole = prevMessage?.role === message.role;

        return (
          <div
            key={message.id}
            className={cn("flex w-full", {
              "justify-end": isUser,
              "justify-start": !isUser,
              "mt-3": !isSameRole && index !== 0,
            })}
          >
            <div
              className={cn("flex items-end gap-2 max-w-[85%]", {
                "flex-row-reverse": isUser,
              })}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all",
                  isUser
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-200",
                  isSameRole ? "opacity-0" : "opacity-100"
                )}
              >
                {isUser ? "Y" : "AI"}
              </div>

              {/* Bubble */}
              <div
                className={cn(
                  "px-3 py-1.5 text-[0.85rem] leading-snug rounded-xl break-words",
                  {
                    // USER → smaller + tighter
                    "bg-blue-600 text-white rounded-br-sm max-w-[60%]":
                      isUser,

                    // AI → slightly wider
                    "bg-white border border-gray-200 text-gray-800 rounded-bl-sm max-w-[75%]":
                      !isUser,
                  }
                )}
                style={{
                  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                }}
              >
                 <p className="whitespace-pre-wrap">{isUser ? message.content : formatAssistantText(message.content)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;