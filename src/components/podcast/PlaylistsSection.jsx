import React from 'react';

const PlaylistsSection = ({ playlists }) => {
  if (playlists.length === 0) return null;

  return (
    <div className="mt-15">
      <p className="text-2xl font-avenir-black text-primary">
        {playlists.length === 1 ? "Check out this Fresh Playlist" : "Check out these Fresh Playlists"}
      </p>
      <div className={`mt-3 flex flex-col ${playlists.length > 1 ? "lg:grid lg:grid-cols-2" : ""} gap-7`}>
        {playlists.map((playlist, index) => (
          <iframe
            key={index}
            style={{ borderRadius: "12px" }}
            src={`https://open.spotify.com/embed/playlist/${playlist.spotifyId}?utm_source=generator`}
            width="100%"
            height={playlists.length === 1 ? "500" : "400"}
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        ))}
      </div>
    </div>
  );
};

export default PlaylistsSection;