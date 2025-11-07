export function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1) || null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
    }
    return null;
  } catch {
    return null;
  }
}

export type YouTubeMetadata = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  channelTitle: string;
};

export async function fetchYouTubeMetadata(videoId: string, apiKey?: string): Promise<YouTubeMetadata | null> {
  const key = apiKey || process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("id", videoId);
  url.searchParams.set("key", key);
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = await res.json();
  const item = data?.items?.[0]?.snippet;
  if (!item) return null;
  return {
    id: videoId,
    title: item.title || "",
    description: item.description || "",
    tags: item.tags || [],
    channelTitle: item.channelTitle || "",
  };
}


