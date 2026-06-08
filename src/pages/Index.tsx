import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Loader2, BookOpen, Star, Trophy, Clapperboard, Library, Search, Users, ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import AnimeCard from "@/components/AnimeCard";
import TrendingCarousel from "@/components/TrendingCarousel";
import { getTopAnime, type JikanAnime } from "@/lib/jikan";
import { getPopularManga, getMangaCoverUrl, type MangaDexManga } from "@/lib/mangadex";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFilter = searchParams.get("filter") === "manga" ? "manga" : "anime";
  const [activeFilter, setActiveFilter] = useState<"anime" | "manga">(queryFilter);
  const [topItems, setTopItems] = useState<JikanAnime[]>([]);
  const [trendingItems, setTrendingItems] = useState<JikanAnime[]>([]);
  const [popularManga, setPopularManga] = useState<MangaDexManga[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveFilter(queryFilter);
  }, [queryFilter]);

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

  const setCatalogFilter = (filter: "anime" | "manga") => {
    setActiveFilter(filter);
    setSearchParams({ filter });
  };

  const featuredTitle = topItems[0];
  const highVoteTitles = topItems
    .filter((item) => item.scored_by)
    .sort((a, b) => (b.scored_by || 0) - (a.scored_by || 0))
    .slice(0, 5);
  const catalogStats = [
    { label: "Ranked titles", value: topItems.length ? `${topItems.length}+` : "Live", icon: Trophy },
    { label: "Audience ratings", value: "MAL", icon: Star },
    { label: "Manga reader", value: "MangaDex", icon: BookOpen },
    { label: "Fast search", value: "Cmd/Ctrl K", icon: Search },
  ];
  const browseLanes = [
    { label: "Top anime", value: "Series, films, OVAs", icon: Clapperboard, filter: "anime" as const },
    { label: "Top manga", value: "Manga, novels, one-shots", icon: Library, filter: "manga" as const },
    { label: "Audience picks", value: "Sorted by score and votes", icon: Users, filter: activeFilter },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[620px] overflow-hidden pt-24">
        <img src={heroBg} alt="Anime cityscape" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />
        <div className="relative container mx-auto grid min-h-[520px] gap-8 px-4 pb-12 md:grid-cols-[1.05fr_0.95fr] md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Anime, manga, ratings, reviews, trailers, and reading links
            </div>
            <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight md:text-7xl">
              <span className="text-gradient">The anime database</span>
              <span className="text-foreground"> for what to watch next.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-foreground/75">
              Browse ranked titles, compare audience scores, open trailers, save a watchlist, read manga, and jump into community reviews from a single catalog.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#catalog" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">
                Explore rankings <ArrowRight className="h-4 w-4" />
              </a>
              <span className="text-sm text-muted-foreground">Press <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">Ctrl K</kbd> to search the database</span>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 md:grid-cols-4">
              {catalogStats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border/70 bg-background/65 p-3 backdrop-blur">
                  <stat.icon className="mb-2 h-4 w-4 text-primary" />
                  <p className="font-display text-lg font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
          {featuredTitle && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="hidden md:block"
            >
              <Link to={`/title/${activeFilter}/${featuredTitle.mal_id}`} className="group grid grid-cols-[160px_1fr] gap-5 rounded-lg border border-border/70 bg-card/80 p-4 shadow-2xl backdrop-blur transition-transform hover:-translate-y-1">
                <img src={featuredTitle.images.jpg.large_image_url} alt={featuredTitle.title} className="aspect-[3/4] rounded-md object-cover" />
                <div className="flex min-w-0 flex-col justify-between py-1">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Featured #{featuredTitle.rank || 1}</p>
                    <h2 className="mt-2 line-clamp-2 font-display text-2xl font-bold text-foreground group-hover:text-primary">{featuredTitle.title}</h2>
                    <p className="mt-2 line-clamp-4 text-sm leading-6 text-muted-foreground">{featuredTitle.synopsis}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-secondary px-2.5 py-1">{featuredTitle.score || "N/A"} rating</span>
                    <span className="rounded-full bg-secondary px-2.5 py-1">{featuredTitle.year || featuredTitle.status}</span>
                    <span className="rounded-full bg-secondary px-2.5 py-1">{featuredTitle.type || activeFilter}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="grid gap-3 md:grid-cols-3">
          {browseLanes.map((lane) => (
            <button
              key={lane.label}
              onClick={() => setCatalogFilter(lane.filter)}
              className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/60 hover:bg-secondary/40"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <lane.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-display text-base font-semibold text-foreground">{lane.label}</span>
                  <span className="text-sm text-muted-foreground">{lane.value}</span>
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </button>
          ))}
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
                        referrerPolicy="no-referrer"
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
      {highVoteTitles.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Audience pulse</h2>
              <p className="text-sm text-muted-foreground">Highly scored titles with the largest active voting pools in this catalog view.</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {highVoteTitles.map((item, index) => (
              <Link key={item.mal_id} to={`/title/${activeFilter}/${item.mal_id}`} className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/60">
                <p className="text-xs font-semibold text-primary">#{item.rank || index + 1}</p>
                <h3 className="mt-2 line-clamp-2 min-h-10 font-display text-sm font-semibold text-foreground">{item.title}</h3>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-accent text-accent" />{item.score || "N/A"}</span>
                  <span>{item.scored_by ? `${Math.round(item.scored_by / 1000)}k votes` : "No vote data"}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="catalog" className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {(["anime", "manga"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setCatalogFilter(f)}
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
              <AnimeCard key={`${anime.mal_id}-${i}`} anime={anime} index={i} type={activeFilter} showRank />
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
          <p className="text-center text-xs text-muted-foreground py-8">You've reached the end.</p>
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
