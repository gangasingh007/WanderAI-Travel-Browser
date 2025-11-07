// /components/chat/ItineraryMenu.tsx
"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FilePlus } from "lucide-react"; // Icons for AI and Manual

type ItineraryMenuProps = {
  isOpen: boolean;
  onClose: () => void; // Function to close the menu
};

export default function ItineraryMenu({ isOpen, onClose }: ItineraryMenuProps) {
  const menuVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: {
        duration: 0.1,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={menuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute right-6 bottom-40 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
          onClick={onClose} // Close menu when an item is clicked
        >
          <div className="p-2">
            <Link
              href="/itineraries/add-itineraries/ai"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100"
            >
              <Sparkles size={18} className="text-purple-500" />
              Make Itinerary with AI
            </Link>
            <Link
              href="/itineraries/add-itineraries/manual"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100"
            >
              <FilePlus size={18} className="text-blue-500" />
              Make Itinerary Manually
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}