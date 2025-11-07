"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type FollowedPerson = {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  isVerified: boolean;
  bio: string;
};

// Mock data for people you follow
const mockFollowedPeople: FollowedPerson[] = [
  {
    id: "1",
    username: "the.city.nomad",
    fullName: "City Nomad",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    isVerified: true,
    bio: "Exploring hidden gems in bustling cities",
  },
  {
    id: "2",
    username: "wanderlust_solo",
    fullName: "Wanderlust Solo",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    isVerified: false,
    bio: "Solo adventures discovering the world",
  },
  {
    id: "3",
    username: "foodie_trails",
    fullName: "Foodie Trails",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    isVerified: true,
    bio: "Following flavors from street food to fine dining",
  },
  {
    id: "4",
    username: "mountain_roamer",
    fullName: "Mountain Roamer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    isVerified: false,
    bio: "Chasing peaks and breathtaking views",
  },
];

function IconVerified() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/Verified.svg" alt="Verified" className="inline-block h-4 w-4 relative top-[1px]" />
  );
}

export default function PeopleYouFollow() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">People You Follow</h2>
        <Link
          href="/following/all"
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          See All
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockFollowedPeople.map((person, index) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={`/profile/${person.username}`}
              className="block p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={person.avatar}
                  alt={person.fullName}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {person.fullName}
                    </span>
                    {person.isVerified && <IconVerified />}
                  </div>
                  <p className="text-xs text-gray-500 truncate">@{person.username}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{person.bio}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

