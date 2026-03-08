import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { JikanAnime } from "@/lib/jikan";

interface AnimeCardProps {
  anime: JikanAnime;
  index: number;
  type?: "anime" | "manga";
}

const AnimeCard = ({ anime, index, type = "anime" }: AnimeCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/title/${type}/${anime.mal_id}`} className="group block">
        <div className="relative overflow-hidden rounded-lg aspect-[3/4] bg-secondary">
          <img
            src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
            alt={anime.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary text-primary-foreground uppercase tracking-wider">
              {anime.type || type}
            </span>
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {anime.title}
          </h3>
          {anime.title_japanese && (
            <p className="text-xs text-muted-foreground line-clamp-1">{anime.title_japanese}</p>
          )}
          <div className="flex items-center gap-2">
            {anime.score && (
              <>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-accent text-accent" />
                  <span className="text-xs font-medium text-foreground">{anime.score}</span>
                </div>
                <span className="text-xs text-muted-foreground">·</span>
              </>
            )}
            {anime.year && (
              <>
                <span className="text-xs text-muted-foreground">{anime.year}</span>
                <span className="text-xs text-muted-foreground">·</span>
              </>
            )}
            <span className="text-xs text-muted-foreground">
              {anime.episodes ? `${anime.episodes} eps` : anime.chapters ? `${anime.chapters} ch` : anime.status}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default AnimeCard;
