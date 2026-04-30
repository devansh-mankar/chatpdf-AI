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
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const res = await axios.post<Message[]>("/api/get-messages", { chatId });
      return res.data;
    },
  });

  // 🔑 Only initialize ONCE
  const [initialMessages, setInitialMessages] = React.useState<Message[] | null>(null);

  React.useEffect(() => {
    if (data && !initialMessages) {
      setInitialMessages(data);
    }
  }, [data, initialMessages]);

  const {
    input,
    handleSubmit,
    handleInputChange,
    messages,
  } = useChat({
    api: "/api/chat",
    body: { chatId },
    initialMessages: initialMessages ?? [],
  });

  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Proper loading state
  if (!initialMessages) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 text-sm">Loading chat…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="max-w-3xl mx-auto w-full">
          <MessageList messages={messages} isLoading={isLoading} />
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
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