const MANGADEX_API = "https://api.mangadex.org";

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
  };
}

export interface ChapterPages {
  baseUrl: string;
  hash: string;
  data: string[];
  dataSaver: string[];
}

export async function getPopularManga(): Promise<MangaDexManga[]> {
  try {
    const res = await fetch(
      `${MANGADEX_API}/manga?limit=12&includes[]=cover_art&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive&hasAvailableChapters=true`
    );
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function searchMangaDex(query: string): Promise<MangaDexManga[]> {
  if (!query.trim()) return [];
  const res = await fetch(
    `${MANGADEX_API}/manga?title=${encodeURIComponent(query)}&limit=10&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`
  );
  const json = await res.json();
  return json.data || [];
}

export async function getMangaDexManga(id: string): Promise<MangaDexManga | null> {
  try {
    const res = await fetch(`${MANGADEX_API}/manga/${id}?includes[]=cover_art&includes[]=author`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function getMangaChapters(mangaId: string, offset = 0): Promise<{ chapters: MangaDexChapter[]; total: number }> {
  try {
    const res = await fetch(
      `${MANGADEX_API}/manga/${mangaId}/feed?translatedLanguage[]=en&order[chapter]=asc&limit=50&offset=${offset}&includes[]=scanlation_group`
    );
    if (!res.ok) return { chapters: [], total: 0 };
    const json = await res.json();
    return { chapters: json.data || [], total: json.total || 0 };
  } catch {
    return { chapters: [], total: 0 };
  }
}

export async function getChapterPages(chapterId: string): Promise<ChapterPages | null> {
  try {
    const res = await fetch(`${MANGADEX_API}/at-home/server/${chapterId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return {
      baseUrl: json.baseUrl,
      hash: json.chapter.hash,
      data: json.chapter.data,
      dataSaver: json.chapter.dataSaver,
    };
  } catch {
    return null;
  }
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
