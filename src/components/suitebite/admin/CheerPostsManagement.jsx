import React, { useState, useEffect, useCallback, useMemo } from "react";
import { suitebiteAPI } from "../../../utils/suitebiteAPI";
import { formatDate, formatTimeAgo } from "../../../utils/dateHelpers";
import { toast } from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  QueueListIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import Loading from "../../loader/Loading";

const CheerPostsManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [moderating, setModerating] = useState(new Set());
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmPostId, setConfirmPostId] = useState(null);
  const [confirmPostData, setConfirmPostData] = useState(null);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Group cheers by sender and time (within same minute)
  const groupCheersBySenderAndTime = (cheers) => {
    if (!Array.isArray(cheers)) return [];

    const grouped = new Map();

    cheers.forEach((cheer) => {
      const createdAt = new Date(cheer.posted_at);
      const timeKey = Math.floor(createdAt.getTime() / 60000); // Group by minute
      const key = `${cheer.cheerer_email}-${timeKey}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          ...cheer,
          recipients: [
            {
              first_name: cheer.peer_first_name,
              last_name: cheer.peer_last_name,
              email: cheer.peer_email,
            },
          ],
          totalHeartbits: cheer.heartbits_given,
          cheer_ids: [cheer.cheer_post_id],
          totalLikes: cheer.likes_count || 0,
          totalComments: cheer.comments_count || 0,
        });
      } else {
        const existing = grouped.get(key);
        existing.recipients.push({
          first_name: cheer.peer_first_name,
          last_name: cheer.peer_last_name,
          email: cheer.peer_email,
        });
        existing.totalHeartbits += cheer.heartbits_given;
        existing.cheer_ids.push(cheer.cheer_post_id);
        existing.totalLikes += cheer.likes_count || 0;
        existing.totalComments += cheer.comments_count || 0;
      }
    });

    return Array.from(grouped.values());
  };

  const loadCheerPosts = useCallback(
    async (page = 1, append = false) => {
      try {
        if (!append) {
          setLoading(true);
          setError(null);
        }

        const response = await suitebiteAPI.getCheerPostsAdmin(
          filter,
          page,
          50
        );

        if (response.success) {
          if (append) {
            setPosts((prev) => [...prev, ...(response.posts || [])]);
          } else {
            setPosts(response.posts || []);
          }
          setHasMorePosts((response.posts || []).length === 50);
          setCurrentPage(page);
        } else {
          setError(response.message || "Failed to load posts");
          toast.error(response.message || "Failed to load posts");
        }
      } catch (error) {
        console.error("Error loading cheer posts:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to load posts";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    setCurrentPage(1);
    setHasMorePosts(true);
    loadCheerPosts(1, false);
  }, [filter, loadCheerPosts]);

  const handleModeratePost = async (postIds, action) => {
    const idsArray = Array.isArray(postIds) ? postIds : [postIds];

    try {
      // Add to moderating set IMMEDIATELY for instant feedback
      idsArray.forEach((id) => {
        setModerating((prev) => {
          const newSet = new Set(prev);
          newSet.add(id);
          return newSet;
        });
      });

      // Small delay to ensure UI updates
      await new Promise((resolve) => setTimeout(resolve, 50));

      for (const postId of idsArray) {
        const post = posts.find((p) => p.cheer_post_id === postId);
        if (!post) continue;

        const postDate = new Date(post.posted_at).toLocaleDateString();
        let defaultReason = "";

        switch (action) {
          case "hide":
            defaultReason = `Your cheer post (${postDate}) is hidden due to inappropriate content.`;
            break;
          case "unhide":
            defaultReason = `Your cheer post (${postDate}) has been restored.`;
            break;
          case "delete":
            defaultReason = `Your cheer post (${postDate}) is deleted due to violation of community guidelines.`;
            break;
          default:
            defaultReason = `Your cheer post (${postDate}) has been moderated.`;
        }

        await suitebiteAPI.moderateCheerPost(postId, action, defaultReason);
      }

      toast.success(
        `${idsArray.length} post${idsArray.length > 1 ? "s" : ""} ${
          action === "hide"
            ? "hidden"
            : action === "unhide"
            ? "unhidden"
            : "deleted"
        } successfully`
      );
      await loadCheerPosts(1, false);
    } catch (error) {
      console.error("Error moderating post:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          `Failed to ${action} posts`
      );
    } finally {
      idsArray.forEach((id) => {
        setModerating((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      });
    }
  };

  const handleDeletePost = async (postIds) => {
    const idsArray = Array.isArray(postIds) ? postIds : [postIds];

    try {
      // Add to moderating set IMMEDIATELY for instant feedback
      idsArray.forEach((id) => {
        setModerating((prev) => {
          const newSet = new Set(prev);
          newSet.add(id);
          return newSet;
        });
      });

      // Small delay to ensure UI updates
      await new Promise((resolve) => setTimeout(resolve, 50));

      for (const postId of idsArray) {
        const post = posts.find((p) => p.cheer_post_id === postId);
        if (!post) continue;

        const postDate = new Date(post.posted_at).toLocaleDateString();
        const defaultReason = `Your cheer post (${postDate}) is deleted due to violation of community guidelines.`;

        await suitebiteAPI.moderateCheerPost(postId, "delete", defaultReason);
      }

      toast.success(
        `${idsArray.length} post${
          idsArray.length > 1 ? "s" : ""
        } deleted successfully`
      );
      await loadCheerPosts(1, false);
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete posts"
      );
    } finally {
      idsArray.forEach((id) => {
        setModerating((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      });
    }
  };

  const showConfirmation = (action, postIds, postData) => {
    setConfirmAction(action);
    setConfirmPostId(postIds);
    setConfirmPostData(postData);
    setShowConfirmModal(true);
  };

  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmAction = async () => {
    if (!confirmPostId || !confirmAction || isConfirming) return;

    setIsConfirming(true);

    // Force a small delay to ensure the loading state is visible
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      if (confirmAction === "delete") {
        await handleDeletePost(confirmPostId);
      } else if (confirmAction === "hide" || confirmAction === "unhide") {
        await handleModeratePost(confirmPostId, confirmAction);
      }
    } catch (error) {
      console.error("Error in confirmation action:", error);
    } finally {
      setIsConfirming(false);
      setShowConfirmModal(false);
      setConfirmAction(null);
      setConfirmPostId(null);
      setConfirmPostData(null);
    }
  };

  const handleCancelAction = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmPostId(null);
    setConfirmPostData(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredPosts = posts.filter((post) => {
    const searchLower = debouncedSearchTerm.toLowerCase();
    const matchesSearch =
      !debouncedSearchTerm ||
      (post.post_body || "").toLowerCase().includes(searchLower) ||
      (post.cheer_message || "").toLowerCase().includes(searchLower) ||
      (post.cheerer_first_name || "").toLowerCase().includes(searchLower) ||
      (post.cheerer_last_name || "").toLowerCase().includes(searchLower) ||
      (post.peer_first_name || "").toLowerCase().includes(searchLower) ||
      (post.peer_last_name || "").toLowerCase().includes(searchLower) ||
      (post.cheer_post_id || "").toLowerCase().includes(searchLower) ||
      (post.cheerer_email || "").toLowerCase().includes(searchLower) ||
      (post.peer_email || "").toLowerCase().includes(searchLower);

    let matchesFilter = true;
    if (filter === "active") {
      matchesFilter = !post.is_hidden && !post.is_flagged && !post.is_reported;
    } else if (filter === "hidden") {
      matchesFilter = post.is_hidden;
    } else if (filter === "flagged") {
      matchesFilter = post.is_flagged;
    } else if (filter === "reported") {
      matchesFilter = post.is_reported;
    }

    return matchesSearch && matchesFilter;
  });

  // Group the filtered posts
  const groupedPosts = useMemo(() => {
    return groupCheersBySenderAndTime(filteredPosts);
  }, [filteredPosts]);

  const sortedPosts = useMemo(() => {
    return [...groupedPosts].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "heartbits":
          aValue = a.totalHeartbits || 0;
          bValue = b.totalHeartbits || 0;
          break;
        case "author":
          aValue = (
            (a.cheerer_first_name || "") +
            " " +
            (a.cheerer_last_name || "")
          ).toLowerCase();
          bValue = (
            (b.cheerer_first_name || "") +
            " " +
            (b.cheerer_last_name || "")
          ).toLowerCase();
          break;
        case "likes":
          aValue = a.totalLikes || 0;
          bValue = b.totalLikes || 0;
          break;
        case "comments":
          aValue = a.totalComments || 0;
          bValue = b.totalComments || 0;
          break;
        default:
          aValue = new Date(a.posted_at);
          bValue = new Date(b.posted_at);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [groupedPosts, sortBy, sortOrder]);

  return (
    <div className="cheer-posts-management min-h-screen p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center hover:border-primary hover:shadow-md transition-shadow duration-200">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-3xl font-bold text-gray-900">
            {posts.length}
          </span>
          <span className="text-sm text-gray-500 font-medium">Posts</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center hover:border-primary hover:shadow-md transition-shadow duration-200">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <QueueListIcon className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-3xl font-bold text-gray-900">
            {posts.filter((p) => !p.is_hidden).length}
          </span>
          <span className="text-sm text-gray-500 font-medium">Active</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center hover:border-primary hover:shadow-md transition-shadow duration-200">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
            <EyeSlashIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <span className="text-3xl font-bold text-gray-900">
            {posts.filter((p) => p.is_hidden).length}
          </span>
          <span className="text-sm text-gray-500 font-medium">Hidden</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center hover:border-primary hover:shadow-md transition-shadow duration-200">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-red-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <span className="text-3xl font-bold text-gray-900">
            {posts.reduce((sum, p) => sum + (p.heartbits_given || 0), 0)}
          </span>
          <span className="text-sm text-gray-500 font-medium">Heartbits</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center hover:border-primary hover:shadow-md transition-shadow duration-200">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
            <HeartIcon className="w-6 h-6 text-pink-600" fill="currentColor" />
          </div>
          <span className="text-3xl font-bold text-gray-900">
            {posts.reduce((sum, p) => sum + (p.likes_count || 0), 0)}
          </span>
          <span className="text-sm text-gray-500 font-medium">Likes</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center hover:border-primary hover:shadow-md transition-shadow duration-200">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <span className="text-3xl font-bold text-gray-900">
            {posts.reduce((sum, p) => sum + (p.comments_count || 0), 0)}
          </span>
          <span className="text-sm text-gray-500 font-medium">Comments</span>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Posts
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by post content, author name, recipient, or post ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-transparent text-sm transition-all duration-200 hover:border-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FunnelIcon className="w-4 h-4" />
                Filter
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-transparent text-sm transition-all duration-200 hover:border-gray-400"
              >
                <option value="all">All Posts</option>
                <option value="active">Active Posts</option>
                <option value="hidden">Hidden Posts</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-transparent text-sm transition-all duration-200 hover:border-gray-400"
              >
                <option value="date">Date</option>
                <option value="heartbits">Heartbits</option>
                <option value="author">Author</option>
                <option value="likes">Likes</option>
                <option value="comments">Comments</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base hover:bg-gray-50 transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-[#0097b2] focus:border-transparent"
              title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
            >
              <div className="flex items-center justify-between">
                <span>{sortOrder === "asc" ? "Ascending" : "Descending"}</span>
                {sortOrder === "desc" ? (
                  <ArrowDownIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <ArrowUpIcon className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-state bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Error loading posts
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                loadCheerPosts(1, false);
              }}
              className="ml-auto text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Posts List */}
      {loading ? (
        <Loading />
      ) : (
        <div className="posts-container space-y-4">
          {sortedPosts.map((post) => (
            <PostCard
              key={post.cheer_ids.join("-")}
              post={post}
              onModerate={handleModeratePost}
              onDelete={handleDeletePost}
              moderating={moderating}
              showConfirmation={showConfirmation}
            />
          ))}

          {sortedPosts.length === 0 && !loading && (
            <div className="empty-state text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {posts.length === 0
                  ? "No posts found"
                  : "No posts match your filters"}
              </h3>
              <p className="text-gray-500 mb-4">
                {posts.length === 0
                  ? "There are no cheer posts in the system yet."
                  : "Try adjusting your search terms or filters to find more posts."}
              </p>
              {posts.length > 0 && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilter("all");
                  }}
                  className="text-sm text-[#0097b2] hover:text-[#007a8e] font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {hasMorePosts && sortedPosts.length > 0 && !loading && (
            <div className="text-center py-6">
              <button
                onClick={() => loadCheerPosts(currentPage + 1, true)}
                className="px-6 py-3 bg-[#0097b2] text-white rounded-lg hover:bg-[#007a8e] transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                Load More Posts
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-opacity-100 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div
              className={`px-6 py-4 border-b border-gray-200 rounded-t-xl ${
                confirmAction === "delete"
                  ? "bg-red-50 border-red-200"
                  : confirmAction === "hide"
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    confirmAction === "delete"
                      ? "bg-red-100"
                      : confirmAction === "hide"
                      ? "bg-yellow-100"
                      : "bg-green-100"
                  }`}
                >
                  {confirmAction === "delete" ? (
                    <TrashIcon className="w-5 h-5 text-red-600" />
                  ) : confirmAction === "hide" ? (
                    <EyeSlashIcon className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {confirmAction === "delete"
                      ? "Delete Posts"
                      : confirmAction === "hide"
                      ? "Hide Posts"
                      : "Unhide Posts"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {Array.isArray(confirmPostId)
                      ? `${confirmPostId.length} posts selected`
                      : "1 post selected"}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              {confirmPostData && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Author:</span>{" "}
                    {confirmPostData.cheerer_first_name}{" "}
                    {confirmPostData.cheerer_last_name}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Recipients:</span>{" "}
                    {confirmPostData.recipients?.slice(0, 3).map((r, idx) => (
                      <span key={idx}>
                        {r.first_name} {r.last_name}
                        {idx <
                        Math.min(2, confirmPostData.recipients.length - 1)
                          ? ", "
                          : ""}
                      </span>
                    ))}
                    {confirmPostData.recipients?.length > 3 &&
                      ` and ${confirmPostData.recipients.length - 3} more`}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Message:</span> "
                    {confirmPostData.post_body?.substring(0, 100)}
                    {confirmPostData.post_body?.length > 100 ? "..." : ""}"
                  </p>
                </div>
              )}

              <p className="text-gray-700">
                {confirmAction === "delete"
                  ? "Are you sure you want to permanently delete these cheer posts? This action will remove all posts and associated data."
                  : confirmAction === "hide"
                  ? "Are you sure you want to hide these cheer posts? Hidden posts will not be visible to users but can be restored later."
                  : "Are you sure you want to unhide these cheer posts? The posts will become visible to users again."}
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 rounded-b-xl bg-gray-50 flex gap-3">
              <button
                onClick={handleCancelAction}
                disabled={isConfirming}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isConfirming}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  confirmAction === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : confirmAction === "hide"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isConfirming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>
                      {confirmAction === "delete"
                        ? "Deleting..."
                        : confirmAction === "hide"
                        ? "Hiding..."
                        : "Unhiding..."}
                    </span>
                  </>
                ) : (
                  <span>
                    {confirmAction === "delete"
                      ? "Delete Posts"
                      : confirmAction === "hide"
                      ? "Hide Posts"
                      : "Unhide Posts"}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// PostCard component for grouped posts
const PostCard = ({
  post,
  onModerate,
  onDelete,
  moderating,
  showConfirmation,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [postDetails, setPostDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const getStatusBadge = (post) => {
    if (post.is_hidden)
      return { text: "Hidden", class: "bg-gray-100 text-gray-800" };
    if (post.is_flagged)
      return { text: "Flagged", class: "bg-yellow-100 text-yellow-800" };
    if (post.is_reported)
      return { text: "Reported", class: "bg-red-100 text-red-800" };
    return { text: "Active", class: "bg-green-100 text-green-800" };
  };

  const loadPostDetails = async () => {
    if (postDetails || loadingDetails) return;

    try {
      setLoadingDetails(true);
      const response = await suitebiteAPI.getCheerPost(post.cheer_post_id);
      if (response.success) {
        setPostDetails(response.post);
      }
    } catch (error) {
      console.error("Error loading post details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleDetails = async () => {
    if (!showDetails && !postDetails) {
      await loadPostDetails();
    }
    setShowDetails(!showDetails);
  };

  const isModeratingAny = post.cheer_ids.some((id) => moderating.has(id));

  return (
    <div className="post-card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-gray-300">
      <div className="post-main p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Author Info */}
          <div className="author-section flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            {/* Author Info & Post */}
            <div className="flex flex-col flex-1 gap-4">
              {/* Author Section */}
              <div className="author-section flex flex-row items-center gap-4 w-full">
                {/* Avatar */}
                <div className="author-avatar rounded-full w-12 h-12 flex items-center justify-center font-semibold text-sm shadow-md overflow-hidden flex-shrink-0">
                  {post.cheerer_profile_pic ? (
                    <img
                      src={post.cheerer_profile_pic}
                      alt={`${post.cheerer_first_name} ${post.cheerer_last_name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`bg-gradient-to-br from-[#0097b2] to-[#4a6e7e] text-white w-full h-full flex items-center justify-center ${
                      post.cheerer_profile_pic ? "hidden" : "flex"
                    }`}
                  >
                    {(
                      (post.cheerer_first_name || "").charAt(0) +
                      (post.cheerer_last_name || "").charAt(0)
                    ).toUpperCase()}
                  </div>
                </div>

                {/* Name & Status Badge */}
                <div className="author-info flex items-center gap-2 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {post.cheerer_first_name} {post.cheerer_last_name}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                      getStatusBadge(post).class
                    }`}
                  >
                    {post.is_hidden ? (
                      <EyeSlashIcon className="w-3 h-3" />
                    ) : (
                      <EyeIcon className="w-3 h-3" />
                    )}
                    {getStatusBadge(post).text}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="post-details flex flex-col gap-3">
                {/* Recipients */}
                <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 rounded-lg w-full">
                  <span className="text-sm font-medium text-gray-500">To:</span>
                  <span className="text-sm font-semibold text-gray-900 break-words">
                    {post.recipients.slice(0, 3).map((recipient, idx) => (
                      <span key={idx}>
                        {recipient.first_name} {recipient.last_name}
                        {idx < Math.min(2, post.recipients.length - 1)
                          ? ", "
                          : ""}
                      </span>
                    ))}
                    {post.recipients.length > 3 && (
                      <span className="text-gray-600 font-medium">
                        {" "}
                        and {post.recipients.length - 3}{" "}
                        {post.recipients.length - 3 === 1 ? "other" : "others"}
                      </span>
                    )}
                  </span>
                  <span className="ml-auto text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                    <svg
                      className="sm:hidden w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {formatTimeAgo(post.posted_at)}
                  </span>
                </div>

                {/* Post Body */}
                <div className="text-gray-900 mb-3 p-3 bg-gray-50 rounded-lg border-l-4 border-[#0097b2] break-words whitespace-pre-wrap overflow-wrap-anywhere">
                  {post.post_body}
                </div>

                {/* Post Image */}
                {post.image_url && (
                  <div className="mb-3">
                    <img
                      src={post.image_url}
                      alt="Post attachment"
                      className="rounded-lg max-w-full shadow-sm object-cover"
                    />
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="engagement-stats flex items-center gap-4 mb-4 py-3 px-3 rounded-lg flex-wrap">
                  {/* Likes */}
                  <div className="stat-item flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm">
                    <HeartIcon
                      className="w-4 h-4 text-pink-500"
                      fill="transparent"
                    />
                    <span className="hidden sm:inline text-sm font-medium text-gray-700">
                      {post.totalLikes || 0}
                    </span>
                  </div>

                  {/* Comments */}
                  <div className="stat-item flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span className="hidden sm:inline text-sm font-medium text-gray-700">
                      {post.totalComments || 0}
                    </span>
                  </div>

                  {/* View/Hide Details */}
                  {(post.totalLikes > 0 || post.totalComments > 0) && (
                    <button
                      onClick={handleToggleDetails}
                      className="view-details-btn text-xs text-[#0097b2] hover:text-[#007a8e] font-medium transition-colors duration-200 px-3 py-1.5 bg-white rounded-full shadow-sm hover:shadow-md flex items-center justify-center"
                    >
                      {loadingDetails ? (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 border border-[#0097b2] border-t-transparent rounded-full animate-spin"></div>
                          <span className="hidden sm:inline">Loading...</span>
                        </div>
                      ) : showDetails ? (
                        <div className="flex items-center gap-1">
                          <EyeSlashIcon className="w-4 h-4 text-gray-500" />
                          <span className="hidden sm:inline">Hide</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4 text-gray-500" />
                          <span className="hidden sm:inline">View</span>
                        </div>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section: Stats & Action Buttons */}
            <div className="post-stats flex-shrink-0 w-full sm:w-48 flex flex-col gap-3 mt-4 sm:mt-0">
              {/* Stats */}
              <div className="stats-container p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-start gap-2 mb-2">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="text-xl font-bold text-gray-900">
                    {post.totalHeartbits}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  {formatDate(post.posted_at)}
                </div>
                <div className="text-xs text-gray-400 font-mono bg-gray-200 px-2 py-1 rounded break-all">
                  {post.cheer_ids.length}{" "}
                  {post.cheer_ids.length === 1 ? "post" : "posts"}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons flex flex-col gap-2">
                {post.is_hidden ? (
                  <button
                    className="px-4 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
                    title="Unhide Posts"
                    onClick={() => onModerate(post.cheer_ids, "unhide")}
                    disabled={isModeratingAny}
                  >
                    {isModeratingAny ? (
                      <>
                        <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Unhiding...</span>
                      </>
                    ) : (
                      <>
                        <EyeIcon className="w-4 h-4" />
                        <span>Unhide</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
                    title="Hide Posts"
                    onClick={() =>
                      showConfirmation("hide", post.cheer_ids, post)
                    }
                    disabled={isModeratingAny}
                  >
                    {isModeratingAny ? (
                      <>
                        <div className="w-3 h-3 border border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Hiding...</span>
                      </>
                    ) : (
                      <>
                        <EyeSlashIcon className="w-4 h-4" />
                        <span>Hide</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
                  title="Delete Posts"
                  onClick={() =>
                    showConfirmation("delete", post.cheer_ids, post)
                  }
                  disabled={isModeratingAny}
                >
                  {isModeratingAny ? (
                    <>
                      <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Engagement Section */}
      {showDetails && (
        <div className="engagement-details border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-6">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <span className="font-semibold">Total Recipients:</span>{" "}
              {post.recipients.length}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Recipients:</span>
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {post.recipients.map((recipient, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200"
                >
                  {recipient.first_name} {recipient.last_name}
                </span>
              ))}
            </div>

            {/* Comments Section */}
            {postDetails &&
              postDetails.comments &&
              postDetails.comments.length > 0 && (
                <div className="comments-section mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Comments ({postDetails.comments.length})
                  </h4>
                  <div className="comments-list space-y-3">
                    {postDetails.comments.map((comment, index) => (
                      <div
                        key={
                          comment.comment_id ||
                          comment.cheer_comment_id ||
                          `comment-${index}`
                        }
                        className="comment-item bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="commenter-avatar rounded-full w-8 h-8 flex items-center justify-center font-semibold text-xs shadow-sm overflow-hidden flex-shrink-0">
                            {comment.commenter_profile_pic ? (
                              <img
                                src={comment.commenter_profile_pic}
                                alt={`${comment.commenter_first_name} ${comment.commenter_last_name}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className={`bg-gradient-to-br from-[#0097b2] to-[#4a6e7e] text-white w-full h-full flex items-center justify-center ${
                                comment.commenter_profile_pic ? "hidden" : ""
                              }`}
                            >
                              {(
                                (comment.commenter_first_name || "").charAt(0) +
                                (comment.commenter_last_name || "").charAt(0)
                              ).toUpperCase()}
                            </div>
                          </div>
                          <div className="comment-content flex-1 min-w-0">
                            <div className="comment-header flex items-end gap-2 mb-2 justify-between flex-wrap">
                              <span className="commenter-name font-semibold text-gray-900 text-sm truncate">
                                {comment.commenter_first_name || "Unknown"}{" "}
                                {comment.commenter_last_name || "User"}
                              </span>
                              <span className="comment-time text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {formatTimeAgo(
                                  comment.created_at || comment.commented_at
                                )}
                              </span>
                              {comment.additional_heartbits > 0 && (
                                <span className="comment-heartbits bg-gradient-to-r from-[#bfd1a0] to-[#a8c090] text-[#1a0202] px-2 py-1 rounded-full text-xs font-semibold shadow-sm flex-shrink-0">
                                  +{comment.additional_heartbits} ❤️
                                </span>
                              )}
                            </div>
                            <p className="comment-text text-gray-800 text-sm leading-relaxed break-words overflow-wrap-anywhere whitespace-pre-wrap">
                              {comment.comment ||
                                comment.message ||
                                comment.cheer_comment ||
                                "No comment text available"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Likes Section */}
            {postDetails &&
              postDetails.likes &&
              postDetails.likes.length > 0 && (
                <div className="likes-section">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-pink-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    Likes ({postDetails.likes.length})
                  </h4>
                  <div className="likes-list space-y-2">
                    {postDetails.likes.map((like, index) => (
                      <div
                        key={
                          like.cheer_like_id || like.liker_id || `like-${index}`
                        }
                        className="like-item flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200"
                      >
                        <div className="liker-avatar rounded-full w-7 h-7 flex items-center justify-center font-semibold text-xs overflow-hidden flex-shrink-0">
                          {like.liker_profile_pic ? (
                            <img
                              src={like.liker_profile_pic}
                              alt={`${like.liker_first_name} ${like.liker_last_name}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`bg-gradient-to-br from-[#0097b2] to-[#4a6e7e] text-white w-full h-full flex items-center justify-center ${
                              like.liker_profile_pic ? "hidden" : ""
                            }`}
                          >
                            {(
                              (like.liker_first_name || "").charAt(0) +
                              (like.liker_last_name || "").charAt(0)
                            ).toUpperCase()}
                          </div>
                        </div>
                        <div className="like-content flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="liker-name font-medium text-gray-900 text-sm truncate">
                              {like.liker_first_name || "Unknown"}{" "}
                              {like.liker_last_name || "User"}
                            </span>
                            <span className="like-time text-xs text-gray-500 flex-shrink-0">
                              {formatTimeAgo(like.created_at || like.liked_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheerPostsManagement;
