"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/sidebar/Sidebar";
import Link from "next/link";

export default function ItinAddAIPage() {
  const [activeTab, setActiveTab] = useState<"prompt" | "video">("prompt");
  const [prompt, setPrompt] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (activeTab === "prompt" && !prompt.trim()) {
      return;
    }
    if (activeTab === "video" && !videoLink.trim()) {
      return;
    }

    setIsProcessing(true);
    // TODO: Implement AI processing logic
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex">
      <Sidebar />
      <main className="flex-1 px-8 py-6 relative">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                Create Itinerary with AI
              </h1>
              <p className="text-sm text-gray-500">
                Let AI craft your perfect travel plan from your prompt or video
              </p>
            </div>
            <Link
              href="/itineraries"
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </Link>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-gray-200 via-gray-200 to-transparent" />
        </div>

        {/* Tab Selection */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setActiveTab("prompt")}
            className={`px-6 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === "prompt"
                ? "bg-black text-white border-black shadow-lg"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Create with Prompt</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`px-6 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === "video"
                ? "bg-black text-white border-black shadow-lg"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              <span>Add Video Link</span>
            </div>
          </button>
        </div>

        {/* Content Sections */}
        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            {activeTab === "prompt" ? (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Create with AI Prompt
                      </h2>
                      <p className="text-sm text-gray-500">
                        Describe your dream trip and let AI create the perfect itinerary
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                        Describe Your Trip
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., I want a 5-day trip to Kerala focused on backwaters, local food, and heritage sites. Budget-friendly options preferred."
                        rows={8}
                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 hover:border-gray-300 resize-none"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Be specific about destinations, duration, interests, and budget for better results
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                        <div className="text-xs font-medium text-gray-500 mb-1">Example 1</div>
                        <div className="text-sm text-gray-700">
                          "3-day weekend in Jaipur with heritage palaces and local street food"
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                        <div className="text-xs font-medium text-gray-500 mb-1">Example 2</div>
                        <div className="text-sm text-gray-700">
                          "Adventure trip to Manali for 4 days with trekking and snow activities"
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                        <div className="text-xs font-medium text-gray-500 mb-1">Example 3</div>
                        <div className="text-sm text-gray-700">
                          "Luxury 7-day Kerala backwaters tour with spa and ayurveda"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="video"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M23 7l-7 5 7 5V7z" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Add Video Link
                      </h2>
                      <p className="text-sm text-gray-500">
                        Paste a YouTube or Instagram video link and AI will extract the itinerary
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                        Video URL
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="url"
                          value={videoLink}
                          onChange={(e) => setVideoLink(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=... or https://www.instagram.com/p/..."
                          className="flex-1 rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 hover:border-gray-300"
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Supports YouTube videos and Instagram posts/reels
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-red-50 to-red-100/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="white"
                            >
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                          </div>
                          <div className="font-semibold text-gray-900">YouTube</div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Paste any YouTube video URL. AI will analyze the video description, captions, and comments to extract locations, activities, and recommendations.
                        </div>
                      </div>

                      <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-pink-50 to-purple-100/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="white"
                            >
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                          </div>
                          <div className="font-semibold text-gray-900">Instagram</div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Paste any Instagram post or reel URL. AI will extract locations from captions, tags, and analyze the content to create an itinerary.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex items-center justify-end gap-3"
          >
            <button
              onClick={handleSubmit}
              disabled={
                isProcessing ||
                (activeTab === "prompt" && !prompt.trim()) ||
                (activeTab === "video" && !videoLink.trim())
              }
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-black to-gray-800 text-white text-sm font-semibold hover:from-gray-800 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <span>Generate Itinerary</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
