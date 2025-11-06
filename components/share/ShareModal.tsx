"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Share2, Mail, MessageCircle, Twitter, Link2 } from "lucide-react";

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: "chat" | "itinerary";
  itemId: string;
  title: string;
};

export default function ShareModal({ isOpen, onClose, type, itemId, title }: ShareModalProps) {
  const [shareLink, setShareLink] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareLink = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/share/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          [`${type}Id`]: itemId 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShareLink(data.shareLink);
      }
    } catch (error) {
      console.error('Error generating share link:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareVia = (platform: string) => {
    if (!shareLink) return;

    const encodedLink = encodeURIComponent(shareLink);
    const encodedTitle = encodeURIComponent(title);

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedLink}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedLink}`,
      email: `mailto:?subject=${encodedTitle}&body=Check%20this%20out:%20${encodedLink}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
          >
            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative px-8 py-6 border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                      <Share2 size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Share {type === "chat" ? "Chat" : "Itinerary"}</h2>
                      <p className="text-sm text-gray-400">{title}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >{}
                    <X size={24} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-6 space-y-6">
                {!shareLink ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-6">
                      Generate a shareable link that anyone can access
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={generateShareLink}
                      disabled={isGenerating}
                      className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Generating...</span>
                        </div>
                      ) : (
                        "Generate Share Link"
                      )}
                    </motion.button>
                  </div>
                ) : (
                  <>
                    {/* Share Link */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Share Link
                      </label>
                      <div className="relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl blur opacity-20" />
                        <div className="relative flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                          <Link2 size={20} className="text-gray-400 shrink-0" />
                          <input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="flex-1 bg-transparent text-white text-sm font-mono outline-none"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCopy}
                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2 text-white font-medium"
                          >
                            {copied ? (
                              <>
                                <Check size={16} />
                                <span className="text-sm">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={16} />
                                <span className="text-sm">Copy</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Share Platforms */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Share via
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => shareVia('twitter')}
                          className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex flex-col items-center gap-2"
                        >
                          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Twitter size={24} className="text-blue-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-300">Twitter</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => shareVia('whatsapp')}
                          className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex flex-col items-center gap-2"
                        >
                          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <MessageCircle size={24} className="text-green-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-300">WhatsApp</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => shareVia('email')}
                          className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex flex-col items-center gap-2"
                        >
                          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <Mail size={24} className="text-red-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-300">Email</span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                      <p className="text-sm text-gray-300">
                        <span className="font-semibold text-violet-400">Note:</span> Anyone with this link can view your {type === "chat" ? "conversation" : "itinerary"}. The link will expire in 30 days.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
