export const extractSpotifyId = (url) => {
  const match = url.match(/(?:episode|playlist)\/([^?]+)/);
  return match ? match[1] : null;
};

export const isValidEpisodeUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.endsWith("spotify.com")) return false;
    const embedRegex = /^\/(episode|playlist)\/[a-zA-Z0-9]{22}$/;
    return embedRegex.test(parsedUrl.pathname);
  } catch (error) {
    return false;
  }
};

export const buildSpotifyUrl = (episode) => {
  return `https://open.spotify.com/${episode.embedType.toLowerCase()}/${
    episode.spotifyId
  }`;
};
