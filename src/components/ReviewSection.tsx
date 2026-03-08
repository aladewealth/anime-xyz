import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, Send } from "lucide-react";
import type { Review } from "@/data/animeData";

interface ReviewSectionProps {
  reviews: Review[];
  animeId: string;
}

const ReviewSection = ({ reviews, animeId }: ReviewSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [localReviews, setLocalReviews] = useState(reviews);

  const handleSubmit = () => {
    if (!newComment.trim() || newRating === 0) return;
    const review: Review = {
      id: `r-${Date.now()}`,
      animeId,
      userName: "Anonymous",
      avatar: "✨",
      rating: newRating,
      comment: newComment,
      date: new Date().toISOString().split("T")[0],
      likes: 0,
    };
    setLocalReviews([review, ...localReviews]);
    setNewComment("");
    setNewRating(0);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-semibold text-foreground">Reviews</h2>

      {/* Write review */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setNewRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-5 w-5 ${
                  star <= (hoverRating || newRating)
                    ? "fill-accent text-accent"
                    : "text-muted-foreground/30"
                } transition-colors`}
              />
            </button>
          ))}
          {newRating > 0 && (
            <span className="text-sm text-muted-foreground ml-2">{newRating * 2}/10</span>
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Share your thoughts..."
            className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim() || newRating === 0}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {localReviews.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{review.avatar}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{review.userName}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                <span className="text-sm font-semibold text-foreground">{review.rating}</span>
                <span className="text-xs text-muted-foreground">/10</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
            <button className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ThumbsUp className="h-3 w-3" />
              <span>{review.likes}</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
