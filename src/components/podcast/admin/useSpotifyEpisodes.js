import { useState, useEffect } from "react";
import api from "../../../utils/axios";
import toast from "react-hot-toast";

export const useSpotifyEpisodes = () => {
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataUpdated, setDataUpdated] = useState(false);

  const fetchEpisodes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/spotify/");
      setEpisodes(response.data.data);
    } catch (err) {
      console.error("Unable to fetch Spotify Episodes", err);
      toast.error("Failed to load episodes");
    } finally {
      setIsLoading(false);
    }
  };

  const addEpisode = async (url, userId) => {
    try {
      const response = await api.post("/api/spotify/", { url, userId });
      toast.success(response.data.message);
      setDataUpdated((prev) => !prev);
      return { success: true };
    } catch (err) {
      console.error("Error adding episode:", err);
      toast.error("An error occurred. Please try again.");
      return { success: false, error: err };
    }
  };

  const updateEpisode = async (episodeId, url, userId) => {
    try {
      const response = await api.put(`/api/spotify/${episodeId}`, {
        episodeId,
        url,
        userId,
      });
      toast.success(response.data.message);
      setDataUpdated((prev) => !prev);
      return { success: true };
    } catch (err) {
      console.error("Error updating episode:", err);
      toast.error("An error occurred. Please try again.");
      return { success: false, error: err };
    }
  };

  const deleteEpisode = async (episodeId, userId) => {
    try {
      const response = await api.delete(`/api/spotify/${episodeId}`, {
        data: { episodeId, userId },
      });
      toast.success(response.data.message);
      setDataUpdated((prev) => !prev);
      return { success: true };
    } catch (err) {
      console.error("Unable to delete spotify link", err);
      toast.error("Unable to delete spotify link");
      return { success: false, error: err };
    }
  };

  // Fetch episodes on mount and when data is updated
  useEffect(() => {
    fetchEpisodes();
  }, [dataUpdated]);

  return {
    episodes,
    isLoading,
    addEpisode,
    updateEpisode,
    deleteEpisode,
    refreshEpisodes: () => setDataUpdated((prev) => !prev),
  };
};
