import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pointsSystemApi } from "../../api/pointsSystemApi";
import { useStore } from "../../store/authStore";
import { toast } from "react-hot-toast";
import useIsMobile from "../../utils/useIsMobile";
import {
  HeartIcon,
  ChatBubbleLeftEllipsisIcon,
  TrophyIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { formatFullDateTime } from "../../utils/dateHelpers";

const CheerPage = () => {
  const user = useStore((state) => state.user);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Form state
  const [cheerText, setCheerText] = useState("");
  const [messageText, setMessageText] = useState("");
  const [cheerPoints, setCheerPoints] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feed interaction state
  const [activeTab, setActiveTab] = useState("weekly");
  const [commentingCheer, setCommentingCheer] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [likedCheers, setLikedCheers] = useState(new Set());
  const [cheerComments, setCheerComments] = useState(new Map());
  const [loadingComments, setLoadingComments] = useState(false);
  const [showMoreLeaderboard, setShowMoreLeaderboard] = useState(false);
  const COMMENTS_PAGE_SIZE = 20;

  // Simplified state for cheer feed
  const [allCheers, setAllCheers] = useState([]);

  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  // Add state for date filter
  const [selectedDate, setSelectedDate] = useState("");

  // Add pagination state for cheer feed
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  // Reset cheers and pagination when date changes
  useEffect(() => {
    setAllCheers([]);
    setCurrentPage(1);
  }, [selectedDate]);

  // Fetch cheer statistics
  const { isLoading: statsLoading } = useQuery({
    // Fetch cheer statistics (removed unused variable)
    //const { isLoading: statsLoading } = useQuery({

    queryKey: ["cheer-stats"],
    queryFn: pointsSystemApi.getCheerStats,
    staleTime: 2 * 60 * 1000,
    enabled: !!user && Object.keys(user).length > 0,
  });

  // Fetch user points
  const { data: pointsData, isLoading: pointsLoading } = useQuery({
    queryKey: ["points"],
    queryFn: pointsSystemApi.getPoints,
    staleTime: 1 * 60 * 1000,
    enabled: !!user && Object.keys(user).length > 0,
  });

  // Simplified cheer feed query - load all recent posts first
  const {
    data: cheerFeed,
    isLoading: feedLoading,
    refetch: refetchCheerFeed,
  } = useQuery({
    queryKey: ["cheer-feed", selectedDate, currentPage, itemsPerPage],
    queryFn: async () => {
      const offset = (currentPage - 1) * itemsPerPage;

      if (selectedDate) {
        // Create date boundaries in UTC to avoid timezone issues
        const [year, month, day] = selectedDate.split("-").map(Number);

        // Start of day in UTC (00:00:00.000)
        const from = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

        // End of day in UTC (23:59:59.999)
        const to = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

        return pointsSystemApi.getCheerFeed(
          itemsPerPage,
          from.toISOString(),
          to.toISOString(),
          offset
        );
      } else {
        // For all cheers, request a large amount to get comprehensive data
        return pointsSystemApi.getCheerFeed(1000, null, null, 0);
      }
    },
    staleTime: 1 * 60 * 1000,
    enabled: !!user && Object.keys(user).length > 0,
    onSuccess: (data) => {
      const allCheers = data?.data?.cheers || data?.cheers || [];
      setAllCheers(allCheers);
    },
    onError: (error) => {
      console.error("Cheer feed error:", error);
    },
  });

  // Fetch leaderboard
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["leaderboard", activeTab, user?.id],
    queryFn: () => pointsSystemApi.getLeaderboard(activeTab, user?.id),
    staleTime: 2 * 60 * 1000,
    enabled: !!user && Object.keys(user).length > 0,
  });

  // Process leaderboard data
  const leaderboard = leaderboardData?.data || [];
  const currentUserLeaderboard = leaderboardData?.currentUser || null;

  // User search for @ mentions
  const { data: searchResults = [] } = useQuery({
    queryKey: ["user-search", searchQuery],
    queryFn: () => pointsSystemApi.searchUsers(searchQuery),
    enabled: searchQuery.length >= 1 && !!user && Object.keys(user).length > 0,
    staleTime: 30 * 1000,
  });

  // Bulk cheer mutation for multiple recipients
  const bulkCheerMutation = useMutation({
    mutationFn: ({ recipientId, amount, message }) => {
      return pointsSystemApi.sendCheer(recipientId, amount, message);
    },
  });

  // Heart cheer mutation
  const likeMutation = useMutation({
    mutationFn: (cheerId) => pointsSystemApi.toggleCheerLike(cheerId),
    onSuccess: (data, cheerId) => {
      // Extract the actual like status from the response
      const likeStatus =
        data.liked !== undefined ? data.liked : data.data && data.data.liked;

      // Fallback: if likeStatus is undefined, check if it was previously liked
      const wasPreviouslyLiked = likedCheers.has(cheerId);
      const finalLikeStatus =
        likeStatus !== undefined ? likeStatus : !wasPreviouslyLiked;

      // Update localStorage based on server response
      const currentLikes = JSON.parse(
        localStorage.getItem("likedCheers") || "[]"
      );
      if (finalLikeStatus === true) {
        if (!currentLikes.includes(cheerId)) {
          currentLikes.push(cheerId);
        }
      } else {
        const index = currentLikes.indexOf(cheerId);
        if (index > -1) {
          currentLikes.splice(index, 1);
        }
      }
      localStorage.setItem("likedCheers", JSON.stringify(currentLikes));

      // Update state based on server response, not localStorage
      setLikedCheers((prev) => {
        const newSet = new Set(prev);
        if (finalLikeStatus === true) {
          newSet.add(cheerId);
        } else {
          newSet.delete(cheerId);
        }
        return newSet;
      });

      queryClient.invalidateQueries(["cheer-feed"]);
      // Refresh the current page to get updated like status
      refetchCheerFeed();
    },
    onError: (error) => {
      console.error("likeMutation.onError", error);
      toast.error("Failed to update heart");
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: ({ cheerId, comment }) =>
      pointsSystemApi.addCheerComment(cheerId, comment),
    onSuccess: (data, variables) => {
      setCommentText("");
      setCheerComments((prev) => {
        const newComments = new Map(prev);
        const existing = newComments.get(variables.cheerId);
        const existingArray = Array.isArray(existing) ? existing : [];

        const newComment = {
          _id: data.id || data._id,
          comment: data.comment,
          fromUser: {
            _id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            avatar: user.profile_pic,
          },
          createdAt: data.created_at || data.createdAt,
        };
        newComments.set(variables.cheerId, [newComment, ...existingArray]);
        return newComments;
      });
      queryClient.invalidateQueries(["cheer-feed"]);
      // Refresh the current page to get updated comment count
      refetchCheerFeed();
      toast.success("Comment added!");
    },
    onError: (error) => {
      console.error("Comment error:", error);
      toast.error("Failed to add comment");
    },
  });

  // Add state for editing comments
  const [editingComment, setEditingComment] = useState(null); // {cheerId, commentId}
  const [editCommentText, setEditCommentText] = useState("");

  // Edit comment mutation
  const editCommentMutation = useMutation({
    mutationFn: ({ cheerId, commentId, comment }) =>
      pointsSystemApi.updateCheerComment(cheerId, commentId, comment),
    onSuccess: (_, variables) => {
      setCheerComments((prev) => {
        const newMap = new Map(prev);
        const data = newMap.get(variables.cheerId);
        if (data && Array.isArray(data.comments)) {
          data.comments = data.comments.map((c) =>
            c._id === variables.commentId
              ? { ...c, comment: variables.comment }
              : c
          );
        }
        return newMap;
      });
      setEditingComment(null);
      setEditCommentText("");
      toast.success("Comment updated!");
    },
    onError: () => toast.error("Failed to update comment"),
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: ({ cheerId, commentId }) =>
      pointsSystemApi.deleteCheerComment(cheerId, commentId),
    onSuccess: (_, variables) => {
      setCheerComments((prev) => {
        const newMap = new Map(prev);
        const data = newMap.get(variables.cheerId);
        if (data && Array.isArray(data.comments)) {
          data.comments = data.comments.filter(
            (c) => c._id !== variables.commentId
          );
        }
        return newMap;
      });
      toast.success("Comment deleted!");
    },
    onError: () => toast.error("Failed to delete comment"),
  });

  // Add state for delete confirmation
  const [confirmingDelete, setConfirmingDelete] = useState(null); // {cheerId, commentId}

  // Load persisted likes from localStorage on component mount
  useEffect(() => {
    const persistedLikes = JSON.parse(
      localStorage.getItem("likedCheers") || "[]"
    );
    if (persistedLikes.length > 0) {
      setLikedCheers(new Set(persistedLikes));
    }

    // Cleanup function to clear likes when component unmounts
    return () => {
      // Optionally clear old likes after a certain time period
      const lastCleared = localStorage.getItem("likedCheersLastCleared");
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      if (!lastCleared || now - parseInt(lastCleared) > oneDay) {
        localStorage.removeItem("likedCheers");
        localStorage.setItem("likedCheersLastCleared", now.toString());
      }
    };
  }, []);

  // Initialize hearted cheers state when feed data loads
  useEffect(() => {
    if (allCheers && Array.isArray(allCheers)) {
      const likedCheerIds = new Set();
      const serverLikedCheerIds = new Set();

      allCheers.forEach((cheer) => {
        // Check for both userLiked and userHearted fields, handling both boolean and numeric values
        const isLiked =
          cheer.userLiked === true ||
          cheer.userLiked === 1 ||
          cheer.userLiked === "1";
        const isHearted =
          cheer.userHearted === true ||
          cheer.userHearted === 1 ||
          cheer.userHearted === "1";

        if (isLiked || isHearted) {
          likedCheerIds.add(cheer.cheer_id);
          serverLikedCheerIds.add(cheer.cheer_id);
        }
      });

      // Only add persisted likes for cheers that don't have server data
      const persistedLikes = JSON.parse(
        localStorage.getItem("likedCheers") || "[]"
      );
      persistedLikes.forEach((cheerId) => {
        // Only add if server doesn't have data for this cheer
        if (!serverLikedCheerIds.has(cheerId)) {
          likedCheerIds.add(cheerId);
        }
      });

      setLikedCheers(likedCheerIds);

      // Clean up localStorage to remove stale data for cheers that have server data
      if (serverLikedCheerIds.size > 0) {
        const currentPersistedLikes = JSON.parse(
          localStorage.getItem("likedCheers") || "[]"
        );
        const cleanedPersistedLikes = currentPersistedLikes.filter(
          (cheerId) => !serverLikedCheerIds.has(cheerId)
        );
        localStorage.setItem(
          "likedCheers",
          JSON.stringify(cleanedPersistedLikes)
        );
      }
    }
  }, [allCheers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Function to fetch comments for a specific cheer (with pagination)
  const fetchComments = async (cheerId, append = false) => {
    setLoadingComments(true);
    try {
      const prev = cheerComments.get(cheerId) || {
        comments: [],
        offset: 0,
        hasMore: true,
      };
      const offset = append ? prev.offset : 0;
      const comments = await pointsSystemApi.getCheerComments(cheerId, {
        limit: COMMENTS_PAGE_SIZE,
        offset,
      });
      const newComments = Array.isArray(comments) ? comments : [];
      setCheerComments((prevMap) => {
        const prevData = prevMap.get(cheerId) || {
          comments: [],
          offset: 0,
          hasMore: true,
        };
        const merged = append
          ? [...prevData.comments, ...newComments]
          : newComments;
        return new Map(prevMap).set(cheerId, {
          comments: merged,
          offset: offset + newComments.length,
          hasMore: newComments.length === COMMENTS_PAGE_SIZE,
        });
      });
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Failed to load comments");
      setCheerComments((prevMap) =>
        new Map(prevMap).set(cheerId, {
          comments: [],
          offset: 0,
          hasMore: false,
        })
      );
    } finally {
      setLoadingComments(false);
    }
  };

  // Handle comment button click
  const handleCommentClick = (cheerId) => {
    const isOpening = commentingCheer !== cheerId;
    setCommentingCheer(isOpening ? cheerId : null);
    if (isOpening) {
      fetchComments(cheerId, false);
    }
  };

  // Handle @ mention search in textarea
  const handleCheerTextChange = (e) => {
    const value = e.target.value;
    setCheerText(value);

    if (value.trim().length > 0) {
      setSearchQuery(value);
      setShowUserDropdown(true);
    } else {
      setShowUserDropdown(false);
      setSearchQuery("");
    }
  };

  const handleUserSelect = (user) => {
    setCheerText("");
    setSelectedUsers((prev) => [...prev, user]);
    setShowUserDropdown(false);
  };

  const handleCheerSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }
    if (!messageText.trim()) {
      toast.error("Please enter a message for your cheer");
      return;
    }
    const totalHeartbitsNeeded = cheerPoints * selectedUsers.length;
    if (totalHeartbitsNeeded > availableHeartbits) {
      toast.error(
        `Not enough heartbits available. You need ${totalHeartbitsNeeded} heartbits to send ${cheerPoints} to ${selectedUsers.length} recipients, but you only have ${availableHeartbits} remaining.`
      );
      return;
    }
    setIsSubmitting(true);

    const sendCheersSequentially = async () => {
      let successCount = 0;
      let errorCount = 0;
      for (const user of selectedUsers) {
        try {
          const cheerData = {
            recipientId: user.user_id,
            amount: cheerPoints,
            message: messageText.trim(),
          };
          await bulkCheerMutation.mutateAsync(cheerData);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to send cheer to ${user.name}:`, error);
        }
      }

      if (errorCount === 0) {
        toast.success(
          `Cheers sent successfully to ${successCount} recipients! 🎉`
        );
        setSelectedUsers([]);
        setCheerText("");
        setMessageText("");
        setCheerPoints(1);
        queryClient.invalidateQueries(["points"]);
        queryClient.invalidateQueries(["cheer-feed"]);
        queryClient.invalidateQueries(["leaderboard"]);
        // Reset and reload feed
        setAllCheers([]);
      } else if (successCount > 0) {
        toast.warning(`Sent ${successCount} cheers, but ${errorCount} failed.`);
      } else {
        toast.error("Failed to send any cheers. Please try again.");
      }
    };

    sendCheersSequentially()
      .catch((error) => {
        console.error("Cheer submission failed:", error);
        const backendMsg =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to send cheers";
        toast.error(backendMsg);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const formatTimeAgo = (date) => {
    try {
      if (!date) return "Unknown time";

      const now = new Date();
      const dateObj = new Date(date);

      if (isNaN(dateObj.getTime())) return "Invalid date";

      const diffMs = now - dateObj;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch (error) {
      console.error("Time formatting error:", error, "for date:", date);
      return "Invalid date";
    }
  };

  // Show authentication debug info if user object is empty or undefined
  if (!user || Object.keys(user).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <HeartIconSolid className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please ensure you are logged in to access the Cheer a Peer
              feature.
            </p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const anyLoading =
    statsLoading || pointsLoading || feedLoading || leaderboardLoading;

  if (anyLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="text-center">
          <div className="relative">
            <div
              className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-4 mx-auto mb-4"
              style={{ borderTopColor: "#0097b2" }}
            ></div>
            <SparklesIcon
              className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{ color: "#0097b2" }}
            />
          </div>
          <p
            className="text-lg font-medium"
            style={{ color: "#4a6e7e", fontFamily: "Avenir, sans-serif" }}
          >
            Loading your cheer dashboard...
          </p>
        </div>
      </div>
    );
  }

  const availableHeartbits =
    (pointsData?.data?.monthlyCheerLimit || 100) -
    (pointsData?.data?.monthlyCheerUsed || 0);

  // Get all data from API response and paginate client-side
  const allData = cheerFeed?.data?.cheers || cheerFeed?.cheers || [];
  const pageStartIndex = (currentPage - 1) * itemsPerPage;
  const pageEndIndex = pageStartIndex + itemsPerPage;
  const feed = allData.slice(pageStartIndex, pageEndIndex);

  // Get pagination data - handle different API response structures
  const paginationData = cheerFeed?.pagination || cheerFeed?.data?.pagination;
  const totalItems = allData.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Calculate display indices
  const startIndex = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Handle page change with error handling
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) {
      console.warn("Invalid page number:", page);
      return;
    }

    setCurrentPage(page);

    // Scroll to top of feed section for better UX
    const feedSection = document.querySelector(".cheer-feed-section");
    if (feedSection) {
      feedSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle items per page change (currently not used but kept for future flexibility)
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    // start

    <div
      className="w-full min-h-screen"
      // style={{
      //   background:
      //     "linear-gradient(135deg, #f8fafc 0%, #e0f7fa 50%, #f8fafc 100%)",
      // }}
      style={{
        backgroundColor: "#f8fafc",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - Create Cheer & Heartbits */}
          <div className="lg:col-span-1 space-y-6">
            {/* ENHANCED CREATE CHEER FORM */}
            <div
              className="rounded-3xl shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl overflow-hidden relative group"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e2e8f0",
              }}
            >
              {/* Animated glow effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(circle at top right, rgba(0, 151, 178, 0.1) 0%, transparent 70%)",
                }}
              />

              <div className="relative">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background:
                        "linear-gradient(135deg, #0097b2 0%, #4a6e7e 100%)",
                    }}
                  >
                    <HeartIconSolid className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2
                      className="text-2xl font-black"
                      style={{
                        color: "#1a0202",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Send Heartbits
                    </h2>
                    <p
                      className="text-sm"
                      style={{
                        color: "#64748b",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Recognize your peers
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCheerSubmit} className="space-y-6">
                  {/* Selected Users Display */}
                  {selectedUsers.length > 0 && (
                    <div>
                      <label
                        className="block text-sm font-bold mb-3"
                        style={{
                          color: "#1a0202",
                          fontFamily: "Avenir, sans-serif",
                        }}
                      >
                        Recipients ({selectedUsers.length})
                      </label>
                      <div
                        className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 rounded-xl"
                        style={{ backgroundColor: "#f8fafc" }}
                      >
                        {selectedUsers.map((user, index) => (
                          <div
                            key={user.user_id}
                            className="group/tag flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                            style={{
                              background:
                                "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                              border: "1px solid #3b82f6",
                            }}
                          >
                            <img
                              src={user.avatar || "/images/default-avatar.png"}
                              alt={user.name}
                              className="w-6 h-6 rounded-full ring-2 ring-white"
                            />
                            <span
                              className="text-sm font-bold truncate max-w-24"
                              style={{
                                color: "#1e40af",
                                fontFamily: "Avenir, sans-serif",
                              }}
                            >
                              {user.name}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedUsers((prev) =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }
                              className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-125 opacity-70 group-hover/tag:opacity-100"
                              style={{
                                backgroundColor: "#ef4444",
                                color: "#ffffff",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search Input */}
                  <div className="relative" ref={dropdownRef}>
                    <label
                      className="block text-sm font-bold mb-2"
                      style={{
                        color: "#1a0202",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Search Peers
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cheerText}
                        onChange={handleCheerTextChange}
                        placeholder="Type a name..."
                        className="w-full px-4 py-3 rounded-2xl transition-all duration-200 focus:ring-4 text-base"
                        style={{
                          border: "2px solid #e2e8f0",
                          backgroundColor: "#ffffff",
                          fontFamily: "Avenir, sans-serif",
                          color: "#1a0202",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#0097b2";
                          e.target.style.boxShadow =
                            "0 0 0 4px rgba(0, 151, 178, 0.1)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e2e8f0";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg
                          className="w-5 h-5"
                          style={{ color: "#94a3b8" }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* User Dropdown */}
                    {showUserDropdown &&
                      Array.isArray(searchResults) &&
                      searchResults.length > 0 && (
                        <div
                          className="absolute z-20 w-full mt-2 rounded-2xl shadow-2xl max-h-64 overflow-y-auto"
                          style={{
                            backgroundColor: "#ffffff",
                            border: "2px solid #e2e8f0",
                          }}
                        >
                          {searchResults
                            .filter(
                              (result) =>
                                !selectedUsers.some(
                                  (selected) =>
                                    selected.user_id === result.user_id
                                )
                            )
                            .map((result) => (
                              <button
                                key={result.user_id}
                                type="button"
                                onClick={() => handleUserSelect(result)}
                                className="w-full px-5 py-4 text-left flex items-center space-x-4 transition-all duration-200 hover:scale-[1.02]"
                                style={{
                                  borderBottom: "1px solid #f1f5f9",
                                }}
                                onMouseEnter={(e) =>
                                  (e.target.style.backgroundColor = "#f0f9ff")
                                }
                                onMouseLeave={(e) =>
                                  (e.target.style.backgroundColor =
                                    "transparent")
                                }
                              >
                                <img
                                  src={
                                    result.avatar ||
                                    "/images/default-avatar.png"
                                  }
                                  alt={result.name}
                                  className="w-12 h-12 rounded-xl ring-2 ring-gray-200"
                                />
                                <div className="flex-1 min-w-0">
                                  <p
                                    className="font-bold text-base truncate"
                                    style={{
                                      color: "#1a0202",
                                      fontFamily: "Avenir, sans-serif",
                                    }}
                                  >
                                    {result.name}
                                  </p>
                                  <p
                                    className="text-sm truncate"
                                    style={{
                                      color: "#64748b",
                                      fontFamily: "Avenir, sans-serif",
                                    }}
                                  >
                                    {result.email}
                                  </p>
                                </div>
                              </button>
                            ))}
                        </div>
                      )}
                  </div>

                  {/* Message Input */}
                  <div>
                    <label
                      className="block text-sm font-bold mb-2"
                      style={{
                        color: "#1a0202",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      ref={textareaRef}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Share why they deserve recognition... 🌟"
                      className="w-full px-4 py-3 rounded-2xl resize-none transition-all duration-200 focus:ring-4"
                      style={{
                        border: "2px solid #e2e8f0",
                        backgroundColor: "#ffffff",
                        fontFamily: "Avenir, sans-serif",
                        color: "#1a0202",
                        minHeight: "120px",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#0097b2";
                        e.target.style.boxShadow =
                          "0 0 0 4px rgba(0, 151, 178, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow = "none";
                      }}
                      required
                    />
                  </div>

                  {/* Heartbits Amount */}
                  <div>
                    <label
                      className="block text-sm font-bold mb-2"
                      style={{
                        color: "#1a0202",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Heartbits Amount
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max={Math.min(100, availableHeartbits)}
                        value={cheerPoints}
                        onChange={(e) =>
                          setCheerPoints(parseInt(e.target.value))
                        }
                        className="flex-1 h-3 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #0097b2 0%, #0097b2 ${
                            (cheerPoints / Math.min(100, availableHeartbits)) *
                            100
                          }%, #e2e8f0 ${
                            (cheerPoints / Math.min(100, availableHeartbits)) *
                            100
                          }%, #e2e8f0 100%)`,
                        }}
                      />
                      <div className="text-center min-w-20">
                        <div
                          className="text-3xl font-black"
                          style={{
                            color: "#0097b2",
                            fontFamily: "Avenir, sans-serif",
                          }}
                        >
                          {cheerPoints}
                        </div>
                        <div
                          className="text-xs font-semibold"
                          style={{
                            color: "#64748b",
                            fontFamily: "Avenir, sans-serif",
                          }}
                        >
                          MAX {Math.min(100, availableHeartbits)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={
                      anyLoading ||
                      isSubmitting ||
                      selectedUsers.length === 0 ||
                      !messageText.trim() ||
                      bulkCheerMutation.isLoading ||
                      cheerPoints > availableHeartbits
                    }
                    className="w-full text-white py-4 px-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed font-black text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                    style={{
                      background:
                        "linear-gradient(135deg, #0097b2 0%, #4a6e7e 100%)",
                      fontFamily: "Avenir, sans-serif",
                    }}
                  >
                    {bulkCheerMutation.isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-6 h-6" />
                        <span>Send Heartbits</span>
                        <HeartIconSolid className="w-6 h-6" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* ENHANCED HEARTBITS WIDGET */}
            <div
              className="rounded-3xl shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid #e2e8f0",
              }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
                  }}
                >
                  <HeartIconSolid className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3
                    className="text-2xl font-black"
                    style={{
                      color: "#1a0202",
                      fontFamily: "Avenir, sans-serif",
                    }}
                  >
                    Your Heartbits
                  </h3>
                </div>
              </div>

              <div className="space-y-6">
                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="text-center p-4 rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    }}
                  >
                    <div
                      className="text-4xl font-black mb-1"
                      style={{
                        color: "#1e40af",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      {availableHeartbits}
                    </div>
                    <div
                      className="text-sm font-bold"
                      style={{
                        color: "#1e40af",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Available
                    </div>
                  </div>

                  <div
                    className="text-center p-4 rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                    }}
                  >
                    <div
                      className="text-4xl font-black mb-1"
                      style={{
                        color: "#065f46",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      {pointsData?.data?.monthlyReceivedHeartbits || 0}
                    </div>
                    <div
                      className="text-sm font-bold"
                      style={{
                        color: "#065f46",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Received
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: "#1a0202",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Monthly Usage
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: "#0097b2",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      {pointsData?.data?.monthlyCheerUsed || 0} /{" "}
                      {pointsData?.data?.monthlyCheerLimit || 100}
                    </span>
                  </div>

                  <div
                    className="relative h-4 rounded-full overflow-hidden"
                    style={{ backgroundColor: "#e2e8f0" }}
                  >
                    <div
                      className="h-full transition-all duration-1000 relative overflow-hidden"
                      style={{
                        width: `${Math.min(
                          ((pointsData?.data?.monthlyCheerUsed || 0) /
                            (pointsData?.data?.monthlyCheerLimit || 100)) *
                            100,
                          100
                        )}%`,
                        background:
                          "linear-gradient(90deg, #0097b2 0%, #4a6e7e 100%)",
                      }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                          animation: "shimmer 2s infinite",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-center mt-2">
                    <span
                      className="text-2xl font-black"
                      style={{
                        color: "#0097b2",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      {Math.round(
                        ((pointsData?.data?.monthlyCheerUsed || 0) /
                          (pointsData?.data?.monthlyCheerLimit || 100)) *
                          100
                      )}
                      %
                    </span>
                    <span
                      className="text-sm font-semibold ml-2"
                      style={{
                        color: "#64748b",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Used
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* una */}
          {/* Right Column - Feed & Leaderboard */}

          <div className="lg:col-span-2 space-y-6">
            {/* ENHANCED CHEER FEED */}
            <div
              className="rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl cheer-feed-section"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
              }}
            >
              {/* Feed Header with Date Filter */}
              <div
                className="px-6 py-5 border-b border-gray-200"
                style={{
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left side - Title */}
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110"
                      style={{
                        background:
                          "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      }}
                    >
                      <FireIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2
                        className="text-2xl font-black"
                        style={{
                          color: "#1a0202",
                          fontFamily: "Avenir, sans-serif",
                        }}
                      >
                        Recent Cheers
                      </h2>
                      <p
                        className="text-sm"
                        style={{
                          color: "#64748b",
                          fontFamily: "Avenir, sans-serif",
                        }}
                      >
                        {totalItems} total cheers
                      </p>
                    </div>
                  </div>

                  {/* Right side - Date Filter */}
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="cheer-date-picker"
                      className="text-sm font-bold whitespace-nowrap"
                      style={{
                        color: "#1a0202",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Filter by Date:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="cheer-date-picker"
                        type="date"
                        className="px-4 py-2 rounded-xl text-sm transition-all duration-300 focus:ring-4 focus:outline-none"
                        style={{
                          border: "2px solid #e2e8f0",
                          backgroundColor: "#ffffff",
                          fontFamily: "Avenir, sans-serif",
                          color: "#1a0202",
                          cursor: "pointer",
                        }}
                        value={selectedDate}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#0097b2";
                          e.target.style.boxShadow =
                            "0 0 0 4px rgba(0, 151, 178, 0.1)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e2e8f0";
                          e.target.style.boxShadow = "none";
                        }}
                      />

                      {selectedDate && (
                        <button
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
                          style={{
                            background:
                              "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                            color: "#ffffff",
                            fontWeight: "bold",
                          }}
                          onClick={() => setSelectedDate("")}
                          title="Clear filter"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feed Content */}
              <div className="max-h-[600px] overflow-y-auto p-6">
                {feedLoading ? (
                  <div className="p-12 text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-yellow-500 animate-spin"></div>
                    </div>
                    <p
                      className="text-base font-medium"
                      style={{
                        color: "#64748b",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Loading cheers...
                    </p>
                  </div>
                ) : feed.length > 0 ? (
                  <div className="space-y-4">
                    {feed.map((cheer) => (
                      <div
                        key={cheer.cheer_id}
                        className="group relative rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                        style={{
                          background:
                            "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                          border: "1px solid #e2e8f0",
                          overflow: "hidden",
                        }}
                      >
                        {/* Accent bar */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:w-2"
                          style={{
                            background:
                              "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)",
                          }}
                        />

                        {/* Content */}
                        <div className="p-6 pl-8">
                          <div className="flex gap-4">
                            {/* Avatar */}
                            <img
                              src={
                                cheer.fromUser?.avatar ||
                                "/images/default-avatar.png"
                              }
                              alt={cheer.fromUser?.name}
                              className="w-14 h-14 rounded-2xl ring-2 ring-gray-200 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                            />

                            {/* Main Content */}
                            <div className="flex-1 min-w-0">
                              {/* Header */}
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span
                                  className="font-bold text-base truncate max-w-32"
                                  style={{
                                    color: "#1a0202",
                                    fontFamily: "Avenir, sans-serif",
                                  }}
                                >
                                  {cheer.fromUser?.name}
                                </span>
                                <span className="text-gray-500 text-sm">
                                  cheered
                                </span>
                                <span
                                  className="font-bold text-base truncate max-w-32"
                                  style={{
                                    color: "#1a0202",
                                    fontFamily: "Avenir, sans-serif",
                                  }}
                                >
                                  {cheer.toUser?.name}
                                </span>
                                <div
                                  className="px-3 py-1 rounded-full text-sm font-black shadow-md flex items-center gap-1"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                                    color: "#ffffff",
                                  }}
                                >
                                  <span>+{cheer.points}</span>
                                  <HeartIconSolid
                                    className="w-3 h-3"
                                    style={{ color: "#ef4444" }}
                                  />
                                  <span>bits</span>
                                </div>
                              </div>

                              {/* Message */}
                              {cheer.message && (
                                <p
                                  className="mb-4 text-base leading-relaxed"
                                  style={{
                                    color: "#374151",
                                    fontFamily: "Avenir, sans-serif",
                                  }}
                                >
                                  {cheer.message}
                                </p>
                              )}

                              {/* Actions */}
                              <div className="flex items-center gap-4 mb-2">
                                <button
                                  onClick={() =>
                                    likeMutation.mutate(cheer.cheer_id)
                                  }
                                  disabled={likeMutation.isLoading}
                                  className="flex items-center gap-2 transition-all duration-200 hover:scale-110 active:scale-95 px-3 py-1.5 rounded-xl"
                                  style={{
                                    background: likedCheers.has(cheer.cheer_id)
                                      ? "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)"
                                      : "#f8fafc",
                                    color: likedCheers.has(cheer.cheer_id)
                                      ? "#dc2626"
                                      : "#64748b",
                                    fontFamily: "Avenir, sans-serif",
                                    border: `1px solid ${
                                      likedCheers.has(cheer.cheer_id)
                                        ? "#fca5a5"
                                        : "#e2e8f0"
                                    }`,
                                  }}
                                >
                                  {likedCheers.has(cheer.cheer_id) ? (
                                    <HeartIconSolid className="w-5 h-5" />
                                  ) : (
                                    <HeartIcon className="w-5 h-5" />
                                  )}
                                  <span className="text-sm font-bold">
                                    {cheer.heartCount || cheer.likeCount || 0}
                                  </span>
                                </button>

                                <button
                                  onClick={() =>
                                    handleCommentClick(cheer.cheer_id)
                                  }
                                  className="flex items-center gap-2 transition-all duration-200 hover:scale-110 active:scale-95 px-3 py-1.5 rounded-xl"
                                  style={{
                                    background:
                                      commentingCheer === cheer.cheer_id
                                        ? "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
                                        : "#f8fafc",
                                    color:
                                      commentingCheer === cheer.cheer_id
                                        ? "#065f46"
                                        : "#64738b",
                                    fontFamily: "Avenir, sans-serif",
                                    border: `1px solid ${
                                      commentingCheer === cheer.cheer_id
                                        ? "#6ee7b7"
                                        : "#e2e8f0"
                                    }`,
                                  }}
                                >
                                  <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                                  <span className="text-sm font-bold">
                                    {cheer.commentCount || 0}
                                  </span>
                                </button>

                                <span
                                  className="text-sm font-medium ml-auto"
                                  style={{
                                    color: "#94a3b8",
                                    fontFamily: "Avenir, sans-serif",
                                  }}
                                >
                                  {formatTimeAgo(cheer.createdAt)}
                                </span>
                              </div>

                              {/* Comments Section */}
                              {commentingCheer === cheer.cheer_id && (
                                <div
                                  className="mt-4 p-4 rounded-2xl"
                                  style={{
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                  }}
                                >
                                  {/* Add Comment */}
                                  <div className="flex gap-2 mb-4">
                                    <input
                                      type="text"
                                      value={commentText}
                                      onChange={(e) =>
                                        setCommentText(e.target.value)
                                      }
                                      placeholder="Write a comment..."
                                      className="flex-1 px-4 py-2 rounded-xl text-sm transition-all duration-200 focus:ring-4"
                                      style={{
                                        border: "2px solid #e2e8f0",
                                        fontFamily: "Avenir, sans-serif",
                                        color: "#1a0202",
                                      }}
                                      onFocus={(e) => {
                                        e.target.style.borderColor = "#0097b2";
                                        e.target.style.boxShadow =
                                          "0 0 0 4px rgba(0, 151, 178, 0.1)";
                                      }}
                                      onBlur={(e) => {
                                        e.target.style.borderColor = "#e2e8f0";
                                        e.target.style.boxShadow = "none";
                                      }}
                                      onKeyPress={(e) => {
                                        if (
                                          e.key === "Enter" &&
                                          commentText.trim()
                                        ) {
                                          commentMutation.mutate({
                                            cheerId: cheer.cheer_id,
                                            comment: commentText.trim(),
                                          });
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={() => {
                                        if (commentText.trim()) {
                                          commentMutation.mutate({
                                            cheerId: cheer.cheer_id,
                                            comment: commentText.trim(),
                                          });
                                        }
                                      }}
                                      disabled={
                                        !commentText.trim() ||
                                        commentMutation.isLoading
                                      }
                                      className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                                      style={{
                                        background:
                                          "linear-gradient(135deg, #0097b2 0%, #4a6e7e 100%)",
                                        color: "#ffffff",
                                        fontFamily: "Avenir, sans-serif",
                                      }}
                                    >
                                      Post
                                    </button>
                                  </div>

                                  {/* Comments List */}
                                  <div className="space-y-3">
                                    {loadingComments ? (
                                      <div className="flex items-center justify-center py-4">
                                        <div
                                          className="animate-spin rounded-full h-5 w-5 border-2 border-transparent border-t-2"
                                          style={{ borderTopColor: "#0097b2" }}
                                        ></div>
                                      </div>
                                    ) : (
                                      (() => {
                                        const commentData = cheerComments.get(
                                          cheer.cheer_id
                                        ) || { comments: [] };
                                        const comments = commentData.comments;
                                        if (
                                          Array.isArray(comments) &&
                                          comments.length > 0
                                        ) {
                                          return (
                                            <>
                                              {comments.map(
                                                (comment, index) => {
                                                  const commentKey =
                                                    comment._id ||
                                                    comment.id ||
                                                    `comment-${cheer.cheer_id}-${index}`;
                                                  return (
                                                    <div
                                                      key={commentKey}
                                                      className="rounded-xl p-3 transition-all duration-200 hover:scale-[1.01]"
                                                      style={{
                                                        background: "#ffffff",
                                                        border:
                                                          "1px solid #e2e8f0",
                                                      }}
                                                    >
                                                      <div className="flex gap-3">
                                                        <img
                                                          src={
                                                            comment.fromUser
                                                              ?.avatar ||
                                                            "/images/default-avatar.png"
                                                          }
                                                          alt={
                                                            comment.fromUser
                                                              ?.name || "User"
                                                          }
                                                          className="w-10 h-10 rounded-xl ring-1 ring-gray-200 flex-shrink-0"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                          <div className="flex items-center gap-2 mb-1">
                                                            <span
                                                              className="font-bold text-sm"
                                                              style={{
                                                                color:
                                                                  "#1a0202",
                                                                fontFamily:
                                                                  "Avenir, sans-serif",
                                                              }}
                                                            >
                                                              {comment.fromUser
                                                                ?.name ||
                                                                "Anonymous"}
                                                            </span>
                                                            <span
                                                              className="text-xs"
                                                              style={{
                                                                color:
                                                                  "#94a3b8",
                                                                fontFamily:
                                                                  "Avenir, sans-serif",
                                                              }}
                                                            >
                                                              {formatTimeAgo(
                                                                comment.createdAt
                                                              )}
                                                            </span>
                                                          </div>

                                                          {editingComment &&
                                                          editingComment.cheerId ===
                                                            cheer.cheer_id &&
                                                          editingComment.commentId ===
                                                            comment._id ? (
                                                            <div className="flex items-center gap-2">
                                                              <input
                                                                type="text"
                                                                value={
                                                                  editCommentText
                                                                }
                                                                onChange={(e) =>
                                                                  setEditCommentText(
                                                                    e.target
                                                                      .value
                                                                  )
                                                                }
                                                                className="flex-1 px-3 py-1 rounded-lg border text-sm"
                                                                style={{
                                                                  fontFamily:
                                                                    "Avenir, sans-serif",
                                                                }}
                                                                disabled={
                                                                  editCommentMutation.isLoading
                                                                }
                                                              />
                                                              <button
                                                                className="px-3 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                                                                style={{
                                                                  background:
                                                                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                                                  color:
                                                                    "#ffffff",
                                                                }}
                                                                disabled={
                                                                  editCommentMutation.isLoading ||
                                                                  !editCommentText.trim()
                                                                }
                                                                onClick={() =>
                                                                  editCommentMutation.mutate(
                                                                    {
                                                                      cheerId:
                                                                        cheer.cheer_id,
                                                                      commentId:
                                                                        comment._id,
                                                                      comment:
                                                                        editCommentText.trim(),
                                                                    }
                                                                  )
                                                                }
                                                              >
                                                                Save
                                                              </button>
                                                              <button
                                                                className="px-3 py-1 rounded-lg text-xs font-bold"
                                                                style={{
                                                                  background:
                                                                    "#e2e8f0",
                                                                  color:
                                                                    "#64748b",
                                                                }}
                                                                onClick={() => {
                                                                  setEditingComment(
                                                                    null
                                                                  );
                                                                  setEditCommentText(
                                                                    ""
                                                                  );
                                                                }}
                                                              >
                                                                Cancel
                                                              </button>
                                                            </div>
                                                          ) : (
                                                            <p
                                                              className="text-sm"
                                                              style={{
                                                                color:
                                                                  "#374151",
                                                                fontFamily:
                                                                  "Avenir, sans-serif",
                                                              }}
                                                            >
                                                              {comment.comment}
                                                            </p>
                                                          )}

                                                          {/* Edit/Delete buttons */}
                                                          {comment.fromUser
                                                            ?._id === user.id &&
                                                            !editingComment && (
                                                              <div className="flex gap-2 mt-2">
                                                                {confirmingDelete &&
                                                                confirmingDelete.cheerId ===
                                                                  cheer.cheer_id &&
                                                                confirmingDelete.commentId ===
                                                                  comment._id ? (
                                                                  <>
                                                                    <span
                                                                      className="text-xs font-bold mr-2"
                                                                      style={{
                                                                        color:
                                                                          "#ef4444",
                                                                      }}
                                                                    >
                                                                      Delete?
                                                                    </span>
                                                                    <button
                                                                      className="px-2 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                                                                      style={{
                                                                        background:
                                                                          "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                                                        color:
                                                                          "#ffffff",
                                                                      }}
                                                                      onClick={() => {
                                                                        deleteCommentMutation.mutate(
                                                                          {
                                                                            cheerId:
                                                                              cheer.cheer_id,
                                                                            commentId:
                                                                              comment._id,
                                                                          }
                                                                        );
                                                                        setConfirmingDelete(
                                                                          null
                                                                        );
                                                                      }}
                                                                    >
                                                                      Yes
                                                                    </button>
                                                                    <button
                                                                      className="px-2 py-1 rounded-lg text-xs font-bold"
                                                                      style={{
                                                                        background:
                                                                          "#e2e8f0",
                                                                        color:
                                                                          "#64748b",
                                                                      }}
                                                                      onClick={() =>
                                                                        setConfirmingDelete(
                                                                          null
                                                                        )
                                                                      }
                                                                    >
                                                                      No
                                                                    </button>
                                                                  </>
                                                                ) : (
                                                                  <>
                                                                    <button
                                                                      className="px-2 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                                                                      style={{
                                                                        background:
                                                                          "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                                                                        color:
                                                                          "#ffffff",
                                                                      }}
                                                                      onClick={() => {
                                                                        setEditingComment(
                                                                          {
                                                                            cheerId:
                                                                              cheer.cheer_id,
                                                                            commentId:
                                                                              comment._id,
                                                                          }
                                                                        );
                                                                        setEditCommentText(
                                                                          comment.comment
                                                                        );
                                                                      }}
                                                                    >
                                                                      Edit
                                                                    </button>
                                                                    <button
                                                                      className="px-2 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                                                                      style={{
                                                                        background:
                                                                          "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                                                        color:
                                                                          "#ffffff",
                                                                      }}
                                                                      onClick={() =>
                                                                        setConfirmingDelete(
                                                                          {
                                                                            cheerId:
                                                                              cheer.cheer_id,
                                                                            commentId:
                                                                              comment._id,
                                                                          }
                                                                        )
                                                                      }
                                                                    >
                                                                      Delete
                                                                    </button>
                                                                  </>
                                                                )}
                                                              </div>
                                                            )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  );
                                                }
                                              )}
                                              {commentData.hasMore && (
                                                <button
                                                  className="w-full py-2 text-sm font-bold rounded-xl transition-all hover:scale-105"
                                                  style={{
                                                    color: "#0097b2",
                                                    background: "#f8fafc",
                                                    border: "1px solid #e2e8f0",
                                                    fontFamily:
                                                      "Avenir, sans-serif",
                                                  }}
                                                  onClick={() =>
                                                    fetchComments(
                                                      cheer.cheer_id,
                                                      true
                                                    )
                                                  }
                                                >
                                                  Load more
                                                </button>
                                              )}
                                            </>
                                          );
                                        } else {
                                          return (
                                            <p
                                              className="text-sm text-center py-4"
                                              style={{
                                                color: "#94a3b8",
                                                fontFamily:
                                                  "Avenir, sans-serif",
                                              }}
                                            >
                                              No comments yet
                                            </p>
                                          );
                                        }
                                      })()
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Date stamp */}
                          <div
                            className="absolute bottom-3 right-4 text-xs font-medium px-2 py-1 rounded-lg"
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              color: "#94a3b8",
                              fontFamily: "Avenir, sans-serif",
                            }}
                          >
                            {formatFullDateTime(
                              cheer.createdAt || cheer.posted_at
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <HeartIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{
                        color: "#64748b",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      No cheers yet
                    </h3>
                    <p
                      className="text-base"
                      style={{
                        color: "#94a3b8",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Be the first to spread positivity! 🌟
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className="px-6 py-4 border-t border-gray-200"
                  style={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95 shadow-md"
                      style={{
                        background:
                          currentPage === 1
                            ? "#f1f5f9"
                            : "linear-gradient(135deg, #0097b2 0%, #4a6e7e 100%)",
                        color: currentPage === 1 ? "#64748b" : "#ffffff",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Previous
                    </button>

                    <div className="flex gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className="w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-110 active:scale-95 shadow-md"
                              style={{
                                background:
                                  currentPage === pageNum
                                    ? "linear-gradient(135deg, #0097b2 0%, #4a6e7e 100%)"
                                    : "#ffffff",
                                color:
                                  currentPage === pageNum
                                    ? "#ffffff"
                                    : "#475569",
                                fontFamily: "Avenir, sans-serif",
                                border: `1px solid ${
                                  currentPage === pageNum
                                    ? "transparent"
                                    : "#e2e8f0"
                                }`,
                              }}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95 shadow-md"
                      style={{
                        background:
                          currentPage === totalPages
                            ? "#f1f5f9"
                            : "linear-gradient(135deg, #0097b2 0%, #4a6e7e 100%)",
                        color:
                          currentPage === totalPages ? "#64748b" : "#ffffff",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ENHANCED LEADERBOARD */}
            <div
              className="rounded-3xl shadow-2xl p-6 transition-all duration-300 hover:shadow-3xl"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
              }}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110"
                    style={{
                      background:
                        "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                    }}
                  >
                    <TrophyIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2
                      className="text-2xl font-black"
                      style={{
                        color: "#1a0202",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Leaderboard
                    </h2>
                    <p
                      className="text-sm"
                      style={{
                        color: "#64748b",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Top performers
                    </p>
                  </div>
                </div>

                {/* Period Tabs */}
                <div className="flex gap-2">
                  {["weekly", "monthly", "alltime"].map((period) => (
                    <button
                      key={period}
                      onClick={() => setActiveTab(period)}
                      className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                      style={{
                        background:
                          activeTab === period
                            ? "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)"
                            : "#f8fafc",
                        color: activeTab === period ? "#ffffff" : "#64748b",
                        fontFamily: "Avenir, sans-serif",
                        border: `1px solid ${
                          activeTab === period ? "transparent" : "#e2e8f0"
                        }`,
                      }}
                    >
                      {period === "alltime"
                        ? "All Time"
                        : period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current User Position */}
              {user && currentUserLeaderboard && (
                <>
                  <div className="mb-4">
                    <p
                      className="text-sm font-bold mb-2"
                      style={{
                        color: "#64748b",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Your Position
                    </p>
                    <div
                      className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
                      style={{
                        background:
                          "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                        border: "2px solid #fbbf24",
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-lg"
                        style={{
                          background:
                            currentUserLeaderboard.rank === 1
                              ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
                              : currentUserLeaderboard.rank === 2
                              ? "linear-gradient(135deg, #C0C0C0 0%, #808080 100%)"
                              : currentUserLeaderboard.rank === 3
                              ? "linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)"
                              : "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
                          color: "#ffffff",
                          textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        {currentUserLeaderboard.rank}
                      </div>
                      <img
                        src={
                          currentUserLeaderboard.info?.avatar ||
                          "/images/default-avatar.png"
                        }
                        alt={currentUserLeaderboard.info?.name}
                        className="w-12 h-12 rounded-xl ring-2 ring-white"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-bold text-base truncate"
                          style={{
                            color: "#92400e",
                            fontFamily: "Avenir, sans-serif",
                          }}
                        >
                          {currentUserLeaderboard.info?.name ||
                            user.first_name + " " + user.last_name}
                        </p>
                      </div>
                      <span
                        className="font-black text-lg"
                        style={{
                          color: "#92400e",
                          fontFamily: "Avenir, sans-serif",
                        }}
                      >
                        {currentUserLeaderboard.info?.totalPoints ||
                          currentUserLeaderboard.totalPoints ||
                          0}{" "}
                        received
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    className="h-px my-6"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, #e2e8f0 20%, #e2e8f0 80%, transparent)",
                    }}
                  ></div>
                </>
              )}

              {/* Leaderboard List */}
              {leaderboardLoading ? (
                <div className="text-center py-12">
                  <div className="relative w-16 h-16 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-500 border-r-orange-500 animate-spin"></div>
                  </div>
                  <p
                    className="text-base font-medium"
                    style={{
                      color: "#64748b",
                      fontFamily: "Avenir, sans-serif",
                    }}
                  >
                    Loading leaderboard...
                  </p>
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {leaderboard
                    .slice(0, showMoreLeaderboard ? 10 : 3)
                    .map((entry) => (
                      <div
                        key={entry._id || entry.userId || entry.user_id}
                        className="group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                        style={{
                          background:
                            "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {/* Rank Badge */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-lg transform transition-transform duration-300 group-hover:scale-110"
                          style={{
                            background:
                              entry.rank === 1
                                ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
                                : entry.rank === 2
                                ? "linear-gradient(135deg, #C0C0C0 0%, #808080 100%)"
                                : entry.rank === 3
                                ? "linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)"
                                : "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
                            color: "#ffffff",
                            textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                          }}
                        >
                          {entry.rank}
                        </div>

                        {/* Avatar */}
                        <img
                          src={entry.avatar || "/images/default-avatar.png"}
                          alt={entry.name || entry.userName}
                          className="w-12 h-12 rounded-xl ring-2 ring-gray-200 transition-transform duration-300 group-hover:scale-110"
                        />

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-bold text-base truncate"
                            style={{
                              color: "#1a0202",
                              fontFamily: "Avenir, sans-serif",
                            }}
                          >
                            {entry.name || entry.userName}
                          </p>
                          {entry.rank <= 3 && (
                            <p
                              className="text-xs font-semibold"
                              style={{
                                color: "#64748b",
                                fontFamily: "Avenir, sans-serif",
                              }}
                            >
                              {entry.rank === 1
                                ? "🥇 Champion"
                                : entry.rank === 2
                                ? "🥈 Runner-up"
                                : "🥉 3rd Place"}
                            </p>
                          )}
                        </div>

                        {/* Points */}
                        <div className="text-right">
                          <div
                            className="font-black text-lg"
                            style={{
                              color:
                                entry.rank === 1
                                  ? "#f59e0b"
                                  : entry.rank === 2
                                  ? "#94a3b8"
                                  : entry.rank === 3
                                  ? "#92400e"
                                  : "#64738b",
                              fontFamily: "Avenir, sans-serif",
                            }}
                          >
                            {entry.totalPoints || entry.total_earned}
                          </div>
                          <div
                            className="text-xs font-semibold"
                            style={{
                              color: "#94a3b8",
                              fontFamily: "Avenir, sans-serif",
                            }}
                          >
                            received
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Show More/Less Button */}
                  {leaderboard.length > 3 && (
                    <button
                      onClick={() =>
                        setShowMoreLeaderboard(!showMoreLeaderboard)
                      }
                      className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md mt-4"
                      style={{
                        background:
                          "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                        color: "#0097b2",
                        fontFamily: "Avenir, sans-serif",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {showMoreLeaderboard ? "↑ Show Less" : "↓ Show More"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <TrophyIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{
                      color: "#64748b",
                      fontFamily: "Avenir, sans-serif",
                    }}
                  >
                    No rankings yet
                  </h3>
                  <p
                    className="text-base"
                    style={{
                      color: "#94a3b8",
                      fontFamily: "Avenir, sans-serif",
                    }}
                  >
                    Start sending cheers to see who's on top! 🏆
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* End of right column */}
          {/* last */}
        </div>
      </div>
    </div>
  );
};

export default CheerPage;
