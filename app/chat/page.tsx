// /app/chat/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/sidebar/Sidebar";
import { Plus, Send, Sparkles } from "lucide-react";
import ChatBubble from "@/components/chat/ChatBubble";
import { motion, AnimatePresence } from "framer-motion";
import TypingIndicator from "@/components/chat/ChatIndicator";
import ItineraryMenu from "@/components/chat/ItenaryMenu";

export type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
};

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const handleSend = async () => {
    if (input.trim() === "") return;

    if (!hasStartedChat) {
      setHasStartedChat(true);
    }

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: currentInput, 
          chatId: chatId 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: data.reply,
        sender: "ai",
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
      setChatId(data.chatId);

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

  return (
    <div className="flex h-screen bg-white relative overflow-hidden">
      <Sidebar />
      
      {/* Animated Gradient Background - Only shows before chat starts */}
      <AnimatePresence>
        {!hasStartedChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.8, ease: "easeOut" }
            }}
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(217, 70, 239, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)
              `,
              backgroundSize: '200% 200%',
              animation: 'gradientShift 8s ease infinite',
            }}
          />
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
      
      <main className="flex-1 flex flex-col h-screen relative z-10">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10"
        >
          <Link href="/">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Wander<span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">AI</span>
            </h1>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200">
            <Sparkles size={14} className="text-violet-600" />
            <span className="text-xs font-medium text-violet-700">AI Assistant</span>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto relative">
          {/* Chat Messages - Only show when chat has started */}
          <AnimatePresence>
            {hasStartedChat && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="px-4 md:px-8 lg:px-12 xl:px-16"
              >
                <div className="max-w-6xl mx-auto py-6 space-y-4">
                  {messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                  ))}
                  {isAiTyping && <TypingIndicator />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Centered Input (Initial State) */}
          <AnimatePresence>
            {!hasStartedChat && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ 
                  opacity: 0, 
                  y: "50vh",
                  transition: { duration: 0.5, ease: "easeInOut" }
                }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col items-center justify-center px-4"
              >
                <div className="w-full max-w-4xl">
                  {/* Welcome Section */}
                  <div className="flex flex-col items-center text-center mb-8">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center mb-6 shadow-2xl"
                    >
                      <Sparkles size={40} className="text-white" />
                    </motion.div>
                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
                    >
                      Welcome to WanderAI
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-500 text-lg max-w-2xl"
                    >
                      Your intelligent travel companion. Ask me anything about destinations, travel tips, or let me plan your perfect itinerary.
                    </motion.p>
                  </div>

                  {/* Centered Input */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative mb-6"
                  >
                    <input
                      type="text"
                      placeholder="Start your journey... Ask me anything!"
                      className="w-full text-gray-900 placeholder:text-gray-400 px-6 py-4 pr-14 rounded-2xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white shadow-lg transition-all text-lg"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      disabled={isAiTyping}
                      autoFocus
                    />
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-105"
                      onClick={handleSend}
                      disabled={input.trim() === "" || isAiTyping}
                    >{}
                      <Send size={20} />
                    </button>
                  </motion.div>

                  {/* Suggestion Chips */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    {[
                      "Plan a 5-day trip from Amritsar to Manali",
                      "Best beaches in Goa",
                      "Budget travel tips for Europe",
                      "Hidden gems in North East India",
                      "Exploring South India"
                    ].map((suggestion, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + idx * 0.1 }}
                        onClick={() => setInput(suggestion.replace(/[🇯🇵🏖️💰🗺️]/g, '').trim())}
                        className="px-5 py-3.5 text-sm text-left text-gray-700 bg-gradient-to-br from-gray-50 to-white hover:from-violet-50 hover:to-fuchsia-50 border border-gray-200 hover:border-violet-300 rounded-xl transition-all hover:shadow-md group"
                      >
                        <span className="group-hover:text-violet-700 transition-colors">
                          {suggestion}
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>

                  {/* Helper Text */}
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-xs text-gray-400 text-center mt-6"
                  >
                    Press Enter to send • Shift + Enter for new line
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Input Bar (After First Message) */}
        <AnimatePresence>
          {hasStartedChat && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="border-t border-gray-200 bg-white/80 backdrop-blur-sm sticky bottom-0"
            >
              <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 xl:px-16 py-4">
                <div className="relative flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Ask about your next destination..."
                      className="w-full text-gray-900 placeholder:text-gray-400 px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white shadow-sm transition-all"
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                      onClick={handleSend}
                      disabled={input.trim() === "" || isAiTyping}
                    >{}
                      <Send size={18} />
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Press Enter to send, Shift + Enter for new line
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu and Plus Button */}
        <ItineraryMenu 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
        />
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="absolute right-6 bottom-28 w-14 h-14 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all z-50"
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
