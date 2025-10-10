import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Button from "./Button";

const EpisodeFormModal = ({
  open,
  onClose,
  onSubmit,
  episodeDetails,
  onChange,
  filterType,
}) => {
  const isEditing = episodeDetails.episodeId !== null;

  const getTitle = () => {
    if (filterType === "Episodes") {
      return isEditing ? "Edit Spotify Episode" : "Add Spotify Episode";
    } else if (filterType === "Playlists") {
      return isEditing ? "Edit Spotify Playlist" : "Add Spotify Playlist";
    }
    return isEditing ? "Edit Spotify Link" : "Add Spotify Link";
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent>
        <div className="text-sm p-1 font-semibold mt-2">
          Spotify Link<span className="text-primary">*</span>
        </div>
        <input
          type="text"
          name="spotifyUrl"
          value={episodeDetails.spotifyId}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://open.spotify.com/episode/..."
          className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          autoFocus
        />
        <p className="text-xs text-gray-500 mt-2">
          Paste the full Spotify episode or playlist URL
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="secondary">
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="primary">
          {isEditing ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EpisodeFormModal;
