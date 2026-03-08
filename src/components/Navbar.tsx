import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Moon, Sun, Menu, X, Bookmark, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SearchModal from "./SearchModal";

const Navbar = () => {
  const [isDark, setIsDark] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="font-display text-xl font-bold tracking-tight">
            <span className="text-gradient">ANiMe</span>
            <span className="text-muted-foreground">.xyz</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/?filter=anime" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Anime</Link>
            <Link to="/?filter=manga" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Manga</Link>
            <Link to="/watchlist" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Bookmark className="h-3.5 w-3.5" /> Watchlist
            </Link>
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/watchlist"
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <Bookmark className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsDark(!isDark)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-border/50"
            >
              <div className="container mx-auto flex flex-col gap-2 px-4 py-4">
                <Link to="/" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-muted-foreground py-2">Home</Link>
                <Link to="/?filter=anime" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-muted-foreground py-2">Anime</Link>
                <Link to="/?filter=manga" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-muted-foreground py-2">Manga</Link>
                <Link to="/watchlist" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-muted-foreground py-2 flex items-center gap-1">
                  <Bookmark className="h-3.5 w-3.5" /> Watchlist
                </Link>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-muted-foreground py-2 flex items-center gap-1">
                  <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
