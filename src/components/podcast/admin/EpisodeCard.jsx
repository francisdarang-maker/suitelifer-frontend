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
          ? "flex items-center justify-between px-6 py-4 bg-white border-l-4 border-[#0495b5] hover:border-[#0495b5]/80 hover:bg-gradient-to-r hover:from-white hover:to-[#0495b5]/5 rounded-r-xl shadow-sm hover:shadow-md"
          : "flex flex-col bg-gradient-to-br from-white via-gray-50/50 to-[#0495b5]/10 p-6 mx-4 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200/60 hover:border-[#0495b5]/30"
      }`}
    >
      {/* Geometric accent elements */}
      {!compact && (
        <>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#0495b5]/10 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-[#0495b5]/5 to-transparent rounded-tr-full" />
        </>
      )}

      {/* === CARD VIEW (with embed) === */}
      {!compact && (
        <div className="relative flex-1 rounded-xl overflow-hidden shadow-lg ring-1 ring-gray-200/40 group-hover:ring-[#0495b5]/20 transition-all duration-300 transform group-hover:scale-[1.02]">
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
            : "flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pt-4"
        }`}
      >
        {/* INFO SECTION */}
        <div
          className={`${
            compact
              ? "flex items-center gap-4 text-sm text-gray-700"
              : "flex flex-col gap-4 text-sm text-gray-600 flex-1 min-w-0"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-gradient-to-r from-[#0495b5] to-[#0495b5]/90 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              {episode.embedType}
            </span>
            
            {compact && (
              <div className="h-4 w-px bg-gray-300/60" />
            )}
          </div>

          {compact ? (
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="flex items-center gap-2 bg-gray-100/80 px-3 py-1.5 rounded-lg">
                <div className="w-2 h-2 bg-[#0495b5] rounded-full animate-pulse" />
                <span className="font-semibold text-gray-900 truncate max-w-[180px]">
                  {episode.createdBy ?? "N/A"}
                </span>
              </div>
              <span className="text-gray-500 text-xs font-medium whitespace-nowrap bg-white px-3 py-1.5 rounded-lg border border-gray-200/60">
                {formatTimestamp(episode.createdAt ?? "N/A").fullDate}
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
              <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-xl border border-gray-200/60 shadow-sm">
                <span className="text-gray-500 font-medium">Created by:</span>
                <span className="font-bold text-gray-900">
                  {episode.createdBy ?? "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[#0495b5]/10 px-4 py-2 rounded-xl border border-[#0495b5]/20 shadow-sm">
                <span className="text-gray-600 font-medium">Date:</span>
                <span className="font-semibold text-[#0495b5]">
                  {formatTimestamp(episode.createdAt ?? "N/A").fullDate}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div
          className={`flex flex-wrap items-center gap-2 ${
            compact ? "justify-end" : "lg:justify-end"
          }`}
        >
          <Button
            onClick={() => onPreview(episode)}
            variant={compact ? "ghost" : "secondary"}
            icon={<EyeIcon className="h-5 w-5" />}
            className={`transition-all duration-200 ${
              compact 
                ? "hover:scale-105 hover:text-[#0495b5] hover:bg-[#0495b5]/10" 
                : "hover:shadow-md"
            }`}
          >
            {!compact && "Preview"}
          </Button>
          <Button
            onClick={() => onEdit(episode)}
            variant={compact ? "ghost" : "primary"}
            icon={<EditIcon className="text-lg" />}
            className={`transition-all duration-200 ${
              compact 
                ? "hover:scale-105 hover:text-[#0495b5] hover:bg-[#0495b5]/10" 
                : "bg-gradient-to-r from-[#0495b5] to-[#0495b5]/90 hover:from-[#0495b5] hover:to-[#0495b5] hover:shadow-lg"
            }`}
          >
            {!compact && "Edit"}
          </Button>
          <Button
            onClick={() => onDelete(episode.episodeId)}
            variant={compact ? "ghost" : "danger"}
            icon={<DeleteIcon className="text-lg" />}
            className={`transition-all duration-200 ${
              compact 
                ? "hover:scale-105 hover:text-red-600 hover:bg-red-50" 
                : "hover:shadow-md"
            }`}
          >
            {!compact && "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EpisodeCard;