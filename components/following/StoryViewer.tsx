"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Story = {
  id: string;
  username: string;
  avatar: string;
  hasNewStory: boolean;
  videoUrl?: string;
  imageUrl?: string;
};

type StoryViewerProps = {
  stories: Story[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
};

export default function StoryViewer({ stories, initialIndex, isOpen, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsPlaying(true);
    }
  }, [isOpen, initialIndex]);

  const currentStory = stories[currentIndex];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev < stories.length - 1) {
        setIsPlaying(true);
        return prev + 1;
      } else {
        onClose();
        return prev;
      }
    });
  }, [stories.length, onClose]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev > 0) {
        setIsPlaying(true);
        return prev - 1;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, handleNext, handlePrevious, onClose]);

  if (!isOpen || !currentStory) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Blurred Background */}
        <motion.div
          initial={{ backdropFilter: "blur(0px)" }}
          animate={{ backdropFilter: "blur(20px)" }}
          exit={{ backdropFilter: "blur(0px)" }}
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />

        {/* Story Container - Small Box */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-sm mx-4 aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Story Content */}
          <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden">
            {/* Video/Image */}
            {currentStory.videoUrl ? (
              <video
                key={currentStory.videoUrl}
                src={currentStory.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : currentStory.imageUrl ? (
              <img
                key={currentStory.imageUrl}
                src={currentStory.imageUrl}
                alt={currentStory.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                <img
                  src={currentStory.avatar}
                  alt={currentStory.username}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white"
                />
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

            {/* Story Info */}
            <div className="absolute top-4 left-4 right-16 flex items-center gap-3">
              <img
                src={currentStory.avatar}
                alt={currentStory.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
              />
              <div>
                <p className="text-white font-semibold text-sm">{currentStory.username}</p>
                <p className="text-white/80 text-xs">2h ago</p>
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="absolute top-16 left-4 right-4 flex gap-1">
              {stories.map((_, index) => (
                <div
                  key={index}
                  className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
                >
                  {index < currentIndex ? (
                    <div className="h-full bg-white rounded-full w-full" />
                  ) : index === currentIndex ? (
                    <motion.div
                      key={`progress-${currentIndex}`}
                      className="h-full bg-white rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, ease: "linear" }}
                      onAnimationComplete={handleNext}
                    />
                  ) : (
                    <div className="h-full bg-white/30 rounded-full w-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            {currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                aria-label="Previous story"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {currentIndex < stories.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                aria-label="Next story"
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Click areas for navigation */}
            <div className="absolute inset-0 flex">
              <div
                className="flex-1 cursor-pointer"
                onClick={handlePrevious}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  const startX = touch.clientX;
                  const handleTouchEnd = (e: TouchEvent) => {
                    const touch = e.changedTouches[0];
                    const endX = touch.clientX;
                    if (startX - endX > 50) handleNext();
                    if (endX - startX > 50) handlePrevious();
                    document.removeEventListener("touchend", handleTouchEnd);
                  };
                  document.addEventListener("touchend", handleTouchEnd);
                }}
              />
              <div
                className="flex-1 cursor-pointer"
                onClick={handleNext}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

