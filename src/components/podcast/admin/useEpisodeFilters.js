import { useMemo } from "react";

export const useEpisodeFilters = (
  episodes,
  embedTypeFilter,
  searchQuery,
  sortOrder
) => {

  const stats = useMemo(() => ({
    total: episodes.length,
    episodes: episodes.filter((ep) => ep.embedType === "EPISODE").length,
    playlists: episodes.filter((ep) => ep.embedType === "PLAYLIST").length,
  }), [episodes]);

  const filteredEpisodes = useMemo(() => {
    return episodes
      .filter((ep) => {
        // Filter by type
        if (embedTypeFilter === "Episodes" && ep.embedType !== "EPISODE") {
          return false;
        }
        if (embedTypeFilter === "Playlists" && ep.embedType !== "PLAYLIST") {
          return false;
        }

        // Filter by search query
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          return (
            ep.spotifyId.toLowerCase().includes(searchLower) ||
            (ep.createdBy && ep.createdBy.toLowerCase().includes(searchLower)) ||
            ep.embedType.toLowerCase().includes(searchLower)
          );
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [episodes, embedTypeFilter, searchQuery, sortOrder]);

  return {
    filteredEpisodes,
    stats,
  };
};