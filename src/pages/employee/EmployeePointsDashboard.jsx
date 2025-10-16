import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pointsSystemApi } from "../../api/pointsSystemApi";
import { useStore } from "../../store/authStore";
import { toast } from "react-hot-toast";
import {
  StarIcon,
  GiftIcon,
  ChartBarIcon,
  PlusIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import logoFs from "../../assets/logos/logo-fs.svg";
import defaultAvatar from "../../assets/images/defaultAvatar.svg";

const PointsDashboard = () => {
  const user = useStore((state) => state.user);
  const queryClient = useQueryClient();
  const [cheerModalOpen, setCheerModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [cheerAmount, setCheerAmount] = useState(10);
  const [cheerMessage, setCheerMessage] = useState("");
  const [moderationNotification, setModerationNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  // Safe date formatting function
  const formatDateSafely = (dateValue) => {
    try {
      if (!dateValue) return "No date";

      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error, "for value:", dateValue);
      return "Invalid date";
    }
  };

  // Get user avatar utility function
  const getUserAvatar = (transaction) => {
    if (transaction.related_user_avatar) {
      return transaction.related_user_avatar;
    }
    return defaultAvatar; // Default avatar fallback
  };

  // Check for moderation notifications in transaction history
  const checkForModerationNotifications = useCallback((transactions) => {
    if (!transactions || !Array.isArray(transactions)) {
      return;
    }

    const moderationTransactions = transactions.filter((t) => {
      const isModeration = t.type === "moderation";
      const hasModerationMessage =
        t.type === "notification" && t.message?.includes("moderated");
      return isModeration || hasModerationMessage;
    });

    if (moderationTransactions.length > 0) {
      const latestModeration = moderationTransactions[0]; // Most recent first

      // Get the transaction ID from the correct field
      const transactionId =
        latestModeration.transactionId || latestModeration.transaction_id;

      // Check if this notification has been dismissed in the database
      let metadata = latestModeration.metadata;
      if (typeof metadata === "string") {
        try {
          metadata = JSON.parse(metadata);
        } catch (e) {
          metadata = {};
        }
      }

      const isDismissed = metadata?.dismissed === true;

      if (isDismissed) {
        return; // Skip if already dismissed
      }

      // Only show notification if it has a proper reason or is very recent (within last 24 hours)
      const notificationDate = new Date(
        latestModeration.created_at || latestModeration.createdAt
      );
      const isRecent =
        Date.now() - notificationDate.getTime() < 24 * 60 * 60 * 1000; // 24 hours

      // If no reason provided and not recent, don't show the notification
      if (!metadata?.reason && !isRecent) {
        return;
      }

      const action = metadata?.action || "moderated";
      const actionText =
        action === "hidden"
          ? "hidden"
          : action === "deleted"
          ? "deleted"
          : action === "unhidden"
          ? "restored"
          : "moderated";

      setModerationNotification({
        type: "moderation",
        message:
          latestModeration.message ||
          `Your cheer post has been ${actionText} by our moderation team.`,
        reason: metadata?.reason || "No reason provided",
        date: latestModeration.created_at,
        action: action,
        transactionId: transactionId,
      });
    }
  }, []);

  // Fetch user's points data
  const {
    data: pointsData,
    isLoading: pointsLoading,
    error: pointsError,
  } = useQuery({
    queryKey: ["points"],
    queryFn: pointsSystemApi.getPoints,
    staleTime: 10 * 1000, // 10 seconds (reduced from 1 minute)
    enabled: !!user?.id, // Only fetch when user is loaded
  });

  // Listen for storage events to refresh points data when orders are cancelled
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "points-updated" && e.newValue === "true") {
        // Invalidate points cache when orders are cancelled
        queryClient.invalidateQueries(["points"]);
        queryClient.invalidateQueries(["points-history"]);
        // Clear the flag
        localStorage.removeItem("points-updated");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [queryClient]);

  // Fetch points history with pagination
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["points-history", currentPage, itemsPerPage],
    queryFn: () => {
      const offset = (currentPage - 1) * itemsPerPage;
      return pointsSystemApi.getPointsHistory(itemsPerPage, offset);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!user?.id, // Only fetch when user is loaded
  });

  // Check for moderation notifications when history data changes
  useEffect(() => {
    if (historyData?.data) {
      checkForModerationNotifications(historyData.data);
    }
  }, [historyData, checkForModerationNotifications]);

  // Get total count from pagination data
  const totalItems = historyData?.pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Fetch users for cheer functionality with search
  const { data: usersData } = useQuery({
    queryKey: ["users-search", ""],
    queryFn: () => pointsSystemApi.searchUsers(""),
    enabled: false, // Only fetch when needed
    staleTime: 30 * 1000, // 30 seconds
  });

  // Send cheer mutation
  const cheerMutation = useMutation({
    mutationFn: ({ recipientId, amount, message }) =>
      pointsSystemApi.sendCheer(recipientId, amount, message),
    onSuccess: () => {
      toast.success("Cheer sent successfully! 🎉");
      setCheerModalOpen(false);
      setSelectedUser("");
      setCheerMessage("");
      setCheerAmount(10);
      // Refresh points data
      queryClient.invalidateQueries(["points"]);
      queryClient.invalidateQueries(["points-history"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send cheer");
    },
  });

  if (!user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0097b2] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  const handleSendCheer = (e) => {
    e.preventDefault();
    if (!selectedUser || cheerAmount < 1) {
      toast.error("Please select a user and enter a valid amount");
      return;
    }

    cheerMutation.mutate({
      recipientId: selectedUser,
      amount: cheerAmount,
      message: cheerMessage,
    });
  };

  if (pointsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: "#0097b2" }}
        ></div>
      </div>
    );
  }

  if (pointsError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div
          className="text-lg font-semibold mb-2"
          style={{
            color: "#1a0202",
            fontFamily: "Avenir, sans-serif",
            fontWeight: "700",
          }}
        >
          Error Loading Points
        </div>
        <div
          className="text-sm"
          style={{ color: "#4a6e7e", fontFamily: "Avenir, sans-serif" }}
        >
          {pointsError.message}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-white px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: "#0097b2",
            fontFamily: "Avenir, sans-serif",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#007a92")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#0097b2")}
        >
          Retry
        </button>
      </div>
    );
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case "purchase":
        return <GiftIcon className="w-5 h-5" style={{ color: "#1a0202" }} />;
      case "given":
        return (
          <HeartIconSolid className="w-5 h-5" style={{ color: "#0097b2" }} />
        );
      case "received":
        return (
          <HeartIconSolid className="w-5 h-5" style={{ color: "#bfd1a0" }} />
        );
      case "admin_grant":
      case "admin_added":
        return <PlusIcon className="w-5 h-5" style={{ color: "#0097b2" }} />;
      case "admin_deduct":
        return <PlusIcon className="w-5 h-5" style={{ color: "#1a0202" }} />;
      default:
        return <StarIcon className="w-5 h-5" style={{ color: "#0097b2" }} />;
    }
  };

  // Filter transactions (excluding moderation notifications)
  const filteredTransactions =
    historyData?.data?.filter((transaction) => {
      if (transaction.type === "moderation") return false;
      if (transaction.type === "given")
        return transaction.fromUserId === user.id;
      if (transaction.type === "received")
        return transaction.toUserId === user.id;
      if (transaction.type === "admin_grant")
        return transaction.toUserId === user.id;
      if (transaction.type === "admin_deduct")
        return transaction.toUserId === user.id;
      return true; // keep all other types
    }) || [];

  // Calculate display indices
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of transactions section
    const transactionsSection = document.querySelector(".transactions-section");
    if (transactionsSection) {
      transactionsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="min-h-screen bg-white py-8 px-40">
      {/* Moderation Notification Banner */}
      {moderationNotification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3">
          <div
            className={`relative overflow-hidden rounded-lg shadow-md transform transition-all duration-200 ease-out animate-in slide-in-from-top-1 ${
              moderationNotification.action === "hidden"
                ? "bg-gradient-to-r from-amber-50 to-orange-50 border-l-3 border-amber-400"
                : moderationNotification.action === "deleted"
                ? "bg-gradient-to-r from-red-50 to-rose-50 border-l-3 border-red-500"
                : "bg-gradient-to-r from-green-50 to-teal-50 border-l-3 border-green-500"
            }`}
          >
            <div className="relative p-2">
              <div className="flex items-start gap-2">
                {/* Content area */}
                <div className="flex-1 min-w-0">
                  {/* Header with X button in upper right */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* Icon beside title */}
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          moderationNotification.action === "hidden"
                            ? "bg-amber-100 text-amber-600"
                            : moderationNotification.action === "deleted"
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {moderationNotification.action === "hidden" ? (
                          <ExclamationTriangleIcon className="h-4 w-4 animate-pulse" />
                        ) : moderationNotification.action === "deleted" ? (
                          <ExclamationTriangleIcon className="h-4 w-4 animate-pulse" />
                        ) : (
                          <ExclamationTriangleIcon className="h-4 w-4 animate-pulse" />
                        )}
                      </div>
                      <h3
                        className={`text-sm font-bold truncate ${
                          moderationNotification.action === "hidden"
                            ? "text-amber-800"
                            : moderationNotification.action === "deleted"
                            ? "text-red-800"
                            : "text-green-800"
                        }`}
                      >
                        {moderationNotification.action === "hidden"
                          ? "Hidden Post"
                          : moderationNotification.action === "deleted"
                          ? "Deleted Post"
                          : moderationNotification.action === "unhidden"
                          ? "Restored Post"
                          : "Moderated Post"}
                      </h3>
                    </div>

                    {/* Close button in upper right */}
                    <button
                      type="button"
                      onClick={() => setModerationNotification(null)}
                      className={`p-1 rounded-full transition-all duration-200 hover:scale-110 ${
                        moderationNotification.action === "hidden"
                          ? "text-amber-500 hover:bg-amber-100"
                          : moderationNotification.action === "deleted"
                          ? "text-red-500 hover:bg-red-100"
                          : "text-green-500 hover:bg-green-100"
                      }`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Message and reason with Got it button in bottom right */}
                  <div className="ml-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            moderationNotification.action === "hidden"
                              ? "text-amber-700"
                              : moderationNotification.action === "deleted"
                              ? "text-red-700"
                              : "text-green-700"
                          }`}
                        >
                          {moderationNotification.message}
                        </p>

                        {/* Reason */}
                        {moderationNotification.reason && (
                          <div className="flex items-center gap-1 mt-1">
                            <div
                              className={`w-1 h-1 rounded-full ${
                                moderationNotification.action === "hidden"
                                  ? "bg-amber-500"
                                  : moderationNotification.action === "deleted"
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              }`}
                            ></div>
                            <p
                              className={`text-sm ${
                                moderationNotification.action === "hidden"
                                  ? "text-amber-600"
                                  : moderationNotification.action === "deleted"
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {moderationNotification.reason}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action button in bottom right */}
                      <button
                        type="button"
                        onClick={async () => {
                          if (moderationNotification?.transactionId) {
                            try {
                              await pointsSystemApi.dismissModerationNotification(
                                moderationNotification.transactionId
                              );
                              setModerationNotification(null);
                              queryClient.invalidateQueries(["points-history"]);
                            } catch (error) {
                              setModerationNotification(null);
                            }
                          } else {
                            setModerationNotification(null);
                          }
                        }}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md font-medium text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex-shrink-0 self-end ${
                          moderationNotification.action === "hidden"
                            ? "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500"
                            : moderationNotification.action === "deleted"
                            ? "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
                            : "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500"
                        } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                      >
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Got it
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          {/* Header content can be added here if needed in the future */}
        </div>
        {/* Points Overview Cards */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Balance - Blue (Trust, Stability) */}
          <div
            className="group relative rounded-xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 overflow-hidden cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
              borderRadius: "18px",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
              }}
            />

            <div className="relative flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-bold mb-2 "
                  style={{ color: "#1e40af", fontFamily: "Avenir, sans-serif" }}
                >
                  Current Balance
                </p>
                <p
                  className="text-4xl font-black mb-1 transition-all duration-300 group-hover:scale-110 lg:text-md"
                  style={{
                    color: "#1e40af",
                    fontFamily: "Avenir, sans-serif",
                    fontWeight: "900",
                  }}
                >
                  {pointsData?.data?.currentBalance || 0}
                </p>
                <p
                  className="text-xs font-semibold opacity-80"
                  style={{ color: "#1e40af", fontFamily: "Avenir, sans-serif" }}
                >
                  Points
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <StarIconSolid
                  className="w-14 h-14 relative transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 lg:hidden 2xl:inline"
                  style={{ color: "#1e40af" }}
                />
              </div>
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-500 group-hover:h-1.5"
              style={{
                background: "linear-gradient(90deg, #3b82f6 0%, #1e40af 100%)",
              }}
            />
          </div>

          {/* Heartbits Remaining - Pink/Rose (Emotional, Giving) */}
          <div
            className="group relative rounded-xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 overflow-hidden cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
              borderRadius: "18px",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(236, 72, 153, 0.15) 0%, transparent 70%)",
              }}
            />

            <div className="relative flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-bold mb-2"
                  style={{ color: "#be185d", fontFamily: "Avenir, sans-serif" }}
                >
                  Heartbits Remaining
                </p>
                <p
                  className="text-4xl font-black mb-1 transition-all duration-300 group-hover:scale-110"
                  style={{
                    color: "#be185d",
                    fontFamily: "Avenir, sans-serif",
                    fontWeight: "900",
                  }}
                >
                  {(pointsData?.data?.monthlyCheerLimit || 100) -
                    (pointsData?.data?.monthlyCheerUsed || 0)}
                </p>
                <p
                  className="text-xs font-semibold opacity-80"
                  style={{ color: "#be185d", fontFamily: "Avenir, sans-serif" }}
                >
                  This Month
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-pink-400 rounded-full opacity-20 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <HeartIconSolid
                  className="w-14 h-14 relative transition-transform duration-300 group-hover:scale-110 group-hover:animate-pulse lg:hidden 2xl:inline"
                  style={{ color: "#be185d" }}
                />
              </div>
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-500 group-hover:h-1.5"
              style={{
                background: "linear-gradient(90deg, #ec4899 0%, #be185d 100%)",
              }}
            />
          </div>

          {/* Total Earned - Green (Growth, Success) */}
          <div
            className="group relative rounded-xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 overflow-hidden cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
              borderRadius: "18px",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
              }}
            />

            <div className="relative flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-bold mb-2 lg:whitespace-normal"
                  style={{ color: "#065f46", fontFamily: "Avenir, sans-serif" }}
                >
                  Total{" "}
                  <span className="hidden lg:inline xl:hidden">
                    <br />
                  </span>
                  Earned
                </p>

                <p
                  className="text-4xl font-black mb-1 transition-all duration-300 group-hover:scale-110"
                  style={{
                    color: "#065f46",
                    fontFamily: "Avenir, sans-serif",
                    fontWeight: "900",
                  }}
                >
                  {pointsData?.data?.totalEarned || 0}
                </p>
                <p
                  className="text-xs font-semibold opacity-80"
                  style={{ color: "#065f46", fontFamily: "Avenir, sans-serif" }}
                >
                  All Time
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <TrophyIcon
                  className="w-14 h-14 relative transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12 lg:hidden 2xl:inline"
                  style={{ color: "#065f46" }}
                />
              </div>
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-500 group-hover:h-1.5"
              style={{
                background: "linear-gradient(90deg, #10b981 0%, #065f46 100%)",
              }}
            />
          </div>

          {/* Total Spent - Orange/Amber (Active, Neutral) */}
          <div
            className="group relative rounded-xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 overflow-hidden cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)",
              borderRadius: "18px",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(251, 146, 60, 0.15) 0%, transparent 70%)",
              }}
            />

            <div className="relative flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-bold mb-2 lg:whitespace-normal xl:whitespace-nowrap"
                  style={{ color: "#92400e", fontFamily: "Avenir, sans-serif" }}
                >
                  Total{" "}
                  <span className="hidden lg:inline xl:hidden">
                    <br />
                  </span>
                  Spent
                </p>

                <p
                  className="text-4xl font-black mb-1 transition-all duration-300 group-hover:scale-110"
                  style={{
                    color: "#92400e",
                    fontFamily: "Avenir, sans-serif",
                    fontWeight: "900",
                  }}
                >
                  {pointsData?.data?.totalSpent || 0}
                </p>
                <p
                  className="text-xs font-semibold opacity-80"
                  style={{ color: "#92400e", fontFamily: "Avenir, sans-serif" }}
                >
                  Points
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-orange-400 rounded-full opacity-20 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <GiftIcon
                  className="w-14 h-14 relative transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 lg:hidden 2xl:inline"
                  style={{ color: "#92400e" }}
                />
              </div>
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-500 group-hover:h-1.5"
              style={{
                background: "linear-gradient(90deg, #fb923c 0%, #92400e 100%)",
              }}
            />
          </div>
        </div>
        {/* Recent Activity */}
        {/* Replace */}
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-white via-gray-50 to-slate-100 shadow-2xl border border-white/20 backdrop-blur-xl transactions-section">
          {/* Animated Header with Gradient */}
          <div className="relative px-6 py-5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
            <div className="absolute inset-0 bg-grid-white/[0.05]"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full"></div>
                <h2
                  className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"
                  style={{ fontFamily: "Avenir, sans-serif" }}
                >
                  Recent Activity
                </h2>
              </div>
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-200/50">
                <p
                  className="text-xs font-bold text-cyan-600"
                  style={{ fontFamily: "Avenir, sans-serif" }}
                >
                  {filteredTransactions.length} transactions
                </p>
              </div>
            </div>
          </div>

          {/* Transactions List with Stagger Animation */}
          <div
            style={{
              maxHeight: "600px",
              overflowY: "auto",
            }}
            className="p-5 space-y-3"
          >
            {historyLoading ? (
              <div className="p-16 text-center">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 border-r-blue-500 animate-spin"></div>
                </div>
                <p
                  className="text-gray-500 text-sm font-medium"
                  style={{ fontFamily: "Avenir, sans-serif" }}
                >
                  Loading your activity...
                </p>
              </div>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction, index) => {
                const isAdminTransaction =
                  transaction.type === "admin_grant" ||
                  transaction.type === "admin_added" ||
                  transaction.type === "admin_deduct";

                const senderLabel = isAdminTransaction
                  ? "Admin"
                  : transaction.related_user || "Unknown";

                let displayDescription = transaction.description;

                if (
                  transaction.type === "received" &&
                  transaction.description &&
                  transaction.description.includes("points")
                ) {
                  displayDescription = transaction.description.replace(
                    "points",
                    "Heartbits"
                  );
                }

                if (
                  transaction.type === "received" &&
                  transaction.description &&
                  transaction.description.includes("from Admin")
                ) {
                  displayDescription = displayDescription.replace(
                    "from Admin",
                    `from ${transaction.related_user || "Unknown"}`
                  );
                }

                if (transaction.type === "given" && !displayDescription) {
                  displayDescription = `Cheered ${transaction.amount} heartbits`;
                }

                if (transaction.type === "received" && !displayDescription) {
                  displayDescription = `Received ${transaction.amount} heartbits`;
                }

                if (isAdminTransaction && !displayDescription) {
                  if (transaction.type === "admin_deduct") {
                    displayDescription = `Deducted ${Math.abs(
                      transaction.amount
                    )} heartbits by Admin`;
                  } else {
                    displayDescription = `Received ${transaction.amount} heartbits from Admin`;
                  }
                }

                const isNegative =
                  transaction.type === "purchase" ||
                  transaction.type === "given" ||
                  transaction.type === "admin_deduct";

                return (
                  <div
                    key={index}
                    className="group relative rounded-2xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] cursor-pointer"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
                      border: "1px solid rgba(226,232,240,0.8)",
                      overflow: "hidden",
                      animation: `slideIn 0.5s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    {/* Animated gradient accent bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 transition-all duration-500 group-hover:w-2"
                      style={{
                        width: "3px",
                        background: isNegative
                          ? "linear-gradient(180deg, #f87171 0%, #dc2626 50%, #991b1b 100%)"
                          : "linear-gradient(180deg, #34d399 0%, #10b981 50%, #059669 100%)",
                        boxShadow: isNegative
                          ? "0 0 20px rgba(248, 113, 113, 0.3)"
                          : "0 0 20px rgba(52, 211, 153, 0.3)",
                      }}
                    />

                    {/* Hover glow effect */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at top left, ${
                          isNegative
                            ? "rgba(248, 113, 113, 0.05)"
                            : "rgba(52, 211, 153, 0.05)"
                        } 0%, transparent 70%)`,
                      }}
                    />

                    <div className="relative p-5 pl-7 flex items-start justify-between gap-4">
                      {/* Left side - Avatar and Details */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Avatar with ring animation */}
                        <div className="flex-shrink-0 relative">
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 blur-lg group-hover:blur-xl transition-all duration-500"></div>
                          {isAdminTransaction ? (
                            <div className="relative">
                              <img
                                src={logoFs}
                                alt="Admin"
                                className="w-16 h-16 rounded-2xl object-cover shadow-xl transition-transform duration-500 group-hover:scale-110"
                                style={{ border: "3px solid #0097b2" }}
                              />
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                                <span className="text-white text-xs font-black">
                                  A
                                </span>
                              </div>
                            </div>
                          ) : transaction.related_user ? (
                            <img
                              src={getUserAvatar(transaction)}
                              alt={transaction.related_user}
                              className="w-16 h-16 rounded-2xl object-cover shadow-xl ring-2 ring-gray-200/50 transition-transform duration-500 group-hover:scale-110 group-hover:ring-4 group-hover:ring-cyan-300/50"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                              <span className="text-white text-3xl font-black">
                                +
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Transaction Details */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-bold text-gray-900 text-base mb-1 truncate transition-colors duration-300 group-hover:text-cyan-600"
                            style={{ fontFamily: "Avenir, sans-serif" }}
                          >
                            {displayDescription ||
                              transaction.type.replace("_", " ").toUpperCase()}
                          </p>
                          <p
                            className="text-sm text-gray-500 mb-3 flex items-center gap-2"
                            style={{ fontFamily: "Avenir, sans-serif" }}
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
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {formatDateSafely(
                              transaction.createdAt || transaction.created_at
                            )}
                          </p>

                          {/* Premium message bubble */}
                          {(isAdminTransaction ||
                            (["received", "given"].includes(transaction.type) &&
                              transaction.message)) && (
                            <div className="mt-3 inline-block max-w-full">
                              <div
                                className="px-4 py-2.5 rounded-2xl text-sm backdrop-blur-sm shadow-lg border transition-all duration-300 hover:scale-105"
                                style={{
                                  background:
                                    "linear-gradient(135deg, rgba(239, 246, 255, 0.9) 0%, rgba(219, 234, 254, 0.9) 100%)",
                                  border: "1px solid rgba(59, 130, 246, 0.3)",
                                  fontFamily: "Avenir, sans-serif",
                                }}
                              >
                                <p className="text-blue-700 font-medium italic">
                                  &ldquo;{transaction.message || ""}&rdquo;
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side - Amount badge with premium styling */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div
                          className="relative px-4 py-2 rounded-2xl font-black text-lg shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl"
                          style={{
                            background: isNegative
                              ? "linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fca5a5 100%)"
                              : "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)",
                            color: isNegative ? "#991b1b" : "#065f46",
                            fontFamily: "Avenir, sans-serif",
                          }}
                        >
                          <div
                            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{
                              boxShadow: isNegative
                                ? "0 0 30px rgba(220, 38, 38, 0.4)"
                                : "0 0 30px rgba(16, 185, 129, 0.4)",
                            }}
                          />
                          <span className="relative">
                            {isNegative ? "-" : "+"}
                            {transaction.amount}
                            {transaction.type === "received" ||
                            transaction.type === "given"
                              ? " bits"
                              : " pts"}
                          </span>
                        </div>

                        {transaction.related_user && !isAdminTransaction && (
                          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300/50">
                            <p
                              className="text-xs text-gray-600 font-bold"
                              style={{ fontFamily: "Avenir, sans-serif" }}
                            >
                              {transaction.type === "given" ? "to" : "from"}{" "}
                              {senderLabel}
                            </p>
                          </div>
                        )}

                        {isAdminTransaction && (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/50">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse"></div>
                            <p
                              className="text-xs font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent"
                              style={{ fontFamily: "Avenir, sans-serif" }}
                            >
                              from Admin
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-20 text-center">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ChartBarIcon className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <p
                  className="text-gray-600 font-bold text-lg mb-2"
                  style={{ fontFamily: "Avenir, sans-serif" }}
                >
                  No recent activity
                </p>
                <p
                  className="text-gray-400 text-sm"
                  style={{ fontFamily: "Avenir, sans-serif" }}
                >
                  Your transactions will appear here
                </p>
              </div>
            )}
          </div>

          {/* Premium Pagination */}
          {totalPages > 1 && (
            <div className="relative px-6 py-5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 via-white/50 to-slate-50/50 backdrop-blur-sm"></div>
              <div className="relative flex items-center justify-between">
                <div className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm">
                  <p
                    className="text-sm font-bold text-gray-700"
                    style={{ fontFamily: "Avenir, sans-serif" }}
                  >
                    Showing {startIndex}-{endIndex} of {totalItems}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Previous button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl"
                    style={{
                      background:
                        currentPage === 1
                          ? "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)"
                          : "linear-gradient(135deg, #0097b2 0%, #007a92 100%)",
                      color: currentPage === 1 ? "#94a3b8" : "#ffffff",
                      fontFamily: "Avenir, sans-serif",
                    }}
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center space-x-1.5">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                          className="w-11 h-11 rounded-xl text-sm font-black transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-xl"
                          style={{
                            background:
                              currentPage === pageNum
                                ? "linear-gradient(135deg, #0097b2 0%, #007a92 100%)"
                                : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                            color:
                              currentPage === pageNum ? "#ffffff" : "#475569",
                            fontFamily: "Avenir, sans-serif",
                            border:
                              currentPage === pageNum
                                ? "none"
                                : "1px solid #e2e8f0",
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl"
                    style={{
                      background:
                        currentPage === totalPages
                          ? "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)"
                          : "linear-gradient(135deg, #0097b2 0%, #007a92 100%)",
                      color: currentPage === totalPages ? "#94a3b8" : "#ffffff",
                      fontFamily: "Avenir, sans-serif",
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Replace */}
        {/* Send Heartbits Modal */}
        {cheerModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <HeartIconSolid
                  className="w-6 h-6"
                  style={{ color: "#0097b2" }}
                />
                Send Heartbits
              </h3>
              <form onSubmit={handleSendCheer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select User
                  </label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-4 focus:ring-[#0097b2] focus:border-transparent"
                    required
                  >
                    <option value="">Choose a user...</option>
                    {Array.isArray(usersData) &&
                      usersData.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (Points)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={pointsData?.data?.currentBalance || 0}
                    value={cheerAmount}
                    onChange={(e) => setCheerAmount(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-4 focus:ring-[#0097b2] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message (Optional)
                  </label>
                  <textarea
                    value={cheerMessage}
                    onChange={(e) => setCheerMessage(e.target.value)}
                    placeholder="Add a nice message..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none focus:ring-4 focus:ring-[#0097b2] focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setCheerModalOpen(false)}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={cheerMutation.isPending}
                    className="flex-1 text-white px-4 py-2 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    style={{
                      background:
                        "linear-gradient(135deg, #0097b2 0%, #4a6e7e 100%)",
                      fontFamily: "Avenir, sans-serif",
                      minWidth: "140px",
                      opacity: cheerMutation.isPending ? 0.5 : 1,
                    }}
                  >
                    {cheerMutation.isPending ? "Sending..." : "Send Heartbits"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsDashboard;
