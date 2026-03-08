import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, X, Loader2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchAnime, type JikanAnime } from "@/lib/jikan";
import { searchMangaDex, getMangaCoverUrl, type MangaDexManga } from "@/lib/mangadex";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const SearchModal = ({ open, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JikanAnime[]>([]);
  const [mangadexResults, setMangadexResults] = useState<MangaDexManga[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<"anime" | "manga" | "read">("anime");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
      setMangadexResults([]);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
      }
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const doSearch = useCallback(
    (q: string, type: "anime" | "manga") => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!q.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const data = await searchAnime(q, type);
          setResults(data);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 400);
    },
    []
  );

  useEffect(() => {
    doSearch(query, searchType);
  }, [query, searchType, doSearch]);

  const handleSelect = (item: JikanAnime) => {
    const type = searchType;
    navigate(`/title/${type}/${item.mal_id}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg mx-4 rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Type toggle */}
            <div className="flex border-b border-border">
              {(["anime", "manga"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSearchType(t)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    searchType === t
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              {loading ? (
                <Loader2 className="h-4 w-4 text-primary shrink-0 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
              )}
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${searchType}...`}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {query.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Search across MyAnimeList's database</p>
                <p className="text-xs mt-1 opacity-60">Powered by Jikan API</p>
              </div>
            )}

            {query.length > 0 && !loading && results.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No results found for "{query}"
              </div>
            )}

            {results.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                {results.map((item) => (
                  <button
                    key={item.mal_id}
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <img
                      src={item.images.jpg.image_url}
                      alt={item.title}
                      className="h-12 w-9 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.title_japanese || ""} · {item.type || searchType} · ⭐ {item.score ?? "N/A"}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {item.genres?.slice(0, 2).map((g) => (
                        <span
                          key={g.mal_id}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
