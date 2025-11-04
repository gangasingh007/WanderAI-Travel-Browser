"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import GlassCarousel from "@/components/GlassCarousel";
// UI-only landing page: no auth or data dependencies

// Hook to track section visibility
function useSectionVisibility(threshold: number = 0.3) {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map());
  const thresholdRef = useRef(threshold);

  // Keep threshold ref updated
  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  // Cleanup on unmount
  useEffect(() => {
      return () => {
      observersRef.current.forEach((observer) => observer.disconnect());
      observersRef.current.clear();
      };
  }, []);

  const registerSection = (sectionId: string) => (element: HTMLElement | null) => {
    // Cleanup existing observer for this section
    const existingObserver = observersRef.current.get(sectionId);
    if (existingObserver) {
      existingObserver.disconnect();
      observersRef.current.delete(sectionId);
    }

    if (element) {
      // Create new observer directly - no state updates here
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setVisibleSections((prev) => {
              const next = new Set(prev);
              // Use ref to get current threshold value
              if (entry.isIntersecting && entry.intersectionRatio >= thresholdRef.current) {
                next.add(sectionId);
              } else {
                next.delete(sectionId);
              }
              return next;
            });
          });
        },
        {
          threshold: [0, thresholdRef.current, 1],
          rootMargin: '-10% 0px -10% 0px'
        }
      );

      observer.observe(element);
      observersRef.current.set(sectionId, observer);
    }
  };

  return { visibleSections, registerSection };
}

// Creator card data
const creators = [
  {
    name: "@the.city.nomad",
    description: "Exploring hidden gems in bustling cities across Asia",
    gif: "https://media.giphy.com/media/3o7TKSjR3IDRxQ0XWW/giphy.gif",
    place: "Delhi, India"
  },
  {
    name: "@wanderlust_solo",
    description: "Solo adventures discovering the world one destination at a time",
    gif: "https://media.giphy.com/media/l0MYGb3LuZui8KVXa/giphy.gif",
    place: "Tokyo, Japan"
  },
  {
    name: "@foodie_trails",
    description: "Following flavors from street food to fine dining around the globe",
    gif: "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif",
    place: "Bangkok, Thailand"
  },
  {
    name: "@mountain_roamer",
    description: "Chasing peaks and breathtaking views in the Himalayas",
    gif: "https://media.giphy.com/media/l0HlGIXMJBKhqoJmw/giphy.gif",
    place: "Nepal"
  },
  {
    name: "@jet_set_travel",
    description: "Luxury travel experiences and exclusive destinations worldwide",
    gif: "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif",
    place: "Dubai, UAE"
  },
  {
    name: "@artistic.voyager",
    description: "Capturing art, architecture, and culture through my lens",
    gif: "https://media.giphy.com/media/3o7TKSjR3IDRxQ0XWW/giphy.gif",
    place: "Paris, France"
  }
];

function CreatorCollage({ isVisible }: { isVisible: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleHoverChange = (hovered: boolean) => {
    setIsHovered(hovered);
  };

  return (
    <div className="relative py-8">
      {/* Simple white fade overlays */}
      <div 
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-40 z-20"
        style={{
          background: 'linear-gradient(to right, white 0%, rgba(255, 255, 255, 0.8) 40%, rgba(255, 255, 255, 0.4) 70%, transparent 100%)'
        }}
      />
      <div 
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-40 z-20"
        style={{
          background: 'linear-gradient(to left, white 0%, rgba(255, 255, 255, 0.8) 40%, rgba(255, 255, 255, 0.4) 70%, transparent 100%)'
        }}
      />
      
      {/* Scrolling row - proper infinite loop */}
      <div className="relative overflow-hidden py-4 w-full">
        <div 
          ref={scrollContainerRef}
          className={`flex gap-6 w-max animate-scroll-left`}
          style={{
            animationPlayState: (!isVisible || isHovered) ? 'paused' : 'running'
          }}
        >
          {/* First set of cards */}
          {creators.map((creator, idx) => (
            <CreatorCard 
              key={`set1-${idx}`} 
              creator={creator} 
              onHoverChange={handleHoverChange}
            />
          ))}
          {/* Duplicate set for seamless loop - must be identical */}
          {creators.map((creator, idx) => (
            <CreatorCard 
              key={`set2-${idx}`} 
              creator={creator} 
              onHoverChange={handleHoverChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CreatorCard({ 
  creator, 
  onHoverChange 
}: { 
  creator: typeof creators[0];
  onHoverChange: (isHovered: boolean) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullyVisible, setIsFullyVisible] = useState(false);
  const gifRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Check if card is fully visible using IntersectionObserver
  useEffect(() => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Card is fully visible when intersectionRatio is >= 0.95
          setIsFullyVisible(entry.intersectionRatio >= 0.95);
        });
      },
      {
        threshold: [0, 0.5, 0.95, 1],
        rootMargin: '0px'
      }
    );

    observer.observe(cardElement);

      return () => {
      if (cardElement) {
        observer.unobserve(cardElement);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (!isFullyVisible) return;
    
    // Pause animation first, synchronously
    onHoverChange(true);
    setIsPlaying(true);
    
    // Force GIF to restart by reloading with timestamp
    if (gifRef.current) {
      const originalSrc = creator.gif.split('?')[0];
      gifRef.current.src = originalSrc + '?t=' + Date.now();
    }
  };

  const handleMouseLeave = () => {
    setIsPlaying(false);
    onHoverChange(false);
    };

    return (
    <div
      ref={cardRef}
      className="flex-shrink-0 w-80"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        pointerEvents: isFullyVisible ? 'auto' : 'none',
        opacity: isFullyVisible ? 1 : 0.6,
        transform: isFullyVisible && isPlaying ? 'scale(1.05)' : 'scale(1)',
        transformOrigin: 'center center',
        transition: 'transform 0.2s ease-out, opacity 0.3s ease-out',
        zIndex: isFullyVisible && isPlaying ? 10 : 1
      }}
    >
      {/* Card content wrapper - prevents layout shift */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
        {/* GIF container */}
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          <div className="absolute inset-0">
            {/* Static placeholder */}
            <div 
              className={`absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center transition-opacity duration-300 ${
                isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <div className="text-gray-400 text-4xl">📸</div>
            </div>
            {/* GIF that plays on hover */}
            <img
              ref={gifRef}
              src={creator.gif}
              alt={creator.place}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isPlaying ? 'opacity-100' : 'opacity-0'
              }`}
                  loading="lazy"
                />
              </div>
          </div>
        
        {/* Card content */}
        <div className="p-5">
          <h3 className="font-semibold text-black text-lg mb-2">{creator.name}</h3>
          <p className="text-sm text-black/70 mb-2">{creator.place}</p>
          <p className="text-sm text-black/60 leading-relaxed">{creator.description}</p>
          </div>
        </div>
      </div>
    );
}

// City-specific photo data
const CITY_PHOTOS = {
  delhi: [
    { src: "https://plus.unsplash.com/premium_photo-1661919589683-f11880119fb7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170", alt: "Delhi", city: 'delhi' },
    { src: "https://images.unsplash.com/photo-1609258678760-ba05d9b95bb9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735", alt: "Delhi", city: 'delhi' },
    { src: "https://images.unsplash.com/photo-1598977054780-2dc700fdc9d3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735", alt: "Delhi", city: 'delhi' },
  ],
  jaipur: [
    { src: "https://images.unsplash.com/photo-1602643163983-ed0babc39797?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=765", alt: "Jaipur", city: 'jaipur' },
    { src: "https://images.unsplash.com/photo-1599661046289-e31897846e41?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=627", alt: "Jaipur", city: 'jaipur' },
    { src: "https://images.unsplash.com/photo-1602339752474-f77aa7bcaecd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1173", alt: "Jaipur", city: 'jaipur' },
  ],
  agra: [
    { src: "https://plus.unsplash.com/premium_photo-1697729441569-f706fdd1f71c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170", alt: "Agra", city: 'agra' },
    { src: "https://images.unsplash.com/photo-1589884674963-c33aec0347a7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fGFncmF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600", alt: "Agra", city: 'agra' },
    { src: "https://images.unsplash.com/photo-1610014412574-1dec1a8e0651?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aXRtYWQtdWQtZGF1bGF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600", alt: "Agra", city: 'agra' },
  ],
};

// Combine all photos in order: Delhi → Jaipur → Agra
const ALL_PHOTOS = [
  ...CITY_PHOTOS.delhi,
  ...CITY_PHOTOS.jaipur,
  ...CITY_PHOTOS.agra,
];

// City start indices
const CITY_START_INDICES = {
  delhi: 0,
  jaipur: CITY_PHOTOS.delhi.length,
  agra: CITY_PHOTOS.delhi.length + CITY_PHOTOS.jaipur.length,
};

type City = 'delhi' | 'jaipur' | 'agra';

function InteractiveJourneyCarousel({ isVisible }: { isVisible: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dir, setDir] = useState<1|-1>(1);
  const lockRef = useRef(false);
  const resetTokenRef = useRef(0);

  const activePhoto = ALL_PHOTOS[currentIndex];
  
  // Determine which city the current photo belongs to
  const getCityForIndex = (index: number): City => {
    if (index < CITY_START_INDICES.jaipur) return 'delhi';
    if (index < CITY_START_INDICES.agra) return 'jaipur';
    return 'agra';
  };

  const highlightedCity = getCityForIndex(currentIndex);

  // Auto-advance carousel
  useEffect(() => {
    if (!isVisible || lockRef.current) return;
    const timer = setTimeout(() => {
      setDir(1);
      setCurrentIndex((prev) => (prev + 1) % ALL_PHOTOS.length);
      resetTokenRef.current += 1;
    }, 4200);
    return () => clearTimeout(timer);
  }, [currentIndex, isVisible]);

  const goToPhoto = (direction: 1|-1) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setDir(direction);
    setCurrentIndex((prev) => (prev + direction + ALL_PHOTOS.length) % ALL_PHOTOS.length);
    resetTokenRef.current += 1;
    setTimeout(() => { lockRef.current = false; }, 480);
  };

  const selectCity = (city: City) => {
    setCurrentIndex(CITY_START_INDICES[city]);
    resetTokenRef.current += 1;
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/30 backdrop-blur-2xl shadow-[0_8px_32px_rgba(31,38,135,0.25)]">
      <div className="relative aspect-[16/10] md:aspect-[4/3]">
        <div className="absolute inset-0">
          <AnimatePresence initial={false} custom={dir}>
            <motion.img
              key={`${currentIndex}-${activePhoto.src}`}
              src={activePhoto.src}
              alt={activePhoto.alt}
              className="h-full w-full object-cover"
              loading="lazy"
              initial={{ opacity: 0, x: dir > 0 ? 60 : -60, scale: 1.02 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: dir > 0 ? -60 : 60, scale: 1.01 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-white/10" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-white/50 rounded-3xl" />
        </div>

        {/* City buttons */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-wrap gap-2 z-20">
          {(['delhi', 'jaipur', 'agra'] as City[]).map((city) => (
            <motion.button
              key={city}
              type="button"
              onClick={() => selectCity(city)}
              className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium shadow-md backdrop-blur-md transition-all duration-300 cursor-pointer ${
                highlightedCity === city
                  ? 'bg-white/90 text-black border-2 border-black/20'
                  : 'bg-white/70 text-black/80 border border-white/40 hover:bg-white/85'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {city.charAt(0).toUpperCase() + city.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Navigation controls */}
        <div className="absolute inset-0 flex items-center justify-between px-2 md:px-4 pointer-events-none">
          <motion.button
            type="button"
            aria-label="Previous photo"
            className="group relative pointer-events-auto h-10 w-10 md:h-12 md:w-12 rounded-full border border-white/40 bg-white/20 backdrop-blur-xl text-white shadow-md transition flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 overflow-hidden cursor-pointer"
            onClick={() => goToPhoto(-1)}
            whileTap={{ scale: 0.92, backgroundColor: "rgba(255,255,255,0.35)" }}
            whileHover={{ scale: 1.05 }}
            onMouseMove={(e) => {
              const t = e.currentTarget as HTMLElement;
              const r = t.getBoundingClientRect();
              const x = e.clientX - r.left;
              const y = e.clientY - r.top;
              const g = t.querySelector('.btn-glow') as HTMLElement | null;
              if (g) { g.style.left = `${x}px`; g.style.top = `${y}px`; }
            }}
            onMouseLeave={(e) => {
              const g = (e.currentTarget as HTMLElement).querySelector('.btn-glow') as HTMLElement | null;
              if (g) g.style.opacity = '0';
            }}
          >
            <span className="btn-glow pointer-events-none absolute h-10 w-10 md:h-12 md:w-12 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-80 transition-opacity duration-200" style={{ background: "radial-gradient(24px 24px at center, rgba(255,255,255,0.25), rgba(255,255,255,0))" }} />
            <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <svg className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </motion.button>
          <motion.button
            type="button"
            aria-label="Next photo"
            className="group relative pointer-events-auto h-10 w-10 md:h-12 md:w-12 rounded-full border border-white/40 bg-white/20 backdrop-blur-xl text-white shadow-md transition flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 overflow-hidden cursor-pointer"
            onClick={() => goToPhoto(1)}
            whileTap={{ scale: 0.92, backgroundColor: "rgba(255,255,255,0.35)" }}
            whileHover={{ scale: 1.05 }}
            onMouseMove={(e) => {
              const t = e.currentTarget as HTMLElement;
              const r = t.getBoundingClientRect();
              const x = e.clientX - r.left;
              const y = e.clientY - r.top;
              const g = t.querySelector('.btn-glow') as HTMLElement | null;
              if (g) { g.style.left = `${x}px`; g.style.top = `${y}px`; }
            }}
            onMouseLeave={(e) => {
              const g = (e.currentTarget as HTMLElement).querySelector('.btn-glow') as HTMLElement | null;
              if (g) g.style.opacity = '0';
            }}
          >
            <span className="btn-glow pointer-events-none absolute h-10 w-10 md:h-12 md:w-12 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-80 transition-opacity duration-200" style={{ background: "radial-gradient(24px 24px at center, rgba(255,255,255,0.22), rgba(255,255,255,0))" }} />
            <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <svg className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { visibleSections, registerSection } = useSectionVisibility(0.3);
  const viewedSectionsRef = useRef<Set<string>>(new Set());
  
  // Track sections that have been viewed (first time only)
  useEffect(() => {
    visibleSections.forEach((sectionId) => {
      if (!viewedSectionsRef.current.has(sectionId)) {
        viewedSectionsRef.current.add(sectionId);
      }
    });
  }, [visibleSections]);
  
  const hasViewed = (sectionId: string) => viewedSectionsRef.current.has(sectionId);
  
  const isHeroVisible = hasViewed('hero') || visibleSections.has('hero');
  const isCarouselVisible = visibleSections.has('carousel');
  const isJourneyVisible = visibleSections.has('journey');
  const isCollageVisible = visibleSections.has('collage');
  const isFeaturesVisible = visibleSections.has('features');
  const isHowItWorksVisible = visibleSections.has('howitworks');
  const isCtaVisible = visibleSections.has('cta');

  return (
    <div className="relative w-full bg-white no-select-text">

      {/* HERO with background image */}
      <section ref={registerSection('hero')} className="relative min-h-screen">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop"
            alt="Mountain landscape"
            className="h-full w-full object-cover brightness-105 contrast-105 saturate-115"
          />
          {/* Darker, warmer gradient for better legibility without washing out */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/25 to-black/50" />
        </div>

      {/* Content Overlay */}
        <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-20 px-8 py-6 md:px-12 md:py-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={isHeroVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
              transition={hasViewed('hero') ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }}
              className="text-white drop-shadow"
            >
              <Link
                href="/"
                className="group relative inline-flex items-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent overflow-hidden cursor-pointer"
                onMouseEnter={(e) => {
                  const t = e.currentTarget as HTMLElement;
                  const text = t.querySelector(".logo-text") as HTMLElement | null;
                  if (text) {
                    const r = text.getBoundingClientRect();
                    const x = e.clientX - r.left;
                    const y = e.clientY - r.top;
                    text.style.setProperty("--mx", x + "px");
                    text.style.setProperty("--my", y + "px");
                  }
                }}
                onMouseMove={(e) => {
                  const t = e.currentTarget as HTMLElement;
                  const text = t.querySelector(".logo-text") as HTMLElement | null;
                  if (text) {
                    const r = text.getBoundingClientRect();
                    const x = e.clientX - r.left;
                    const y = e.clientY - r.top;
                    text.style.setProperty("--mx", x + "px");
                    text.style.setProperty("--my", y + "px");
                  }
                }}
                onMouseLeave={(e) => {
                  const text = (e.currentTarget as HTMLElement).querySelector(".logo-text") as HTMLElement | null;
                  if (text) {
                    text.style.setProperty("--mx", "-100px");
                    text.style.setProperty("--my", "-100px");
                  }
                }}
              >
                <h1 className="relative z-10 text-2xl font-semibold tracking-tight cursor-pointer select-none">
                  <span className="logo-text">Wander</span><span className="logo-text">AI</span>
                </h1>
              </Link>
            </motion.div>

            {/* Auth Buttons */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={isHeroVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={hasViewed('hero') ? { duration: 0 } : { duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-4"
            >
              <Link
                href="/login"
                className="group relative inline-flex h-12 items-center justify-center px-6 leading-none text-sm font-semibold text-white rounded-full border border-white/40 bg-white/10 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 hover:bg-white/15 cursor-pointer"
                onMouseEnter={(e) => {
                  const t = e.currentTarget as HTMLElement;
                  const r = t.getBoundingClientRect();
                  const x = e.clientX - r.left;
                  const y = e.clientY - r.top;
                  const g = t.querySelector(".btn-glow") as HTMLElement | null;
                  if (g) {
                    g.style.left = `${x}px`;
                    g.style.top = `${y}px`;
                    g.style.opacity = "1";
                  }
                }}
                onMouseMove={(e) => {
                  const t = e.currentTarget as HTMLElement;
                  const r = t.getBoundingClientRect();
                  const x = e.clientX - r.left;
                  const y = e.clientY - r.top;
                  const g = t.querySelector(".btn-glow") as HTMLElement | null;
                  if (g) {
                    g.style.left = `${x}px`;
                    g.style.top = `${y}px`;
                  }
                }}
                onMouseLeave={(e) => {
                  const g = (e.currentTarget as HTMLElement).querySelector(".btn-glow") as HTMLElement | null;
                  if (g) g.style.opacity = "0";
                }}
              >
                <span className="relative z-10">Login</span>
                <span className="btn-glow pointer-events-none absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-150" style={{ background: "radial-gradient(52px 52px at center, rgba(255,255,255,0.18), rgba(255,255,255,0))" }} />
                <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link
                href="/signup"
                className="group relative inline-flex h-12 items-center justify-center px-6 leading-none text-sm font-semibold text-white rounded-full border border-white/40 bg-white/10 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 hover:bg-white/15 cursor-pointer"
                onMouseEnter={(e) => {
                  const t = e.currentTarget as HTMLElement;
                  const r = t.getBoundingClientRect();
                  const x = e.clientX - r.left;
                  const y = e.clientY - r.top;
                  const g = t.querySelector(".btn-glow") as HTMLElement | null;
                  if (g) {
                    g.style.left = `${x}px`;
                    g.style.top = `${y}px`;
                    g.style.opacity = "1";
                  }
                }}
                onMouseMove={(e) => {
                  const t = e.currentTarget as HTMLElement;
                  const r = t.getBoundingClientRect();
                  const x = e.clientX - r.left;
                  const y = e.clientY - r.top;
                  const g = t.querySelector(".btn-glow") as HTMLElement | null;
                  if (g) {
                    g.style.left = `${x}px`;
                    g.style.top = `${y}px`;
                  }
                }}
                onMouseLeave={(e) => {
                  const g = (e.currentTarget as HTMLElement).querySelector(".btn-glow") as HTMLElement | null;
                  if (g) g.style.opacity = "0";
                }}
              >
                <span className="relative z-10">Sign Up</span>
                <span className="btn-glow pointer-events-none absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-150" style={{ background: "radial-gradient(56px 56px at center, rgba(125,211,252,0.30), rgba(125,211,252,0))" }} />
                <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </motion.div>
          </div>
        </nav>

        {/* Hero Content - Centered */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isHeroVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={hasViewed('hero') ? { duration: 0 } : { duration: 0.9, ease: "easeOut", delay: 0.25 }}
          className="flex-1 flex items-center justify-center px-8 pt-24"
        >
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={isHeroVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={hasViewed('hero') ? { duration: 0 } : { duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
              className="liquid-text text-5xl md:text-7xl font-semibold mb-6 leading-tight tracking-tight drop-shadow"
            >
              Browse Travel Like
              <br />
              <span className="liquid-text-sub">You Browse the Web</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={isHeroVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
              transition={hasViewed('hero') ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
              className="liquid-subtle text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow"
            >
              Discover, remix, and personalize travel content from creators into
              interactive itineraries pinned on a map. Your all-in-one travel
              browser.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={hasViewed('hero') ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/signup"
                className="group relative inline-grid place-items-center h-14 md:h-14 px-10 font-semibold text-white rounded-full border border-white/40 bg-white/10 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 hover:bg-white/15 cursor-pointer"
                onMouseEnter={(e) => {
                  const t = e.currentTarget as HTMLElement;
                  const r = t.getBoundingClientRect();
                  const x = e.clientX - r.left;
                  const y = e.clientY - r.top;
                  const g = t.querySelector(".btn-glow") as HTMLElement | null;
                  if (g) {
                    g.style.left = `${x}px`;
                    g.style.top = `${y}px`;
                    g.style.opacity = "1";
                  }
                }}
                onMouseMove={(e) => {
                  const t = e.currentTarget as HTMLElement;
                  const r = t.getBoundingClientRect();
                  const x = e.clientX - r.left;
                  const y = e.clientY - r.top;
                  const g = t.querySelector(".btn-glow") as HTMLElement | null;
                  if (g) {
                    g.style.left = `${x}px`;
                    g.style.top = `${y}px`;
                  }
                }}
                onMouseLeave={(e) => {
                  const g = (e.currentTarget as HTMLElement).querySelector(".btn-glow") as HTMLElement | null;
                  if (g) g.style.opacity = "0";
                }}
              >
                <span className="relative z-10">Start Exploring</span>
                <span className="btn-glow pointer-events-none absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-150" style={{ background: "radial-gradient(64px 64px at center, rgba(253,230,138,0.20), rgba(253,230,138,0))" }} />
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-200/0 via-amber-200/25 to-amber-200/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="pointer-events-none absolute -inset-6 rounded-[999px] bg-amber-400/10 blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
              </Link>
              <Link
                href="/explore"
                className="group relative inline-grid place-items-center h-14 md:h-14 px-10 font-semibold text-white rounded-full border border-white/50 bg-white/5 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 hover:bg-white/10 cursor-pointer"
                onMouseEnter={(e) => {
                  const t = e.currentTarget as HTMLElement;
                  const r = t.getBoundingClientRect();
                  const x = e.clientX - r.left;
                  const y = e.clientY - r.top;
                  const g = t.querySelector(".btn-glow") as HTMLElement | null;
                  if (g) {
                    g.style.left = `${x}px`;
                    g.style.top = `${y}px`;
                    g.style.opacity = "1";
                  }
                }}
                onMouseMove={(e) => {
                  const t = e.currentTarget as HTMLElement;
                  const r = t.getBoundingClientRect();
                  const x = e.clientX - r.left;
                  const y = e.clientY - r.top;
                  const g = t.querySelector(".btn-glow") as HTMLElement | null;
                  if (g) {
                    g.style.left = `${x}px`;
                    g.style.top = `${y}px`;
                  }
                }}
                onMouseLeave={(e) => {
                  const g = (e.currentTarget as HTMLElement).querySelector(".btn-glow") as HTMLElement | null;
                  if (g) g.style.opacity = "0";
                }}
              >
                <span className="relative z-10">See How It Works</span>
                <span className="btn-glow pointer-events-none absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-150" style={{ background: "radial-gradient(64px 64px at center, rgba(255,255,255,0.22), rgba(255,255,255,0))" }} />
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="pointer-events-none absolute -inset-6 rounded-[999px] bg-white/10 blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator - restored */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isHeroVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={hasViewed('hero') ? { duration: 0 } : { duration: 0.6, ease: "easeOut", delay: 0.9 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="flex flex-col items-center gap-2 text-white/80">
            <div className="relative h-6">
              <motion.span
                className="absolute inset-0 flex items-center justify-center text-sm font-medium whitespace-nowrap leading-none"
                animate={isHeroVisible ? { y: [0, 4, 0], opacity: [0, 1, 0] } : { y: 0, opacity: 0 }}
                transition={{ duration: 1.6, ease: "easeInOut", repeat: isHeroVisible ? Infinity : 0, delay: 0 }}
                style={{ willChange: "transform, opacity" }}
              >
                Scroll to explore
              </motion.span>
              <motion.span
                className="absolute inset-0 flex items-center justify-center text-sm font-medium whitespace-nowrap leading-none"
                animate={isHeroVisible ? { y: [0, 4, 0], opacity: [0, 1, 0] } : { y: 0, opacity: 0 }}
                transition={{ duration: 1.6, ease: "easeInOut", repeat: isHeroVisible ? Infinity : 0, delay: 0.2 }}
                style={{ willChange: "transform, opacity" }}
              >
                Scroll to explore
              </motion.span>
              <motion.span
                className="absolute inset-0 flex items-center justify-center text-sm font-medium whitespace-nowrap leading-none"
                animate={isHeroVisible ? { y: [0, 4, 0], opacity: [0, 1, 0] } : { y: 0, opacity: 0 }}
                transition={{ duration: 1.6, ease: "easeInOut", repeat: isHeroVisible ? Infinity : 0, delay: 0.4 }}
                style={{ willChange: "transform, opacity" }}
              >
                Scroll to explore
              </motion.span>
            </div>
            <div className="relative h-5 w-5">
              <motion.svg
                className="absolute inset-0 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={isHeroVisible ? { y: [0, 4, 0], opacity: [0, 1, 0] } : { y: 0, opacity: 0 }}
                transition={{ duration: 1.6, ease: "easeInOut", repeat: isHeroVisible ? Infinity : 0, delay: 0 }}
                style={{ willChange: "transform, opacity" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </motion.svg>
              <motion.svg
                className="absolute inset-0 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={isHeroVisible ? { y: [0, 4, 0], opacity: [0, 1, 0] } : { y: 0, opacity: 0 }}
                transition={{ duration: 1.6, ease: "easeInOut", repeat: isHeroVisible ? Infinity : 0, delay: 0.2 }}
                style={{ willChange: "transform, opacity" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </motion.svg>
              <motion.svg
                className="absolute inset-0 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
                animate={isHeroVisible ? { y: [0, 4, 0], opacity: [0, 1, 0] } : { y: 0, opacity: 0 }}
                transition={{ duration: 1.6, ease: "easeInOut", repeat: isHeroVisible ? Infinity : 0, delay: 0.4 }}
                style={{ willChange: "transform, opacity" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </motion.svg>
            </div>
          </div>
        </motion.div>

        
        </div>

      </section>

      {/* Collage Section - Indian Landscapes with auto-scroll and controls */}
      <section ref={registerSection('carousel')} className="relative px-6 md:px-12 lg:px-20 py-16 md:py-24 bg-transparent overflow-hidden">
        {/* Subtle lively ambient wallpaper behind content */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 section-ambient" 
          style={{
            animationPlayState: isCarouselVisible ? 'running' : 'paused'
          }}
        />
        {/* Optional soft scrim to keep content readable */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-white/20" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-8 md:mb-12 text-center">
            <h2 className="text-3xl md:text-5xl font-semibold text-black/90">Explore India, one scroll at a time</h2>
            <p className="mt-3 text-black/60 text-lg md:text-xl font-medium">Discover breathtaking destinations, curated by travelers, for travelers. Your next adventure starts here.</p>
          </div>

          <div className="mb-8">
            <GlassCarousel paused={!isCarouselVisible} />
          </div>
        </div>
      </section>

      {/* Interactive Journey Preview */}
      <section ref={registerSection('journey')} className="relative px-6 md:px-12 lg:px-20 py-16 md:py-24 bg-transparent overflow-hidden">
        {/* Ambient background */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 journey-ambient" 
          style={{
            animationPlayState: isJourneyVisible ? 'running' : 'paused'
          }}
        />
        <div className="pointer-events-none absolute inset-0 z-0 bg-white/15" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-8 md:mb-12 text-center">
            <h2 className="text-3xl md:text-5xl font-semibold text-black/90">Preview a real journey</h2>
            <p className="mt-3 text-black/60">See a creator's route, follow it, earn coins as you complete checkpoints.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Interactive Carousel with City Selection */}
            <InteractiveJourneyCarousel isVisible={isJourneyVisible} />

            {/* Journey details + CTA */}
            <div className="flex flex-col justify-between rounded-3xl border border-white/40 bg-white/40 backdrop-blur-2xl p-6 md:p-8 shadow-[0_8px_32px_rgba(31,38,135,0.22)]">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&q=60" alt="Creator avatar" className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="text-black font-semibold">@the.city.nomad</p>
                    <p className="text-black/60 text-sm">Cultural + Food | 7-day Golden Triangle</p>
                  </div>
                </div>

                <p className="text-black/80 leading-relaxed mb-4">
                  Follow this 7-day route through Delhi, Jaipur, and Agra. Save spots, get timings, and navigate with ease.
                </p>

                <ul className="text-black/70 text-sm space-y-2 mb-6">
                  <li>• 24 curated stops with hours and best times</li>
                  <li>• Offline-friendly notes and checklists</li>
                  <li>• Earn coins for each checkpoint completed</li>
                </ul>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href="#follow"
                  className="group relative inline-grid place-items-center h-12 px-8 font-semibold text-black rounded-full border border-white/60 bg-white/90 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 hover:bg-white cursor-pointer"
                  onMouseMove={(e) => {
                    const t = e.currentTarget as HTMLElement;
                    const r = t.getBoundingClientRect();
                    const x = e.clientX - r.left;
                    const y = e.clientY - r.top;
                    const g = t.querySelector('.btn-glow') as HTMLElement | null;
                    if (g) { g.style.left = `${x}px`; g.style.top = `${y}px`; }
                  }}
                  onMouseLeave={(e) => {
                    const g = (e.currentTarget as HTMLElement).querySelector('.btn-glow') as HTMLElement | null;
                    if (g) g.style.opacity = '0';
                  }}
                >
                  <span className="relative z-10">Follow journey</span>
                  <span className="btn-glow pointer-events-none absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-80 transition-opacity duration-200" style={{ background: "radial-gradient(64px 64px at center, rgba(186,230,253,0.26), rgba(186,230,253,0))" }} />
                </a>

                <div className="flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-4 h-12 backdrop-blur-md">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black text-white text-xs">◎</span>
                  <span className="text-black font-medium">Earn up to 300 coins</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creators Collage Section */}
      <section ref={registerSection('collage')} className="relative px-6 md:px-12 lg:px-20 py-16 md:py-24 overflow-hidden">
        {/* Aesthetic static background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-gray-50 via-white to-gray-50">
          {/* Subtle pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(0,0,0) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          />
          {/* Soft color accents */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-transparent to-blue-50/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-8 md:mb-12 text-center">
            <h2 className="text-3xl md:text-5xl font-semibold text-black/90">Join Our Creator Community</h2>
            <p className="mt-3 text-black/60">Meet the travel influencers sharing their journeys with WanderAI</p>
          </div>

          {/* Single row scrolling collage */}
          <CreatorCollage isVisible={isCollageVisible} />
        </div>
      </section>

        {/* Feature Section */}
        <section ref={registerSection('features')} className="relative px-6 md:px-12 lg:px-20 py-20 md:py-32 overflow-hidden">
          {/* Ambient background */}
          <div className="pointer-events-none absolute inset-0 z-0 section-ambient" 
            style={{
              animationPlayState: visibleSections.has('features') ? 'running' : 'paused'
            }}
          />
          <div className="pointer-events-none absolute inset-0 z-0 bg-white/30" />

          <div className="relative z-10 max-w-6xl mx-auto">
            <motion.div
              initial={false}
              animate={hasViewed('features') || visibleSections.has('features') ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={hasViewed('features') ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-semibold text-black/90 mb-4">Why WanderAI</h2>
              <p className="text-lg text-black/60 max-w-2xl mx-auto">Curate trips from real creator content, remix with AI, and take it on the road.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  number: 1,
                  title: "Capture & Organize",
                  description: "Save posts, videos, and links. We extract places, hours, and price automatically.",
                  icon: "📸"
                },
                {
                  number: 2,
                  title: "Remix with AI",
                  description: "Generate day-by-day itineraries that match your vibe, budget, and time.",
                  icon: "✨"
                },
                {
                  number: 3,
                  title: "Map & Go",
                  description: "Everything is pinned on a live map with offline-friendly notes and checklists.",
                  icon: "🗺️"
                }
              ].map((feature, idx) => (
                <motion.div
                  key={feature.number}
                  initial={false}
                  animate={hasViewed('features') || visibleSections.has('features') ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{
                    opacity: hasViewed('features') ? { duration: 0 } : { 
                      duration: 0.6, 
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.2 + idx * 0.15
                    },
                    y: { 
                      duration: 0.75, 
                      ease: [0.4, 0, 0.2, 1] 
                    },
                    scale: { 
                      duration: 0.75, 
                      ease: [0.4, 0, 0.2, 1] 
                    }
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -8,
                    transition: { 
                      duration: 0.4, 
                      ease: [0.4, 0, 0.2, 1]
                    }
                  }}
                  className="group relative"
                >
                  <div className="relative h-full p-8 rounded-3xl border border-white/40 bg-white/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(31,38,135,0.15)] overflow-hidden transition-all duration-500 hover:shadow-[0_12px_48px_rgba(31,38,135,0.25)] hover:bg-white/50">
                    {/* Glass gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="absolute inset-0 ring-1 ring-white/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    {/* Glow effect on hover */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-amber-200/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none" />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Number badge with glass effect */}
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="relative mb-6 inline-flex"
                      >
                        <div className="relative w-14 h-14 rounded-2xl border border-white/50 bg-white/60 backdrop-blur-md shadow-lg flex items-center justify-center overflow-hidden">
                          {/* Glass shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
                          <span className="relative text-2xl font-bold text-black/90">{feature.number}</span>
                          {/* Hover glow */}
                          <div className="absolute inset-0 bg-white/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm pointer-events-none" />
              </div>
                      </motion.div>

                      <h3 className="text-xl md:text-2xl font-semibold mb-3 text-black/90 group-hover:text-black transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-black/70 leading-relaxed group-hover:text-black/80 transition-colors">
                        {feature.description}
                      </p>

                      {/* Decorative icon */}
                      <motion.div
                        initial={false}
                        animate={hasViewed('features') || visibleSections.has('features') ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                        transition={hasViewed('features') ? { duration: 0 } : { 
                          duration: 0.6, 
                          delay: 0.4 + idx * 0.15,
                          type: "spring",
                          stiffness: 200,
                          damping: 15
                        }}
                        className="absolute bottom-4 right-4 text-4xl opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                      >
                        {feature.icon}
                      </motion.div>
              </div>
              </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section ref={registerSection('howitworks')} className="relative px-6 md:px-12 lg:px-20 py-20 md:py-32 overflow-hidden">
          {/* Ambient background */}
          <div className="pointer-events-none absolute inset-0 z-0 section-ambient" 
            style={{
              animationPlayState: visibleSections.has('howitworks') ? 'running' : 'paused'
            }}
          />
          <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-gray-50/50 via-white/30 to-white/50" />

          <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={false}
              animate={hasViewed('howitworks') || visibleSections.has('howitworks') ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={hasViewed('howitworks') ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.h2 
                initial={false}
                animate={hasViewed('howitworks') || visibleSections.has('howitworks') ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={hasViewed('howitworks') ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
                className="text-3xl md:text-5xl font-semibold text-black/90 mb-4"
              >
                Plan smarter, travel lighter
              </motion.h2>
              <motion.p 
                initial={false}
                animate={hasViewed('howitworks') || visibleSections.has('howitworks') ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={hasViewed('howitworks') ? { duration: 0 } : { duration: 0.6, delay: 0.3 }}
                className="text-lg text-black/60 mb-8"
              >
                Turn inspiration into action. WanderAI brings research, planning, and navigation into one simple workspace.
              </motion.p>
              <div className="flex flex-col gap-4 mb-8">
                {[
                  { feature: "One-click import", desc: "from links, PDFs, and social posts." },
                  { feature: "Smart dedupe", desc: "to merge overlapping recs and avoid repeats." },
                  { feature: "Live maps", desc: "with hours, distances, and best times to go." }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={false}
                    animate={hasViewed('howitworks') || visibleSections.has('howitworks') ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={hasViewed('howitworks') ? { duration: 0 } : { 
                      opacity: { duration: 0.5, delay: 0.4 + idx * 0.1 },
                      x: { duration: 0.1, ease: [0.4, 0, 0.2, 1] }
                    }}
                    whileHover={{ 
                      x: 8,
                      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
                    }}
                    className="group flex items-start gap-4 p-4 rounded-2xl border border-white/40 bg-white/30 backdrop-blur-xl transition-all duration-150 ease-out hover:bg-white/40 hover:border-white/60"
                  >
                    <motion.div
                      initial={{ scale: 1, rotate: 0 }}
                      whileHover={{ 
                        scale: 1.2, 
                        rotate: 180,
                        transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
                      }}
                      transition={{ scale: { duration: 0.15 }, rotate: { duration: 0.15 } }}
                      className="relative mt-0.5 w-6 h-6 rounded-full border-2 border-white/60 bg-white/60 backdrop-blur-md shadow-lg flex items-center justify-center flex-shrink-0 cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent rounded-full" />
                      <motion.div 
                        className="relative w-3 h-3 rounded-full"
                        animate={{ 
                          backgroundColor: "rgba(0, 0, 0, 0.8)"
                        }}
                        whileHover={{ 
                          backgroundColor: "rgba(0, 0, 0, 1)",
                          transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
                        }}
                        transition={{ backgroundColor: { duration: 0.15 } }}
                      />
                    </motion.div>
                    <p className="text-black/80 leading-relaxed pt-0.5 cursor-pointer">
                      <span className="font-semibold text-black">{item.feature}</span> {item.desc}
                    </p>
                  </motion.div>
                ))}
                </div>
              <motion.div 
                initial={false}
                animate={hasViewed('howitworks') || visibleSections.has('howitworks') ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={hasViewed('howitworks') ? { duration: 0 } : { duration: 0.6, delay: 0.7 }}
                className="flex flex-wrap gap-4"
              >
                <motion.div
                  initial={false}
                  animate={hasViewed('howitworks') || visibleSections.has('howitworks') ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={hasViewed('howitworks') ? { duration: 0 } : { duration: 0.5, delay: 0.8 }}
                >
                  <Link 
                    href="/signup" 
                    className="group relative inline-flex items-center px-8 py-4 font-semibold text-black rounded-full border-2 border-white/50 bg-white/40 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 hover:bg-white/60 hover:border-white/70 cursor-pointer"
                    onMouseEnter={(e) => {
                      const t = e.currentTarget as HTMLElement;
                      const r = t.getBoundingClientRect();
                      const x = e.clientX - r.left;
                      const y = e.clientY - r.top;
                      const g = t.querySelector(".btn-glow") as HTMLElement | null;
                      if (g) {
                        g.style.left = `${x}px`;
                        g.style.top = `${y}px`;
                        g.style.opacity = "1";
                      }
                    }}
                    onMouseMove={(e) => {
                      const t = e.currentTarget as HTMLElement;
                      const r = t.getBoundingClientRect();
                      const x = e.clientX - r.left;
                      const y = e.clientY - r.top;
                      const g = t.querySelector(".btn-glow") as HTMLElement | null;
                      if (g) {
                        g.style.left = `${x}px`;
                        g.style.top = `${y}px`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      const g = (e.currentTarget as HTMLElement).querySelector(".btn-glow") as HTMLElement | null;
                      if (g) g.style.opacity = "0";
                    }}
                  >
                    <span className="relative z-10">Create your first trip</span>
                    <span className="btn-glow pointer-events-none absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-150" style={{ background: "radial-gradient(64px 64px at center, rgba(0,0,0,0.1), rgba(0,0,0,0))" }} />
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-black/0 via-black/10 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="pointer-events-none absolute -inset-6 rounded-[999px] bg-black/10 blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                  </Link>
                </motion.div>
                <motion.div
                  initial={false}
                  animate={hasViewed('howitworks') || visibleSections.has('howitworks') ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={hasViewed('howitworks') ? { duration: 0 } : { duration: 0.5, delay: 0.9 }}
                >
                  <Link 
                    href="/explore" 
                    className="group relative inline-flex items-center px-8 py-4 font-semibold text-black rounded-full border-2 border-white/50 bg-white/40 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 hover:bg-white/60 hover:border-white/70 cursor-pointer"
                    onMouseEnter={(e) => {
                      const t = e.currentTarget as HTMLElement;
                      const r = t.getBoundingClientRect();
                      const x = e.clientX - r.left;
                      const y = e.clientY - r.top;
                      const g = t.querySelector(".btn-glow") as HTMLElement | null;
                      if (g) {
                        g.style.left = `${x}px`;
                        g.style.top = `${y}px`;
                        g.style.opacity = "1";
                      }
                    }}
                    onMouseMove={(e) => {
                      const t = e.currentTarget as HTMLElement;
                      const r = t.getBoundingClientRect();
                      const x = e.clientX - r.left;
                      const y = e.clientY - r.top;
                      const g = t.querySelector(".btn-glow") as HTMLElement | null;
                      if (g) {
                        g.style.left = `${x}px`;
                        g.style.top = `${y}px`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      const g = (e.currentTarget as HTMLElement).querySelector(".btn-glow") as HTMLElement | null;
                      if (g) g.style.opacity = "0";
                    }}
                  >
                    <span className="relative z-10">Explore examples</span>
                    <span className="btn-glow pointer-events-none absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-150" style={{ background: "radial-gradient(64px 64px at center, rgba(0,0,0,0.1), rgba(0,0,0,0))" }} />
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-black/0 via-black/10 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="pointer-events-none absolute -inset-6 rounded-[999px] bg-black/10 blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div
              initial={false}
              animate={hasViewed('howitworks') || visibleSections.has('howitworks') ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={hasViewed('howitworks') ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              className="relative w-full h-72 md:h-96 rounded-3xl border border-white/40 bg-white/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(31,38,135,0.15)] overflow-hidden group"
            >
              {/* Glass gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10" />
              <div className="absolute inset-0 ring-1 ring-white/50 rounded-3xl" />
              {/* Placeholder content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={false}
                  animate={hasViewed('howitworks') || visibleSections.has('howitworks') ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0.5 }}
                  transition={hasViewed('howitworks') ? { duration: 0 } : { duration: 0.6, delay: 0.5 }}
                  className="text-black/40 text-lg font-medium group-hover:text-black/60 transition-colors"
                >
                  App preview
                </motion.div>
                </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section ref={registerSection('cta')} className="relative px-6 md:px-12 lg:px-20 py-20 md:py-32 overflow-hidden">
          {/* Ambient background */}
          <div className="pointer-events-none absolute inset-0 z-0 section-ambient" 
            style={{
              animationPlayState: visibleSections.has('cta') ? 'running' : 'paused'
            }}
          />
          <div className="pointer-events-none absolute inset-0 z-0 bg-white/40" />

          <div className="relative z-10 max-w-5xl mx-auto">
            <motion.div
              initial={false}
              animate={hasViewed('cta') || visibleSections.has('cta') ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={hasViewed('cta') ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <motion.h2 
                initial={false}
                animate={hasViewed('cta') || visibleSections.has('cta') ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={hasViewed('cta') ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
                className="text-3xl md:text-5xl font-semibold text-black/90 mb-6"
              >
                Ready to browse travel like the web?
              </motion.h2>
              <motion.p 
                initial={false}
                animate={hasViewed('cta') || visibleSections.has('cta') ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={hasViewed('cta') ? { duration: 0 } : { duration: 0.6, delay: 0.3 }}
                className="text-lg md:text-xl text-black/60 mb-12 max-w-2xl mx-auto"
              >
                Join travelers turning inspiration into real trips in minutes.
              </motion.p>
              <motion.div
                initial={false}
                animate={hasViewed('cta') || visibleSections.has('cta') ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={hasViewed('cta') ? { duration: 0 } : { duration: 0.6, delay: 0.5 }}
              >
                <Link 
                  href="/signup" 
                  className="group relative inline-flex items-center px-10 py-5 font-semibold text-black rounded-full border-2 border-white/50 bg-white/40 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300 hover:bg-white/60 hover:border-white/70 cursor-pointer"
                  onMouseEnter={(e) => {
                    const t = e.currentTarget as HTMLElement;
                    const r = t.getBoundingClientRect();
                    const x = e.clientX - r.left;
                    const y = e.clientY - r.top;
                    const g = t.querySelector(".btn-glow") as HTMLElement | null;
                    if (g) {
                      g.style.left = `${x}px`;
                      g.style.top = `${y}px`;
                      g.style.opacity = "1";
                    }
                  }}
                  onMouseMove={(e) => {
                    const t = e.currentTarget as HTMLElement;
                    const r = t.getBoundingClientRect();
                    const x = e.clientX - r.left;
                    const y = e.clientY - r.top;
                    const g = t.querySelector(".btn-glow") as HTMLElement | null;
                    if (g) {
                      g.style.left = `${x}px`;
                      g.style.top = `${y}px`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    const g = (e.currentTarget as HTMLElement).querySelector(".btn-glow") as HTMLElement | null;
                    if (g) g.style.opacity = "0";
                  }}
                >
                  <span className="relative z-10 text-lg">Start planning your journey →</span>
                  <span className="btn-glow pointer-events-none absolute h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-150" style={{ background: "radial-gradient(80px 80px at center, rgba(0,0,0,0.1), rgba(0,0,0,0))" }} />
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-black/0 via-black/10 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="pointer-events-none absolute -inset-8 rounded-[999px] bg-black/10 blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-500" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 md:px-12 lg:px-20 py-10 border-t border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-black font-semibold">Wander<span className="text-gray-600">AI</span></div>
            <div className="text-sm text-gray-600">© {new Date().getFullYear()} WanderAI. All rights reserved.</div>
          </div>
        </footer>
    </div>
  );
}
