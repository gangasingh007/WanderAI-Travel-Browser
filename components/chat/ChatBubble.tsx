// /components/chat/ChatBubble.tsx
"use client";

import { Message } from "@/app/chat/page";
import { User, Bot, Copy, Check, MapPin, ArrowRight } from "lucide-react";
import ReactMarkdown, { ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type ChatBubbleProps = {
  message: Message;
};

export default function ChatBubble({ message }: ChatBubbleProps) {
  const { text, sender, draftData } = message;
  const isUser = sender === "user";
  const [copied, setCopied] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sanitize and ensure text is a valid string for ReactMarkdown
  const sanitizedText = (() => {
    try {
      let cleanText = typeof text === "string" ? text : String(text ?? "");
      cleanText = cleanText.replace(/^\s*,+\s*/, "").trim();
      return cleanText;
    } catch (e) {
      console.error("[ChatBubble] Error sanitizing text:", e);
      return "";
    }
  })();

  // Typewriter effect for AI messages
  useEffect(() => {
    if (!isUser && sanitizedText) {
      setIsAnimating(true);
      setDisplayedText("");
      
      let currentIndex = 0;
      const textLength = sanitizedText.length;
      
      // Adjust speed: smaller = faster (milliseconds per character)
      const typingSpeed = 1;
      
      const intervalId = setInterval(() => {
        if (currentIndex <= textLength) {
          setDisplayedText(sanitizedText.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(intervalId);
          setIsAnimating(false);
        }
      }, typingSpeed);

      return () => {
        clearInterval(intervalId);
        setDisplayedText(sanitizedText);
        setIsAnimating(false);
      };
    } else {
      setDisplayedText(sanitizedText);
    }
  }, [sanitizedText, isUser]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 mb-6 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Bot Avatar */}
      {!isUser && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 flex items-center justify-center shrink-0 shadow-md"
        >
          <Bot size={18} className="text-white" strokeWidth={2.5} />
        </motion.div>
      )}

      <div className="flex flex-col gap-1.5 max-w-[90%] md:max-w-[85%] lg:max-w-[80%]">
        {/* Message Bubble */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className={`group relative ${
            isUser
              ? "bg-blue-400 text-white shadow-lg shadow-blue-500/20"
              : "bg-white text-gray-900 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          } rounded-2xl ${isUser ? "rounded-tr-md" : "rounded-tl-md"}`}
        >
          <div className={`px-4 py-3 ${!isUser && "relative"}`}>
            {isUser ? (
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                {text}
              </p>
            ) : (
              <div className="space-y-3">
                <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:text-gray-800 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:text-fuchsia-600">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                    // Paragraphs
                    p: ({ node, ...props }) => (
                      <p 
                        className="mb-3 last:mb-0 leading-[1.7] text-[15px] text-gray-800" 
                        {...props} 
                      />
                    ),
                    
                    // Headings
                    h1: ({ node, ...props }) => (
                      <h1 
                        className="text-2xl font-bold mt-5 mb-3 first:mt-0 text-gray-900 pb-2 border-b-2 border-gray-200" 
                        {...props} 
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 
                        className="text-xl font-semibold mt-4 mb-2.5 first:mt-0 text-gray-900" 
                        {...props} 
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 
                        className="text-lg font-semibold mt-3.5 mb-2 first:mt-0 text-gray-900" 
                        {...props} 
                      />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4 
                        className="text-base font-semibold mt-3 mb-1.5 first:mt-0 text-gray-800" 
                        {...props} 
                      />
                    ),
                    
                    // Lists
                    ul: ({ node, ...props }) => (
                      <ul 
                        className="space-y-1.5 my-3 pl-5 list-disc marker:text-violet-500" 
                        {...props} 
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol 
                        className="space-y-1.5 my-3 pl-5 list-decimal marker:text-violet-500" 
                        {...props} 
                      />
                    ),
                    li: ({ node, className, ...props }) => {
                      const isTaskList = className?.includes('task-list-item');
                      return (
                        <li 
                          className={`leading-[1.7] text-gray-800 ${
                            isTaskList ? 'list-none -ml-5' : 'pl-1'
                          }`}
                          {...props} 
                        />
                      );
                    },
                    
                    // Code blocks
                    code: (props: React.ComponentProps<"code"> & ExtraProps) => {
                      const { children, className, node, ...rest } = props;
                      const match = /language-(\w+)/.exec(className || '');
                      const isInlineCode = !match && !className?.includes('language-');
                      
                      return isInlineCode ? (
                        <code
                          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-fuchsia-50 text-fuchsia-700 text-[13.5px] font-mono border border-fuchsia-200"
                          {...rest}
                        >
                          {children}
                        </code>
                      ) : (
                        <div className="relative my-3 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                          {/* Code header */}
                          <div className="flex items-center justify-between bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-2 border-b border-gray-200">
                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                              {match ? match[1] : 'code'}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(String(children));
                              }}
                              className="p-1 rounded hover:bg-gray-200 transition-colors"
                            >{}
                              <Copy size={12} className="text-gray-600" />
                            </button>
                          </div>
                          {/* Code content */}
                          <pre className="overflow-x-auto p-3 bg-gray-900 m-0">
                            <code
                              className={`text-[13px] font-mono text-gray-100 ${className || ''}`}
                              {...rest}
                            >
                              {children}
                            </code>
                          </pre>
                        </div>
                      );
                    },
                    
                    // Blockquotes
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-violet-400 pl-4 pr-2 py-2 my-3 italic text-gray-700 bg-violet-50/50 rounded-r"
                        {...props}
                      />
                    ),
                    
                    // Links
                    a: ({ node, ...props }) => (
                      <a
                        className="text-blue-600 hover:text-blue-700 underline decoration-blue-300 underline-offset-2 transition-colors font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      />
                    ),
                    
                    // Strong/Bold
                    strong: ({ node, ...props }) => (
                      <strong 
                        className="font-semibold text-gray-900" 
                        {...props} 
                      />
                    ),
                    
                    // Em/Italic
                    em: ({ node, ...props }) => (
                      <em 
                        className="italic text-gray-800" 
                        {...props} 
                      />
                    ),

                    // Strikethrough (GFM)
                    del: ({ node, ...props }) => (
                      <del 
                        className="text-gray-500 line-through" 
                        {...props} 
                      />
                    ),

                    // Task list checkbox (GFM)
                    input: ({ type, checked, disabled }) => {
                      if (type === 'checkbox') {
                        return (
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            className="mr-2 w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-not-allowed"
                            readOnly
                          />
                        );
                      }
                      return null;
                    },
                    
                    // Tables
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-3 rounded-lg border border-gray-200 shadow-sm">
                        <table 
                          className="min-w-full divide-y divide-gray-200" 
                          {...props} 
                        />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead 
                        className="bg-gray-50" 
                        {...props} 
                      />
                    ),
                    tbody: ({ node, ...props }) => (
                      <tbody 
                        className="divide-y divide-gray-100 bg-white" 
                        {...props} 
                      />
                    ),
                    tr: ({ node, ...props }) => (
                      <tr 
                        className="hover:bg-gray-50 transition-colors" 
                        {...props} 
                      />
                    ),
                    th: ({ node, ...props }) => (
                      <th 
                        className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" 
                        {...props} 
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td 
                        className="px-4 py-2.5 text-sm text-gray-800" 
                        {...props} 
                      />
                    ),
                    
                    // Horizontal rule
                    hr: ({ node, ...props }) => (
                      <hr 
                        className="my-5 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" 
                        {...props} 
                      />
                    ),
                  }}
                >
                    {displayedText}
                  </ReactMarkdown>
                  
                  {/* Typing cursor indicator */}
                  {isAnimating && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-0.5 h-4 bg-violet-500 ml-0.5"
                    />
                  )}
                </div>

                {/* Draft Card */}
                {draftData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4"
                  >
                    <Link 
                      href={`/itineraries/add-itineraries/manual?draftId=${draftData.draftId}`}
                      className="block group"
                    >
                      <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 border-2 border-violet-200 rounded-xl p-4 hover:border-violet-300 hover:shadow-lg transition-all cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0 shadow-md">
                            <MapPin size={24} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 mb-1 group-hover:text-violet-700 transition-colors">
                              {draftData.title}
                            </h4>
                            {draftData.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {draftData.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-violet-600 font-medium">
                              <span>Open Draft</span>
                              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </div>
            )}

            {/* Copy Button for Bot Messages */}
            {!isUser && !isAnimating && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-50 border border-gray-200 opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100"
                title="Copy message"
                aria-label="Copy message to clipboard"
              >
                {copied ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} className="text-gray-600" />
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-9 h-9 rounded-full bg-blue-400 flex items-center justify-center shrink-0 shadow-md"
        >
          <User size={18} className="text-white" strokeWidth={2.5} />
        </motion.div>
      )}
    </motion.div>
  );
}
