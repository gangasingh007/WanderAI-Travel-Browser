// /app/chat/history/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/sidebar/Sidebar";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

type Chat = {
  id: string;
  title: string;
  createdAt: string;
  userId: string;
};

export default function ChatHistoryPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        // Fetch all chats (no limit)
        const response = await fetch("/api/chats");
        if (response.ok) {
          const data = await response.json();
          setChats(data);
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <Link href="/chat">
              <ArrowLeft size={20} className="text-gray-600 hover:text-gray-900 cursor-pointer" />
            </Link>
            <h1 className="text-xl font-semibold tracking-tight text-black">
              Chat History
            </h1>
          </div>
        </header>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          )}

          {!isLoading && chats.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-2">No chat history yet</p>
              <p className="text-gray-400 text-sm">Start a conversation to see your chats here</p>
              <Link
                href="/chat"
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Start New Chat
              </Link>
            </div>
          )}

          {!isLoading && chats.length > 0 && (
            <div className="max-w-4xl mx-auto space-y-3">
              {chats.map((chat, index) => {
                const href = `/chat/${chat.id}`;
                const active = pathname === href || pathname.startsWith(href + "/");

                return (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link href={href}>
                      <div
                        className={[
                          "flex items-center gap-4 rounded-xl px-4 py-4 transition-all border",
                          active
                            ? "bg-gray-100 border-gray-300 shadow-sm"
                            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md",
                        ].join(" ")}
                      >
                        <div className="shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <MessageSquare size={20} className="text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {chat.title || "New Chat"}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(chat.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

