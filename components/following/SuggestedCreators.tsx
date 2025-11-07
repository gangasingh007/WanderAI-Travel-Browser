"use client";

import { useState } from "react";
import Link from "next/link";

type SuggestedCreator = {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  followedBy: string;
  isVerified: boolean;
};

// Mock suggested creators data
const mockSuggestedCreators: SuggestedCreator[] = [
  {
    id: "1",
    username: "kanika_sharma_nag",
    fullName: "Kanika Sharma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    followedBy: "ashna_",
    isVerified: true,
  },
  {
    id: "2",
    username: "mapiyk",
    fullName: "M.@.π.γ.Κ",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    followedBy: "theaayı",
    isVerified: false,
  },
  {
    id: "3",
    username: "manyaratra",
    fullName: "Manya Ratra",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    followedBy: "arshia_be",
    isVerified: false,
  },
  {
    id: "4",
    username: "gautam_khanna",
    fullName: "Gautam Khanna",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    followedBy: "rommy.",
    isVerified: true,
  },
  {
    id: "5",
    username: "okjaanu",
    fullName: "Ok Jaanu",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
    followedBy: "sunilmeh",
    isVerified: false,
  },
];

function IconVerified() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/Verified.svg" alt="Verified" className="inline-block h-4 w-4 relative top-[1px]" />
  );
}

export default function SuggestedCreators() {
  const [following, setFollowing] = useState<Set<string>>(new Set());

  const handleFollow = (id: string) => {
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      {/* Suggested for you */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Suggested for you</h3>
        <Link
          href="/explore"
          className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          See All
        </Link>
      </div>

      <div className="space-y-3">
        {mockSuggestedCreators.map((creator) => (
          <div key={creator.id} className="flex items-center gap-3">
            <Link href={`/profile/${creator.username}`} className="flex-shrink-0">
              <img
                src={creator.avatar}
                alt={creator.fullName}
                className="w-10 h-10 rounded-xl object-cover"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                href={`/profile/${creator.username}`}
                className="flex items-center gap-1 group"
              >
                <span className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700">
                  {creator.fullName}
                </span>
                {creator.isVerified && <IconVerified />}
              </Link>
              <p className="text-xs text-gray-500 truncate">
                Followed by {creator.followedBy}
              </p>
            </div>
            <button
              onClick={() => handleFollow(creator.id)}
              className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors shadow-sm ${
                following.has(creator.id)
                  ? "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
                  : "bg-gray-900 text-white hover:bg-gray-800 border border-transparent"
              }`}
            >
              {following.has(creator.id) ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Thanks for using Wander AI as your travel partner ❤️
        </p>
      </div>
    </div>
  );
}
