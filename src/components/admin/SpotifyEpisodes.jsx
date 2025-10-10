import { useState, useEffect, useCallback } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useStore } from "../../store/authStore";
import { useAddAuditLog } from "../../components/admin/UseAddAuditLog";
import { useSpotifyEpisodes } from "../../components/podcast/admin/useSpotifyEpisodes";
import { useEpisodeFilters } from "../../components/podcast/admin/useEpisodeFilters";
import {
  extractSpotifyId,
  isValidEpisodeUrl,
  buildSpotifyUrl,
} from "../../components/podcast/admin/spotifyHelpers";

// UI Components
import FilterButtons from "../../components/podcast/admin/FilterButtons";
import LoadingSpinner from "../../components/podcast/admin/LoadingSpinner";
import EmptyState from "../../components/podcast/admin/EmptyState";
import ConfirmationDialog from "../../components/podcast/admin/ConfirmationDialog";

// Spotify Components
import StatisticsSection from "../../components/podcast/admin/StatisticsSection";
import SearchAndActionsBar from "../../components/podcast/admin/SearchAndActionBar";
import ActiveFilters from "../../components/podcast/admin/ActiveFilters";
import EpisodeCard from "../../components/podcast/admin/EpisodeCard";
import PreviewModal from "../../components/podcast/admin/PreviewModal";
import EpisodeFormModal from "../../components/podcast/admin/EpisodeFormModal";
import ErrorModal from "../../components/podcast/admin/ErrorModal";

// New Feature Components
import BulkActionsBar from "../../components/podcast/admin/BulkActionsBar";
import BatchImportModal from "../../components/podcast/admin/BatchImportModal";
import ToastNotification from "../../components/podcast/admin/ToastNotification";
import ViewModeToggle from "../../components/podcast/admin/ViewModeToggle";
import KeyboardShortcutsHelper from "../../components/podcast/admin/KeyboardShortcutsHelper";
import Pagination from "../../components/podcast/admin/Pagination";

const SpotifyEpisodes = () => {
  const addLog = useAddAuditLog();
  const user = useStore((state) => state.user);

  // Custom hooks
  const { episodes, isLoading, addEpisode, updateEpisode, deleteEpisode } =
    useSpotifyEpisodes();

  // State management
  const [embedTypeFilter, setEmbedTypeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState(null);
  const [previewModal, setPreviewModal] = useState({
    open: false,
    episode: null,
  });
  const [episodeDetails, setEpisodeDetails] = useState({
    episodeId: null,
    spotifyId: "",
  });

  // NEW: Bulk operations state
  const [selectedEpisodes, setSelectedEpisodes] = useState([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  // NEW: Batch import state
  const [batchImportOpen, setBatchImportOpen] = useState(false);

  // NEW: Toast notification state
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
    action: null,
  });

  // NEW: View mode state
  const [viewMode, setViewMode] = useState("card"); // 'card' or 'compact'

  // NEW: Keyboard shortcuts helper state
  const [showShortcuts, setShowShortcuts] = useState(false);

  // NEW: Recently deleted (undo functionality)
  const [recentlyDeleted, setRecentlyDeleted] = useState(null);

  // NEW: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Use filter hook
  const { filteredEpisodes, stats } = useEpisodeFilters(
    episodes,
    embedTypeFilter,
    searchQuery,
    sortOrder
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredEpisodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEpisodes = filteredEpisodes.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, embedTypeFilter, sortOrder]);

  // NEW: Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + K for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("episode-search")?.focus();
      }
      // Ctrl/Cmd + N for new episode
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        openAddModal();
      }
      // Ctrl/Cmd + / for shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setShowShortcuts(true);
      }
      // Escape to clear selection
      if (e.key === "Escape" && selectedEpisodes.length > 0) {
        setSelectedEpisodes([]);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedEpisodes]);

  // NEW: Auto-clear toast
  useEffect(() => {
    if (toast.open) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, open: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.open]);

  // NEW: Bulk selection handlers
  const toggleSelectEpisode = (episodeId) => {
    setSelectedEpisodes((prev) =>
      prev.includes(episodeId)
        ? prev.filter((id) => id !== episodeId)
        : [...prev, episodeId]
    );
  };

  const selectAllEpisodes = () => {
    setSelectedEpisodes(filteredEpisodes.map((ep) => ep.episodeId));
  };

  const clearSelection = () => {
    setSelectedEpisodes([]);
  };

  const toggleSelectAll = () => {
    if (selectedEpisodes.length === filteredEpisodes.length) {
      clearSelection();
    } else {
      selectAllEpisodes();
    }
  };

  // NEW: Bulk delete handler
  const handleBulkDeleteClick = () => {
    setBulkDeleteConfirmOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    const deletedEpisodes = episodes.filter((ep) =>
      selectedEpisodes.includes(ep.episodeId)
    );

    for (const episodeId of selectedEpisodes) {
      await deleteEpisode(episodeId, user.id);
    }

    addLog({
      action: "DELETE",
      description: `Bulk deleted ${selectedEpisodes.length} spotify links`,
    });

    setToast({
      open: true,
      message: `${selectedEpisodes.length} episode(s) deleted`,
      type: "success",
      action: null,
    });

    setSelectedEpisodes([]);
    setBulkDeleteConfirmOpen(false);
  };

  // NEW: Export handlers
  const exportToCSV = () => {
    const selectedData = episodes.filter((ep) =>
      selectedEpisodes.includes(ep.episodeId)
    );
    const dataToExport =
      selectedData.length > 0 ? selectedData : filteredEpisodes;

    const csvContent = [
      ["Episode ID", "Spotify ID", "Type", "Date Added", "URL"],
      ...dataToExport.map((ep) => [
        ep.episodeId,
        ep.spotifyId,
        ep.embedType || "episode",
        new Date(ep.createdAt).toLocaleDateString(),
        buildSpotifyUrl(ep),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spotify-episodes-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setToast({
      open: true,
      message: `Exported ${dataToExport.length} episode(s) to CSV`,
      type: "success",
      action: null,
    });

    addLog({
      action: "EXPORT",
      description: `Exported ${dataToExport.length} spotify links to CSV`,
    });
  };

  const exportToJSON = () => {
    const selectedData = episodes.filter((ep) =>
      selectedEpisodes.includes(ep.episodeId)
    );
    const dataToExport =
      selectedData.length > 0 ? selectedData : filteredEpisodes;

    const jsonContent = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spotify-episodes-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    setToast({
      open: true,
      message: `Exported ${dataToExport.length} episode(s) to JSON`,
      type: "success",
      action: null,
    });

    addLog({
      action: "EXPORT",
      description: `Exported ${dataToExport.length} spotify links to JSON`,
    });
  };

  // NEW: Copy link handler
  const copyEpisodeLink = (episode) => {
    const url = buildSpotifyUrl(episode);
    navigator.clipboard.writeText(url);
    setToast({
      open: true,
      message: "Link copied to clipboard",
      type: "success",
      action: null,
    });
  };

  // NEW: Batch import handler
  const handleBatchImport = async (urls) => {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const url of urls) {
      if (!isValidEpisodeUrl(url)) {
        errorCount++;
        errors.push(`Invalid URL: ${url}`);
        continue;
      }

      const spotifyId = extractSpotifyId(url);
      if (episodes.some((ep) => ep.spotifyId === spotifyId)) {
        errorCount++;
        errors.push(`Duplicate: ${url}`);
        continue;
      }

      const result = await addEpisode(url, user.id);
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
        errors.push(`Failed: ${url}`);
      }
    }

    if (successCount > 0) {
      addLog({
        action: "CREATE",
        description: `Batch imported ${successCount} spotify links`,
      });

      setToast({
        open: true,
        message: `Successfully imported ${successCount} episode(s)${
          errorCount > 0 ? `, ${errorCount} failed` : ""
        }`,
        type: successCount > 0 ? "success" : "error",
        action: null,
      });
    }

    if (errors.length > 0 && errorCount === urls.length) {
      setError(
        `Batch import failed:\n${errors.slice(0, 3).join("\n")}${
          errors.length > 3 ? `\n...and ${errors.length - 3} more` : ""
        }`
      );
    }

    setBatchImportOpen(false);
  };

  // Modal handlers
  const openAddModal = () => {
    setEpisodeDetails({ episodeId: null, spotifyId: "" });
    setOpenModal(true);
  };

  const openEditModal = (episode) => {
    setEpisodeDetails({
      episodeId: episode.episodeId,
      spotifyId: buildSpotifyUrl(episode),
    });
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
  };

  const openPreviewModal = (episode) => {
    setPreviewModal({ open: true, episode });
  };

  const closePreviewModal = () => {
    setPreviewModal({ open: false, episode: null });
  };

  // Form submission handler
  const handleAddEditEpisode = async (e) => {
    e.preventDefault();

    // Validate URL
    if (!isValidEpisodeUrl(episodeDetails.spotifyId)) {
      setError(
        "The provided Spotify episode URL is invalid. Please verify the link and submit again."
      );
      closeModal();
      return;
    }

    // Check if no changes were made during edit
    if (episodeDetails.episodeId !== null) {
      const existingEpisode = episodes.find(
        (ep) => ep.episodeId === episodeDetails.episodeId
      );
      if (
        existingEpisode &&
        episodeDetails.spotifyId === buildSpotifyUrl(existingEpisode)
      ) {
        closeModal();
        return;
      }
    }

    // Check for duplicates
    const spotifyId = extractSpotifyId(episodeDetails.spotifyId);
    if (
      episodes.some(
        (ep) =>
          ep.spotifyId === spotifyId &&
          ep.episodeId !== episodeDetails.episodeId
      )
    ) {
      setError("Episode already added!");
      closeModal();
      return;
    }

    // Add or update episode
    if (episodeDetails.episodeId === null) {
      const result = await addEpisode(episodeDetails.spotifyId, user.id);
      if (result.success) {
        addLog({
          action: "CREATE",
          description: "A new spotify link has been added",
        });
        setToast({
          open: true,
          message: "Episode added successfully",
          type: "success",
          action: null,
        });
      }
    } else {
      const result = await updateEpisode(
        episodeDetails.episodeId,
        episodeDetails.spotifyId,
        user.id
      );
      if (result.success) {
        addLog({
          action: "UPDATE",
          description: "A spotify link has been updated",
        });
        setToast({
          open: true,
          message: "Episode updated successfully",
          type: "success",
          action: null,
        });
      }
    }

    closeModal();
  };

  // Delete handlers with undo functionality
  const handleDeleteClick = (episodeId) => {
    setEpisodeToDelete(episodeId);
    setConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (episodeToDelete !== null) {
      const episodeData = episodes.find(
        (ep) => ep.episodeId === episodeToDelete
      );

      const result = await deleteEpisode(episodeToDelete, user.id);
      if (result.success) {
        addLog({
          action: "DELETE",
          description: "A spotify link has been deleted",
        });

        // Store deleted episode for undo
        setRecentlyDeleted({
          episode: episodeData,
          timestamp: Date.now(),
        });

        setToast({
          open: true,
          message: "Episode deleted",
          type: "success",
          action: {
            label: "Undo",
            onClick: () => handleUndoDelete(episodeData),
          },
        });
      }
    }
    setConfirmationOpen(false);
    setEpisodeToDelete(null);
  };

  const handleUndoDelete = async (episodeData) => {
    const result = await addEpisode(buildSpotifyUrl(episodeData), user.id);
    if (result.success) {
      addLog({
        action: "CREATE",
        description: "Undid deletion of spotify link",
      });
      setToast({
        open: true,
        message: "Episode restored",
        type: "success",
        action: null,
      });
      setRecentlyDeleted(null);
    }
  };

  const handleCloseDialog = () => {
    setConfirmationOpen(false);
    setEpisodeToDelete(null);
  };

  // Filter and search handlers
  const clearSearch = () => setSearchQuery("");
  const toggleSort = () =>
    setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
  const clearAllFilters = () => {
    setSearchQuery("");
    setEmbedTypeFilter("All");
  };

  // Empty state content
  const getEmptyStateContent = () => {
    if (searchQuery) {
      return {
        title: "No results found",
        description: "Try adjusting your search or filters",
      };
    }

    const filterText =
      embedTypeFilter.toLowerCase() === "all"
        ? "episode/playlist"
        : embedTypeFilter.toLowerCase();

    return {
      title: `No ${filterText} available`,
      description: `You haven't added any podcast ${filterText} yet. Once you do, they'll show up here automatically.`,
    };
  };

  const emptyStateContent = getEmptyStateContent();

  return (
    <div className="w-full space-y-6 mb-20">
      {/* Toast Notification */}
      <ToastNotification
        open={toast.open}
        message={toast.message}
        type={toast.type}
        action={toast.action}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      {/* Keyboard Shortcuts Helper */}
      <KeyboardShortcutsHelper
        open={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Error Modal */}
      <ErrorModal
        open={!!error}
        onClose={() => setError(null)}
        message={error}
      />

      {/* Statistics Cards */}
      <StatisticsSection stats={stats} />

      {/* Search and Actions Bar - Enhanced */}
      {/* Search and Actions Bar - Enhanced */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <SearchAndActionsBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchClear={clearSearch}
            sortOrder={sortOrder}
            onSortToggle={toggleSort}
            onAddClick={openAddModal}
            filterType={embedTypeFilter}
          />
        </div>

        {/* NEW: Additional action buttons */}
        <button
          onClick={() => setBatchImportOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Batch Import
        </button>

        <div className="relative group">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Export
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <button
              onClick={exportToCSV}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded-t-lg"
            >
              Export as CSV
            </button>
            <button
              onClick={exportToJSON}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded-b-lg"
            >
              Export as JSON
            </button>
          </div>
        </div>

        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />

        <button
          onClick={() => setShowShortcuts(true)}
          className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
          title="Keyboard shortcuts (Ctrl+/)"
        >
          ⌘/?
        </button>
      </div>

      {/* Active Filters */}
      <ActiveFilters
        searchQuery={searchQuery}
        filterType={embedTypeFilter}
        onClearAll={clearAllFilters}
      />

      {/* NEW: Bulk Actions Bar */}
      {selectedEpisodes.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedEpisodes.length}
          totalCount={filteredEpisodes.length}
          onSelectAll={toggleSelectAll}
          onClearSelection={clearSelection}
          onBulkDelete={handleBulkDeleteClick}
          onBulkExport={exportToCSV}
        />
      )}

      {/* Add/Edit Modal */}
      <EpisodeFormModal
        open={openModal}
        onClose={closeModal}
        onSubmit={handleAddEditEpisode}
        episodeDetails={episodeDetails}
        onChange={(value) =>
          setEpisodeDetails((prev) => ({ ...prev, spotifyId: value }))
        }
        filterType={embedTypeFilter}
      />

      {/* NEW: Batch Import Modal */}
      <BatchImportModal
        open={batchImportOpen}
        onClose={() => setBatchImportOpen(false)}
        onImport={handleBatchImport}
      />

      {/* Filter Buttons */}
      <FilterButtons
        buttons={[
          { label: "All" },
          { label: "Episodes" },
          { label: "Playlists" },
        ]}
        activeFilter={embedTypeFilter}
        onFilterChange={setEmbedTypeFilter}
      />

      {/* Loading State */}
      {isLoading && <LoadingSpinner />}

      {/* Empty State */}
      {!isLoading && filteredEpisodes.length === 0 && (
        <EmptyState
          title={emptyStateContent.title}
          description={emptyStateContent.description}
          icon={
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          }
        />
      )}

      {/* Episodes List - Enhanced with selection and view modes */}
      {!isLoading && filteredEpisodes.length > 0 && (
        <>
          <div className={viewMode === "compact" ? "space-y-2" : "space-y-6"}>
            {paginatedEpisodes.map((episode) => (
              <div key={episode.episodeId} className="flex items-start gap-3">
                {/* Selection checkbox */}
                <input
                  type="checkbox"
                  checked={selectedEpisodes.includes(episode.episodeId)}
                  onChange={() => toggleSelectEpisode(episode.episodeId)}
                  className="mt-4 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                <div className="flex-1">
                  <EpisodeCard
                    episode={episode}
                    onPreview={openPreviewModal}
                    onEdit={openEditModal}
                    onDelete={handleDeleteClick}
                    onCopyLink={() => copyEpisodeLink(episode)}
                    compact={viewMode === "compact"}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* NEW: Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredEpisodes.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </>
      )}

      {/* Preview Modal */}
      <PreviewModal
        open={previewModal.open}
        onClose={closePreviewModal}
        episode={previewModal.episode}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Spotify Episode?"
        description="Are you sure you want to delete this Spotify Link? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        icon={<ExclamationTriangleIcon className="h-12 w-12 text-red-700" />}
        variant="danger"
      />

      {/* NEW: Bulk Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        title={`Delete ${selectedEpisodes.length} Episodes?`}
        description={`Are you sure you want to delete ${selectedEpisodes.length} selected episode(s)? This action cannot be undone.`}
        confirmLabel="Delete All"
        cancelLabel="Cancel"
        icon={<ExclamationTriangleIcon className="h-12 w-12 text-red-700" />}
        variant="danger"
      />
    </div>
  );
};

export default SpotifyEpisodes;
