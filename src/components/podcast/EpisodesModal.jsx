import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpotifyEmbed from '../careers/SpotifyEmbed';

const EpisodesModal = ({
  showModal,
  setShowModal,
  isLoadingAllEpisodes,
  sortedAllEpisodes,
  sortOrder,
  toggleSortOrder
}) => {
  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[88vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-8 py-6 flex justify-between items-center z-10">
              <div>
                <h2 className="text-3xl font-avenir-black text-gray-900 tracking-tight">
                  All Episodes
                </h2>
                {!isLoadingAllEpisodes && sortedAllEpisodes.length > 0 && (
                  <p className="text-gray-500 text-sm font-avenir-medium mt-1">
                    {sortedAllEpisodes.length}{" "}
                    {sortedAllEpisodes.length === 1 ? "episode" : "episodes"}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSortOrder}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 text-sm font-avenir-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {sortOrder === "latest" ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    )}
                  </svg>
                  {sortOrder === "latest" ? "Newest" : "Oldest"}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* MODAL CONTENT */}
            <div className="overflow-y-auto px-8 py-6 bg-white" style={{ maxHeight: "calc(88vh - 100px)" }}>
              {isLoadingAllEpisodes ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="animate-pulse">
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex gap-6">
                          <div className="flex-shrink-0 w-28 h-28 bg-gray-200 rounded-xl"></div>
                          <div className="flex-1 space-y-3">
                            <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded-lg w-1/3"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedAllEpisodes.length > 0 ? (
                <div className="space-y-3">
                  {sortedAllEpisodes.map(({ spotifyId, embedType, episode_id, spotify_id, created_at, createdAt }, index) => (
                    <motion.div
                      key={episode_id || spotify_id || spotifyId || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="group"
                    >
                      <div className="bg-gray-50/50 hover:bg-gray-50 rounded-2xl p-6 transition-all duration-300 border border-transparent hover:border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-avenir-black text-gray-400 tracking-wider">
                              EP. {String(index + 1).padStart(2, "0")}
                            </span>
                            {(created_at || createdAt) && (
                              <>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="text-xs text-gray-500 font-avenir-medium">
                                  {new Date(created_at || createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="relative overflow-hidden rounded-xl">
                          <SpotifyEmbed spotifyId={spotifyId || spotify_id} embedType={embedType || "EPISODE"} index={index} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-avenir-black text-gray-900 mb-2">No episodes available</h3>
                  <p className="text-gray-500 text-sm font-avenir-medium">New episodes will appear here</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EpisodesModal;