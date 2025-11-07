"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "@/components/sidebar/Sidebar";
import StoriesSection from "@/components/following/StoriesSection";
import SuggestedCreators from "@/components/following/SuggestedCreators";
import MessagesPanel from "@/components/following/MessagesPanel";
import FollowingFeed from "@/components/following/FollowingFeed";

export default function FollowingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { user: currentUser } = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    })();
  }, [router]);

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
      <div className="flex-1 flex gap-6 w-full">
        {/* Main Content Area - Full Width */}
        <main className="flex-1 px-6 py-6">
          {/* Following Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Following</h1>
          </div>

          {/* Stories Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm">
            <StoriesSection />
          </div>

          {/* Following Feed */}
          <FollowingFeed />
        </main>

        {/* Right Sidebar - Hidden on mobile/tablet */}
        <aside className="w-80 hidden xl:block px-6 py-6">
          <div className="sticky top-6">
            <SuggestedCreators />
          </div>
        </aside>
      </div>

      {/* Compact Messages Button */}
      <MessagesPanel />
    </div>
  );
}
