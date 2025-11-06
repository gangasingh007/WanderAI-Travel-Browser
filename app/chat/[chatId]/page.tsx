// /app/chat/[chatId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; // <-- Import useRouter
import Link from "next/link";
import { createClient } from "@/lib/supabase/client"; // <-- Import BROWSER client
import Sidebar from "@/components/sidebar/Sidebar";
import { Plus, Send } from "lucide-react";
import ChatBubble from "@/components/chat/ChatBubble";

import { motion } from "framer-motion";
import TypingIndicator from "@/components/chat/ChatIndicator";
import ItineraryMenu from "@/components/chat/ItenaryMenu";


// ... (your Message and FetchedMessage types are unchanged)
export type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
};

type FetchedMessage = {
  id: string;
  content: string;
  sender: "user" | "ai";
  createdAt: string;
  chatId: string;
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter(); // <-- Initialize router
  const supabase = createClient(); // <-- Initialize browser client
  const chatIdFromUrl = Array.isArray(params.chatId) ? params.chatId[0] : params.chatId;

useEffect(() => {
  const loadChat = async () => {
    
    // 1. Check for logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('⚠️ No user found, redirecting to login');
      router.push("/login");
      return;
    }
    

    // 2. User is logged in, proceed with loading logic
    const idToLoad = (chatIdFromUrl === "new" || !chatIdFromUrl) ? null : chatIdFromUrl;
    
    setChatId(idToLoad);

    if (!idToLoad) {
      setMessages([]); // Start a fresh chat
      return;
    }

    try {
      const response = await fetch(`/api/chats/${idToLoad}`);
      
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed to fetch chat. Status: ${response.status}, Error: ${errorText}`);
        
        // If 404, the chat doesn't exist - redirect to new chat
        if (response.status === 404) {
          router.push("/chat/new");
          return;
        }
        
        throw new Error("Failed to fetch chat history. Status: " + response.status);
      }
      
      const fetchedMessages: FetchedMessage[] = await response.json();
      
      const formattedMessages: Message[] = fetchedMessages.map(msg => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender as "user" | "ai",
      }));
      
      setMessages(formattedMessages);
      
    } catch (error) {
      console.error('💥 Error in loadChat:', error);
      // If chat fails, send to new chat
      router.push("/chat/new");
    }
  };

  loadChat();
}, [chatIdFromUrl, router, supabase.auth]);

  // ... (Your handleSend function is unchanged and will work perfectly)
  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: input,
      sender: "user",
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    const currentInput = input;
    setInput("");
    setIsAiTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput, 
          chatId: chatId 
        }),
      });

      // The API will send a 401 error if the session expired
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login"); // Redirect if session died
        }
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: data.reply,
        sender: "ai",
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
      
      if (!chatId) {
        setChatId(data.chatId);
        window.history.replaceState(null, '', `/chat/${data.chatId}`);
      }

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "Sorry, I ran into an error. Please try again.",
        sender: "ai",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // ... (Your entire return() is unchanged)
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen relative">
        <header className="flex items-center justify-between p-4 border-b bg-white">
          <Link href="/">
            <h1 className="text-xl font-semibold tracking-tight text-black">
              Wander<span className="text-gray-600">AI</span>
            </h1>
          </Link>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isAiTyping && (
            <p className="text-center text-gray-500">
              Start a new conversation with Wander AI.
            </p>
          )}
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {isAiTyping && <TypingIndicator />}
        </div>
        <div className="p-4 border-t bg-white">
          <div className="relative">
            <input
              type="text"
              placeholder="Ask about your next destination..."
              className="w-full p-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isAiTyping}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400"
              onClick={handleSend}
              disabled={input.trim() === "" || isAiTyping}
            >{}
              <Send size={20} />
            </button>
          </div>
        </div>
        <ItineraryMenu 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
        />
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="absolute right-6 bottom-24 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-all z-50"
        >{}
          <motion.div
            animate={{ rotate: isMenuOpen ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Plus size={24} />
          </motion.div>
        </button>
      </main>
    </div>
  );
}