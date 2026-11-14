// MangaDex API is CORS-blocked from browsers, so route every API call through our
// Lovable Cloud edge function proxy at supabase/functions/mangadex-proxy.
const PROXY_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mangadex-proxy`;
const PROXY_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const mdFetch = (path: string, init?: RequestInit) => {
  if (!import.meta.env.VITE_SUPABASE_URL || !PROXY_KEY) {
    return Promise.reject(new Error("MangaDex proxy is not configured"));
  }
  const controller = new AbortController();
  const timer = init?.signal ? undefined : setTimeout(() => controller.abort(), 12000);
  return fetch(`${PROXY_BASE}?path=${encodeURIComponent(path)}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      apikey: PROXY_KEY,
      Authorization: `Bearer ${PROXY_KEY}`,
    },
    signal: init?.signal ?? controller.signal,
  }).finally(() => {
    if (timer) clearTimeout(timer);
  });
};

export interface MangaDexManga {
  id: string;
  attributes: {
    title: { en?: string; ja?: string; [key: string]: string | undefined };
    description: { en?: string };
    status: string;
    year: number | null;
    tags: { attributes: { name: { en: string } } }[];
  };
  relationships: { type: string; id: string; attributes?: { fileName?: string } }[];
}

export interface MangaDexChapter {
  id: string;
  attributes: {
    chapter: string | null;
    title: string | null;
    translatedLanguage: string;
    pages: number;
    publishAt: string;
    externalUrl?: string | null;
  };
}

export interface ChapterPages {
  baseUrl: string;
  hash: string;
  data: string[];
  dataSaver: string[];
}

export async function getPopularManga(): Promise<MangaDexManga[]> {
  const res = await mdFetch(
    `/manga?limit=12&includes[]=cover_art&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive&hasAvailableChapters=true`
  );
  if (!res.ok) throw new Error(`MangaDex proxy failed (${res.status})`);
  const json = await res.json();
  if (!Array.isArray(json.data)) throw new Error("Unexpected MangaDex response");
  return json.data;
}

export async function searchMangaDex(query: string): Promise<MangaDexManga[]> {
  if (!query.trim()) return [];
  const res = await mdFetch(
    `/manga?title=${encodeURIComponent(query)}&limit=10&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`
  );
  if (!res.ok) throw new Error(`MangaDex search failed (${res.status})`);
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

export async function getMangaDexManga(id: string): Promise<MangaDexManga | null> {
  try {
    const res = await mdFetch(`/manga/${id}?includes[]=cover_art&includes[]=author`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function getMangaChapters(mangaId: string, offset = 0): Promise<{ chapters: MangaDexChapter[]; total: number }> {
  try {
    const res = await mdFetch(
      `/manga/${mangaId}/feed?translatedLanguage[]=en&order[chapter]=asc&limit=50&offset=${offset}&includes[]=scanlation_group`
    );
    if (!res.ok) return { chapters: [], total: 0 };
    const json = await res.json();
    return { chapters: json.data || [], total: json.total || 0 };
  } catch {
    return { chapters: [], total: 0 };
  }
}

export async function getChapterMeta(chapterId: string): Promise<{ chapter: string; externalUrl: string | null } | null> {
  try {
    const res = await mdFetch(`/chapter/${chapterId}`);
    if (!res.ok) return null;
    const json = await res.json();
    const attributes = json.data?.attributes;
    const chapter = attributes?.chapter;
    return {
      chapter: chapter == null ? "" : String(chapter),
      externalUrl: attributes?.externalUrl || null,
    };
  } catch {
    return null;
  }
}

export async function getChapterPages(chapterId: string): Promise<ChapterPages | null> {
  try {
    const res = await mdFetch(`/at-home/server/${chapterId}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.chapter?.hash || !Array.isArray(json.chapter.data)) return null;
    return {
      baseUrl: json.baseUrl,
      hash: json.chapter.hash,
      data: json.chapter.data,
      dataSaver: Array.isArray(json.chapter.dataSaver) ? json.chapter.dataSaver : [],
    };
  } catch {
    return null;
  }
}

export function fallbackCover(img: HTMLImageElement) {
  if (!img.src.includes("/placeholder.svg")) img.src = "/placeholder.svg";
}

export function getMangaCoverUrl(manga: MangaDexManga, size: "256" | "512" = "512"): string {
  const coverRel = manga.relationships.find((r) => r.type === "cover_art");
  if (coverRel?.attributes?.fileName) {
    return `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.${size}.jpg`;
  }
  return "/placeholder.svg";
}

export function getPageUrl(pages: ChapterPages, index: number, quality: "full" | "saver" = "full"): string {
  const files = quality === "full" ? pages.data : pages.dataSaver;
  const prefix = quality === "full" ? "data" : "data-saver";
  return `${pages.baseUrl}/${prefix}/${pages.hash}/${files[index]}`;
}
