import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toggleBookmark, isBookmarked, type BookmarkItem } from "@/lib/bookmarks";
import { toast } from "sonner";

interface BookmarkButtonProps {
  item: BookmarkItem;
  size?: "sm" | "md";
}

const BookmarkButton = ({ item, size = "md" }: BookmarkButtonProps) => {
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(item.id, item.type));

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleBookmark(item);
    setBookmarked(added);
    toast(added ? `Added "${item.title}" to watchlist` : `Removed "${item.title}" from watchlist`, {
      duration: 2000,
    });
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const btnSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <button
      onClick={handleToggle}
      className={`${btnSize} flex items-center justify-center rounded-lg transition-all duration-200 ${
        bookmarked
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      }`}
      title={bookmarked ? "Remove from watchlist" : "Add to watchlist"}
    >
      {bookmarked ? (
        <BookmarkCheck className={iconSize} />
      ) : (
        <Bookmark className={iconSize} />
      )}
    </button>
  );
};

export default BookmarkButton;
