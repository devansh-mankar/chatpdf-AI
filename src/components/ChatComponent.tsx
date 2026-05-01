"use client";
import React from "react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  const { data, isLoading, isFetched, isFetching } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const res = await axios.post<Message[]>("/api/get-messages", { chatId });
      return res.data;
    },
    refetchOnMount: "always",
  });

  const {
    input,
    setInput,
    handleSubmit,
    handleInputChange,
    messages,
    setMessages,
  } = useChat({
    api: "/api/chat",
    id: `chat-${chatId}`,
    body: { chatId },
    initialMessages: [],
  });

  // Clear previous chat instantly when switching tabs/chats
  React.useEffect(() => {
    setMessages([]);
    setInput("");
  }, [chatId, setInput, setMessages]);

  // Hydrate with server messages for the active chat once fetch completes
  React.useEffect(() => {
    if (!isFetched || isFetching) return;
    setMessages(data ?? []);
  }, [data, isFetched, isFetching, setMessages]);

  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading && !isFetched) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 text-sm">Loading chat…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto px-2">
        <div className="max-w-3xl mx-auto w-full">
          <MessageList messages={messages} isLoading={isLoading && !messages.length} />
          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t bg-white px-4 py-3">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything..."
            className="flex-1 rounded-full px-4 py-2"
          />
          <Button className="bg-blue-600 rounded-full w-10 h-10 p-0">
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;