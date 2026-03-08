import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import AnimeCard from "@/components/AnimeCard";
import { getTopAnime, type JikanAnime } from "@/lib/jikan";

const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Slice of Life", "Supernatural"];

const Index = () => {
  const [activeFilter, setActiveFilter] = useState<"anime" | "manga">("anime");
  const [topItems, setTopItems] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTopAnime(activeFilter)
      .then((data) => {
        if (!cancelled) setTopItems(data);
      })
      .catch(() => {
        if (!cancelled) setTopItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeFilter]);

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
              <AnimeCard key={anime.mal_id} anime={anime} index={i} type={activeFilter} />
            ))}
          </div>
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
