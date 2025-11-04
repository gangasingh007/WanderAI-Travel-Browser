"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/sidebar/Sidebar";
import { createClient } from "@/lib/supabase/client";

type Suggestion = {
  id: string | number;
  name: string;
  location?: string | null;
  type?: string | null; // stay, cab, guide, cafe, etc.
  price?: number | null;
  rating?: number | null;
  image_url?: string | null;
};

type Review = {
  id: string | number;
  user_name?: string | null;
  stay_name?: string | null;
  rating?: number | null;
  content?: string | null;
};

export default function MarketplacePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Search state
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);

  // Featured
  const [featured, setFeatured] = useState<Suggestion[]>([]);
  const featuredScrollRef = useRef<HTMLDivElement | null>(null);

  // Partner form
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    stayName: "",
    location: "",
    contact: "",
    description: "",
    imageUrl: "",
    tagCreator: "",
  });

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);

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

  // Load featured stays (fallback to placeholder if none)
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("stays")
          .select("id,name:stay_name,location,rating,price,image_url,featured")
          .eq("featured", true)
          .limit(12);
        if (error) throw error;
        const mapped: Suggestion[] = (data || []).map((d: any) => ({
          id: d.id,
          name: d.name ?? d.stay_name ?? "Unknown Stay",
          location: d.location ?? null,
          rating: d.rating ?? null,
          price: d.price ?? null,
          image_url: d.image_url ?? null,
          type: "stay",
        }));
        if (mapped.length > 0) {
          setFeatured(mapped.slice(0, 8));
        } else {
          setFeatured([
            { id: 1, name: "Hillside Retreat", location: "Manali", rating: 4.7, price: 3200, image_url: "https://images.unsplash.com/photo-1696594935764-ba33fd73d012?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG90ZWxzJTIwYW5kJTIwc3RheXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600", type: "stay" },
            { id: 2, name: "Cityscape Loft", location: "Bengaluru", rating: 4.5, price: 4200, image_url: null, type: "stay" },
            { id: 3, name: "Beachfront Villa", location: "Goa", rating: 4.8, price: 7800, image_url: null, type: "stay" },
            { id: 4, name: "Backwater Cottage", location: "Alleppey", rating: 4.6, price: 3600, image_url: null, type: "stay" },
            { id: 5, name: "Desert Camp", location: "Jaisalmer", rating: 4.4, price: 2900, image_url: null, type: "stay" },
            { id: 6, name: "Tea Estate Bungalow", location: "Munnar", rating: 4.7, price: 5100, image_url: null, type: "stay" },
            { id: 7, name: "Lakeview Homestay", location: "Nainital", rating: 4.5, price: 2500, image_url: null, type: "stay" },
            { id: 8, name: "Cliffside Haven", location: "Varkala", rating: 4.6, price: 3400, image_url: null, type: "stay" },
          ]);
        }
      } catch (_e) {
        setFeatured([
          { id: 1, name: "Hillside Retreat", location: "Manali", rating: 4.7, price: 3200, image_url: "https://images.unsplash.com/photo-1696594935764-ba33fd73d012?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG90ZWxzJTIwYW5kJTIwc3RheXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600", type: "stay" },
          { id: 2, name: "Cityscape Loft", location: "Bengaluru", rating: 4.5, price: 4200, image_url: "https://images.unsplash.com/photo-1668169064105-9bb22b0fd30f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1151", type: "stay" },
          { id: 3, name: "Beachfront Villa", location: "Goa", rating: 4.8, price: 7800, image_url:"https://media.hostunusual.com/wp-content/uploads/2022/04/31153018/Backwater-dusk.jpg", type: "stay" },
          { id: 4, name: "Backwater Cottage", location: "Alleppey", rating: 4.6, price: 3600, image_url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT80-mltyDuGTTt0sIkjyVVmabz6czsT0PFbA&s", type: "stay" },
          { id: 5, name: "Desert Camp", location: "Jaisalmer", rating: 4.4, price: 2900, image_url:"https://images.unsplash.com/photo-1676193361626-debc2960b1c4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687", type: "stay" },
          { id: 6, name: "Tea Estate Bungalow", location: "Munnar", rating: 4.7, price: 5100, image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEA3uWkUdCgI-x52_cBVGKRXN_Ak0U5F0Yzw&s", type: "stay" },
          { id: 7, name: "Lakeview Homestay", location: "Nainital", rating: 4.5, price: 2500, image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-auZg3YLGVELbSWyZ30mfoud1XMW-h4thLQ&s", type: "stay" },
          { id: 8, name: "Cliffside Haven", location: "Varkala", rating: 4.6, price: 3400, image_url:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRvn3LkR6HnLUQYhvZthVwKd-IVcAR1KAF1A&s", type: "stay" },
        ]);
      }
    })();
  }, [supabase]);

  // Load community reviews (top-rated)
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("reviews")
          .select("id,user_name,stay_name,rating,content")
          .order("rating", { ascending: false })
          .limit(6);
        if (error) throw error;
        setReviews((data as Review[]) || []);
      } catch (_e) {
        setReviews([
          { id: "r1", user_name: "Aisha", stay_name: "Hillside Retreat", rating: 5, content: "Beautiful views and cozy rooms!" },
          { id: "r2", user_name: "Rohit", stay_name: "Cityscape Loft", rating: 4, content: "Great location for work trips." },
        ]);
      }
    })();
  }, [supabase]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current);
    if (!query) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        // Search across stays, cabs, guides, cafes if available
        const searches = await Promise.allSettled([
          (supabase as any)
            .from("stays")
            .select("id,stay_name,location,rating,price,image_url")
            .ilike("stay_name", `%${query}%`)
            .limit(5),
          (supabase as any)
            .from("services")
            .select("id,name,location,category,price,image_url,rating")
            .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
            .limit(5),
        ]);

        const collected: Suggestion[] = [];
        searches.forEach((res) => {
          if (res.status === "fulfilled" && res.value && !res.value.error) {
            (res.value.data || []).forEach((d: any) => {
              collected.push({
                id: d.id,
                name: d.stay_name ?? d.name ?? "",
                location: d.location ?? null,
                rating: d.rating ?? null,
                price: d.price ?? null,
                image_url: d.image_url ?? null,
                type: d.category ?? (d.stay_name ? "stay" : null),
              });
            });
          }
        });
        setSuggestions(collected);
        setSuggestionsOpen(true);
      } catch (_e) {
        setSuggestions([]);
        setSuggestionsOpen(false);
      }
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const submitPartnerForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);
    try {
      const payload = {
        stay_name: form.stayName,
        location: form.location,
        contact_info: form.contact,
        description: form.description,
        image_url: form.imageUrl || null,
        submitted_by: user?.id ?? null,
        status: "PENDING",
        tagged_creator: form.tagCreator || null,
      };
      const { error } = await (supabase as any)
        .from("stays_submissions")
        .insert(payload);
      if (error) throw error;
      setSubmitSuccess("Submitted! We'll review and get back to you.");
      setForm({ stayName: "", location: "", contact: "", description: "", imageUrl: "", tagCreator: "" });
    } catch (err: any) {
      setSubmitError(err?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollFeatured = (dir: "left" | "right") => {
    const el = featuredScrollRef.current;
    if (!el) return;
    const amount = 360; // px per scroll
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
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
      <main className="flex-1 px-8 py-6 overflow-x-hidden">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-black">Marketplace</h1>
        </div>

        {/* Header / Search Section */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="relative mb-8">
          <div className="relative w-full overflow-hidden">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
              placeholder="Search for stays, cabs, or experiences..."
              className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-[15px] shadow-sm focus:outline-none focus:ring-2 focus:ring-black/80 text-black"
            />
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
            </svg>
          </div>
          <AnimatePresence>
            {suggestionsOpen && suggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden"
              >
                {suggestions.map((s, i) => (
                  <li key={`${s.type ?? "item"}-${s.id}`} className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={(s.image_url && s.image_url.length > 5)
                          ? s.image_url
                          : `https://source.unsplash.com/80x80/?${encodeURIComponent(s.type || 'travel')},hotel,stay&sig=${i}`}
                        alt={s.name}
                        className="h-10 w-10 rounded-md object-cover flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-black truncate">{s.name}</div>
                        <div className="text-xs text-gray-500 truncate">{[s.type, s.location].filter(Boolean).join(" • ")}</div>
                      </div>
                    </div>
                    {s.rating ? (
                      <div className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700">⭐ {s.rating.toFixed(1)}</div>
                    ) : null}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Featured Carousel Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black">Featured stays</h2>
            <div className="text-xs text-gray-500">API integrations coming soon: Goibibo, MakeMyTrip, Booking.com</div>
          </div>
          <div className="relative">
            <button aria-label="Scroll left" onClick={() => scrollFeatured("left")} className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-black">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button aria-label="Scroll right" onClick={() => scrollFeatured("right")} className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-black">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
            <div ref={featuredScrollRef} className="w-full overflow-x-auto scroll-smooth scrollbar-hide no-scrollbar px-4">
              <div className="flex gap-4">
              {featured.map((f, idx) => (
                <motion.div key={`${f.id}-${idx}`} whileHover={{ y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="min-w-[250px] rounded-xl border border-gray-200 bg-white flex-shrink-0">
                  {/* image (fallback to contextual random if missing) */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(f.image_url && typeof f.image_url === "string" && f.image_url.length > 5)
                      ? f.image_url
                      : `https://source.unsplash.com/800x400/?hotel,resort,stay&sig=${idx}`}
                    alt={f.name}
                    className="w-full h-40 object-cover rounded-xl"
                    loading="lazy"
                  />
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-gray-900 truncate mr-2">{f.name}</div>
                      {typeof f.price === "number" ? (
                        <div className="text-xs font-medium text-gray-700">₹{Math.round(f.price)}</div>
                      ) : null}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{f.location ?? "Unknown"}</div>
                    <div className="flex items-center gap-2 mt-2">
                      {typeof f.rating === "number" ? (<span className="text-xs bg-gray-100 px-2 py-1 rounded-md">⭐ {f.rating.toFixed(1)}</span>) : null}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button className="text-xs px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-black">View Details</button>
                      <button className="text-xs px-3 py-2 rounded-lg bg-black text-white hover:bg-black/90">Book Now</button>
                    </div>
                  </div>
                </motion.div>
              ))}
              </div>
            </div>
          </div>
        </section>

        {/* Cab Services Section */}
        <section className="mb-10">
          <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-black">Need a ride? Contact our partnered cab services</h3>
              <p className="text-sm text-gray-600">Reliable cabs for airport drops, city commutes, and sightseeing.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 text-black">View Partners</button>
              <button className="px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-black/90">Contact Cab Services</button>
            </div>
          </div>
        </section>

        {/* Community / Review Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black">Community Voices</h2>
            <button className="px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 text-black" onClick={() => {
              if (!user) {
                router.push("/login");
                return;
              }
              // Simple demo: prompt then insert
              const content = window.prompt("Share your experience (short review)") || "";
              const ratingStr = window.prompt("Rating out of 5 (e.g., 4.5)") || "";
              const rating = parseFloat(ratingStr);
              if (!content || Number.isNaN(rating)) return;
              (async () => {
                try {
                  const { error } = await (supabase as any)
                    .from("reviews")
                    .insert({
                      user_id: user.id,
                      user_name: user.email,
                      content,
                      rating,
                    });
                  if (error) throw error;
                  setReviews((r) => [{ id: Math.random().toString(36).slice(2), user_name: user.email, rating, content }, ...r].slice(0, 6));
                } catch (_e) {}
              })();
            }}>Write a Review</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="rounded-xl border border-gray-200 p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-black">{rev.user_name ?? "Traveler"}</div>
                  {typeof rev.rating === "number" ? (<div className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700">⭐ {rev.rating.toFixed(1)}</div>) : null}
                </div>
                <div className="text-xs text-gray-500 mt-1">{rev.stay_name ?? "Stay"}</div>
                <p className="text-sm text-gray-700 mt-2 line-clamp-4">{rev.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Partner Listing Section — List Your Stay (moved below reviews) */}
        <section className="mt-10 mb-10">
          <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
            <h2 className="text-lg font-semibold text-black mb-1">List Your Stay on WanderAI</h2>
            <p className="text-sm text-gray-600 mb-4">Get featured on the map and unlock creator-led visibility.</p>
            <form onSubmit={submitPartnerForm} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="text-xs text-gray-600">Stay Name</label>
                <input value={form.stayName} onChange={(e) => setForm((v) => ({ ...v, stayName: e.target.value }))} required className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/80 bg-white text-black" />
              </div>
              <div className="col-span-1">
                <label className="text-xs text-gray-600">Location</label>
                <input value={form.location} onChange={(e) => setForm((v) => ({ ...v, location: e.target.value }))} required className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/80 bg-white text-black" />
              </div>
              <div className="col-span-1">
                <label className="text-xs text-gray-600">Contact Info</label>
                <input value={form.contact} onChange={(e) => setForm((v) => ({ ...v, contact: e.target.value }))} required className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/80 bg-white text-black" />
              </div>
              <div className="col-span-1">
                <label className="text-xs text-gray-600">Image URL (optional)</label>
                <input value={form.imageUrl} onChange={(e) => setForm((v) => ({ ...v, imageUrl: e.target.value }))} placeholder="https://..." className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/80 bg-white text-black" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="text-xs text-gray-600">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} rows={3} required className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/80 bg-white text-black" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="text-xs text-gray-600">Tag Creator</label>
                <input value={form.tagCreator} onChange={(e) => setForm((v) => ({ ...v, tagCreator: e.target.value }))} placeholder="Creator username or ID" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/80 bg-white text-black" />
                <p className="text-[11px] text-gray-500 mt-1">Tagged creators earn coins automatically when your stay goes live.</p>
              </div>
              <div className="col-span-1 md:col-span-2 flex items-center gap-3">
                <button disabled={submitting} className="px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-black/90 disabled:opacity-60">{submitting ? "Submitting..." : "Submit"}</button>
                {submitSuccess ? <span className="text-sm text-green-600">{submitSuccess}</span> : null}
                {submitError ? <span className="text-sm text-red-600">{submitError}</span> : null}
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}


