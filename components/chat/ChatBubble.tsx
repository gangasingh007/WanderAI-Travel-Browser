// /components/chat/ChatBubble.tsx
"use client";

import { Message } from "@/app/chat/page";
import { User, Bot, Copy, Check } from "lucide-react";
import ReactMarkdown, { ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";

type ChatBubbleProps = {
  message: Message;
};

export default function ChatBubble({ message }: ChatBubbleProps) {
  const { text, sender } = message;
  const isUser = sender === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex gap-3 mb-6 ${
        isUser ? "justify-end" : "justify-start"
      } animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      {/* Bot Avatar */}
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg ring-2 ring-purple-100">
          <Bot size={20} className="text-white" />
        </div>
      )}

      <div className="flex flex-col gap-1 max-w-[85%] md:max-w-[75%]">
        {/* Message Bubble */}
        <div
          className={`group relative ${
            isUser
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200/50"
              : "bg-gradient-to-br from-gray-50 to-gray-100/80 text-gray-900 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow"
          } rounded-2xl ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"} overflow-hidden`}
        >
          <div className={`px-4 py-3 ${!isUser && "relative"}`}>
            {isUser ? (
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                {text}
              </p>
            ) : (
              <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:text-gray-800 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:text-pink-600">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Paragraphs
                    p: ({ node, ...props }) => (
                      <p 
                        className="mb-4 last:mb-0 leading-[1.75] text-[15px] text-gray-800" 
                        {...props} 
                      />
                    ),
                    
                    // Headings
                    h1: ({ node, ...props }) => (
                      <h1 
                        className="text-2xl font-bold mt-6 mb-3 first:mt-0 text-gray-900 border-b border-gray-300 pb-2" 
                        {...props} 
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 
                        className="text-xl font-semibold mt-5 mb-3 first:mt-0 text-gray-900" 
                        {...props} 
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 
                        className="text-lg font-semibold mt-4 mb-2 first:mt-0 text-gray-900" 
                        {...props} 
                      />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4 
                        className="text-base font-semibold mt-3 mb-2 first:mt-0 text-gray-800" 
                        {...props} 
                      />
                    ),
                    
                    // Lists
                    ul: ({ node, ...props }) => (
                      <ul 
                        className="space-y-2 my-4 pl-6 list-disc" 
                        {...props} 
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol 
                        className="space-y-2 my-4 pl-6 list-decimal" 
                        {...props} 
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li 
                        className="leading-[1.75] pl-1.5 text-gray-800 marker:text-indigo-500" 
                        {...props} 
                      />
                    ),
                    
                    // Code blocks
                    code: (props: JSX.IntrinsicElements["code"] & ExtraProps) => {
                      const { children, className, node, ...rest } = props;
                      const match = /language-(\w+)/.exec(className || '');
                      const isInlineCode = !match && !className?.includes('language-');
                      
                      return isInlineCode ? (
                        <code
                          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-white text-pink-600 text-[13.5px] font-mono border border-gray-300 shadow-sm whitespace-nowrap"
                          {...rest}
                        >
                          {children}
                        </code>
                      ) : (
                        <div className="relative my-4">
                          {match && (
                            <div className="absolute top-0 right-0 px-3 py-1 text-xs font-mono text-gray-400 bg-gray-800 rounded-bl-md z-10">
                              {match[1]}
                            </div>
                          )}
                          <pre className="overflow-x-auto p-4 rounded-lg bg-gray-900 border border-gray-700 shadow-md">
                            <code
                              className={`text-sm font-mono text-gray-100 ${className || ''}`}
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
                        className="border-l-4 border-indigo-400 pl-4 pr-4 py-1 my-4 italic text-gray-700 bg-indigo-50/50 rounded-r-md"
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
                    
                    // Tables
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-4">
                        <table 
                          className="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-lg shadow-sm bg-white" 
                          {...props} 
                        />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead 
                        className="bg-gray-100" 
                        {...props} 
                      />
                    ),
                    tbody: ({ node, ...props }) => (
                      <tbody 
                        className="divide-y divide-gray-200 bg-white" 
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
                        className="px-4 py-2 text-left text-sm font-semibold text-gray-900" 
                        {...props} 
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td 
                        className="px-4 py-2 text-sm text-gray-800" 
                        {...props} 
                      />
                    ),
                    
                    // Horizontal rule
                    hr: ({ node, ...props }) => (
                      <hr 
                        className="my-6 border-gray-300" 
                        {...props} 
                      />
                    ),
                  }}
                >
                  {text}
                </ReactMarkdown>
              </div>
            )}

            {/* Copy Button for Bot Messages */}
            {!isUser && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-white border border-gray-300 opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-50 shadow-sm"
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
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg ring-2 ring-blue-100">
          <User size={20} className="text-white" />
        </div>
      )}
    </div>
  );
}
