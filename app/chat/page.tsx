"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Sidebar from "@/components/sidebar/Sidebar";

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { user: currentUser } = await getCurrentUser();
    if (!currentUser) {
      router.push("/login");
    } else {
      setUser(currentUser);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <main className="flex-1 px-8 py-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              Wander<span className="text-gray-600">AI</span>
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-black font-medium">
              {user?.user_metadata?.full_name || user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Chat Interface Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-black mb-4">
            Welcome to Wander AI
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your travel browser is ready. Chat interface coming soon!
          </p>
          
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <p className="text-gray-600">
              Authentication is working! 🎉
            </p>
            <div className="mt-4 space-y-2 text-sm text-gray-600 text-left">
              <p><span className="font-semibold">Name:</span> {user?.user_metadata?.full_name || "Not set"}</p>
              <p><span className="font-semibold">Username:</span> {user?.user_metadata?.username || "Not set"}</p>
              <p><span className="font-semibold">Email:</span> {user?.email}</p>
              <p><span className="font-semibold">User type:</span> {user?.user_metadata?.user_type || "Not set"}</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

