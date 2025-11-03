"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/sidebar/Sidebar";

type Category = 'all' | 'top-creators' | 'trending' | 'best-itineraries' | 'underrated' | 'adventure' | 'culture' | 'food' | 'budget' | 'luxury';

type ItineraryCard = {
  id: string;
  title: string;
  creator: string;
  creatorAvatar: string;
  destination: string;
  image: string;
  views: number;
  saves: number;
  rating: number;
  days: number;
  stops: number;
  tags: string[];
};

// Mock data for itineraries
const mockItineraries: ItineraryCard[] = [
  {
    id: '1',
    title: 'Golden Triangle Adventure',
    creator: '@the.city.nomad',
    creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
    destination: 'Delhi, Jaipur, Agra',
    image: 'https://plus.unsplash.com/premium_photo-1661919589683-f11880119fb7?w=800&q=80',
    views: 12400,
    saves: 890,
    rating: 4.8,
    days: 7,
    stops: 24,
    tags: ['culture', 'food']
  },
  {
    id: '2',
    title: 'Hidden Gems of Rajasthan',
    creator: '@wanderlust_solo',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    destination: 'Jodhpur, Udaipur',
    image: 'https://images.unsplash.com/photo-1602643163983-ed0babc39797?w=800&q=80',
    views: 8200,
    saves: 650,
    rating: 4.9,
    days: 5,
    stops: 18,
    tags: ['underrated', 'adventure']
  },
  {
    id: '3',
    title: 'Street Food Trail',
    creator: '@foodie_trails',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    destination: 'Mumbai, Delhi',
    image: 'https://images.unsplash.com/photo-1609258678760-ba05d9b95bb9?w=800&q=80',
    views: 15600,
    saves: 1200,
    rating: 4.7,
    days: 6,
    stops: 32,
    tags: ['food', 'budget']
  },
  {
    id: '4',
    title: 'Luxury Heritage Tour',
    creator: '@jet_set_travel',
    creatorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
    destination: 'Kerala, Goa',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    views: 9800,
    saves: 750,
    rating: 4.9,
    days: 10,
    stops: 28,
    tags: ['luxury', 'culture']
  },
  {
    id: '5',
    title: 'Mountain Escape',
    creator: '@mountain_roamer',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    destination: 'Himachal Pradesh',
    image: 'https://images.unsplash.com/photo-1561769227-9cc2d37ceeb6?w=800&q=80',
    views: 11200,
    saves: 980,
    rating: 4.8,
    days: 8,
    stops: 20,
    tags: ['adventure', 'underrated']
  },
  {
    id: '6',
    title: 'Art & Architecture',
    creator: '@artistic.voyager',
    creatorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    destination: 'Hampi, Badami',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
    views: 6700,
    saves: 520,
    rating: 4.6,
    days: 4,
    stops: 15,
    tags: ['culture', 'underrated']
  },
  {
    id: '7',
    title: 'Budget Backpacker Route',
    creator: '@budget_backpacker',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80',
    destination: 'Rishikesh, Manali',
    image: 'https://images.unsplash.com/photo-1602339752474-f77aa7bcaecd?w=800&q=80',
    views: 14300,
    saves: 1100,
    rating: 4.7,
    days: 6,
    stops: 22,
    tags: ['budget', 'adventure']
  },
  {
    id: '8',
    title: 'Spiritual Journey',
    creator: '@spiritual_seeker',
    creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    destination: 'Varanasi, Rishikesh',
    image: 'https://plus.unsplash.com/premium_photo-1697729441569-f706fdd1f71c?w=800&q=80',
    views: 8900,
    saves: 680,
    rating: 4.9,
    days: 7,
    stops: 19,
    tags: ['culture', 'underrated']
  },
];

const categories: { id: Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'top-creators', label: 'Top Creators' },
  { id: 'trending', label: 'Trending' },
  { id: 'best-itineraries', label: 'Best Itineraries' },
  { id: 'underrated', label: 'Underrated Gems' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'culture', label: 'Culture' },
  { id: 'food', label: 'Food' },
  { id: 'budget', label: 'Budget' },
  { id: 'luxury', label: 'Luxury' },
];

function ItineraryCard({ card, index }: { card: ItineraryCard; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer"
    >
      <Link href={`/itinerary/${card.id}`}>
        <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(31,38,135,0.15)] transition-all duration-300 hover:shadow-[0_12px_48px_rgba(31,38,135,0.25)] hover:bg-white/50">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <motion.img
              src={card.image}
              alt={card.title}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Stats overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                  {card.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/></svg>
                  {card.saves}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                <svg className="w-3 h-3 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <span>{card.rating}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={card.creatorAvatar}
                alt={card.creator}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/50"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black truncate">{card.creator}</p>
                <p className="text-xs text-black/60 truncate">{card.destination}</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2 group-hover:text-black/80 transition-colors">
              {card.title}
            </h3>

            <div className="flex items-center gap-4 text-sm text-black/70 mb-3">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {card.days} days
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {card.stops} stops
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {card.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs font-medium rounded-full bg-white/60 text-black/70 border border-white/40"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ExplorePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { user: currentUser } = await getCurrentUser();
      // Allow access without auth for now (for testing)
      // Uncomment the redirect if you want auth required:
      // if (!currentUser) {
      //   router.push("/login");
      //   return;
      // }
      setUser(currentUser || null);
      setLoading(false);
    })();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Filter itineraries based on category and search
  const filteredItineraries = mockItineraries.filter((card) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      card.tags.includes(selectedCategory) ||
      (selectedCategory === 'top-creators' && card.rating >= 4.8) ||
      (selectedCategory === 'trending' && card.views > 10000) ||
      (selectedCategory === 'best-itineraries' && card.rating >= 4.7) ||
      (selectedCategory === 'underrated' && card.tags.includes('underrated'));
    
    const matchesSearch =
      searchQuery === '' ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.creator.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

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
      <main className="flex-1 px-6 md:px-12 py-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold text-black/90 mb-2">Explore</h1>
              <p className="text-black/60">Discover amazing travel itineraries from creators worldwide</p>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-black font-medium">
                    {user?.user_metadata?.full_name || user?.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search destinations, creators, or itineraries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-12 rounded-2xl border border-white/40 bg-white/40 backdrop-blur-2xl text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20 focus:bg-white/50 transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === category.id
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-white/40 backdrop-blur-md border border-white/40 text-black/70 hover:bg-white/60'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 text-sm text-black/60">
          Showing {filteredItineraries.length} {filteredItineraries.length === 1 ? 'itinerary' : 'itineraries'}
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory + searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredItineraries.length > 0 ? (
              filteredItineraries.map((card, index) => (
                <ItineraryCard key={card.id} card={card} index={index} />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-black/60 text-lg">No itineraries found. Try a different category or search term.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
