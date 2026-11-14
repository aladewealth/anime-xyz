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
  rank?: number | null;
  popularity?: number | null;
  members?: number | null;
  favorites?: number | null;
  synopsis: string | null;
  year: number | null;
  season?: string | null;
  rating?: string | null;
  source?: string | null;
  duration?: string | null;
  images: {
    jpg: { image_url: string; large_image_url: string };
  };
  genres: { mal_id: number; name: string }[];
  studios?: { mal_id: number; name: string }[];
  authors?: { mal_id: number; name: string }[];
  trailer?: {
    youtube_id: string | null;
    url: string | null;
    embed_url: string | null;
  };
  streaming?: { name: string; url: string }[];
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

// Rate-limit helper: Jikan allows ~3 req/s and often stalls, so cap each attempt.
const REQUEST_TIMEOUT_MS = 12000;
let lastRequest = 0;

function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const wait = Math.max(0, 350 - (now - lastRequest));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();

  const res = await fetchWithTimeout(url);
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 1000));
    lastRequest = Date.now();
    return fetchWithTimeout(url);
  }
  return res;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await rateLimitedFetch(url);
  if (!res.ok) {
    throw new Error(`Jikan request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

function asList<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export async function searchAnime(query: string, type: "anime" | "manga" = "anime"): Promise<JikanAnime[]> {
  if (!query.trim()) return [];
  const json = await fetchJson<JikanResponse<JikanAnime[]>>(
    `${BASE_URL}/${type}?q=${encodeURIComponent(query)}&limit=10&sfw=true`
  );
  return asList(json.data);
}

export async function getTopAnime(type: "anime" | "manga" = "anime", page = 1): Promise<JikanAnime[]> {
  const endpoint = type === "anime" ? "top/anime" : "top/manga";
  const json = await fetchJson<JikanResponse<JikanAnime[]>>(
    `${BASE_URL}/${endpoint}?page=${page}&limit=15&sfw=true`
  );
  return asList(json.data);
}

export async function getAiringAnime(): Promise<JikanAnime[]> {
  const json = await fetchJson<JikanResponse<JikanAnime[]>>(
    `${BASE_URL}/top/anime?filter=airing&limit=10&sfw=true`
  );
  return asList(json.data);
}

export async function getAnimeById(id: number, type: "anime" | "manga" = "anime"): Promise<JikanAnime | null> {
  try {
    const res = await rateLimitedFetch(`${BASE_URL}/${type}/${id}/full`);
    if (!res.ok) return null;
    const json: JikanResponse<JikanAnime> = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function getAnimeReviews(id: number, type: "anime" | "manga" = "anime"): Promise<JikanReview[]> {
  try {
    const res = await rateLimitedFetch(`${BASE_URL}/${type}/${id}/reviews?page=1`);
    if (!res.ok) return [];
    const json: JikanResponse<JikanReview[]> = await res.json();
    return asList(json.data).slice(0, 6);
  } catch {
    return [];
  }
}

export async function getRecommendations(id: number, type: "anime" | "manga" = "anime"): Promise<JikanAnime[]> {
  try {
    const res = await rateLimitedFetch(`${BASE_URL}/${type}/${id}/recommendations`);
    if (!res.ok) return [];
    const json: JikanResponse<{ entry: JikanAnime }[]> = await res.json();
    return asList(json.data)
      .slice(0, 5)
      .map((row) => row?.entry)
      .filter((entry): entry is JikanAnime => Boolean(entry?.mal_id));
  } catch {
    return [];
  }
}
