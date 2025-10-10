import React from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SpotifyEmbed from "./SpotifyEmbed";
import Button from "./Button";
import formatTimestamp from "../../../utils/formatTimestamp";

const EpisodeCard = ({
  episode,
  onPreview,
  onEdit,
  onDelete,
  compact = false,
}) => {
  return (
    <div
      className={`group relative overflow-hidden transition-all duration-300 ${
        compact
          ? "flex items-center justify-between px-6 py-4 bg-white border border-gray-200 hover:border-primary/30 hover:bg-gradient-to-r hover:from-white hover:to-primary/5 rounded-xl"
          : "flex flex-col gap-6 bg-gradient-to-br from-white via-white to-gray-50 p-6 mx-4 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100"
      }`}
    >
      {/* Subtle gradient overlay for depth */}
      {!compact && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
      )}

      {/* === CARD VIEW (with embed) === */}
      {!compact && (
        <div className="relative flex-1 rounded-xl overflow-hidden shadow-md ring-1 ring-gray-200/50 group-hover:ring-primary/30 transition-all duration-300">
          <SpotifyEmbed
            spotifyId={episode.spotifyId}
            embedType={episode.embedType}
          />
        </div>
      )}

      {/* === DETAILS + ACTIONS === */}
      <div
        className={`relative flex w-full ${
          compact
            ? "flex-row items-center justify-between gap-6"
            : "flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
        }`}
      >
        {/* INFO SECTION */}
        <div
          className={`${
            compact
              ? "flex items-center gap-4 text-sm text-gray-700"
              : "flex flex-col gap-3 text-sm text-gray-600"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm shrink-0 hover:shadow-md transition-shadow">
              {episode.embedType}
            </span>
            
            {compact && (
              <div className="h-4 w-px bg-gray-300" />
            )}
          </div>

          {compact ? (
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="font-semibold text-gray-900 truncate max-w-[200px]">
                  {episode.createdBy ?? "N/A"}
                </span>
              </div>
              <span className="text-gray-500 text-xs font-medium whitespace-nowrap">
                {formatTimestamp(episode.createdAt ?? "N/A").fullDate}
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">Created by:</span>
                <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                  {episode.createdBy ?? "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">Date:</span>
                <span className="font-semibold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                  {formatTimestamp(episode.createdAt ?? "N/A").fullDate}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div
          className={`flex flex-wrap items-center gap-2 ${
            compact ? "justify-end" : ""
          }`}
        >
          <Button
            onClick={() => onPreview(episode)}
            variant={compact ? "ghost" : "secondary"}
            icon={<EyeIcon className="h-5 w-5" />}
            className={compact ? "hover:scale-105 transition-transform" : ""}
          >
            {!compact && "Preview"}
          </Button>
          <Button
            onClick={() => onEdit(episode)}
            variant={compact ? "ghost" : "primary"}
            icon={<EditIcon className="text-lg" />}
            className={compact ? "hover:scale-105 transition-transform" : ""}
          >
            {!compact && "Edit"}
          </Button>
          <Button
            onClick={() => onDelete(episode.episodeId)}
            variant={compact ? "ghost" : "danger"}
            icon={<DeleteIcon className="text-lg" />}
            className={compact ? "hover:scale-105 transition-transform" : ""}
          >
            {!compact && "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EpisodeCard;