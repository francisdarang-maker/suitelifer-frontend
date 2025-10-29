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
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { formatFullDateTime } from "../../utils/dateHelpers";
import defaultAvatar from "../../assets/images/defaultAvatar.svg";
import Loading from "../../components/loader/Loading";

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

  const [allCheers, setAllCheers] = useState([]);
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  const groupCheersBySenderAndTime = (cheers) => {
    if (!Array.isArray(cheers)) return [];

    const grouped = new Map();

    cheers.forEach((cheer) => {
      // Create a key based on sender ID and created time (rounded to nearest minute)
      const createdAt = new Date(cheer.createdAt);
      const timeKey = Math.floor(createdAt.getTime() / 60000); // Group by minute
      const key = `${cheer.fromUser?._id || cheer.from_user_id}-${timeKey}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          ...cheer,
          recipients: [cheer.toUser],
          totalPoints: cheer.points,
          cheer_ids: [cheer.cheer_id],
        });
      } else {
        const existing = grouped.get(key);
        existing.recipients.push(cheer.toUser);
        existing.totalPoints += cheer.points;
        existing.cheer_ids.push(cheer.cheer_id);
      }
    });

    return Array.from(grouped.values());
  };

  useEffect(() => {
    setAllCheers([]);
    setCurrentPage(1);
  }, [selectedDate]);

  const { isLoading: statsLoading } = useQuery({
    queryKey: ["cheer-stats"],
    queryFn: pointsSystemApi.getCheerStats,
    staleTime: 2 * 60 * 1000,
    enabled: !!user && Object.keys(user).length > 0,
  });

  const { data: pointsData, isLoading: pointsLoading } = useQuery({
    queryKey: ["points"],
    queryFn: pointsSystemApi.getPoints,
    staleTime: 1 * 60 * 1000,
    enabled: !!user && Object.keys(user).length > 0,
  });

  const {
    data: cheerFeed,
    isLoading: feedLoading,
    refetch: refetchCheerFeed,
  } = useQuery({
    queryKey: ["cheer-feed", selectedDate, currentPage, itemsPerPage],
    queryFn: async () => {
      const offset = (currentPage - 1) * itemsPerPage;
      if (selectedDate) {
        const [year, month, day] = selectedDate.split("-").map(Number);
        const from = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const to = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
        return pointsSystemApi.getCheerFeed(
          itemsPerPage,
          from.toISOString(),
          to.toISOString(),
          offset
        );
      } else {
        return pointsSystemApi.getCheerFeed(1000, null, null, 0);
      }
    },
    staleTime: 1 * 60 * 1000,
    enabled: !!user && Object.keys(user).length > 0,
    onSuccess: (data) => {
      const allCheers = data?.data?.cheers || data?.cheers || [];
      setAllCheers(allCheers);
    },
  });

  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["leaderboard", activeTab, user?.id],
    queryFn: () => pointsSystemApi.getLeaderboard(activeTab, user?.id),
    staleTime: 2 * 60 * 1000,
    enabled: !!user && Object.keys(user).length > 0,
  });

  const leaderboard = leaderboardData?.data || [];
  const currentUserLeaderboard = leaderboardData?.currentUser || null;

  const { data: searchResults = [] } = useQuery({
    queryKey: ["user-search", searchQuery],
    queryFn: () => pointsSystemApi.searchUsers(searchQuery),
    enabled: searchQuery.length >= 1 && !!user && Object.keys(user).length > 0,
    staleTime: 30 * 1000,
  });

  const bulkCheerMutation = useMutation({
    mutationFn: ({ recipientId, amount, message }) => {
      return pointsSystemApi.sendCheer(recipientId, amount, message);
    },
  });

  const likeMutation = useMutation({
    mutationFn: (cheerId) => pointsSystemApi.toggleCheerLike(cheerId),
    onSuccess: (data, cheerId) => {
      const likeStatus =
        data.liked !== undefined ? data.liked : data.data && data.data.liked;
      const wasPreviouslyLiked = likedCheers.has(cheerId);
      const finalLikeStatus =
        likeStatus !== undefined ? likeStatus : !wasPreviouslyLiked;

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
      refetchCheerFeed();
    },
    onError: () => {
      toast.error("Failed to update heart");
    },
  });
  const commentMutation = useMutation({
    mutationFn: ({ cheerId, comment }) =>
      pointsSystemApi.addCheerComment(cheerId, comment),
    onSuccess: async (data, variables) => {
      setCommentText("");
      // Immediately reload comments from server to get fresh data
      await fetchComments(variables.cheerId, false);
      queryClient.invalidateQueries(["cheer-feed"]);
      refetchCheerFeed();
      toast.success("Comment added!");
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

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

  const deleteCommentMutation = useMutation({
    mutationFn: ({ cheerId, commentId }) =>
      pointsSystemApi.deleteCheerComment(cheerId, commentId),
    onSuccess: async (_, variables) => {
      setLoadingComments(true);

      // First invalidate queries to trigger refetch
      await queryClient.invalidateQueries(["cheer-feed"]);
      await refetchCheerFeed();

      // Then reload comments for the specific cheer
      await fetchComments(variables.cheerId, false);

      setLoadingComments(false);
      toast.success("Comment deleted!");
    },
    onError: () => {
      setLoadingComments(false);
      toast.error("Failed to delete comment");
    },
  });

  useEffect(() => {
    const persistedLikes = JSON.parse(
      localStorage.getItem("likedCheers") || "[]"
    );
    if (persistedLikes.length > 0) {
      setLikedCheers(new Set(persistedLikes));
    }
    return () => {
      const lastCleared = localStorage.getItem("likedCheersLastCleared");
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      if (!lastCleared || now - parseInt(lastCleared) > oneDay) {
        localStorage.removeItem("likedCheers");
        localStorage.setItem("likedCheersLastCleared", now.toString());
      }
    };
  }, []);

  useEffect(() => {
    if (allCheers && Array.isArray(allCheers)) {
      const likedCheerIds = new Set();
      const serverLikedCheerIds = new Set();
      allCheers.forEach((cheer) => {
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
      const persistedLikes = JSON.parse(
        localStorage.getItem("likedCheers") || "[]"
      );
      persistedLikes.forEach((cheerId) => {
        if (!serverLikedCheerIds.has(cheerId)) {
          likedCheerIds.add(cheerId);
        }
      });
      setLikedCheers(likedCheerIds);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleCommentClick = (cheerId) => {
    const isOpening = commentingCheer !== cheerId;
    setCommentingCheer(isOpening ? cheerId : null);
    if (isOpening) {
      fetchComments(cheerId, false);
    }
  };

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

  const MAX_RECIPIENTS = 5;

  const handleUserSelect = (user) => {
    setSelectedUsers((prev) => {
      if (prev.length >= MAX_RECIPIENTS) return prev; // 🔒 Prevent adding more
      return [...prev, user];
    });
    setCheerText("");
    setShowUserDropdown(false);
  };

  const [isSending, setIsSending] = useState(false);

  const handleCheerSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSending(true); // start spinner

    // ✅ VALIDATION
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one recipient");
      setIsSending(false);
      return;
    }

    if (!messageText.trim()) {
      toast.error("Please enter a message for your cheer");
      setIsSending(false);
      return;
    }

    const totalHeartbitsNeeded = cheerPoints * selectedUsers.length;
    if (totalHeartbitsNeeded > availableHeartbits) {
      toast.error(
        `Not enough heartbits available. You need ${totalHeartbitsNeeded} heartbits but you only have ${availableHeartbits} remaining.`
      );
      setIsSending(false);
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
        }
      }

      if (errorCount === 0) {
        toast.success(`Cheers sent to ${successCount} recipients! 🎉`);
        setSelectedUsers([]);
        setCheerText("");
        setMessageText("");
        setCheerPoints(1);
        queryClient.invalidateQueries(["points"]);
        queryClient.invalidateQueries(["cheer-feed"]);
        queryClient.invalidateQueries(["leaderboard"]);
        setAllCheers([]);
      } else if (successCount > 0) {
        toast.warning(`Sent ${successCount} cheers, but ${errorCount} failed.`);
      } else {
        toast.error("Failed to send any cheers. Please try again.");
      }
    };

    sendCheersSequentially()
      .catch((error) => {
        const backendMsg =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to send cheers";
        toast.error(backendMsg);
      })
      .finally(() => {
        setIsSubmitting(false);
        setIsSending(false); // 👈 THIS IS CRITICAL
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
      return "Invalid date";
    }
  };

  if (!user || Object.keys(user).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <HeartIconSolid className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Please log in to access Cheer a Peer.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const anyLoading =
    statsLoading || pointsLoading || feedLoading || leaderboardLoading;

  if (anyLoading) {
    return <Loading />;
  }

  const availableHeartbits =
    (pointsData?.data?.monthlyCheerLimit || 100) -
    (pointsData?.data?.monthlyCheerUsed || 0);

  const allData = cheerFeed?.data?.cheers || cheerFeed?.cheers || [];
  const pageStartIndex = (currentPage - 1) * itemsPerPage;
  const pageEndIndex = pageStartIndex + itemsPerPage;
  const feed = allData.slice(pageStartIndex, pageEndIndex);
  const groupedFeed = groupCheersBySenderAndTime(feed);

  const totalItems = allData.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const feedSection = document.querySelector(".cheer-feed-section");
    if (feedSection) {
      feedSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT: Send Cheer + Stats */}
          <div className="space-y-4 ">
            {/* Send Cheer Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PaperAirplaneIcon className="w-5 h-5 text-blue-600" />
                Send Heartbits
              </h2>

              <form onSubmit={handleCheerSubmit} className="space-y-4">
                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipients ({selectedUsers.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map((user, index) => (
                        <span
                          key={user.user_id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                        >
                          <img
                            src={user.avatar || defaultAvatar}
                            alt={user.name}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="max-w-24 truncate">{user.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedUsers((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                            className="ml-1 hover:text-blue-900"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Search Peers */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Peers
                  </label>
                  <input
                    type="text"
                    value={cheerText}
                    onChange={handleCheerTextChange}
                    placeholder={
                      selectedUsers.length >= MAX_RECIPIENTS
                        ? `Limit reached (${MAX_RECIPIENTS} people)`
                        : "Type a name..."
                    }
                    disabled={selectedUsers.length >= MAX_RECIPIENTS} // ✅ Disable when full
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      selectedUsers.length >= MAX_RECIPIENTS
                        ? "bg-gray-100 cursor-not-allowed opacity-70"
                        : ""
                    }`}
                  />

                  {/* Dropdown (only shows if under limit) */}
                  {showUserDropdown &&
                    selectedUsers.length < MAX_RECIPIENTS &&
                    Array.isArray(searchResults) &&
                    searchResults.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
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
                              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                            >
                              <img
                                src={result.avatar || defaultAvatar}
                                alt={result.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900 truncate">
                                  {result.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {result.email}
                                </p>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}

                  {/* Notice when limit reached */}
                  {selectedUsers.length >= MAX_RECIPIENTS && (
                    <p className="text-xs text-red-500 mt-2">
                      You can only send Heartbits to up to {MAX_RECIPIENTS}{" "}
                      people at a time.
                    </p>
                  )}
                </div>
                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Share why they deserve recognition..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    rows="3"
                    required
                  />
                </div>
                {/* Points Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Heartbits Amount
                    </label>
                    <span className="text-2xl font-bold text-blue-600">
                      {cheerPoints}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={Math.min(100, availableHeartbits)}
                    value={cheerPoints}
                    onChange={(e) => setCheerPoints(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>Max: {Math.min(100, availableHeartbits)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={
                    anyLoading ||
                    isSubmitting ||
                    selectedUsers.length === 0 ||
                    !messageText.trim() ||
                    bulkCheerMutation.isLoading ||
                    cheerPoints > availableHeartbits ||
                    isSending
                  }
                  className="w-full bg-primary text-white py-2.5 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSending || bulkCheerMutation.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-5 h-5" />
                      <span>Send Heartbits</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HeartIconSolid className="w-5 h-5 text-rose-500" />
                Your Heartbits
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">
                    {availableHeartbits}
                  </div>
                  <div className="text-xs text-blue-600 font-medium mt-0.5">
                    Available
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
                  <div className="text-2xl font-bold text-green-600">
                    {pointsData?.data?.monthlyReceivedHeartbits || 0}
                  </div>
                  <div className="text-xs text-green-600 font-medium mt-0.5">
                    Received
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                  <span>Monthly Usage</span>
                  <span className="font-medium">
                    {pointsData?.data?.monthlyCheerUsed || 0} /{" "}
                    {pointsData?.data?.monthlyCheerLimit || 100}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        ((pointsData?.data?.monthlyCheerUsed || 0) /
                          (pointsData?.data?.monthlyCheerLimit || 100)) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Leaderboard Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-amber-500" />
                  Leaderboard
                </h3>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
                {["weekly", "monthly", "alltime"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setActiveTab(period)}
                    className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      activeTab === period
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {period === "alltime"
                      ? "All Time"
                      : period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>

              {/* Current User */}
              {user && currentUserLeaderboard && (
                <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs font-medium text-amber-700 mb-2">
                    Your Position
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {currentUserLeaderboard.rank}
                    </div>
                    <img
                      src={currentUserLeaderboard.info?.avatar || defaultAvatar}
                      alt={currentUserLeaderboard.info?.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {currentUserLeaderboard.info?.name ||
                          user.first_name + " " + user.last_name}
                      </p>
                    </div>
                    <span className="font-bold text-sm text-amber-700">
                      {currentUserLeaderboard.info?.totalPoints ||
                        currentUserLeaderboard.totalPoints ||
                        0}
                    </span>
                  </div>
                </div>
              )}

              {/* Leaderboard List */}
              {leaderboardLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mx-auto"></div>
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard
                    .slice(0, showMoreLeaderboard ? 10 : 5)
                    .map((entry) => (
                      <div
                        key={entry._id || entry.userId || entry.user_id}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm ${
                            entry.rank === 1
                              ? "bg-gradient-to-br from-amber-400 to-amber-500"
                              : entry.rank === 2
                              ? "bg-gradient-to-br from-gray-400 to-gray-500"
                              : entry.rank === 3
                              ? "bg-gradient-to-br from-orange-400 to-orange-500"
                              : "bg-gray-400"
                          }`}
                        >
                          {entry.rank}
                        </div>
                        <img
                          src={entry.avatar || defaultAvatar}
                          alt={entry.name || entry.userName}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {entry.name || entry.userName}
                          </p>
                        </div>
                        <span className="font-bold text-sm text-gray-700">
                          {entry.totalPoints || entry.total_earned}
                        </span>
                      </div>
                    ))}

                  {leaderboard.length > 5 && (
                    <button
                      onClick={() =>
                        setShowMoreLeaderboard(!showMoreLeaderboard)
                      }
                      className="w-full py-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      {showMoreLeaderboard ? "Show Less" : "Show More"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrophyIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No rankings yet</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 cheer-feed-section">
              {/* Header */}
              <div className="px-4 py-3.5 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FireIcon className="w-5 h-5 text-orange-500" />
                    <h2 className="text-base font-semibold text-gray-900">
                      Recent Cheers
                    </h2>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {totalItems}
                    </span>
                  </div>

                  {/* Date Filter */}
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedDate}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    {selectedDate && (
                      <button
                        className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        onClick={() => setSelectedDate("")}
                        title="Clear filter"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Feed Content */}
              <div className="max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-180px)] lg:max-h-[1108px] overflow-y-auto p-2 sm:p-3 md:p-4">
                {feedLoading ? (
                  <div className="text-center py-8 sm:py-10">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-2 border-gray-300 border-t-blue-600 mx-auto mb-2 sm:mb-3"></div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Loading cheers...
                    </p>
                  </div>
                ) : groupedFeed.length > 0 ? (
                  <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                    {groupedFeed.map((cheer) => (
                      <div
                        key={cheer.cheer_ids.join("-")}
                        className="border border-gray-200 rounded-lg p-2.5 sm:p-3 md:p-3.5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-2 sm:gap-3">
                          <img
                            src={cheer.fromUser?.avatar || defaultAvatar}
                            alt={cheer.fromUser?.name}
                            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex-shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                              <div className="text-xs sm:text-sm md:text-base text-gray-900 leading-snug flex-1">
                                <span
                                  className="font-semibold cursor-pointer"
                                  title={cheer.fromUser?.name}
                                >
                                  {cheer.fromUser?.name}
                                </span>{" "}
                                <span className="text-gray-500">cheered</span>{" "}
                                {cheer.recipients
                                  .slice(0, 5)
                                  .map((recipient, idx) => (
                                    <span
                                      key={idx}
                                      className="font-semibold text-primary"
                                      title={recipient?.name}
                                    >
                                      {recipient?.name}
                                      {idx <
                                        Math.min(
                                          4,
                                          cheer.recipients.length - 1
                                        ) && ","}{" "}
                                    </span>
                                  ))}
                                {cheer.recipients.length > 5 && (
                                  <span className="text-gray-600 font-medium">
                                    and {cheer.recipients.length - 5}{" "}
                                    {cheer.recipients.length - 5 === 1
                                      ? "other"
                                      : "others"}
                                  </span>
                                )}{" "}
                                <span className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] sm:text-xs font-bold ml-1 align-middle">
                                  +{cheer.totalPoints}
                                  <HeartIconSolid className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500" />
                                </span>
                              </div>

                              <span className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0 sm:ml-auto">
                                {formatTimeAgo(cheer.createdAt)}
                              </span>
                            </div>

                            {/* Message */}
                            {cheer.message && (
                              <div className="w-full p-2 sm:p-2.5 md:p-3 border-none rounded-md bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary mb-2 sm:mb-3">
                                {(() => {
                                  const urlRegex =
                                    /(https?:\/\/[^\s]+\.(?:gif|jpg|jpeg|png|webp)(?:\?[^\s]*)?)/gi;
                                  const parts = cheer.message.split(urlRegex);

                                  return parts.map((part, index) => {
                                    if (urlRegex.test(part)) {
                                      return (
                                        <div key={index} className="my-2">
                                          <img
                                            src={part}
                                            alt="Shared content"
                                            className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                                            style={{ maxHeight: "200px" }}
                                            onError={(e) => {
                                              e.target.style.display = "none";
                                              e.target.nextSibling.style.display =
                                                "block";
                                            }}
                                          />
                                          <a
                                            href={part}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 underline break-all"
                                            style={{ display: "none" }}
                                          >
                                            {part}
                                          </a>
                                        </div>
                                      );
                                    }
                                    return part ? (
                                      <p
                                        key={index}
                                        className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words"
                                      >
                                        {part}
                                      </p>
                                    ) : null;
                                  });
                                })()}
                              </div>
                            )}

                            {/* Actions - Using first cheer_id for interactions */}
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                              <button
                                onClick={() =>
                                  likeMutation.mutate(cheer.cheer_id)
                                }
                                disabled={likeMutation.isLoading}
                                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-colors touch-manipulation ${
                                  likedCheers.has(cheer.cheer_id)
                                    ? "bg-red-50 text-red-600"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 active:bg-gray-200"
                                }`}
                              >
                                {likedCheers.has(cheer.cheer_id) ? (
                                  <HeartIconSolid className="w-3 h-3 sm:w-4 sm:h-4" />
                                ) : (
                                  <HeartIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                )}
                                <span>
                                  {cheer.heartCount || cheer.likeCount || 0}
                                </span>
                              </button>

                              <button
                                onClick={() =>
                                  handleCommentClick(cheer.cheer_id)
                                }
                                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-colors touch-manipulation ${
                                  commentingCheer === cheer.cheer_id
                                    ? "bg-green-50 text-green-600"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 active:bg-gray-200"
                                }`}
                              >
                                <ChatBubbleLeftEllipsisIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{cheer.commentCount || 0}</span>
                              </button>
                            </div>

                            {/* Comments section remains the same */}
                            {commentingCheer === cheer.cheer_id && (
                              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                                <div className="flex gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                  <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) =>
                                      setCommentText(e.target.value)
                                    }
                                    placeholder="Write a comment..."
                                    className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg text-[10px] sm:text-xs font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                                  >
                                    Post
                                  </button>
                                </div>

                                {/* Rest of comments section stays the same */}
                                <div className="space-y-1.5 sm:space-y-2">
                                  {loadingComments ? (
                                    <div className="flex justify-center py-2 sm:py-3">
                                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-gray-300 border-t-blue-600"></div>
                                    </div>
                                  ) : (
                                    (() => {
                                      const commentData = cheerComments.get(
                                        cheer.cheer_id
                                      ) || {
                                        comments: [],
                                      };
                                      const comments = commentData.comments;
                                      if (
                                        Array.isArray(comments) &&
                                        comments.length > 0
                                      ) {
                                        return (
                                          <>
                                            {comments.map((comment, index) => {
                                              const commentKey =
                                                comment._id ||
                                                comment.id ||
                                                `comment-${cheer.cheer_id}-${index}`;
                                              const isEditing =
                                                editingComment &&
                                                editingComment.cheerId ===
                                                  cheer.cheer_id &&
                                                editingComment.commentId ===
                                                  comment._id;
                                              const isDeleting =
                                                confirmingDelete &&
                                                confirmingDelete.cheerId ===
                                                  cheer.cheer_id &&
                                                confirmingDelete.commentId ===
                                                  comment._id;
                                              const isOwnComment =
                                                comment.fromUser?._id ===
                                                user.id;

                                              return (
                                                <div
                                                  key={commentKey}
                                                  className="group bg-gray-50 rounded-lg p-2 sm:p-2.5 hover:bg-gray-100 transition-colors duration-200"
                                                >
                                                  <div className="flex gap-2 sm:gap-3">
                                                    <img
                                                      src={
                                                        comment.fromUser
                                                          ?.avatar ||
                                                        defaultAvatar
                                                      }
                                                      alt={
                                                        comment.fromUser
                                                          ?.name || "User"
                                                      }
                                                      className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex-shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                      <div className="flex items-start sm:items-center justify-between mb-1 gap-2">
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 min-w-0">
                                                          <span className="font-medium text-xs sm:text-sm text-gray-900 truncate">
                                                            {comment.fromUser
                                                              ?.name ||
                                                              "Anonymous"}
                                                          </span>
                                                          <span className="text-[10px] sm:text-xs text-gray-400 flex-shrink-0">
                                                            {formatTimeAgo(
                                                              comment.createdAt
                                                            )}
                                                          </span>
                                                        </div>
                                                        {isOwnComment &&
                                                          !isEditing && (
                                                            <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                                                              <button
                                                                className="p-1 sm:p-1.5 rounded hover:bg-amber-50 transition-colors"
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
                                                                title="Edit comment"
                                                              >
                                                                <svg
                                                                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-amber-600"
                                                                  fill="none"
                                                                  stroke="currentColor"
                                                                  viewBox="0 0 24 24"
                                                                >
                                                                  <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                      2
                                                                    }
                                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                  />
                                                                </svg>
                                                              </button>

                                                              <button
                                                                className="p-1 sm:p-1.5 rounded hover:bg-red-50 transition-colors"
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
                                                                title="Delete comment"
                                                              >
                                                                <svg
                                                                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-red-600"
                                                                  fill="none"
                                                                  stroke="currentColor"
                                                                  viewBox="0 0 24 24"
                                                                >
                                                                  <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                      2
                                                                    }
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                  />
                                                                </svg>
                                                              </button>
                                                            </div>
                                                          )}
                                                      </div>

                                                      {isEditing ? (
                                                        <div className="space-y-2">
                                                          <textarea
                                                            value={
                                                              editCommentText
                                                            }
                                                            onChange={(e) =>
                                                              setEditCommentText(
                                                                e.target.value
                                                              )
                                                            }
                                                            className="w-full px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                            rows="2"
                                                            disabled={
                                                              editCommentMutation.isLoading
                                                            }
                                                          />
                                                          <div className="flex gap-2">
                                                            <button
                                                              className="flex-1 px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
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
                                                              {editCommentMutation.isLoading
                                                                ? "Saving..."
                                                                : "Save"}
                                                            </button>
                                                            <button
                                                              className="flex-1 px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 bg-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-400 active:bg-gray-500 transition-colors touch-manipulation"
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
                                                        </div>
                                                      ) : (
                                                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words">
                                                          {comment.comment}
                                                        </p>
                                                      )}

                                                      {isDeleting && (
                                                        <div className="mt-2 p-2 sm:p-3 bg-red-50 rounded-lg border border-red-200">
                                                          <p className="text-xs sm:text-sm text-red-800 font-medium mb-2">
                                                            Are you sure you
                                                            want to delete this
                                                            comment?
                                                          </p>
                                                          <div className="flex gap-2">
                                                            <button
                                                              className="flex-1 px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-red-700 active:bg-red-800 transition-colors touch-manipulation"
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
                                                              Delete
                                                            </button>
                                                            <button
                                                              className="flex-1 px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 bg-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-400 active:bg-gray-500 transition-colors touch-manipulation"
                                                              onClick={() =>
                                                                setConfirmingDelete(
                                                                  null
                                                                )
                                                              }
                                                            >
                                                              Cancel
                                                            </button>
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                            {commentData.hasMore && (
                                              <button
                                                className="w-full py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors touch-manipulation"
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
                                          <p className="text-xs sm:text-sm text-gray-500 text-center py-2">
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-10 md:py-12">
                    <HeartIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-2" />
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1">
                      No cheers yet
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Be the first to spread positivity! 🌟
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    <div className="flex gap-1 mx-2">
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
                              className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                                currentPage === pageNum
                                  ? "bg-primary text-white"
                                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                              }`}
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
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheerPage;
