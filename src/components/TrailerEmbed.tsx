import { Play, ExternalLink } from "lucide-react";

interface TrailerEmbedProps {
  youtubeId: string | null;
  embedUrl: string | null;
  streaming?: { name: string; url: string }[];
  title: string;
}

const streamingIcons: Record<string, string> = {
  Crunchyroll: "🍥",
  Netflix: "🎬",
  Funimation: "📺",
  "Amazon Prime Video": "📦",
  "Disney Plus": "✨",
  Hulu: "💚",
  "HBO Max": "🎭",
  "HIDIVE": "📡",
};

const TrailerEmbed = ({ youtubeId, embedUrl, streaming, title }: TrailerEmbedProps) => {
  if (!youtubeId && (!streaming || streaming.length === 0)) return null;

  return (
    <div className="space-y-4">
      {/* Trailer */}
      {youtubeId && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Play className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">Trailer</h2>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-secondary">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={`${title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      )}

      {/* Streaming links */}
      {streaming && streaming.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ExternalLink className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-semibold text-foreground">Watch on</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {streaming.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
              >
                <span>{streamingIcons[s.name] || "📺"}</span>
                {s.name}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrailerEmbed;
