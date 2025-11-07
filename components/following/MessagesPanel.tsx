"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ArrowLeft } from "lucide-react";

type Message = {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  lastMessage: string;
  timeAgo: string;
  unread?: boolean;
};

type ChatMessage = {
  id: string;
  text: string;
  sender: "user" | "other";
  time: string;
};

// Mock messages data
const mockMessages: Message[] = [
  {
    id: "1",
    username: "vinay_handa",
    fullName: "Vinay Handa",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    lastMessage: "https://www.facebook.com/share/...",
    timeAgo: "5d",
    unread: false,
  },
  {
    id: "2",
    username: "satvik_khanna",
    fullName: "Satvik Khanna",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    lastMessage: "Satvik sent an attachment.",
    timeAgo: "6d",
    unread: false,
  },
  {
    id: "3",
    username: "mapik",
    fullName: "M.@.π.i.K",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    lastMessage: "Kk bro.",
    timeAgo: "1w",
    unread: false,
  },
  {
    id: "4",
    username: "sanjay_khanna",
    fullName: "Sanjay Khanna",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
    lastMessage: "You sent an attachment.",
    timeAgo: "2w",
    unread: false,
  },
  {
    id: "5",
    username: "soniakhanna",
    fullName: "soniakhanna",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    lastMessage: "You sent an attachment.",
    timeAgo: "2w",
    unread: false,
  },
  {
    id: "6",
    username: "sarthak_khanna",
    fullName: "Sarthak Khanna",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    lastMessage: "You sent an attachment.",
    timeAgo: "2w",
    unread: false,
  },
  {
    id: "7",
    username: "alka_khanna",
    fullName: "Alka Khanna",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    lastMessage: "Hello!",
    timeAgo: "3w",
    unread: true,
  },
];

// Fixed messages to show inside each chat
const getFixedMessages = (userId: string): ChatMessage[] => {
  return [
    {
      id: "1",
      text: "Hey! How are you doing?",
      sender: "other",
      time: "10:30 AM",
    },
    {
      id: "2",
      text: "I'm doing great, thanks for asking! How about you?",
      sender: "user",
      time: "10:32 AM",
    },
    {
      id: "3",
      text: "I'm good too! Just planning my next travel adventure.",
      sender: "other",
      time: "10:33 AM",
    },
    {
      id: "4",
      text: "That sounds exciting! Where are you planning to go?",
      sender: "user",
      time: "10:35 AM",
    },
    {
      id: "5",
      text: "Thinking about exploring the Golden Triangle in India. Have you been there?",
      sender: "other",
      time: "10:36 AM",
    },
    {
      id: "6",
      text: "Yes! It's an amazing journey. Delhi, Agra, and Jaipur are all incredible cities with rich history.",
      sender: "user",
      time: "10:38 AM",
    },
  ];
};

export default function MessagesPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const currentUserAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80";

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
  };

  const chatMessages = selectedMessage ? getFixedMessages(selectedMessage.id) : [];

  return (
    <>
      {/* Compact Message Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-white/10 backdrop-blur-xl rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-2xl hover:bg-white/15 transition-all duration-200 z-50 group border border-white/20"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        }}
        aria-label="Open messages"
      >
        {/* Message Icon with Badge */}
        <div className="relative flex-shrink-0">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-900"
          >
            <path d="M21.5 2L2 12l5 2 12-5-5 5 2 5 8.5-19.5z" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
            1
          </span>
        </div>
        
        {/* Messages Text */}
        <span className="text-gray-900 font-medium text-sm whitespace-nowrap">Messages</span>
        
        {/* Profile Picture */}
        <img
          src={currentUserAvatar}
          alt="Your profile"
          className="w-8 h-8 rounded-full object-cover border-2 border-white/30 flex-shrink-0 shadow-md"
        />
      </button>

      {/* Full Messages Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop - No blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                setSelectedMessage(null);
              }}
              className="fixed inset-0 bg-black/10 z-40"
            />
            
            {/* Messages Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-6 right-6 rounded-2xl shadow-2xl border border-white/20 z-50 w-80 h-[500px] max-h-[calc(100vh-120px)] flex flex-col overflow-hidden backdrop-blur-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              }}
            >
              {!selectedMessage ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-white/20">
                    <div className="flex items-center gap-2">
                      <h3 className="text-gray-900 font-semibold">Messages</h3>
                      <span className="bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full shadow-lg">
                        1
                      </span>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Messages List */}
                  <div className="flex-1 overflow-y-auto">
                    {mockMessages.map((message) => (
                      <button
                        key={message.id}
                        onClick={() => handleMessageClick(message)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                      >
                        <img
                          src={message.avatar}
                          alt={message.fullName}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-white/20 shadow-md"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-900 text-sm font-medium truncate">
                              {message.fullName}
                            </span>
                            <span className="text-gray-600 text-xs ml-2">
                              {message.timeAgo}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs truncate">
                            {message.lastMessage}
                          </p>
                        </div>
                        {message.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 shadow-lg" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Compose Button */}
                  <div className="p-4 border-t border-white/20">
                    <Link
                      href="/chat"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center w-full p-2 text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-white/10"
                    >
                      <Send size={18} className="mr-2" />
                      <span className="text-sm font-medium">New Message</span>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-white/20">
                    <button
                      onClick={handleBackToList}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      aria-label="Back"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <img
                      src={selectedMessage.avatar}
                      alt={selectedMessage.fullName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/20 shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 font-semibold text-sm truncate">
                        {selectedMessage.fullName}
                      </h3>
                      <p className="text-gray-600 text-xs truncate">
                        {selectedMessage.username}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setSelectedMessage(null);
                      }}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            msg.sender === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-white/20 backdrop-blur-sm text-gray-900 border border-white/30"
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender === "user" ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-white/20">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                      <button className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
