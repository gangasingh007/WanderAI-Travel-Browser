"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Sidebar from "@/components/sidebar/Sidebar";
import MapCanvas from "@/components/map/MapCanvas";
import MarkerPalette from "@/components/map/MarkerPalette";

export default function MapPage() {
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

        {/* Marker Palette */}
        <div className="mb-4">
          <MarkerPalette />
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MapCanvas enableEditing />
        </motion.div>
      </main>
    </div>
  );
}


