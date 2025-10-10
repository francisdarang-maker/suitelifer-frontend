import React from 'react';
import SpotifyEmbed from '../careers/SpotifyEmbed';

const EpisodesGrid = ({ spotifyEpisodes }) => {
  return (
    <section className="mt-3">
      {/* Mobile View */}
      <div className="sm:hidden">
        {spotifyEpisodes.map(({ spotifyId, embedType }, index) => (
          <div className="p-1" key={index}>
            <SpotifyEmbed spotifyId={spotifyId} embedType={embedType} index={index + 1} />
          </div>
        ))}
      </div>

      {/* Desktop View */}
      {spotifyEpisodes.length === 1 ? (
        <div className="hidden sm:flex gap-7">
          <div className="w-full">
            <SpotifyEmbed spotifyId={spotifyEpisodes[0].spotifyId} embedType={spotifyEpisodes[0].embedType} index={0} />
          </div>
        </div>
      ) : spotifyEpisodes.length === 2 ? (
        <div className="hidden sm:flex gap-7">
          {spotifyEpisodes.slice(0, 2).map(({ spotifyId, embedType }, index) => (
            <div className="w-1/2" key={index + 1}>
              <SpotifyEmbed spotifyId={spotifyId} embedType={embedType} index={index + 1} />
            </div>
          ))}
        </div>
      ) : (
        <div className="hidden sm:flex gap-7">
          <div className="w-1/2">
            <SpotifyEmbed spotifyId={spotifyEpisodes[0].spotifyId} embedType={spotifyEpisodes[0].embedType} index={0} />
          </div>
          <div className="w-1/2 flex flex-col justify-center gap-7">
            {spotifyEpisodes.slice(1, 3).map(({ spotifyId, embedType }, index) => (
              <SpotifyEmbed key={index + 1} spotifyId={spotifyId} embedType={embedType} index={index + 1} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default EpisodesGrid;