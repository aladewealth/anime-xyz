import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Tv, Star, Clock, TrendingUp, ArrowRight, Bookmark } from "lucide-react";
import { getBookmarks, getAllProgress, type BookmarkItem, type ReadingProgress } from "@/lib/bookmarks";
import { getRecommendations, type JikanAnime } from "@/lib/jikan";

const Dashboard = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [progress, setProgress] = useState<Record<string, ReadingProgress>>({});
  const [recommendations, setRecommendations] = useState<JikanAnime[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    const bm = getBookmarks();
    const pg = getAllProgress();
    setBookmarks(bm);
    setProgress(pg);

    // Fetch recommendations based on first bookmarked anime
    const firstAnime = bm.find((b) => b.type === "anime");
    if (firstAnime) {
      setLoadingRecs(true);
      getRecommendations(Number(firstAnime.id), "anime")
        .then((recs) => setRecommendations(recs.slice(0, 6)))
        .finally(() => setLoadingRecs(false));
    }
  }, []);

  const animeBookmarks = bookmarks.filter((b) => b.type === "anime");
  const mangaBookmarks = bookmarks.filter((b) => b.type === "manga");
  const recentReads = Object.entries(progress)
    .map(([id, p]) => ({ id, ...p }))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const stats = [
    { label: "Anime Saved", value: animeBookmarks.length, icon: Tv, color: "text-primary" },
    { label: "Manga Saved", value: mangaBookmarks.length, icon: BookOpen, color: "text-accent" },
    { label: "Chapters Read", value: Object.keys(progress).length, icon: Clock, color: "text-muted-foreground" },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Your anime &amp; manga at a glance</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-4 mb-10"
        >
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 flex flex-col items-center gap-2">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <span className="font-display text-2xl font-bold text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Watchlist Preview */}
        <Section title="Watchlist" icon={Bookmark} linkTo="/watchlist" delay={0.1}>
          {bookmarks.length === 0 ? (
            <EmptyState text="No bookmarks yet. Browse and save titles!" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {bookmarks.slice(0, 6).map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  to={item.type === "anime" ? `/title/anime/${item.id}` : `/manga/${item.id}`}
                  className="group"
                >
                  <div className="aspect-[3/4] rounded-lg overflow-hidden border border-border bg-muted relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {item.score && (
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-md bg-background/80 backdrop-blur-sm px-1.5 py-0.5 text-xs font-medium text-foreground">
                        <Star className="h-3 w-3 text-accent fill-accent" />
                        {item.score}
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Section>

        {/* Recent Reads */}
        <Section title="Recent Reads" icon={BookOpen} delay={0.15}>
          {recentReads.length === 0 ? (
            <EmptyState text="Start reading manga to track your progress here." />
          ) : (
            <div className="space-y-3">
              {recentReads.map((r) => {
                const pct = r.totalPages > 0 ? Math.round((r.page / r.totalPages) * 100) : 0;
                return (
                  <Link
                    key={r.id}
                    to={`/read/${r.mangaId}/${r.chapterId}`}
                    className="flex items-center gap-4 rounded-lg border border-border bg-card p-3 hover:bg-muted/50 transition-colors group"
                  >
                    <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        Chapter {r.chapterNumber}
                      </p>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
                  </Link>
                );
              })}
            </div>
          )}
        </Section>

        {/* Recommendations */}
        <Section title="Recommended" icon={TrendingUp} delay={0.2}>
          {loadingRecs ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <EmptyState text="Save some anime to get personalized recommendations." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {recommendations.map((rec) => (
                <Link
                  key={rec.mal_id}
                  to={`/title/anime/${rec.mal_id}`}
                  className="group"
                >
                  <div className="aspect-[3/4] rounded-lg overflow-hidden border border-border bg-muted">
                    <img
                      src={rec.images?.jpg?.large_image_url || rec.images?.jpg?.image_url || "/placeholder.svg"}
                      alt={rec.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {rec.title}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

function Section({
  title,
  icon: Icon,
  linkTo,
  delay = 0,
  children,
}: {
  title: string;
  icon: React.ElementType;
  linkTo?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mb-10"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
        </div>
        {linkTo && (
          <Link to={linkTo} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {children}
    </motion.section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export default Dashboard;
