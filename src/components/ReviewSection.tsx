import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, Send, Trash2, SortAsc, SortDesc, MessageSquare } from "lucide-react";
import type { JikanReview } from "@/lib/jikan";
import { toast } from "sonner";

interface ReviewSectionProps {
  reviews: JikanReview[];
  animeId: number;
}

interface LocalReview {
  id: string;
  animeId: number;
  userName: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
}

const REVIEWS_KEY = "animexyz_user_reviews";

function getSavedReviews(animeId: number): LocalReview[] {
  try {
    const all: LocalReview[] = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
    return all.filter((r) => r.animeId === animeId);
  } catch {
    return [];
  }
}

function saveReview(review: LocalReview) {
  const all: LocalReview[] = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
  all.unshift(review);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
}

function deleteReview(id: string) {
  const all: LocalReview[] = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(all.filter((r) => r.id !== id)));
}

type SortBy = "newest" | "oldest" | "highest" | "lowest";

const ratingLabels: Record<number, string> = {
  1: "Appalling",
  2: "Horrible",
  3: "Very Bad",
  4: "Bad",
  5: "Average",
  6: "Fine",
  7: "Good",
  8: "Very Good",
  9: "Great",
  10: "Masterpiece",
};

const ReviewSection = ({ reviews, animeId }: ReviewSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [localReviews, setLocalReviews] = useState<LocalReview[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [expanded, setExpanded] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    setLocalReviews(getSavedReviews(animeId));
  }, [animeId]);

  const handleSubmit = () => {
    if (!newComment.trim() || newRating === 0) return;
    const review: LocalReview = {
      id: `local-${Date.now()}`,
      animeId,
      userName: "You",
      avatar: "✨",
      rating: newRating,
      comment: newComment,
      date: new Date().toISOString().split("T")[0],
      likes: 0,
    };
    saveReview(review);
    setLocalReviews([review, ...localReviews]);
    setNewComment("");
    setNewRating(0);
    toast.success("Review posted!");
  };

  const handleDelete = (id: string) => {
    deleteReview(id);
    setLocalReviews(localReviews.filter((r) => r.id !== id));
    toast("Review deleted");
  };

  const toggleExpand = (id: string | number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Combine and sort all reviews
  const allReviews = [
    ...localReviews.map((r) => ({ ...r, source: "local" as const, sortDate: r.date, sortRating: r.rating })),
    ...reviews.map((r) => ({ ...r, source: "mal" as const, sortDate: r.date, sortRating: r.score })),
  ];

  allReviews.sort((a, b) => {
    switch (sortBy) {
      case "newest": return new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime();
      case "oldest": return new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime();
      case "highest": return b.sortRating - a.sortRating;
      case "lowest": return a.sortRating - b.sortRating;
      default: return 0;
    }
  });

  const totalCount = allReviews.length;
  const avgRating = totalCount > 0
    ? (allReviews.reduce((sum, r) => sum + r.sortRating, 0) / totalCount).toFixed(1)
    : null;

  const activeRating = hoverRating || newRating;

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold text-foreground">Reviews</h2>
          {totalCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{totalCount}</span>
          )}
        </div>
        {avgRating && (
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-display text-lg font-bold text-foreground">{avgRating}</span>
            <span className="text-xs text-muted-foreground">/10 avg</span>
          </div>
        )}
      </div>

      {/* Write review */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <p className="text-sm font-medium text-foreground">Write a review</p>

        {/* 1-10 rating scale */}
        <div className="space-y-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
              <button
                key={val}
                onMouseEnter={() => setHoverRating(val)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setNewRating(val)}
                className="group relative transition-transform hover:scale-110"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    val <= activeRating
                      ? "fill-accent text-accent"
                      : "text-muted-foreground/20"
                  }`}
                />
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {activeRating > 0 && (
              <motion.div
                key={activeRating}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <span className={`text-lg font-bold font-display ${
                  activeRating >= 8 ? "text-green-500" :
                  activeRating >= 5 ? "text-accent" :
                  "text-destructive"
                }`}>
                  {activeRating}/10
                </span>
                <span className="text-xs text-muted-foreground">
                  — {ratingLabels[activeRating]}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comment input */}
        <div className="space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="What did you think? Share your experience..."
            rows={3}
            className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {newComment.length}/500
            </span>
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || newRating === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              Post Review
            </button>
          </div>
        </div>
      </div>

      {/* Sort controls */}
      {totalCount > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort by:</span>
          {([
            { key: "newest" as SortBy, label: "Newest", icon: SortDesc },
            { key: "oldest" as SortBy, label: "Oldest", icon: SortAsc },
            { key: "highest" as SortBy, label: "Highest", icon: Star },
            { key: "lowest" as SortBy, label: "Lowest", icon: Star },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                sortBy === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-3">
        <AnimatePresence>
          {allReviews.map((review, i) => {
            if (review.source === "local") {
              const r = review as LocalReview & { source: "local"; sortDate: string; sortRating: number };
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-xl border border-primary/20 bg-card p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{r.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{r.userName}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Your review</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{r.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RatingBadge rating={r.rating} />
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                        title="Delete review"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{r.comment}</p>
                </motion.div>
              );
            } else {
              const r = review as JikanReview & { source: "mal"; sortDate: string; sortRating: number };
              const isExpanded = expanded.has(r.mal_id);
              return (
                <motion.div
                  key={r.mal_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={r.user.images.jpg.image_url}
                        alt={r.user.username}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.user.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.date).toLocaleDateString()}
                          {r.tags.length > 0 && ` · ${r.tags[0]}`}
                        </p>
                      </div>
                    </div>
                    <RatingBadge rating={r.score} />
                  </div>
                  <p className={`mt-3 text-sm text-foreground/80 leading-relaxed ${isExpanded ? "" : "line-clamp-3"}`}>
                    {r.review}
                  </p>
                  {r.review.length > 200 && (
                    <button
                      onClick={() => toggleExpand(r.mal_id)}
                      className="mt-1 text-xs text-primary hover:underline"
                    >
                      {isExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{r.reactions.overall}</span>
                    </button>
                  </div>
                </motion.div>
              );
            }
          })}
        </AnimatePresence>
      </div>

      {totalCount === 0 && (
        <div className="py-8 text-center">
          <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};

// Rating badge component
function RatingBadge({ rating }: { rating: number }) {
  const color = rating >= 8
    ? "bg-green-500/10 text-green-500"
    : rating >= 5
    ? "bg-accent/10 text-accent"
    : "bg-destructive/10 text-destructive";

  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${color}`}>
      <Star className="h-3 w-3 fill-current" />
      <span className="text-sm font-bold">{rating}</span>
      <span className="text-[10px] opacity-60">/10</span>
    </div>
  );
}

export default ReviewSection;
