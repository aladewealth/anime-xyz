import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Loader2, PlayCircle } from "lucide-react";
import { getMangaDexManga, getMangaChapters, getMangaCoverUrl, type MangaDexManga, type MangaDexChapter } from "@/lib/mangadex";
import { getProgress } from "@/lib/bookmarks";
import BookmarkButton from "@/components/BookmarkButton";

const MangaDetail = () => {
  const { mangaId } = useParams<{ mangaId: string }>();
  const navigate = useNavigate();
  const [manga, setManga] = useState<MangaDexManga | null>(null);
  const [chapters, setChapters] = useState<MangaDexChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(true);

  useEffect(() => {
    if (!mangaId) return;
    setLoading(true);
    getMangaDexManga(mangaId).then((data) => {
      setManga(data);
      setLoading(false);
    });

    setChaptersLoading(true);
    getMangaChapters(mangaId).then(({ chapters }) => {
      // Deduplicate by chapter number
      const seen = new Set<string>();
      const unique = chapters.filter((ch) => {
        const num = ch.attributes.chapter || ch.id;
        if (seen.has(num)) return false;
        seen.add(num);
        return true;
      });
      setChapters(unique);
      setChaptersLoading(false);
    });
  }, [mangaId]);

  const progress = mangaId ? getProgress(mangaId) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-2xl font-display font-bold text-foreground">Manga not found</p>
          <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">← Back to home</Link>
        </div>
      </div>
    );
  }

  const title = manga.attributes.title.en || manga.attributes.title.ja || Object.values(manga.attributes.title)[0] || "Unknown";
  const description = manga.attributes.description?.en || "";
  const coverUrl = getMangaCoverUrl(manga);

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4"
      >
        <div className="flex flex-col md:flex-row gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="shrink-0"
          >
            <img src={coverUrl} alt={title} className="w-full max-w-[280px] mx-auto md:mx-0 rounded-xl shadow-2xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 space-y-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary text-primary-foreground uppercase tracking-wider">
                Manga
              </span>
              <BookmarkButton
                item={{
                  id: manga.id,
                  type: "manga",
                  title,
                  image: coverUrl,
                  score: null,
                  addedAt: new Date().toISOString(),
                }}
                size="sm"
              />
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{title}</h1>

            <div className="flex flex-wrap gap-1.5">
              {manga.attributes.tags.slice(0, 8).map((t) => (
                <span key={t.attributes.name.en} className="px-3 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                  {t.attributes.name.en}
                </span>
              ))}
            </div>

            {description && (
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-2">Synopsis</h2>
                <p className="text-foreground/80 leading-relaxed text-sm">{description}</p>
              </div>
            )}

            {/* Resume reading */}
            {progress && (
              <button
                onClick={() => navigate(`/read/${mangaId}/${progress.chapterId}`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <PlayCircle className="h-4 w-4" />
                Resume (Page {progress.page + 1}/{progress.totalPages})
              </button>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Chapters */}
      <section className="container mx-auto px-4 mt-10 pb-16">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold text-foreground">
            Chapters {!chaptersLoading && `(${chapters.length})`}
          </h2>
        </div>

        {chaptersLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : chapters.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No English chapters available</p>
        ) : (
          <div className="grid gap-1.5">
            {chapters.map((ch) => (
              <Link
                key={ch.id}
                to={`/read/${mangaId}/${ch.id}`}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors hover:bg-secondary/50 ${
                  progress?.chapterId === ch.id ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Ch. {ch.attributes.chapter || "?"}
                  </span>
                  {ch.attributes.title && (
                    <span className="text-sm text-muted-foreground hidden sm:inline">— {ch.attributes.title}</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(ch.attributes.publishAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MangaDetail;
