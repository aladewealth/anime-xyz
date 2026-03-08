import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ChevronLeft, ChevronRight, Star, Flame } from "lucide-react";
import type { JikanAnime } from "@/lib/jikan";

interface TrendingCarouselProps {
  items: JikanAnime[];
  type: "anime" | "manga";
}

const TrendingCarousel = ({ items, type }: TrendingCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  if (items.length === 0) return null;

  const item = items[current];
  const rank = current + 1;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-5">
        <Flame className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-semibold text-foreground">Trending This Week</h2>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={item.mal_id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Link
              to={`/title/${type}/${item.mal_id}`}
              className="flex flex-col sm:flex-row gap-0 group"
            >
              {/* Image side */}
              <div className="relative sm:w-[220px] shrink-0">
                <img
                  src={item.images.jpg.large_image_url || item.images.jpg.image_url}
                  alt={item.title}
                  className="h-[200px] sm:h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  #{rank}
                </div>
              </div>

              {/* Info side */}
              <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                    {item.type || type}
                  </span>
                  {item.score && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      {item.score}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{item.status}</span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {item.title}
                </h3>

                {item.title_japanese && (
                  <p className="text-sm text-muted-foreground mt-1">{item.title_japanese}</p>
                )}

                {item.synopsis && (
                  <p className="text-sm text-foreground/70 mt-3 line-clamp-2 leading-relaxed">
                    {item.synopsis}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.genres?.slice(0, 4).map((g) => (
                    <span key={g.mal_id} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <button
          onClick={(e) => { e.preventDefault(); prev(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-foreground hover:bg-background transition-colors z-10"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); next(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-foreground hover:bg-background transition-colors z-10"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {items.slice(0, 10).map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-primary" : "w-1.5 bg-foreground/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingCarousel;
