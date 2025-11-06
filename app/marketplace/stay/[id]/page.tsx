"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getStayById } from "@/data/stays";

export default function StayDetailsPage() {
  const params = useParams();
  const id = (params as any)?.id as string;
  const stay = getStayById(id);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openAt = useCallback((idx: number) => {
    setActiveIndex(idx);
    setLightboxOpen(true);
  }, []);

  const close = useCallback(() => setLightboxOpen(false), []);
  const next = useCallback(() => setActiveIndex((i) => (stay ? (i + 1) % stay.images.length : i)), [stay]);
  const prev = useCallback(() => setActiveIndex((i) => (stay ? (i - 1 + stay.images.length) % stay.images.length : i)), [stay]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, close, next, prev]);

  if (!stay) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold mb-2">Stay not found</h1>
          <p className="text-gray-600 mb-4">This stay is not available yet. Please explore other featured stays.</p>
          <Link href="/marketplace" className="inline-block px-4 py-2 rounded-lg bg-black text-white hover:bg-black/90">Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Cover banner (top quarter section) */}
      <div className="relative w-full h-48 md:h-64 lg:h-72 overflow-hidden">
        <img src={stay.images[0]} alt={stay.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full flex items-end">
          <div className="max-w-6xl mx-auto w-full px-4 pb-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white">{stay.name}</h1>
            <div className="text-white/80 text-sm md:text-base">{stay.location}</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/marketplace" className="text-sm px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">← Back to Marketplace</Link>
          {typeof stay.rating === "number" ? (
            <div className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700">⭐ {stay.rating.toFixed(1)}</div>
          ) : null}
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 overflow-hidden rounded-2xl group relative">
            <button type="button" onClick={() => openAt(0)} className="block w-full">
              <img
                src={stay.images[0]}
                alt={stay.name}
                className="w-full h-[360px] md:h-[480px] object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          </div>
          <div className="grid grid-rows-2 gap-4">
            {stay.images.slice(1).map((src, idx) => (
              <div key={`img-${idx}`} className="overflow-hidden rounded-2xl group relative">
                <button type="button" onClick={() => openAt(idx + 1)} className="block w-full">
                  <img
                    src={src}
                    alt={`${stay.name} ${idx + 2}`}
                    className="w-full h-[178px] md:h-[232px] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Info + Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2">
            {stay.description ? (
              <p className="text-gray-700 leading-relaxed">{stay.description}</p>
            ) : null}
          </div>
          <aside className="rounded-2xl border border-gray-200 p-5 bg-gray-50 h-max">
            {stay.priceRange ? (
              <div className="mb-3">
                <div className="text-xs text-gray-500">Price Range</div>
                <div className="text-sm font-medium">{stay.priceRange}</div>
              </div>
            ) : null}

            {typeof stay.basePrice === "number" ? (
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold text-gray-900 bg-white ring-1 ring-gray-200 shadow-sm">
                    <span className="inline-block h-3 w-3 rounded-full bg-yellow-500/90 shadow-[0_0_0_2px_rgba(255,255,255,0.8)]" />
                    2000 Coins
                  </span>
                  {(() => {
                    const original = Math.round(stay.basePrice as number);
                    const minus = 200;
                    let discounted = Math.max(original - minus, 0);
                    discounted = Math.floor(discounted / 10) * 10 - 1;
                    if (discounted < 0) discounted = 0;
                    return (
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-gray-900">₹{discounted}</span>
                        <span className="text-xs text-gray-400 line-through">₹{original}</span>
                      </div>
                    );
                  })()}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Apply coins at checkout to unlock this price</div>
              </div>
            ) : null}
            {stay.email ? (
              <div className="mb-3">
                <div className="text-xs text-gray-500">Email</div>
                <div className="text-sm">{stay.email}</div>
              </div>
            ) : null}
            {stay.phone ? (
              <div className="mb-4">
                <div className="text-xs text-gray-500">Contact</div>
                <div className="text-sm">{stay.phone}</div>
              </div>
            ) : null}

            {Array.isArray(stay.externalLinks) && stay.externalLinks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stay.externalLinks.map((l) => (
                  <a
                    key={l.name}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-black text-white text-xs hover:bg-black/90"
                  >
                    {l.name}
                  </a>
                ))}
              </div>
            ) : null}
          </aside>
        </div>

        {/* Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-gray-200 p-5 bg-white">
            <h2 className="text-lg font-semibold mb-3">Creator Reviews</h2>
            <div className="space-y-3">
              {stay.creatorReviews.length === 0 ? (
                <div className="text-sm text-gray-600">No creator reviews yet.</div>
              ) : (
                stay.creatorReviews.map((r) => (
                  <div key={r.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{r.author}</div>
                      <div className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700">⭐ {r.rating.toFixed(1)}</div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{r.content}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 p-5 bg-white">
            <h2 className="text-lg font-semibold mb-3">Traveler Reviews</h2>
            <div className="space-y-3">
              {stay.userReviews.length === 0 ? (
                <div className="text-sm text-gray-600">No traveler reviews yet.</div>
              ) : (
                stay.userReviews.map((r) => (
                  <div key={r.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{r.author}</div>
                      <div className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700">⭐ {r.rating.toFixed(1)}</div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{r.content}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/80" onClick={close} />
          <div className="relative z-10 h-full flex items-center justify-center px-4">
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 text-white/90 hover:text-white text-2xl"
            >
              ×
            </button>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/90 hover:text-white text-3xl"
            >
              ‹
            </button>
            <img
              src={stay.images[activeIndex]}
              alt={`Image ${activeIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            />
            <button
              type="button"
              onClick={next}
              aria-label="Next"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/90 hover:text-white text-3xl"
            >
              ›
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}


