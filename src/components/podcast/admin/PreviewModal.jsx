import React from "react";
import SpotifyEmbed from "./SpotifyEmbed";
import Modal from "./Button";
import formatTimestamp from "../../../utils/formatTimestamp";

const PreviewModal = ({ open, onClose, episode }) => {
  if (!open || !episode) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close preview"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <SpotifyEmbed
            spotifyId={episode.spotifyId}
            embedType={episode.embedType}
          />

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <InfoRow label="Type:">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                {episode.embedType}
              </span>
            </InfoRow>
            
            <InfoRow label="Created by:">
              <span className="text-sm font-semibold text-gray-900">
                {episode.createdBy || "N/A"}
              </span>
            </InfoRow>
            
            <InfoRow label="Date created:">
              <span className="text-sm font-semibold text-gray-900">
                {formatTimestamp(episode.createdAt || "N/A").fullDate}
              </span>
            </InfoRow>
            
            <InfoRow label="Spotify ID:">
              <span className="text-xs font-mono text-gray-700 bg-white px-2 py-1 rounded">
                {episode.spotifyId}
              </span>
            </InfoRow>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Helper component for info rows
 */
const InfoRow = ({ label, children }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    {children}
  </div>
);

export default PreviewModal;