"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUser, signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "@/components/sidebar/Sidebar";
import { createClient as createSbClient } from "@/lib/supabase/client";

// Lightweight inline icons to avoid new dependencies
function IconMessage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M21 12c0 4.418-4.03 8-9 8-1.12 0-2.19-.17-3.17-.48L3 21l1.56-4.16A7.74 7.74 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconSettings() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/settings.svg" alt="Settings" className="inline-block h-5 w-5 align-middle" />
  );
}

function IconHeart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-rose-500">
      <path d="M12 21s-7.5-4.438-10-8.5C.4 10.2 1.5 7 4.5 6.5c2-.33 3.5 1 4 2 .5-1 2-2.33 4-2 3 .5 4.1 3.7 2.5 6-2.5 4.06-9 8.5-9 8.5Z"/>
    </svg>
  );
}

function IconVerified() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/Verified.svg" alt="Verified" className="inline-block h-9 sm:h-10 w-auto relative top-[2px]" />
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"created" | "followed" | "saved" | "drafts">("created");
  const [drafts, setDrafts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  // Mock itineraries data for demo rendering
  const createdItineraries = [
    { id: 1, title: "Paris in 4 Days", category: "Classic sights + hidden cafés", views: "9.3k", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop" },
    { id: 2, title: "Bali Slow Travel Week", category: "Ubud + waterfalls + beaches", views: "14k", img: "https://images.unsplash.com/photo-1604999333679-b86d54738315?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1025" },
    { id: 3, title: "Swiss Alps Scenic Rail", category: "Zermatt • Interlaken • Lucerne", views: "13.5k", img: "https://images.unsplash.com/photo-1472586662442-3eec04b9dbda?q=80&w=1200&auto=format&fit=crop" },
    { id: 4, title: "Goa Beach Getaway (3D/2N)", category: "Candolim • Anjuna • Chapora", views: "2.1k", img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1200&auto=format&fit=crop" },
    { id: 5, title: "Tokyo First-Timers", category: "Shibuya • Asakusa • Akihabara", views: "5.4k", img: "https://images.unsplash.com/photo-1480796927426-f609979314bd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070" },
    { id: 6, title: "Himalayan Trek Sampler", category: "Easy trails + mountain stays", views: "7.8k", img: "https://images.unsplash.com/photo-1645033393602-4f7623917853?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170" },
  ];
  const followedItineraries = [
    { id: 7, title: "Kyoto Temples & Tea", category: "Fushimi Inari • Gion • Arashiyama", views: "3.2k", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170" },
    { id: 8, title: "Iceland Ring Road Lite (5 Days)", category: "Waterfalls • Black sand • Lagoons", views: "8.9k", img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop" },
    { id: 9, title: "NYC Weekend Highlights", category: "Soho • Central Park • Broadway", views: "6.1k", img: "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170" },
    { id: 10, title: "Kerala Backwaters Drift", category: "Alleppey houseboat + spice trail", views: "4.4k", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1332" },
    { id: 11, title: "Santorini Sunsets", category: "Oia • Fira • Boat day", views: "2.7k", img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop" },
    { id: 12, title: "Vietnam North Loop", category: "Hanoi • Ha Long • Sapa", views: "9.9k", img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1228" },
  ];
  const savedItineraries = [
    { id: 13, title: "Lisbon Food & Fado", category: "Pastéis • Alfama • Miradouros", views: "1.9k", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop" },
    { id: 14, title: "Dubai 48h Stopover", category: "Old Dubai • Marina • Desert", views: "2.6k", img: "https://images.unsplash.com/photo-1546421845-6471bdcf3edf?q=80&w=1200&auto=format&fit=crop" },
    { id: 15, title: "Maldives Chill Week", category: "Reef snorkel • Sandbanks", views: "12k", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop" },
    { id: 16, title: "Cappadocia Balloons", category: "Goreme • Valleys • Sunrise", views: "6.8k", img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop" },
    { id: 17, title: "Swiss Lakes Drive", category: "Lugano • Como • Maggiore", views: "5.1k", img: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170" },
    { id: 18, title: "Sahara Desert Camp", category: "Merzouga • Camel trek", views: "3.7k", img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop" },
  ];

  useEffect(() => {
    (async () => {
      const { user: currentUser } = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        setAvatarError(false); // Reset error state when user changes
        setLoading(false);
        // Load drafts for the user
        try {
          const res = await fetch('/api/itineraries/my-drafts');
          if (res.ok) {
            const j = await res.json();
            setDrafts(j.drafts || []);
          }
        } catch {}
      }
    })();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const displayName: string = useMemo(() => {
    const metaName = user?.user_metadata?.full_name || user?.user_metadata?.name;
    return metaName || user?.email?.split("@")[0] || "Traveler";
  }, [user]);

  const initials = useMemo(() => {
    const parts = displayName.trim().split(/\s+/);
    const first = parts[0]?.[0] || "T";
    const last = parts[1]?.[0] || (parts[0]?.[1] ?? "R");
    return (first + last).toUpperCase();
  }, [displayName]);

  // Settings form state
  const [nameInput, setNameInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");

  useEffect(() => {
    // Initialize settings form when user loads or modal opens
    const uname = (displayName || "").toLowerCase().replace(/\s+/g, "_");
    setNameInput(displayName || "");
    setUsernameInput(uname);
  }, [displayName, settingsOpen]);

  const isDirty = useMemo(() => {
    const baseUsername = (displayName || "").toLowerCase().replace(/\s+/g, "_");
    return nameInput !== (displayName || "") || usernameInput !== baseUsername;
  }, [nameInput, usernameInput, displayName]);

  async function saveSettings() {
    if (!isDirty) return setSettingsOpen(false);
    const supabase = createSbClient();
    try {
      setSavingSettings(true);
      const { error } = await supabase.auth.updateUser({
        data: { full_name: nameInput, username: usernameInput },
      });
      if (error) throw error;
      // update local state
      setUser((prev: any) => ({
        ...prev,
        user_metadata: {
          ...prev?.user_metadata,
          full_name: nameInput,
          username: usernameInput,
        },
      }));
      setSettingsOpen(false);
    } catch (e) {
      console.error("[settings.save]", e);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    const supabase = createSbClient();
    try {
      if (!user?.id) {
        alert("Please log in again before uploading your avatar.");
        return;
      }
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { data: upData, error: upErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });
      if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
      if (!upData) throw new Error("Upload failed: no data returned. Is the bucket name 'avatars'?");

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Preload the image to avoid flicker and catch bad URLs
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Uploaded image URL is not accessible. Check bucket public access/policies."));
        img.src = publicUrl;
      });

      // Update both Auth metadata and users table
      const { error: updErr } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (updErr) throw new Error(`Auth metadata update failed: ${updErr.message}`);

      // Also update the users table
      const { error: dbErr } = await (supabase
        .from('users') as any)
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
      
      if (dbErr) {
        console.warn("[profile.avatar.upload] Failed to update users table:", dbErr);
        // Don't throw - auth update succeeded, this is just a sync issue
      }

      // Optimistically update local user object
      setUser((prev: any) => ({
        ...prev,
        user_metadata: { ...prev?.user_metadata, avatar_url: publicUrl },
      }));
      console.log("[profile.avatar.upload] success:", { filePath, publicUrl });
    } catch (e) {
      console.error("[profile.avatar.upload]", e);
      const message = e instanceof Error ? e.message : "Unknown error";
      alert(`Failed to upload avatar: ${message}`);
    } finally {
      setUploading(false);
    }
  }

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
      <main className="flex-1 px-6 py-6">
        {/* Cover */}
        <div className="relative rounded-3xl border border-gray-200 mb-5 overflow-hidden">
          {/* Cover image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/CoverPhoto.png" alt="Profile cover" className="h-56 sm:h-64 w-full object-cover" />
          <button
            aria-label="Open settings"
            onClick={() => setSettingsOpen(true)}
            className="absolute top-3 right-3 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-white transition"
          >
            <IconSettings />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>

        {/* Header content below cover */}
        <div className="px-5 sm:px-6 pt-1 sm:pt-2 pb-2 flex items-start justify-between gap-6">
          <div className="flex items-start gap-5 flex-1 min-w-0">
            {/* Avatar left, larger to match info height visually */}
            <div className="group relative w-40 h-40 sm:w-48 sm:h-48 lg:w-52 lg:h-52 -mt-16 sm:-mt-20 rounded-2xl ring-4 ring-white overflow-hidden bg-gray-100 flex items-center justify-center text-3xl sm:text-4xl font-semibold text-gray-700 shadow-sm shrink-0 relative z-10">
              {user?.user_metadata?.avatar_url && !avatarError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt={displayName} 
                  className="w-full h-full object-cover"
                  onError={async () => {
                    // Image failed to load - clear it from database
                    setAvatarError(true);
                    const supabase = createSbClient();
                    try {
                      // Clear from auth metadata
                      await supabase.auth.updateUser({
                        data: { avatar_url: null },
                      });
                      // Clear from users table
                      await (supabase.from('users') as any)
                        .update({ avatar_url: null })
                        .eq('id', user.id);
                      // Update local state
                      setUser((prev: any) => ({
                        ...prev,
                        user_metadata: {
                          ...prev?.user_metadata,
                          avatar_url: null,
                        },
                      }));
                    } catch (error) {
                      console.error('Failed to clear avatar URL:', error);
                    }
                  }}
                />
              ) : (
                <span>{initials}</span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleAvatarUpload(f);
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/45 text-white text-xs sm:text-sm flex items-center justify-center transition"
                title={user?.user_metadata?.avatar_url ? "Change photo" : "Add photo"}
              >
                {uploading ? "Uploading..." : user?.user_metadata?.avatar_url ? "Change photo" : "Add photo"}
              </button>
            </div>

            {/* Info block */}
            <div className="pb-1 flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black">{displayName}</h1>
                <IconVerified />
              </div>
            <p className="text-sm text-gray-600 mt-1">Interface and Travel Experience Designer based on Earth</p>

            <div className="mt-3 flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsFollowing((v) => !v)}
                animate={{
                  backgroundColor: isFollowing ? "#111827" : "#0ea5e9",
                  color: "#ffffff",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="h-9 px-5 rounded-lg text-sm shadow-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-sky-300"
              >
                {isFollowing ? "Following" : "Follow"}
              </motion.button>
              <button className="h-9 px-4 rounded-lg text-sm bg-rose-400 text-white hover:bg-rose-500 transition shadow-sm inline-flex items-center gap-1.5">
                <IconHeart />
                Sponsor
              </button>
              <button className="h-9 w-9 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 grid place-items-center text-gray-700 transition shadow-sm" aria-label="Message">
                <IconMessage />
              </button>
              {/* Badges moved to right section */}
              </div>
            </div>
          </div>

          {/* Right badges + stats aligned to left rows: name, description, buttons */}
          <div className="hidden sm:flex flex-col items-end pr-2 text-right">
            {/* Row 1: badges (slightly below the name) */}
            <div className="flex items-center gap-3 mt-2 mb-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-2 py-1 text-xs text-gray-700 shadow-sm">
                <IconHeart /> Loved by Travelers
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-2 py-1 text-xs text-gray-700 shadow-sm">
                ✈️ Explorer
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-2 py-1 text-xs text-gray-700 shadow-sm">
                🔥 Trendsetter
              </span>
            </div>
            {/* Row 2: labels (aligns with description) */}
            <div className="flex items-center gap-2">
              <div className="text-center w-23">
                <div className="text-s text-gray-500">Followers</div>
              </div>
              <div className="text-center w-26">
                <div className="text-s text-gray-500">Total Trips</div>
              </div>
            </div>
            {/* Row 3: numbers (aligns with buttons) */}
            <div className="flex items-center gap-0 mt-2">
              <div className="text-center w-23 text-gray-900 text-xl font-semibold">2,985</div>
              <div className="text-center w-28 text-gray-900 text-xl font-semibold">42</div>
            </div>
          </div>
        </div>

        {/* Stats row for mobile */}
        <div className="sm:hidden grid grid-cols-2 gap-3 mb-6 mt-2">
          <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
            <div className="text-xs text-gray-500">Followers</div>
            <div className="text-lg font-semibold text-gray-900">2,985</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3 text-center">
            <div className="text-xs text-gray-500">Total Trips</div>
            <div className="text-lg font-semibold text-gray-900">42</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-5 mt-4">
          {[
            { id: "created", label: "Itineraries Created" },
            { id: "followed", label: "Itineraries Followed" },
            { id: "saved", label: "Saved Itineraries" },
            { id: "drafts", label: "Drafts" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`relative h-9 rounded-lg px-3 text-sm transition border ${
                activeTab === t.id ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-300 hover:bg-gray-50 text-gray-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2"
          >
            {(activeTab === "created"
              ? createdItineraries
              : activeTab === "followed"
              ? followedItineraries
              : activeTab === "saved"
              ? savedItineraries
              : (drafts || []).map((d) => ({ id: d.id, title: d.title, category: d.description || "Draft", views: "—", img: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop", isDraft: true }))
            ).map((card) => (
              <div key={card.id} className="group rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition">
                <a href={('isDraft' in card && card.isDraft) ? `/itineraries/add-itineraries/manual?draftId=${card.id}` : `#`} className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.img} alt={card.title} className="h-40 w-full object-cover" />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 truncate">{card.title}</div>
                        <div className="text-xs text-gray-500">{card.category}</div>
                      </div>
                      <span className="text-xs text-gray-500">{card.views}</span>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Footer actions removed as per request */}

        {/* Settings modal */}
        <AnimatePresence>
          {settingsOpen && (
            <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/30" onClick={() => setSettingsOpen(false)} />
              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 24, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="absolute right-6 top-16 w-[360px] max-w-[90vw] rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <div className="font-semibold text-gray-900">Personal Settings</div>
                  <button onClick={() => setSettingsOpen(false)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Email Connected</div>
                    <div className="h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 flex items-center text-sm text-gray-700">{user?.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Account Type</div>
                    <div className="h-10 px-3 rounded-lg border border-gray-200 bg-white flex items-center text-sm text-gray-700">Creator</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Name</div>
                    <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="h-10 px-3 rounded-lg border border-gray-200 bg-white w-full text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"/>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Username</div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">@</span>
                      <input value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="h-10 pl-7 pr-3 rounded-lg border border-gray-200 bg-white w-full text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"/>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between gap-2 bg-gray-50">
                  <button onClick={handleSignOut} className="h-9 px-4 rounded-lg text-sm bg-rose-600 text-white hover:bg-rose-700 transition">Sign Out</button>
                  <button
                    disabled={!isDirty || savingSettings}
                    onClick={saveSettings}
                    className={`${isDirty ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-gray-200 text-gray-800"} h-9 px-4 rounded-lg text-sm transition disabled:cursor-not-allowed`}
                  >
                    {savingSettings ? "Saving..." : "Done"}
                  </button>
        </div>
              </motion.div>
        </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

