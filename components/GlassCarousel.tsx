"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Slide = { src: string; alt: string };

const SLIDES: Slide[] = [
  { src: "https://images.unsplash.com/photo-1573398643956-2b9e6ade3456?auto=format&fit=crop&q=80&w=1280", alt: "Indian landscape 1" },
  { src: "https://plus.unsplash.com/premium_photo-1661919589683-f11880119fb7?auto=format&fit=crop&q=80&w=1280", alt: "Indian landscape 2" },
  { src: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=1280", alt: "Indian landscape 3" },
  { src: "https://images.unsplash.com/photo-1600402808924-9c591a6dace8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171", alt: "Indian landscape 4" },
  { src: "https://plus.unsplash.com/premium_photo-1697730426305-113c62434f97?auto=format&fit=crop&q=80&w=1280", alt: "Indian landscape 5" },
  { src: "https://images.unsplash.com/photo-1712388430474-ace0c16051e2?auto=format&fit=crop&q=80&w=1280", alt: "Indian landscape 6" },
];

function useAutoPlay(cb: () => void, ms: number, paused: boolean, resetToken: number) {
  const cbRef = useRef(cb);
  useEffect(() => { cbRef.current = cb; }, [cb]);
  useEffect(() => {
    if (paused) return;
    let id: number; let last = performance.now();
    const loop = (t: number) => {
      if (t - last >= ms) { last = t; cbRef.current(); }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [ms, paused, resetToken]);
}

export default function GlassCarousel({ paused = false }: { paused?: boolean }) {
  const [i, setI] = useState(0); // current (intended) index
  const [displayIndex, setDisplayIndex] = useState(0); // actually rendered image index
  const [stagedIndex, setStagedIndex] = useState<number|null>(null);
  const [stagedLoaded, setStagedLoaded] = useState(false);
  const [dir, setDir] = useState<1|-1>(1);
  // autoplay should not pause on hover
  const lockRef = useRef(false);
  const [resetToken, setResetToken] = useState(0);
  const loadedSrcsRef = useRef<Set<string>>(new Set());

  // Warm the browser cache with slide images on mount
  useEffect(() => {
    // Prefetch the first few aggressively, then the rest in idle time
    const prefetch = (urls: string[]) => {
      urls.forEach((url) => {
        const img = new window.Image();
        img.decoding = "async";
        img.loading = "eager" as any;
        img.referrerPolicy = "no-referrer";
        img.src = url;
      });
    };
    const firstBatch = SLIDES.slice(0, 3).map(s => s.src);
    const secondBatch = SLIDES.slice(3).map(s => s.src);
    prefetch(firstBatch);
    const idle = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 1));
    idle(() => prefetch(secondBatch));
  }, []);

  const startTransitionTo = useCallback((nextIndex: number) => {
    setI(nextIndex);
    const nextSrc = SLIDES[nextIndex].src;
    const doStage = () => {
      setStagedIndex(nextIndex);
      setStagedLoaded(true);
    };
    if (loadedSrcsRef.current.has(nextSrc)) {
      doStage();
    } else {
      setStagedLoaded(false);
      setStagedIndex(nextIndex);
      const img = new window.Image();
      img.decoding = "async";
      (img as any).fetchPriority = "high";
      img.onload = () => {
        loadedSrcsRef.current.add(nextSrc);
        setStagedLoaded(true);
      };
      img.src = nextSrc;
    }
  }, []);

  const next = useCallback(() => {
    setDir(1);
    const nextIndex = (i + 1) % SLIDES.length;
    startTransitionTo(nextIndex);
  }, [i, startTransitionTo]);

  useAutoPlay(next, 2600, paused, resetToken);

  const go = (d: 1|-1) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setDir(d);
    const nextIndex = (i + d + SLIDES.length) % SLIDES.length;
    startTransitionTo(nextIndex);
    // reset autoplay timer after interaction to keep cadence smooth
    setResetToken((t) => t + 1);
  };

  // swipe
  const startX = useRef<number|null>(null);
  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0]?.clientX ?? null; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? startX.current) - startX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    startX.current = null;
  };

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const active = SLIDES[displayIndex];

  return (
    <section
      className="relative"
      aria-roledescription="carousel"
      aria-label="India destinations"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Section-wide ambient backdrop with smooth crossfade */}
      <motion.div
        key={`section-bg-display-${SLIDES[displayIndex].src}`}
        className="absolute inset-0 -z-10 blur-3xl opacity-50 scale-110"
        style={{ backgroundImage: `url(${SLIDES[displayIndex].src})`, backgroundSize: "cover", backgroundPosition: "center" }}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: stagedIndex !== null && stagedLoaded ? 0 : 0.5 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      />
      {stagedIndex !== null && (
        <motion.div
          key={`section-bg-staged-${SLIDES[stagedIndex].src}`}
          className="absolute inset-0 -z-10 blur-3xl opacity-50 scale-110"
          style={{ backgroundImage: `url(${SLIDES[stagedIndex].src})`, backgroundSize: "cover", backgroundPosition: "center" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: stagedLoaded ? 0.5 : 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />
      )}

      <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/20 backdrop-blur-2xl shadow-[0_8px_32px_rgba(31,38,135,0.37)]">
        {/* Ambient backdrop inside with smooth crossfade */}
        <motion.div
          key={`bg-display-${SLIDES[displayIndex].src}`}
          className="absolute inset-0 z-0 blur-3xl opacity-50 scale-110"
          style={{ backgroundImage: `url(${SLIDES[displayIndex].src})`, backgroundSize: "cover", backgroundPosition: "center" }}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: stagedIndex !== null && stagedLoaded ? 0 : 0.5 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />
        {stagedIndex !== null && (
          <motion.div
            key={`bg-staged-${SLIDES[stagedIndex].src}`}
            className="absolute inset-0 z-0 blur-3xl opacity-50 scale-110"
            style={{ backgroundImage: `url(${SLIDES[stagedIndex].src})`, backgroundSize: "cover", backgroundPosition: "center" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: stagedLoaded ? 0.5 : 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          />
        )}
        <div className="relative aspect-[16/9] md:aspect-[21/9]">
          {/* Base image (currently displayed) */}
          <img
            key={`display-${SLIDES[displayIndex].src}`}
            src={SLIDES[displayIndex].src}
            alt={SLIDES[displayIndex].alt}
            loading={displayIndex === 0 ? "eager" : "lazy"}
            fetchPriority={displayIndex === 0 ? "high" : "auto"}
            decoding="async"
            className="absolute inset-0 z-10 h-full w-full object-cover will-change-transform"
          />
          {/* Staged overlay for seamless crossfade */}
          {stagedIndex !== null && (
            <motion.img
              key={`staged-${SLIDES[stagedIndex].src}`}
              src={SLIDES[stagedIndex].src}
              alt={SLIDES[stagedIndex].alt}
              className="absolute inset-0 z-10 h-full w-full object-cover will-change-transform"
              initial={{ opacity: 0, x: dir > 0 ? 20 : -20, scale: 1.01 }}
              animate={{ opacity: stagedLoaded ? 1 : 0, x: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={() => {
                if (stagedLoaded && stagedIndex !== null) {
                  setDisplayIndex(stagedIndex);
                  setStagedIndex(null);
                  setStagedLoaded(false);
                  setTimeout(() => { lockRef.current = false; }, 80);
                }
              }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-white/10 via-white/5 to-white/10" />
          <div className="pointer-events-none absolute inset-0 z-20 ring-1 ring-white/40 rounded-3xl" />
        </div>

        {/* controls (ensure above overlays) */}
        <div className="absolute inset-0 z-30 flex items-center justify-between px-2 md:px-4">
          <motion.button
            type="button"
            aria-label="Previous slide"
            className="group relative pointer-events-auto h-10 w-10 md:h-12 md:w-12 rounded-full border border-white/40 bg-white/20 backdrop-blur-xl text-white shadow-md transition flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 overflow-hidden cursor-pointer"
            onClick={() => go(-1)}
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
            aria-label="Next slide"
            className="group relative pointer-events-auto h-10 w-10 md:h-12 md:w-12 rounded-full border border-white/40 bg-white/20 backdrop-blur-xl text-white shadow-md transition flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 overflow-hidden cursor-pointer"
            onClick={() => go(1)}
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

        {/* dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 cursor-pointer ${idx === i ? "bg-white/90 shadow" : "bg-white/40 hover:bg-white/60"}`}
              onClick={() => { if (!lockRef.current) { setDir(idx > i ? 1 : -1); startTransitionTo(idx); setResetToken((t) => t + 1); } }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}


