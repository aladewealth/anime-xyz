import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Calendar, Film, BookOpen, Sparkles, Loader2, Users } from "lucide-react";
import { getAnimeById, getAnimeReviews, getRecommendations, type JikanAnime, type JikanReview } from "@/lib/jikan";
import ReviewSection from "@/components/ReviewSection";
import AnimeCard from "@/components/AnimeCard";

const AnimeDetail = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [anime, setAnime] = useState<JikanAnime | null>(null);
  const [reviews, setReviews] = useState<JikanReview[]>([]);
  const [recommendations, setRecommendations] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);

  const mediaType = (type === "manga" ? "manga" : "anime") as "anime" | "manga";
  const malId = Number(id);

  useEffect(() => {
    if (!malId) return;
    setLoading(true);
    setAnime(null);
    setReviews([]);
    setRecommendations([]);

    getAnimeById(malId, mediaType).then((data) => {
      setAnime(data);
      setLoading(false);
    });

    // Fetch reviews and recommendations with slight delays for rate limiting
    setTimeout(() => {
      getAnimeReviews(malId, mediaType).then(setReviews);
    }, 400);
    setTimeout(() => {
      getRecommendations(malId, mediaType).then(setRecommendations);
    }, 800);
  }, [malId, mediaType]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

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

  const studioOrAuthor = mediaType === "anime"
    ? anime.studios?.map((s) => s.name).join(", ")
    : anime.authors?.map((a) => a.name).join(", ");

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
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4"
      >
        <div className="flex flex-col md:flex-row gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="shrink-0"
          >
            <img
              src={anime.images.jpg.large_image_url}
              alt={anime.title}
              className="w-full max-w-[280px] mx-auto md:mx-0 rounded-xl shadow-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 space-y-4"
          >
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary text-primary-foreground uppercase tracking-wider">
              {anime.type || mediaType}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{anime.title}</h1>
            {anime.title_japanese && (
              <p className="text-lg text-muted-foreground">{anime.title_japanese}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm">
              {anime.score && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-semibold text-foreground">{anime.score}</span>
                  <span className="text-muted-foreground">/10</span>
                  {anime.scored_by && (
                    <span className="text-muted-foreground flex items-center gap-0.5 ml-1">
                      <Users className="h-3 w-3" />
                      {(anime.scored_by / 1000).toFixed(0)}k
                    </span>
                  )}
                </div>
              )}
              {anime.year && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{anime.year}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-muted-foreground">
                {mediaType === "anime" ? <Film className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                <span>
                  {anime.episodes ? `${anime.episodes} episodes` : anime.chapters ? `${anime.chapters} chapters` : "Ongoing"}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                anime.status?.includes("Complete") || anime.status?.includes("Finished")
                  ? "bg-green-500/10 text-green-500"
                  : "bg-accent/10 text-accent"
              }`}>
                {anime.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {anime.genres?.map((g) => (
                <span key={g.mal_id} className="px-3 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">{g.name}</span>
              ))}
            </div>

            {studioOrAuthor && (
              <p className="text-sm text-muted-foreground">
                {mediaType === "anime" ? "Studio" : "Author"}: {studioOrAuthor}
              </p>
            )}

            {anime.synopsis && (
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-2">Synopsis</h2>
                <p className="text-foreground/80 leading-relaxed">{anime.synopsis}</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <section className="container mx-auto px-4 mt-12">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">Recommendations</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">If you liked {anime.title}, you might also enjoy...</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {recommendations.map((rec, i) => (
              <AnimeCard key={rec.mal_id} anime={rec} index={i} type={mediaType} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="container mx-auto px-4 mt-12 pb-16 max-w-2xl">
        <ReviewSection reviews={reviews} animeId={malId} />
      </section>
    </div>
  );
};

export default AnimeDetail;
