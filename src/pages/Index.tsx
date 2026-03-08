import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Loader2, BookOpen } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import AnimeCard from "@/components/AnimeCard";
import TrendingCarousel from "@/components/TrendingCarousel";
import { getTopAnime, type JikanAnime } from "@/lib/jikan";
import { getPopularManga, getMangaCoverUrl, type MangaDexManga } from "@/lib/mangadex";

const Index = () => {
  const [activeFilter, setActiveFilter] = useState<"anime" | "manga">("anime");
  const [topItems, setTopItems] = useState<JikanAnime[]>([]);
  const [trendingItems, setTrendingItems] = useState<JikanAnime[]>([]);
  const [popularManga, setPopularManga] = useState<MangaDexManga[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset on filter change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);
    setHasMore(true);
    setTopItems([]);
    getTopAnime(activeFilter, 1)
      .then((data) => {
        if (!cancelled) {
          setTopItems(data);
          setHasMore(data.length >= 15);
        }
      })
      .catch(() => {
        if (!cancelled) setTopItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeFilter]);

  // Load more
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    getTopAnime(activeFilter, nextPage)
      .then((data) => {
        setTopItems((prev) => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(data.length >= 15);
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoadingMore(false));
  }, [activeFilter, page, loadingMore, hasMore]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, loading]);

  // Fetch trending + popular manga
  useEffect(() => {
    let cancelled = false;
    fetch("https://api.jikan.moe/v4/top/anime?filter=airing&limit=10&sfw=true")
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setTrendingItems(json.data || []);
      })
      .catch(() => {
        if (!cancelled) setTrendingItems([]);
      });
    getPopularManga().then((data) => {
      if (!cancelled) setPopularManga(data);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
        <img src={heroBg} alt="Anime cityscape" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative container mx-auto px-4 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
              <span className="text-gradient">ANiMe</span>
              <span className="text-foreground">.xyz</span>
            </h1>
            <p className="mt-3 max-w-md text-foreground/70 text-lg">
              Discover, explore, and review your favorite anime and manga — powered by MyAnimeList data.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-secondary text-xs font-mono">⌘K</kbd> to search</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending Carousel */}
      {trendingItems.length > 0 && (
        <TrendingCarousel items={trendingItems} type="anime" />
      )}

      {/* Read Manga Section */}
      {popularManga.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold text-foreground">Read Manga</h2>
              <span className="text-xs text-muted-foreground ml-1">via MangaDex</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularManga.map((manga) => {
              const title = manga.attributes.title.en || manga.attributes.title.ja || Object.values(manga.attributes.title)[0] || "Unknown";
              return (
                <Link key={manga.id} to={`/manga/${manga.id}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="group rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={getMangaCoverUrl(manga, "256")}
                        alt={title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-2.5">
                      <p className="text-sm font-medium text-foreground truncate">{title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <BookOpen className="h-3 w-3 text-primary" />
                        <span className="text-[10px] text-muted-foreground capitalize">{manga.attributes.status}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {(["anime", "manga"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <span className="text-xs text-muted-foreground ml-2">Top rated on MyAnimeList</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {topItems.map((anime, i) => (
              <AnimeCard key={`${anime.mal_id}-${i}`} anime={anime} index={i} type={activeFilter} />
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-1" />

        {loadingMore && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        )}

        {!loading && !hasMore && topItems.length > 0 && (
          <p className="text-center text-xs text-muted-foreground py-8">You've reached the end ✨</p>
        )}

        {!loading && topItems.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg">Failed to load data</p>
            <p className="text-sm mt-1">Jikan API may be rate-limited. Try refreshing.</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-xs text-muted-foreground">
          <p>© 2026 ANiMe.xyz — Data from MyAnimeList via Jikan API</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
