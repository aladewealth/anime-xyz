export default function TrailerEmbed({ id }: { id: string }) {
  return (
    <iframe
      width="100%"
      height="400"
      src={`https://www.youtube.com/embed/${id}`}
      allowFullScreen
      title="Anime trailer"
    />
  );
}
