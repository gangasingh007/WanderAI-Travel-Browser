// /components/sidebar/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: JSX.Element;
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
    href: "/chat/new", // <-- Corrected link
    icon: <Icon path="M21 15a4 4 0 0 1-4 4H8l-5 5V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />,
  },
  {
    label: "Map",
    href: "/map",
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

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/chats");
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

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 260 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="h-screen border-r border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-30"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-black" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="text-sm font-semibold tracking-tight text-gray-800"
                >
                  Wander<span className="text-gray-600">AI</span>
                </motion.span>
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
            const active = pathname === item.href;
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
        {collapsed && (<div className="mt-6 px-2 space-y-1 overflow-y-auto">
          {!collapsed && (
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Chats
            </h3>
          )}

          {isLoading && !collapsed && (
            <div className="px-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-md w-1/2 animate-pulse"></div>
            </div>
          )}

          {!isLoading && chats.map((chat) => {
            const href = `/chat/${chat.id}`;
            const active = pathname === href;

            return (
              <Link key={chat.id} href={href} className="group block relative" aria-label={chat.title} title={chat.title}>
                <div
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                    active
                      ? "bg-gray-100 text-black"
                      : "text-gray-700 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <span className="shrink-0">
                    {!collapsed ? <MessageSquare size={20} className="text-gray-700" /> :null }
                  </span>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        className="text-sm font-medium truncate"
                      >
                        {chat.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {collapsed && (
                  <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-md bg-black/90 text-white text-[11px] px-2 py-1 opacity-0 group-hover:opacity-100 shadow-md transition-opacity">
                    {chat.title}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        )}
        {/* Footer spacer */}
        <div className="mt-auto pb-4" />
      </div>
    </motion.aside>
  );
}