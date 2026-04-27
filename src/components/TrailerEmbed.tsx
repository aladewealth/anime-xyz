import { Play, ExternalLink } from "lucide-react";

interface TrailerEmbedProps {
  youtubeId: string | null;
  embedUrl: string | null;
  streaming?: { name: string; url: string }[];
  title: string;
}

const TrailerEmbed = ({ youtubeId, embedUrl, streaming, title }: TrailerEmbedProps) => {
  if (!youtubeId && (!streaming || streaming.length === 0)) return null;

  return (
    <div className="space-y-4">
      {youtubeId && (
        <div className="relative aspect-video rounded-xl overflow-hidden border">
          <iframe
            src={embedUrl || `https://www.youtube.com/embed/${youtubeId}`}
            title={`${title} trailer`}
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      )}

      {streaming && streaming.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {streaming.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">
              {s.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrailerEmbed;
