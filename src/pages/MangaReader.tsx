import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Minus, Plus, Download, BookOpen, Maximize2, Minimize2 } from "lucide-react";
import { getChapterPages, getPageUrl, type ChapterPages } from "@/lib/mangadex";
import { saveProgress } from "@/lib/bookmarks";

const MangaReader = () => {
  const { mangaId, chapterId } = useParams<{ mangaId: string; chapterId: string }>();
  const navigate = useNavigate();
  const [pages, setPages] = useState<ChapterPages | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [textSize, setTextSize] = useState(100); // percentage
  const [quality, setQuality] = useState<"full" | "saver">("full");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!chapterId) return;
    setLoading(true);
    setCurrentPage(0);
    getChapterPages(chapterId).then((data) => {
      setPages(data);
      setLoading(false);
    });
  }, [chapterId]);

  // Save progress
  useEffect(() => {
    if (pages && mangaId && chapterId) {
      saveProgress({
        mangaId,
        chapterId,
        chapterNumber: "",
        page: currentPage,
        totalPages: pages.data.length,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [currentPage, pages, mangaId, chapterId]);

  const totalPages = pages?.data.length || 0;

  const goNext = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 0));
  }, []);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "Escape" && isFullscreen) { setIsFullscreen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, isFullscreen]);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleDownloadPage = async () => {
    if (!pages) return;
    const url = getPageUrl(pages, currentPage, quality);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `page-${currentPage + 1}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!pages || totalPages === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-xl font-display font-bold text-foreground">No pages available</p>
          <p className="text-sm text-muted-foreground mt-2">This chapter may not be available in English</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm text-primary hover:underline">← Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background pt-16 flex flex-col"
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      {/* Top bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border"
          >
            <div className="container mx-auto px-4 py-2 flex items-center justify-between">
              <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              <div className="flex items-center gap-3">
                {/* Text/Image size */}
                <div className="flex items-center gap-1 bg-secondary rounded-lg px-2 py-1">
                  <button onClick={() => setTextSize(Math.max(50, textSize - 10))} className="text-muted-foreground hover:text-foreground">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs font-medium text-foreground w-10 text-center">{textSize}%</span>
                  <button onClick={() => setTextSize(Math.min(200, textSize + 10))} className="text-muted-foreground hover:text-foreground">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Quality toggle */}
                <button
                  onClick={() => setQuality(quality === "full" ? "saver" : "full")}
                  className="text-xs px-2 py-1 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  {quality === "full" ? "HD" : "SD"}
                </button>

                {/* Download */}
                <button onClick={handleDownloadPage} className="text-muted-foreground hover:text-foreground" title="Download page">
                  <Download className="h-4 w-4" />
                </button>

                {/* Fullscreen */}
                <button onClick={toggleFullscreen} className="text-muted-foreground hover:text-foreground">
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page viewer */}
      <div className="flex-1 flex items-center justify-center relative select-none mt-12">
        {/* Prev/Next click zones */}
        <button
          onClick={goPrev}
          disabled={currentPage === 0}
          className="absolute left-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer disabled:cursor-default group"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft className="h-8 w-8 text-foreground/50" />
          </div>
        </button>

        <button
          onClick={goNext}
          disabled={currentPage >= totalPages - 1}
          className="absolute right-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer disabled:cursor-default group"
        >
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="h-8 w-8 text-foreground/50" />
          </div>
        </button>

        <AnimatePresence mode="wait">
          <motion.img
            key={currentPage}
            src={getPageUrl(pages, currentPage, quality)}
            alt={`Page ${currentPage + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-h-[calc(100vh-10rem)] object-contain"
            style={{ width: `${textSize}%`, maxWidth: "100%" }}
            draggable={false}
          />
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-sm border-t border-border"
          >
            <div className="container mx-auto px-4 py-3">
              {/* Page slider */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-mono w-8 text-right">{currentPage + 1}</span>
                <input
                  type="range"
                  min={0}
                  max={totalPages - 1}
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className="flex-1 h-1 appearance-none bg-secondary rounded-full accent-primary cursor-pointer"
                />
                <span className="text-xs text-muted-foreground font-mono w-8">{totalPages}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MangaReader;
