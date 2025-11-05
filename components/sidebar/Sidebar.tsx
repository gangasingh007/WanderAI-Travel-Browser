// /components/sidebar/Sidebar.tsx
"use client";

import { useState, type ReactNode, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, ChevronUp, ChevronDown, LogOut, BookOpen, Coins } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/auth";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const Icon = ({ path }: { path: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-700"
  >
    <path d={path} />
  </svg>
);

const navItems: NavItem[] = [
  {
    label: "Chat",
    href: "/chat", // <-- Corrected link
    icon: <Icon path="M21 15a4 4 0 0 1-4 4H8l-5 5V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />,
  },
  {
    label: "Itineraries",
    href: "/itineraries",
    icon: <Icon path="M3 6l7-3 7 3 4-2v14l-4 2-7-3-7 3V4z" />,
  },
  {
    label: "Explore",
    href: "/explore",
    icon: <Icon path="M12 2l3 7h7l-5.5 4 2 7L12 16 5.5 20 7.5 13 2 9h7z" />,
  },
  {
    label: "Following",
    href: "/following",
    icon: <Icon path="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M8 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8-4a4 4 0 1 1 0 8" />,
  },
  {
    label: "Marketplace",
    href: "/marketplace",
    icon: <Icon path="M3 9l1-5h16l1 5M5 22h14a2 2 0 0 0 2-2v-9H3v9a2 2 0 0 0 2 2z" />,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: <Icon path="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
  },
];

type Chat = {
  id: string;
  title: string;
  createdAt: string;
  userId: string;
};

type UserProfile = {
  name: string;
  email: string;
  avatarUrl?: string;
  accountType: "CREATOR" | "TRAVELER";
  totalTrips: number;
  followers: number;
  wanderCoins: number;
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        // Fetch only latest 4 chats for sidebar
        const response = await fetch("/api/chats?limit=4");
        if (response.ok) {
          const data = await response.json();
          setChats(data);
        }
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch user profile from users table
          const { data: profile, error } = await supabase
            .from('users')
            .select('full_name, email, avatar_url, user_type')
            .eq('id', user.id)
            .single();

          if (profile && !error) {
            const profileData = profile as {
              full_name: string | null;
              email: string | null;
              avatar_url: string | null;
              user_type: 'CREATOR' | 'TRAVELER' | null;
            };
            const displayName = profileData.full_name || user.email?.split('@')[0] || 'Traveler';
            setUserProfile({
              name: displayName,
              email: profileData.email || user.email || '',
              avatarUrl: profileData.avatar_url || undefined,
              accountType: profileData.user_type || 'TRAVELER',
              totalTrips: 24, // Mock data
              followers: 156, // Mock data
              wanderCoins: 1250, // Mock data
            });
          } else {
            // Fallback if profile not found
            const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Traveler';
            setUserProfile({
              name: displayName,
              email: user.email || '',
              avatarUrl: user.user_metadata?.avatar_url,
              accountType: 'TRAVELER',
              totalTrips: 24,
              followers: 156,
              wanderCoins: 1250,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <motion.aside
      layout
      animate={{ width: collapsed ? 76 : 240 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="h-screen border-r border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-30"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 h-[72px]">
          <div className="flex-1 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo.svg" alt="Wander AI" className="h-8 w-8 shrink-0" />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  className="leading-tight"
                >
                  <div className="text-xl font-semibold tracking-tight text-gray-900">
                    Wander<span className="text-gray-600">AI</span>
                  </div>
                  <div className="text-[11px] text-gray-500">Travel. Smarter. Together.</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            aria-label="Toggle sidebar"
            onClick={() => setCollapsed((v) => !v)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={collapsed ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="px-2 mt-2 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} className="group block relative" aria-label={item.label} title={item.label}>
                <div
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                    active
                      ? "bg-gray-100 text-black"
                      : "text-gray-700 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        className="text-sm font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {collapsed && (
                  <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-black/90 text-white text-[11px] px-2 py-1 opacity-0 group-hover:opacity-100 shadow-md transition-opacity">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Chat History Section */}
        {!collapsed && (
          <div className="mt-6 px-2 flex-1 overflow-y-auto min-h-0">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Recent Chats
            </h3>

            {isLoading && (
              <div className="px-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-md w-2/3 animate-pulse"></div>
              </div>
            )}

            {!isLoading && chats.length === 0 && (
              <div className="px-3 py-4 text-center">
                <p className="text-xs text-gray-400">No chat history yet</p>
              </div>
            )}

            {!isLoading && chats.length > 0 && (
              <div className="space-y-1">
                {chats.map((chat) => {
                  const href = `/chat/${chat.id}`;
                  const active = pathname === href || pathname.startsWith(href + "/");

                  return (
                    <Link 
                      key={chat.id} 
                      href={href} 
                      className="group block relative" 
                      aria-label={chat.title} 
                      title={chat.title}
                    >
                      <div
                        className={[
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                          active
                            ? "bg-gray-100 text-black"
                            : "text-gray-700 hover:bg-gray-50",
                        ].join(" ")}
                      >
                        <span className="shrink-0">
                          <MessageSquare size={18} className="text-gray-500" />
                        </span>
                        <AnimatePresence>
                          {!collapsed && (
                            <motion.span
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -6 }}
                              className="text-sm font-medium truncate flex-1"
                            >
                              {chat.title || "New Chat"}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </Link>
                  );
                })}
          </div>
        )}

            {/* See All Link - Show when there are chats */}
            {!isLoading && chats.length > 0 && (
                <Link 
                href="/chat/history"
                className="group block relative px-2 mt-2"
                aria-label="See all chats"
                title="See all chats"
                >
                  <div
                    className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                    pathname === "/chat/history"
                        ? "bg-gray-100 text-black"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
                    ].join(" ")}
                  >
                  <span className="text-sm font-medium">See all</span>
                </div>
              </Link>
            )}
          </div>
        )}

        {/* Profile Section */}
        <div className="mt-auto border-t border-gray-200 pt-3 pb-4">
          {!isLoadingProfile && userProfile && (
            <>
              {!collapsed ? (
                <div className="px-2 relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-gray-50 group"
                  >
                    <div className="shrink-0">
                      {userProfile.avatarUrl ? (
                        <img
                          src={userProfile.avatarUrl}
                          alt={userProfile.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(userProfile.name)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {userProfile.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {userProfile.accountType === 'CREATOR' ? 'Creator' : 'Traveler'}
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col">
                      <ChevronUp size={12} className={`text-gray-400 transition-transform ${isProfileMenuOpen ? 'opacity-100' : 'opacity-50'}`} />
                      <ChevronDown size={12} className={`text-gray-400 transition-transform -mt-1 ${isProfileMenuOpen ? 'opacity-50' : 'opacity-100'}`} />
                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed left-[247px] bottom-4 w-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                      >
                        {/* Profile Header */}
                        <div className="px-4 py-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="shrink-0">
                              {userProfile.avatarUrl ? (
                                <img
                                  src={userProfile.avatarUrl}
                                  alt={userProfile.name}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold border-2 border-white shadow-sm">
                                  {getInitials(userProfile.name)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-900 truncate">
                                {userProfile.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {userProfile.accountType === 'CREATOR' ? 'Creator' : 'Traveler'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Total Trips</div>
                              <div className="text-lg font-semibold text-gray-900">{userProfile.totalTrips}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Followers</div>
                              <div className="text-lg font-semibold text-gray-900">{userProfile.followers}</div>
                            </div>
                          </div>
                        </div>

                        {/* Wander Coins */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-yellow-50">
                          <div className="flex items-center gap-2">
                            <Coins size={18} className="text-amber-600" />
                            <div className="flex-1">
                              <div className="text-xs text-gray-600 mb-1">Wander Coins</div>
                              <div className="text-lg font-semibold text-amber-700">{userProfile.wanderCoins.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>

                        {/* Menu Options */}
                        <div className="py-2">
                          <Link
                            href="/itineraries"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <BookOpen size={18} className="text-gray-500" />
                            <span>Saved Itineraries</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={18} />
                            <span>Logout</span>
                          </button>
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                          <p className="text-xs text-center text-gray-500">
                            Thanks for using Wander AI as your travel partner ❤️
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Collapsed profile view
                <div className="px-2 flex justify-center relative" ref={profileMenuRef}>
                  {userProfile.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.name}
                      className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 ring-gray-200 transition-all"
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    />
                  ) : (
                    <div
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:ring-2 ring-gray-200 transition-all"
                    >
                      {getInitials(userProfile.name)}
                    </div>
                  )}
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-0 left-full ml-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                      >
                      {/* Same dropdown content as above */}
                      <div className="px-4 py-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">
                            {userProfile.avatarUrl ? (
                              <img
                                src={userProfile.avatarUrl}
                                alt={userProfile.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold border-2 border-white shadow-sm">
                                {getInitials(userProfile.name)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {userProfile.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {userProfile.accountType === 'CREATOR' ? 'Creator' : 'Traveler'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Total Trips</div>
                            <div className="text-lg font-semibold text-gray-900">{userProfile.totalTrips}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Followers</div>
                            <div className="text-lg font-semibold text-gray-900">{userProfile.followers}</div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-yellow-50">
                        <div className="flex items-center gap-2">
                          <Coins size={18} className="text-amber-600" />
                          <div className="flex-1">
                            <div className="text-xs text-gray-600 mb-1">Wander Coins</div>
                            <div className="text-lg font-semibold text-amber-700">{userProfile.wanderCoins.toLocaleString()}</div>
                          </div>
                        </div>
                  </div>
                      <div className="py-2">
                        <Link
                          href="/itineraries"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <BookOpen size={18} className="text-gray-500" />
                          <span>Saved Itineraries</span>
                </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </div>
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                        <p className="text-xs text-center text-gray-500">
                          Thanks for using Wander AI as your travel partner ❤️
                        </p>
                      </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
          </div>
        )}
            </>
          )}
        </div>
      </div>
    </motion.aside>
  );
}