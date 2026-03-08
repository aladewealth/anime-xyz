import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Calendar, Film, BookOpen, Sparkles } from "lucide-react";
import { animeData, reviewsData } from "@/data/animeData";
import ReviewSection from "@/components/ReviewSection";
import AnimeCard from "@/components/AnimeCard";

const AnimeDetail = () => {
  const { id } = useParams();
  const anime = animeData.find((a) => a.id === id);

  if (!anime) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-2xl font-display font-bold text-foreground">Title not found</p>
          <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">← Back to home</Link>
        </div>
      </div>
    );
  }

  const reviews = reviewsData.filter((r) => r.animeId === anime.id);
  const recommendations = animeData
    .filter((a) => a.id !== anime.id && a.genres.some((g) => anime.genres.includes(g)))
    .slice(0, 4);

  return (
    <div className="min-h-screen pt-16">
      {/* Back nav */}
      <div className="container mx-auto px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4"
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="shrink-0"
          >
            <img
              src={anime.coverImage}
              alt={anime.title}
              className="w-full max-w-[280px] mx-auto md:mx-0 rounded-xl shadow-2xl"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 space-y-4"
          >
            <div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary text-primary-foreground uppercase tracking-wider">
                {anime.type}
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{anime.title}</h1>
            <p className="text-lg text-muted-foreground">{anime.japaneseTitle}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-semibold text-foreground">{anime.rating}</span>
                <span className="text-muted-foreground">/10</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{anime.year}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                {anime.type === "anime" ? <Film className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                <span>{anime.episodes ? `${anime.episodes} episodes` : `${anime.chapters} chapters`}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                anime.status === "Completed" ? "bg-green-500/10 text-green-500" :
                anime.status === "Ongoing" || anime.status === "Airing" ? "bg-accent/10 text-accent" :
                "bg-secondary text-secondary-foreground"
              }`}>
                {anime.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {anime.genres.map((g) => (
                <span key={g} className="px-3 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">{g}</span>
              ))}
            </div>

            {(anime.studio || anime.author) && (
              <p className="text-sm text-muted-foreground">
                {anime.studio ? `Studio: ${anime.studio}` : `Author: ${anime.author}`}
              </p>
            )}

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">Synopsis</h2>
              <p className="text-foreground/80 leading-relaxed">{anime.synopsis}</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <section className="container mx-auto px-4 mt-12">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">AI Recommendations</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Based on genres and themes similar to {anime.title}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recommendations.map((rec, i) => (
              <AnimeCard key={rec.id} anime={rec} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="container mx-auto px-4 mt-12 pb-16 max-w-2xl">
        <ReviewSection reviews={reviews} animeId={anime.id} />
      </section>
    </div>
  );
};

export default AnimeDetail;
