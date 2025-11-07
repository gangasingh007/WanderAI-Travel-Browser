export function extractYouTubeId(url: string): string | null {
  try {
    // Handle various YouTube URL formats
    const u = new URL(url.trim());
    
    // youtu.be format
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.slice(1).split('?')[0]; // Remove query params
      return id || null;
    }
    
    // youtube.com formats
    if (u.hostname.includes("youtube.com") || u.hostname.includes("m.youtube.com")) {
      // Standard watch URL
      if (u.pathname === "/watch") {
        return u.searchParams.get("v");
      }
      
      // Shorts format
      if (u.pathname.startsWith("/shorts/")) {
        const parts = u.pathname.split("/");
        return parts[2] || null;
      }
      
      // Embed format
      if (u.pathname.startsWith("/embed/")) {
        const parts = u.pathname.split("/");
        return parts[2]?.split('?')[0] || null; // Remove query params
      }
      
      // Live format
      if (u.pathname.startsWith("/live/")) {
        const parts = u.pathname.split("/");
        return parts[2] || null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting YouTube ID:', error);
    return null;
  }
}

export type YouTubeMetadata = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  channelTitle: string;
  publishedAt: string;
  duration?: string;
  thumbnails?: {
    default: string;
    medium: string;
    high: string;
  };
};

export async function fetchYouTubeMetadata(
  videoId: string, 
  apiKey?: string
): Promise<YouTubeMetadata | null> {
  const key = apiKey || process.env.YOUTUBE_API_KEY;
  
  if (!key) {
    console.error('YouTube API key is missing');
    return null;
  }
  
  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "snippet,contentDetails"); // Added contentDetails for duration
    url.searchParams.set("id", videoId);
    url.searchParams.set("key", key);
    
    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`YouTube API error (${res.status}):`, errorText);
      return null;
    }
    
    const data = await res.json();
    const item = data?.items?.[0];
    
    if (!item?.snippet) {
      console.error('No video data found for ID:', videoId);
      return null;
    }
    
    const snippet = item.snippet;
    const contentDetails = item.contentDetails;
    
    return {
      id: videoId,
      title: snippet.title || "Untitled Video",
      description: snippet.description || "",
      tags: snippet.tags || [],
      channelTitle: snippet.channelTitle || "",
      publishedAt: snippet.publishedAt || new Date().toISOString(),
      duration: contentDetails?.duration || undefined,
      thumbnails: snippet.thumbnails ? {
        default: snippet.thumbnails.default?.url || "",
        medium: snippet.thumbnails.medium?.url || "",
        high: snippet.thumbnails.high?.url || "",
      } : undefined,
    };
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
    return null;
  }
}
