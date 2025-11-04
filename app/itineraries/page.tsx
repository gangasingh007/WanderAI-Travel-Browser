"use client";

import { useEffect, useState, useRef } from "react";
import { getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "@/components/sidebar/Sidebar";
import MapCanvas from "@/components/map/MapCanvas";
import MapSearchBar from "@/components/map/MapSearchBar";
import Link from "next/link";

export default function ItinerariesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const flyToLocationRef = useRef<((center: [number, number], zoom?: number) => void) | null>(null);

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
      <main className="relative flex-1 px-8 py-6">
        {/* Page Heading */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              <span className="text-gray-900">Wander </span>
              <span className="text-[#0E8EEB]">Map</span>
            </h1>
            <div className="hidden md:block">
              <p className="text-sm text-gray-500 font-medium">
                Explore destinations, plan routes, discover your next adventure
              </p>
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-gray-200 via-gray-200 to-transparent" />
        </div>

        {/* Search Bar */}
        <div className="mb-4 relative z-30">
          <MapSearchBar
            onSelectPlace={(center, placeName) => {
              if (flyToLocationRef.current) {
                flyToLocationRef.current(center, 14);
              }
            }}
          />
        </div>

        {/* Map */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <MapCanvas
            enableEditing={false}
            initialCenter={[78.4, 23.5]}
            initialZoom={5.5}
            showSampleItineraries={true}
            onMapReady={(flyToLocation) => {
              flyToLocationRef.current = flyToLocation;
            }}
          />
        </motion.div>

        {/* Floating Action Button (bottom-right) */}
        <FabMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      </main>
    </div>
  );
}

function FabMenu({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (v: boolean) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-20">
      {/* Options tray - opens to the LEFT of the FAB */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={menuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute bottom-0 right-16"
      >
        {menuOpen && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden min-w-[230px]">
            <Link href="/itineraries/add-itineraries/ai" className="block px-4 py-3 text-sm hover:bg-gray-50">
              <div className="font-medium text-gray-900">Make itinerary with AI</div>
              <div className="text-xs text-gray-600">Auto-generate from links and queries</div>
            </Link>
            <div className="h-px bg-gray-100" />
            <Link href="/itineraries/add-itineraries/manual" className="block px-4 py-3 text-sm hover:bg-gray-50">
              <div className="font-medium text-gray-900">Create itinerary manually</div>
              <div className="text-xs text-gray-600">Place pins and craft your route</div>
            </Link>
          </div>
        )}
      </motion.div>

      {/* FAB with smooth rotate morph + ↔ X */}
      <motion.button
        onClick={() => setMenuOpen(!menuOpen)}
        className="h-14 w-14 rounded-full bg-black text-white grid place-items-center shadow-xl"
        aria-label="Add itinerary"
        whileTap={{ scale: 0.96 }}
        animate={menuOpen ? { rotate: 45 } : { rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </motion.button>
    </div>
  );
}


