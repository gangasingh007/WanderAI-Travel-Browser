"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import StoryViewer from "./StoryViewer";

type Story = {
  id: string;
  username: string;
  avatar: string;
  hasNewStory: boolean;
  videoUrl?: string;
  imageUrl?: string;
};

// Mock stories data with actual videos and images
const mockStories: Story[] = [
  { 
    id: "1", 
    username: "kunal_gup...", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", 
    hasNewStory: true,
    videoUrl: "/1.1.mp4"
  },
  { 
    id: "2", 
    username: "jyotsana95", 
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", 
    hasNewStory: true,
    videoUrl: "/2.1.mp4"
  },
  { 
    id: "3", 
    username: "amiyakhan...", 
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80", 
    hasNewStory: true,
    imageUrl: "/3.png"
  },
  { 
    id: "4", 
    username: "ishaanmah...", 
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80", 
    hasNewStory: true,
    videoUrl: "/3.1.mp4"
  },
  { 
    id: "5", 
    username: "kanikabha...", 
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80", 
    hasNewStory: true,
    videoUrl: "/4.1.mp4"
  },
  { 
    id: "6", 
    username: "shruti1646", 
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80", 
    hasNewStory: true,
    imageUrl: "/4.png"
  },
  { 
    id: "7", 
    username: "msc", 
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80", 
    hasNewStory: false,
    videoUrl: "/train.mp4"
  },
];

export default function StoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handleStoryClick = (index: number) => {
    setSelectedStoryIndex(index);
    setIsViewerOpen(true);
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {mockStories.map((story, index) => (
          <button
            key={story.id}
            onClick={() => handleStoryClick(index)}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="relative">
              <div
                className={`w-16 h-16 rounded-full p-0.5 ${
                  story.hasNewStory
                    ? "bg-gradient-to-tr from-pink-500 via-purple-500 to-orange-500"
                    : "bg-gray-300"
                }`}
              >
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <img
                    src={story.avatar}
                    alt={story.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-700 max-w-[70px] truncate text-center">
              {story.username}
            </span>
          </button>
        ))}
      </div>
      
      {/* Scroll arrow */}
      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-1.5 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors z-10"
        aria-label="Scroll right"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-700"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Story Viewer */}
      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={mockStories}
          initialIndex={selectedStoryIndex}
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedStoryIndex(null);
          }}
        />
      )}
    </div>
  );
}

