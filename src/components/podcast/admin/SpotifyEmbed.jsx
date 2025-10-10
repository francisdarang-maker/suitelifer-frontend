import React from "react";

const SpotifyEmbed = ({ spotifyId, embedType, height = 352 }) => (
  <div className="relative w-full rounded-lg overflow-hidden">
    <iframe
      src={`https://open.spotify.com/embed/${embedType.toLowerCase()}/${spotifyId}?utm_source=generator`}
      width="100%"
      height={height}
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="w-full"
      title={`Spotify ${embedType}`}
    />
  </div>
);

export default SpotifyEmbed;