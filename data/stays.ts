export type StayDetails = {
  id: string | number;
  name: string;
  location: string;
  rating?: number | null;
  images: string[];
  basePrice?: number | null;
  priceRange?: string | null;
  email?: string | null;
  phone?: string | null;
  externalLinks?: { name: string; url: string }[];
  description?: string;
  creatorReviews: { id: string; author: string; rating: number; content: string }[];
  userReviews: { id: string; author: string; rating: number; content: string }[];
};

export const MOCK_STAYS: StayDetails[] = [
  {
    id: 1,
    name: "Hillside Retreat",
    location: "Manali, Himachal Pradesh",
    rating: 4.7,
    basePrice: 3200,
    images: [
      "https://images.unsplash.com/photo-1696594935764-ba33fd73d012?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1505691723518-36a5ac3b2d55?auto=format&fit=crop&q=80&w=1400",
    ],
    priceRange: "₹3,000 - ₹5,500 / night",
    email: "stay@hillsideretreat.example",
    phone: "+91 98765 43210",
    externalLinks: [
      { name: "MakeMyTrip", url: "https://www.makemytrip.com" },
      { name: "Goibibo", url: "https://www.goibibo.com" },
      { name: "Booking.com", url: "https://www.booking.com" },
    ],
    description:
      "Wake up to snow-capped peaks and pine-scented air. Perfect for a cozy workcation or a calm mountain escape.",
    creatorReviews: [
      { id: "c1", author: "@aisha_travels", rating: 5, content: "Insane sunrise views. Rooms are warm and modern." },
      { id: "c2", author: "@rohitexplores", rating: 4.5, content: "Great Wi‑Fi and food. Loved the bonfire nights." },
    ],
    userReviews: [
      { id: "u1", author: "Nikita", rating: 5, content: "Super clean and peaceful. Highly recommend." },
      { id: "u2", author: "Sahil", rating: 4.5, content: "Staff is friendly and helpful. Will return!" },
    ],
  },
  {
    id: 2,
    name: "Cityscape Loft",
    location: "Bengaluru, Karnataka",
    rating: 4.5,
    basePrice: 4200,
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=1400",
    ],
    priceRange: "₹4,000 - ₹7,000 / night",
    email: "loft@cityscape.example",
    phone: "+91 99887 66554",
    externalLinks: [
      { name: "MakeMyTrip", url: "https://www.makemytrip.com" },
      { name: "Goibibo", url: "https://www.goibibo.com" },
    ],
    description:
      "Minimal, sunlit loft in the heart of the city. Ideal for business travel and weekend explorations.",
    creatorReviews: [
      { id: "c3", author: "@devdutt", rating: 4, content: "Walkable to cafes and coworking. Sleek interiors." },
    ],
    userReviews: [
      { id: "u3", author: "Priya", rating: 4.5, content: "Comfortable and quiet. Great work desk." },
    ],
  },
  {
    id: 3,
    name: "Beachfront Villa",
    location: "Goa",
    rating: 4.8,
    basePrice: 7800,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1519822472231-2a9a2a43a08a?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1400",
    ],
    priceRange: "₹7,000 - ₹12,000 / night",
    email: "villa@beachfront.example",
    phone: "+91 98111 22233",
    externalLinks: [
      { name: "Booking.com", url: "https://www.booking.com" },
    ],
    description:
      "Tropical, airy villa steps away from the ocean. Private deck and hammock vibes.",
    creatorReviews: [],
    userReviews: [
      { id: "u4", author: "Mehul", rating: 5, content: "Beach at your doorstep. Magical sunsets." },
    ],
  },
  {
    id: 4,
    name: "Backwater Cottage",
    location: "Alleppey, Kerala",
    rating: 4.6,
    basePrice: 3600,
    images: [
      "https://images.unsplash.com/photo-1519822472231-2a9a2a43a08a?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&q=80&w=1400",
    ],
    priceRange: "₹3,600 - ₹6,000 / night",
    email: "host@backwatercottage.example",
    phone: "+91 90000 12345",
    externalLinks: [
      { name: "MakeMyTrip", url: "https://www.makemytrip.com" },
      { name: "Goibibo", url: "https://www.goibibo.com" },
    ],
    description: "Stilted cottage with serene canal views, canoe rides and homestyle meals.",
    creatorReviews: [
      { id: "c4", author: "@kerala_diaries", rating: 4.5, content: "Sunset canoe ride is a must-do!" },
    ],
    userReviews: [
      { id: "u5", author: "Rhea", rating: 4.5, content: "Calm, beautiful, and comfortable stay." },
    ],
  },
  {
    id: 5,
    name: "Desert Camp",
    location: "Jaisalmer, Rajasthan",
    rating: 4.4,
    basePrice: 2900,
    images: [
      "https://images.unsplash.com/photo-1676193361626-debc2960b1c4?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1400",
    ],
    priceRange: "₹2,500 - ₹4,500 / night",
    email: "book@desertcamp.example",
    phone: "+91 90909 80807",
    externalLinks: [
      { name: "Goibibo", url: "https://www.goibibo.com" },
    ],
    description: "Stargaze under the Thar sky. Cultural evenings with folk music and dance.",
    creatorReviews: [],
    userReviews: [
      { id: "u6", author: "Arnav", rating: 4.3, content: "Tents were comfy. Camel safari was memorable." },
    ],
  },
  {
    id: 6,
    name: "Tea Estate Bungalow",
    location: "Munnar, Kerala",
    rating: 4.7,
    basePrice: 5100,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1505691723518-36a5ac3b2d55?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1461696114087-397271a7aedc?auto=format&fit=crop&q=80&w=1400",
    ],
    priceRange: "₹5,000 - ₹8,000 / night",
    email: "stay@teaestate.example",
    phone: "+91 91234 56780",
    externalLinks: [
      { name: "Booking.com", url: "https://www.booking.com" },
      { name: "MakeMyTrip", url: "https://www.makemytrip.com" },
    ],
    description: "Colonial bungalow amidst rolling tea gardens. Misty mornings and plantation walks.",
    creatorReviews: [
      { id: "c5", author: "@greengetaways", rating: 4.8, content: "Tea tasting session was delightful." },
    ],
    userReviews: [
      { id: "u7", author: "Zoya", rating: 4.7, content: "So serene; perfect for reading and relaxing." },
    ],
  },
  {
    id: 7,
    name: "Lakeview Homestay",
    location: "Nainital, Uttarakhand",
    rating: 4.5,
    basePrice: 2500,
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1461696114087-397271a7aedc?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1505691723518-36a5ac3b2d55?auto=format&fit=crop&q=80&w=1400",
    ],
    priceRange: "₹2,200 - ₹3,500 / night",
    email: "host@lakeview.example",
    phone: "+91 90123 45678",
    externalLinks: [
      { name: "Goibibo", url: "https://www.goibibo.com" },
    ],
    description: "Cozy rooms with balcony views of the lake. Close to mall road.",
    creatorReviews: [],
    userReviews: [
      { id: "u8", author: "Ravi", rating: 4.4, content: "Great value and lovely hosts." },
    ],
  },
  {
    id: 8,
    name: "Cliffside Haven",
    location: "Varkala, Kerala",
    rating: 4.6,
    basePrice: 3400,
    images: [
      "https://images.unsplash.com/photo-1519822472231-2a9a2a43a08a?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=1400",
    ],
    priceRange: "₹3,400 - ₹5,800 / night",
    email: "stay@cliffsidehaven.example",
    phone: "+91 93456 78123",
    externalLinks: [
      { name: "MakeMyTrip", url: "https://www.makemytrip.com" },
      { name: "Booking.com", url: "https://www.booking.com" },
    ],
    description: "Sea-facing rooms on the red cliffs. Cafes and yoga studios nearby.",
    creatorReviews: [
      { id: "c6", author: "@coastalcircle", rating: 4.6, content: "Early morning cliff walks were unreal." },
    ],
    userReviews: [
      { id: "u9", author: "Neha", rating: 4.6, content: "Clean rooms and fantastic view." },
    ],
  },
];

export function getStayById(id: string | number): StayDetails | undefined {
  const target = String(id);
  return MOCK_STAYS.find((s) => String(s.id) === target);
}


