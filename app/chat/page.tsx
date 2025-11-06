// /app/chat/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/sidebar/Sidebar";
import { Plus, Send, MapPin, Calendar } from "lucide-react";
import ChatBubble from "@/components/chat/ChatBubble";
import { motion, AnimatePresence } from "framer-motion";
import TypingIndicator from "@/components/chat/ChatIndicator";
import ItineraryMenu from "@/components/chat/ItenaryMenu";

export type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
};

type Itinerary = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isLoadingItineraries, setIsLoadingItineraries] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch itineraries on mount
  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    setIsLoadingItineraries(true);
    setError(null);
    try {
      const response = await fetch('/api/itineraries?limit=4');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch itineraries: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setItineraries(data);
      } else {
        setError('No itineraries found');
        setItineraries([]);
      }
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      setError(error instanceof Error ? error.message : 'Failed to load itineraries');
      setItineraries([]);
    } finally {
      setIsLoadingItineraries(false);
    }
  };

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
              Wander<span className="bg-blue-500 bg-clip-text text-transparent">AI</span>
            </h1>
          </Link>
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

          {/* Centered Input (Initial State) - Fixed positioning */}
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
                className="flex flex-col items-center justify-center w-full min-h-full px-4 py-12"
              >
                <div className="w-full max-w-6xl">
                  {/* Welcome Section */}
                  <div className="flex flex-col items-center text-center mb-8">
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
                    className="relative mb-8"
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
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12"
                  >
                    {[
                      "Plan a 5-day trip from Amritsar to Manali",
                      "Best beaches in Goa",
                      "Budget travel tips for Europe",
                      "Hidden gems in North East India",
                      "Exploring South India",
                      "Look for the Best accomodations in Srinagar"
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

                  {/* Recommendations Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="mb-12"
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <MapPin size={24} className="text-violet-600" />
                      <h3 className="text-2xl font-bold text-gray-900">Your Travel Recommendations</h3>
                    </div>

                    {isLoadingItineraries ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
                        ))}
                      </div>
                    ) : error ? (
                      <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-200">
                        <p className="text-red-600 font-semibold mb-2">Unable to load itineraries</p>
                        <p className="text-red-500 text-sm mb-4">{error}</p>
                        <button
                          onClick={fetchItineraries}
                          className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : itineraries.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                        <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-semibold mb-2">No itineraries yet</p>
                        <p className="text-gray-500 text-sm">Create your first itinerary to get started</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {itineraries.map((itinerary, idx) => (
                          <motion.div
                            key={itinerary.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.3 + idx * 0.1 }}
                          >
                            <Link href={`/itineraries/${itinerary.id}`} className="block group h-full">
                              <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-violet-300 transition-all shadow-md hover:shadow-xl h-full flex flex-col group-hover:scale-105 transform duration-300">
                                {/* Thumbnail */}
                                {itinerary.thumbnail ? (
                                  <div className="relative h-40 overflow-hidden bg-gray-200">
                                    <img
                                      src={itinerary.thumbnail}
                                      alt={itinerary.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                  </div>
                                ) : (
                                  <div className="h-40 bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center">
                                    <MapPin size={48} className="text-violet-400" />
                                  </div>
                                )}

                                {/* Content */}
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                  <div>
                                    <h4 className="text-gray-900 font-bold text-sm mb-2 line-clamp-2 group-hover:text-violet-700 transition-colors">
                                      {itinerary.title}
                                    </h4>
                                    {itinerary.description && (
                                      <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                                        {itinerary.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar size={12} />
                                    <span>{formatDate(itinerary.updated_at)}</span>
                                  </div>
                                </div>

                                {/* Hover Overlay */}
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  whileHover={{ opacity: 1 }}
                                  className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-sm pointer-events-none rounded-2xl flex items-center justify-center"
                                >
                                  <button className="px-6 py-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                                    View Plan
                                  </button>
                                </motion.div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* Helper Text */}
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-xs text-gray-400 text-center pb-8"
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

        {/* Menu */}
        <ItineraryMenu 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
        />

        {/* Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="absolute right-6 bottom-28 w-14 h-14 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all z-40"
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
