"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";

type ItineraryCard = {
  id: string;
  title: string;
  creator: {
    name: string;
    avatar: string;
  };
  destination: string;
  image: string;
  views: number;
  saves: number;
  rating: number;
  days: number;
  stops: number;
  description: string;
  tags: string[];
};

// Mock data for following feed
const mockFollowingItineraries: ItineraryCard[] = [
  {
    id: '1',
    title: 'Golden Triangle Adventure',
    creator: {
      name: '@the.city.nomad',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
    },
    destination: 'Delhi, Jaipur, Agra',
    image: 'https://plus.unsplash.com/premium_photo-1661919589683-f11880119fb7?w=800&q=80',
    views: 12400,
    saves: 890,
    rating: 4.8,
    days: 7,
    stops: 24,
    description: 'This journey through India\'s Golden Triangle was nothing short of magical. Starting in the vibrant capital of Delhi, I was immediately struck by the incredible contrast between ancient history and modern life.',
    tags: ['culture', 'food']
  },
  {
    id: '2',
    title: 'Hidden Gems of Rajasthan',
    creator: {
      name: '@wanderlust_solo',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    },
    destination: 'Jodhpur, Udaipur',
    image: 'https://images.unsplash.com/photo-1602643163983-ed0babc39797?w=800&q=80',
    views: 8200,
    saves: 650,
    rating: 4.9,
    days: 5,
    stops: 18,
    description: 'Discover the royal heritage and stunning architecture of Rajasthan through its hidden gems. From the blue city of Jodhpur to the romantic lakes of Udaipur.',
    tags: ['underrated', 'adventure']
  },
  {
    id: '3',
    title: 'Street Food Trail',
    creator: {
      name: '@foodie_trails',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    },
    destination: 'Mumbai, Delhi',
    image: 'https://images.unsplash.com/photo-1609258678760-ba05d9b95bb9?w=800&q=80',
    views: 15600,
    saves: 1200,
    rating: 4.7,
    days: 6,
    stops: 32,
    description: 'A culinary journey through India\'s most vibrant food scenes. From Mumbai\'s street vendors to Delhi\'s legendary food markets.',
    tags: ['food', 'budget']
  },
  {
    id: '4',
    title: 'Luxury Heritage Tour',
    creator: {
      name: '@jet_set_travel',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
    },
    destination: 'Kerala, Goa',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    views: 9800,
    saves: 750,
    rating: 4.9,
    days: 10,
    stops: 28,
    description: 'Experience the luxury side of India with this heritage tour through Kerala and Goa. From backwaters to beaches, this journey offers the perfect blend of relaxation and culture.',
    tags: ['luxury', 'culture']
  },
];

function FollowingItineraryCard({ card, index }: { card: ItineraryCard; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="mb-6"
    >
      <Link href={`/itinerary/${card.id}`}>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
          {/* Image */}
          <div className="relative w-full h-[400px] overflow-hidden">
            <motion.img
              src={card.image}
              alt={card.title}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            
            {/* Stats overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between text-white mb-3">
                <div className="flex items-center gap-4 text-sm font-medium">
                  <span>{card.days} days</span>
                  <span>{card.stops} stops</span>
                  <div className="flex items-center gap-1">
                    <span>⭐</span>
                    <span>{card.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>{card.views.toLocaleString()} views</span>
                  <span>{card.saves} saves</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Creator */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={card.creator.avatar}
                alt={card.creator.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-base font-medium text-gray-900">{card.creator.name}</span>
            </div>
            
            {/* Title */}
            <h3 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
              {card.title}
            </h3>
            
            {/* Destination */}
            <p className="text-base text-gray-600 mb-4">{card.destination}</p>
            
            {/* Description */}
            <p className="text-base text-gray-600 leading-relaxed mb-4">
              {card.description}
            </p>
            
            {/* Tags */}
            <div className="flex gap-2">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 text-sm font-medium rounded-full bg-gray-100 text-gray-700"
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

export default function FollowingFeed() {
  const [displayedItems, setDisplayedItems] = useState<ItineraryCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const itemsPerLoad = 3;
  const currentIndexRef = useRef(0);

  // Initialize with first 3 items
  useEffect(() => {
    setDisplayedItems(mockFollowingItineraries.slice(0, itemsPerLoad));
    currentIndexRef.current = itemsPerLoad;
  }, []);

  const loadMore = useCallback(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      const nextItems: ItineraryCard[] = [];
      const startIndex = currentIndexRef.current;
      
      // Loop through the array to get next items
      for (let i = 0; i < itemsPerLoad; i++) {
        const index = (startIndex + i) % mockFollowingItineraries.length;
        nextItems.push(mockFollowingItineraries[index]);
      }
      
      setDisplayedItems((prev) => [...prev, ...nextItems]);
      currentIndexRef.current = (startIndex + itemsPerLoad) % mockFollowingItineraries.length;
      setIsLoading(false);
    }, 500);
  }, [isLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore]);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Your Following Feed</h2>
      </div>
      
      {/* Cards in vertical stack */}
      <div className="space-y-0">
        {displayedItems.map((card, index) => (
          <FollowingItineraryCard key={`${card.id}-${index}`} card={card} index={index} />
        ))}
      </div>
      
      {/* Loading indicator and observer target */}
      <div ref={observerTarget} className="py-8">
        {isLoading && (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}
