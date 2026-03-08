import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { AnimeTitle } from "@/data/animeData";

interface AnimeCardProps {
  anime: AnimeTitle;
  index: number;
}

const AnimeCard = ({ anime, index }: AnimeCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link to={`/title/${anime.id}`} className="group block">
        <div className="relative overflow-hidden rounded-lg aspect-[3/4] bg-secondary">
          <img
            src={anime.coverImage}
            alt={anime.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-xs text-foreground/80 line-clamp-2">{anime.synopsis}</p>
          </div>
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary text-primary-foreground uppercase tracking-wider">
              {anime.type}
            </span>
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {anime.title}
          </h3>
          <p className="text-xs text-muted-foreground">{anime.japaneseTitle}</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span className="text-xs font-medium text-foreground">{anime.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{anime.year}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {anime.episodes ? `${anime.episodes} eps` : `${anime.chapters} ch`}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default AnimeCard;
