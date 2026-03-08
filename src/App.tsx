import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import AnimeDetail from "./pages/AnimeDetail";
import MangaDetail from "./pages/MangaDetail";
import MangaReader from "./pages/MangaReader";
import Watchlist from "./pages/Watchlist";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/title/:type/:id" element={<AnimeDetail />} />
          <Route path="/manga/:mangaId" element={<MangaDetail />} />
          <Route path="/read/:mangaId/:chapterId" element={<MangaReader />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
