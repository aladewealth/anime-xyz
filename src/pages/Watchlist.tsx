import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, Trash2, PlayCircle } from "lucide-react";
import { getBookmarks, removeBookmark, getAllProgress, type BookmarkItem, type ReadingProgress } from "@/lib/bookmarks";

const Watchlist = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [progress, setProgress] = useState<Record<string, ReadingProgress>>({});
  const [filter, setFilter] = useState<"all" | "anime" | "manga">("all");

  useEffect(() => {
    setBookmarks(getBookmarks());
    setProgress(getAllProgress());
  }, []);

  const filtered = bookmarks.filter((b) => filter === "all" || b.type === filter);

  const handleRemove = (id: string, type: "anime" | "manga") => {
    removeBookmark(id, type);
    setBookmarks(getBookmarks());
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="h-6 w-6 text-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground">My Watchlist</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(["all", "anime", "manga"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <span className="text-sm text-muted-foreground self-center ml-2">{filtered.length} saved</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-lg text-muted-foreground">Your watchlist is empty</p>
            <p className="text-sm text-muted-foreground mt-1">Browse anime and manga to add titles here</p>
            <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">Browse titles →</Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((item, i) => {
              const itemProgress = progress[item.id];
              const detailUrl = item.type === "manga" && item.id.includes("-")
                ? `/manga/${item.id}`
                : `/title/${item.type}/${item.id}`;

              return (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:bg-secondary/30 transition-colors"
                >
                  <Link to={detailUrl} className="shrink-0">
                    <img src={item.image} alt={item.title} className="h-20 w-14 rounded-lg object-cover" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={detailUrl}>
                      <h3 className="font-display text-sm font-semibold text-foreground hover:text-primary transition-colors truncate">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-medium">
                        {item.type}
                      </span>
                      {item.score && (
                        <span className="text-xs text-muted-foreground">⭐ {item.score}</span>
                      )}
                    </div>
                    {itemProgress && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1 flex-1 max-w-[120px] rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(itemProgress.page / itemProgress.totalPages) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          Page {itemProgress.page + 1}/{itemProgress.totalPages}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {itemProgress && (
                      <Link
                        to={`/read/${item.id}/${itemProgress.chapterId}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                        title="Resume"
                      >
                        <PlayCircle className="h-4 w-4" />
                      </Link>
                    )}
                    <button
                      onClick={() => handleRemove(item.id, item.type)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
