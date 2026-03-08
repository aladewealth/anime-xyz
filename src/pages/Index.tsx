import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import AnimeCard from "@/components/AnimeCard";
import { animeData, genres } from "@/data/animeData";

const Index = () => {
  const [activeFilter, setActiveFilter] = useState<"all" | "anime" | "manga">("all");
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  const filtered = animeData.filter((a) => {
    if (activeFilter !== "all" && a.type !== activeFilter) return false;
    if (activeGenre && !a.genres.includes(activeGenre)) return false;
    return true;
  });

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
              Discover, explore, and review your favorite anime and manga — powered by AI.
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
          {(["all", "anime", "manga"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <div className="h-5 w-px bg-border mx-2 hidden sm:block" />
          <div className="flex flex-wrap gap-1.5">
            {genres.slice(0, 8).map((g) => (
              <button
                key={g}
                onClick={() => setActiveGenre(activeGenre === g ? null : g)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  activeGenre === g
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filtered.map((anime, i) => (
            <AnimeCard key={anime.id} anime={anime} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg">No titles found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-xs text-muted-foreground">
          <p>© 2026 ANiMe.xyz — Built with ♥ for anime fans everywhere</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
