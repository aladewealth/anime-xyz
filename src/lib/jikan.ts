const BASE_URL = "https://api.jikan.moe/v4";

export interface JikanAnime {
  mal_id: number;
  title: string;
  title_japanese: string | null;
  type: string;
  episodes: number | null;
  chapters?: number | null;
  status: string;
  score: number | null;
  scored_by: number | null;
  synopsis: string | null;
  year: number | null;
  images: {
    jpg: { image_url: string; large_image_url: string };
  };
  genres: { mal_id: number; name: string }[];
  studios?: { mal_id: number; name: string }[];
  authors?: { mal_id: number; name: string }[];
}

export interface JikanReview {
  mal_id: number;
  type: string;
  date: string;
  review: string;
  score: number;
  user: {
    username: string;
    images: { jpg: { image_url: string } };
  };
  tags: string[];
  reactions: { overall: number };
}

export interface JikanResponse<T> {
  data: T;
  pagination?: {
    last_visible_page: number;
    has_next_page: boolean;
  };
}

// Rate-limit helper: Jikan allows ~3 req/s
let lastRequest = 0;
async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const wait = Math.max(0, 350 - (now - lastRequest));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
  const res = await fetch(url);
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 1000));
    return fetch(url);
  }
  return res;
}

export async function searchAnime(query: string, type: "anime" | "manga" = "anime"): Promise<JikanAnime[]> {
  if (!query.trim()) return [];
  const res = await rateLimitedFetch(
    `${BASE_URL}/${type}?q=${encodeURIComponent(query)}&limit=10&sfw=true`
  );
  const json: JikanResponse<JikanAnime[]> = await res.json();
  return json.data;
}

export async function getTopAnime(type: "anime" | "manga" = "anime", page = 1): Promise<JikanAnime[]> {
  const endpoint = type === "anime" ? "top/anime" : "top/manga";
  const res = await rateLimitedFetch(`${BASE_URL}/${endpoint}?page=${page}&limit=15&sfw=true`);
  const json: JikanResponse<JikanAnime[]> = await res.json();
  return json.data;
}

export async function getAnimeById(id: number, type: "anime" | "manga" = "anime"): Promise<JikanAnime | null> {
  try {
    const res = await rateLimitedFetch(`${BASE_URL}/${type}/${id}/full`);
    if (!res.ok) return null;
    const json: JikanResponse<JikanAnime> = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function getAnimeReviews(id: number, type: "anime" | "manga" = "anime"): Promise<JikanReview[]> {
  try {
    const res = await rateLimitedFetch(`${BASE_URL}/${type}/${id}/reviews?page=1`);
    if (!res.ok) return [];
    const json: JikanResponse<JikanReview[]> = await res.json();
    return json.data.slice(0, 6);
  } catch {
    return [];
  }
}

export async function getRecommendations(id: number, type: "anime" | "manga" = "anime"): Promise<JikanAnime[]> {
  try {
    const res = await rateLimitedFetch(`${BASE_URL}/${type}/${id}/recommendations`);
    if (!res.ok) return [];
    const json: JikanResponse<{ entry: JikanAnime }[]> = await res.json();
    return json.data.slice(0, 5).map((r) => r.entry);
  } catch {
    return [];
  }
}
