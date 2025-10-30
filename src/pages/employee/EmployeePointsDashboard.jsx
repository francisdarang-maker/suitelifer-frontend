import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pointsSystemApi } from "../../api/pointsSystemApi";
import { useStore } from "../../store/authStore";
import { toast } from "react-hot-toast";
import {
  StarIcon,
  GiftIcon,
  ChartBarIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import logoFs from "../../assets/logos/logo-fs.svg";
import defaultAvatar from "../../assets/images/defaultAvatar.svg";
import Loading from "../../components/loader/Loading";

const PointsDashboard = () => {
  const user = useStore((state) => state.user);
  const queryClient = useQueryClient();

  const [cheerModalOpen, setCheerModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [cheerAmount, setCheerAmount] = useState(10);
  const [cheerMessage, setCheerMessage] = useState("");
  const [moderationNotification, setModerationNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTransactions, setExpandedTransactions] = useState(new Set());
  const itemsPerPage = 30;

  // Utility Functions
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

  const getUserAvatar = (transaction) => {
    // For bulk cheers, get the sender's avatar (the one who sent it)
    if (transaction.isBulkCheer && transaction.type === "given") {
      return user?.avatar || defaultAvatar; // Current user is the sender
    }
    return transaction.related_user_avatar || defaultAvatar;
  };

  const checkForModerationNotifications = useCallback((transactions) => {
    if (!transactions || !Array.isArray(transactions)) return;

    const moderationTransactions = transactions.filter((t) => {
      const isModeration = t.type === "moderation";
      const hasModerationMessage =
        t.type === "notification" && t.message?.includes("moderated");
      return isModeration || hasModerationMessage;
    });

    if (moderationTransactions.length === 0) return;

    const latestModeration = moderationTransactions[0];
    const transactionId =
      latestModeration.transactionId || latestModeration.transaction_id;

    let metadata = latestModeration.metadata;
    if (typeof metadata === "string") {
      try {
        metadata = JSON.parse(metadata);
      } catch (e) {
        metadata = {};
      }
    }

    if (metadata?.dismissed === true) return;

    const notificationDate = new Date(
      latestModeration.created_at || latestModeration.createdAt
    );
    const isRecent =
      Date.now() - notificationDate.getTime() < 24 * 60 * 60 * 1000;

    if (!metadata?.reason && !isRecent) return;

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
  }, []);

  // Helper function to group bulk cheers
  const groupBulkCheers = useCallback(
    (transactions) => {
      if (!Array.isArray(transactions)) return [];

      const grouped = new Map();
      const nonCheerTransactions = [];

      transactions.forEach((transaction) => {
        // Group both "received" and "given" type transactions
        if (
          (transaction.type === "received" || transaction.type === "given") &&
          transaction.message
        ) {
          const createdAt = new Date(
            transaction.created_at || transaction.createdAt
          );
          const timeKey = Math.floor(createdAt.getTime() / 60000); // Group by minute

          // For "given", group by current user (sender), for "received" group by sender
          const groupKey =
            transaction.type === "given"
              ? `${user.id}-${timeKey}-${transaction.message}-given`
              : `${transaction.fromUserId}-${timeKey}-${transaction.message}-received`;

          if (!grouped.has(groupKey)) {
            grouped.set(groupKey, {
              ...transaction,
              recipients: [transaction.related_user || "Unknown"],
              totalAmount: transaction.amount,
              transaction_ids: [
                transaction.transactionId || transaction.transaction_id,
              ],
              isBulkCheer: false,
            });
          } else {
            const existing = grouped.get(groupKey);
            existing.recipients.push(transaction.related_user || "Unknown");
            existing.totalAmount += transaction.amount;
            existing.transaction_ids.push(
              transaction.transactionId || transaction.transaction_id
            );
            existing.isBulkCheer = true;
          }
        } else {
          // Keep non-cheer transactions as-is
          nonCheerTransactions.push(transaction);
        }
      });

      // Combine grouped and non-grouped transactions
      const groupedArray = Array.from(grouped.values());
      return [...groupedArray, ...nonCheerTransactions].sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt);
        const dateB = new Date(b.created_at || b.createdAt);
        return dateB - dateA; // Most recent first
      });
    },
    [user.id]
  );

  // Queries
  const {
    data: pointsData,
    isLoading: pointsLoading,
    error: pointsError,
  } = useQuery({
    queryKey: ["points"],
    queryFn: pointsSystemApi.getPoints,
    staleTime: 10 * 1000,
    enabled: !!user?.id,
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["points-history", currentPage, itemsPerPage],
    queryFn: () => {
      const offset = (currentPage - 1) * itemsPerPage;
      return pointsSystemApi.getPointsHistory(itemsPerPage, offset);
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!user?.id,
  });

  const { data: usersData } = useQuery({
    queryKey: ["users-search", ""],
    queryFn: () => pointsSystemApi.searchUsers(""),
    enabled: false,
    staleTime: 30 * 1000,
  });

  // Mutations
  const cheerMutation = useMutation({
    mutationFn: ({ recipientId, amount, message }) =>
      pointsSystemApi.sendCheer(recipientId, amount, message),
    onSuccess: () => {
      toast.success("Cheer sent successfully! 🎉");
      setCheerModalOpen(false);
      setSelectedUser("");
      setCheerMessage("");
      setCheerAmount(10);
      queryClient.invalidateQueries(["points"]);
      queryClient.invalidateQueries(["points-history"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send cheer");
    },
  });

  // Effects
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "points-updated" && e.newValue === "true") {
        queryClient.invalidateQueries(["points"]);
        queryClient.invalidateQueries(["points-history"]);
        localStorage.removeItem("points-updated");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [queryClient]);

  useEffect(() => {
    if (historyData?.data) {
      checkForModerationNotifications(historyData.data);
    }
  }, [historyData, checkForModerationNotifications]);

  // Handlers
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const transactionsSection = document.querySelector(".transactions-section");
    if (transactionsSection) {
      transactionsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDismissNotification = async () => {
    if (moderationNotification?.transactionId) {
      try {
        await pointsSystemApi.dismissModerationNotification(
          moderationNotification.transactionId
        );
        queryClient.invalidateQueries(["points-history"]);
      } catch (error) {
        console.error("Failed to dismiss notification:", error);
      }
    }
    setModerationNotification(null);
  };

  // Early Returns
  if (!user?.id) {
    return <Loading />;
  }

  if (pointsLoading) {
    return <Loading />;
  }

  if (pointsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Error Loading Points
          </h2>
          <p className="text-sm text-gray-600 mb-4">{pointsError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Data Processing
  const rawFilteredTransactions =
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
      return true;
    }) || [];

  const filteredTransactions = groupBulkCheers(rawFilteredTransactions);

  const totalItems = historyData?.pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const getTransactionDisplay = (transaction) => {
    const isAdminTransaction = [
      "admin_grant",
      "admin_added",
      "admin_deduct",
    ].includes(transaction.type);

    let displayDescription = transaction.description;

    // Handle bulk cheer display for GIVEN transactions
    if (transaction.isBulkCheer && transaction.type === "given") {
      const recipientCount = transaction.recipients.length;
      displayDescription = `Cheered ${recipientCount} ${
        recipientCount === 1 ? "person" : "people"
      }`;
    }
    // Handle bulk cheer display for RECEIVED transactions
    else if (transaction.isBulkCheer && transaction.type === "received") {
      const sender = transaction.related_user || "Someone";
      const recipientCount = transaction.recipients.length;

      if (recipientCount > 1) {
        displayDescription = `${sender} cheered you and ${recipientCount - 1} ${
          recipientCount - 1 === 1 ? "other" : "others"
        }`;
      } else {
        displayDescription = `Received ${transaction.amount} heartbits from ${sender}`;
      }
    } else if (
      transaction.type === "received" &&
      displayDescription?.includes("points")
    ) {
      displayDescription = displayDescription.replace("points", "Heartbits");
    }

    if (
      transaction.type === "received" &&
      displayDescription?.includes("from Admin")
    ) {
      displayDescription = displayDescription.replace(
        "from Admin",
        `from ${transaction.related_user || "Unknown"}`
      );
    }

    if (
      transaction.type === "given" &&
      !displayDescription &&
      !transaction.isBulkCheer
    ) {
      displayDescription = `Cheered ${transaction.amount} heartbits`;
    }

    if (
      transaction.type === "received" &&
      !displayDescription &&
      !transaction.isBulkCheer
    ) {
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

    const isNegative = ["purchase", "given", "admin_deduct"].includes(
      transaction.type
    );
    const senderLabel = isAdminTransaction
      ? "Admin"
      : transaction.related_user || "Unknown";

    return { displayDescription, isNegative, isAdminTransaction, senderLabel };
  };

  const renderMessageWithMedia = (message) => {
    if (!message) return null;

    const urlRegex =
      /(https?:\/\/[^\s]+\.(?:gif|jpg|jpeg|png|webp)(?:\?[^\s]*)?)/gi;
    const parts = message.split(urlRegex);

    return (
      <div className="w-full p-2 border-none rounded-md bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary">
        {parts.map((part, index) => {
          const resetRegex =
            /(https?:\/\/[^\s]+\.(?:gif|jpg|jpeg|png|webp)(?:\?[^\s]*)?)/gi;
          if (resetRegex.test(part)) {
            return (
              <div key={index} className="my-1">
                <img
                  src={part}
                  alt="Shared content"
                  className="max-w-full h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                  style={{ maxHeight: "200px" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
                <a
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden text-xs text-blue-600 hover:text-blue-700 underline break-all mt-1"
                >
                  {part}
                </a>
              </div>
            );
          }
          return part ? (
            <p
              key={index}
              className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap break-words"
            >
              {part}
            </p>
          ) : null;
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 mb-30">
        {/* Moderation Notification */}
        {moderationNotification && (
          <ModerationBanner
            notification={moderationNotification}
            onDismiss={handleDismissNotification}
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <StatCard
            title="Balance"
            value={pointsData?.data?.currentBalance || 0}
            label="Points"
            icon={<StarIconSolid />}
            gradient="from-blue-50 to-blue-100"
            iconBg="bg-blue-500"
            textColor="text-blue-600"
            valueColor="text-blue-900"
          />
          <StatCard
            title="Heartbits"
            value={
              (pointsData?.data?.monthlyCheerLimit || 100) -
              (pointsData?.data?.monthlyCheerUsed || 0)
            }
            label="Left"
            icon={<HeartIconSolid />}
            gradient="from-rose-50 to-rose-100"
            iconBg="bg-rose-500"
            textColor="text-rose-600"
            valueColor="text-rose-900"
          />
          <StatCard
            title="Earned"
            value={pointsData?.data?.totalEarned || 0}
            label="All Time"
            icon={<TrophyIcon />}
            gradient="from-green-50 to-green-100"
            iconBg="bg-green-500"
            textColor="text-green-600"
            valueColor="text-green-900"
          />
          <StatCard
            title="Spent"
            value={pointsData?.data?.totalSpent || 0}
            label="Points"
            icon={<GiftIcon />}
            gradient="from-amber-50 to-amber-100"
            iconBg="bg-amber-500"
            textColor="text-amber-600"
            valueColor="text-amber-900"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 transactions-section">
          <div className="px-5 py-3.5 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-semibold text-gray-900">
                Recent Activity
              </h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {filteredTransactions.length}
              </span>
            </div>
          </div>

          <div className="max-h-[550px] overflow-y-auto p-4">
            {historyLoading ? (
              <LoadingState />
            ) : filteredTransactions.length > 0 ? (
              <div className="space-y-2.5">
                {filteredTransactions.map((transaction, index) => (
                  <TransactionCard
                    key={
                      transaction.transaction_ids
                        ? transaction.transaction_ids.join("-")
                        : index
                    }
                    transaction={transaction}
                    display={getTransactionDisplay(transaction)}
                    getUserAvatar={getUserAvatar}
                    formatTimeAgo={formatTimeAgo}
                    renderMessageWithMedia={renderMessageWithMedia}
                    logoFs={logoFs}
                    expandedTransactions={expandedTransactions}
                    setExpandedTransactions={setExpandedTransactions}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={totalItems}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      {/* Send Heartbits Modal */}
      {cheerModalOpen && (
        <CheerModal
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          cheerAmount={cheerAmount}
          setCheerAmount={setCheerAmount}
          cheerMessage={cheerMessage}
          setCheerMessage={setCheerMessage}
          usersData={usersData}
          pointsData={pointsData}
          onSubmit={handleSendCheer}
          onClose={() => setCheerModalOpen(false)}
          isSubmitting={cheerMutation.isPending}
        />
      )}
    </div>
  );
};

// Sub-components
const StatCard = ({
  title,
  value,
  label,
  icon,
  gradient,
  iconBg,
  textColor,
  valueColor,
}) => (
  <div
    className={`bg-gradient-to-br ${gradient} rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all hover:scale-105`}
  >
    <div className="flex items-center gap-2 mb-2">
      <div
        className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center shadow-sm lg:hidden xl:inline-flex`}
      >
        {React.cloneElement(icon, { className: "w-5 h-5 text-white" })}
      </div>
      <p className={`text-sm font-semibold ${textColor}`}>{title}</p>
    </div>
    <p className={`text-2xl font-bold ${valueColor} mb-1`}>{value}</p>
    <p className={`text-xs ${textColor}`}>{label}</p>
  </div>
);

const ModerationBanner = ({ notification, onDismiss }) => {
  const colorClasses = {
    hidden: {
      bg: "bg-amber-50",
      border: "border-amber-500",
      icon: "bg-amber-100 text-amber-600",
      text: "text-amber-800",
      subtext: "text-amber-700",
      reason: "text-amber-600",
      button: "bg-amber-500 hover:bg-amber-600",
    },
    deleted: {
      bg: "bg-red-50",
      border: "border-red-500",
      icon: "bg-red-100 text-red-600",
      text: "text-red-800",
      subtext: "text-red-700",
      reason: "text-red-600",
      button: "bg-red-500 hover:bg-red-600",
    },
    default: {
      bg: "bg-green-50",
      border: "border-green-500",
      icon: "bg-green-100 text-green-600",
      text: "text-green-800",
      subtext: "text-green-700",
      reason: "text-green-600",
      button: "bg-green-500 hover:bg-green-600",
    },
  };

  const colors = colorClasses[notification.action] || colorClasses.default;

  return (
    <div className="mb-4">
      <div
        className={`relative overflow-hidden rounded-lg shadow-md border-l-4 ${colors.bg} ${colors.border}`}
      >
        <div className="p-3">
          <div className="flex items-start gap-2">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${colors.icon}`}
            >
              <ExclamationTriangleIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-xs font-bold mb-0.5 ${colors.text}`}>
                {notification.action === "hidden"
                  ? "Hidden Post"
                  : notification.action === "deleted"
                  ? "Deleted Post"
                  : "Restored Post"}
              </h3>
              <p className={`text-xs ${colors.subtext}`}>
                {notification.message}
              </p>
              {notification.reason && (
                <p className={`text-xs mt-0.5 ${colors.reason}`}>
                  Reason: {notification.reason}
                </p>
              )}
            </div>
            <button
              onClick={onDismiss}
              className={`flex-shrink-0 px-2 py-1 rounded-md font-medium text-xs text-white transition-colors ${colors.button}`}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TransactionCard = ({
  transaction,
  display,
  getUserAvatar,
  formatTimeAgo,
  renderMessageWithMedia,
  logoFs,
  expandedTransactions,
  setExpandedTransactions,
}) => {
  const { displayDescription, isNegative, isAdminTransaction, senderLabel } =
    display;

  const transactionKey = transaction.transaction_ids
    ? transaction.transaction_ids.join("-")
    : transaction.transactionId || transaction.transaction_id;

  const isExpanded = expandedTransactions.has(transactionKey);

  const toggleExpanded = () => {
    setExpandedTransactions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(transactionKey)) {
        newSet.delete(transactionKey);
      } else {
        newSet.add(transactionKey);
      }
      return newSet;
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-2.5 sm:p-3.5 hover:shadow-md transition-shadow">
      <div className="flex gap-2 sm:gap-3">
        <div className="flex-shrink-0">
          {isAdminTransaction ? (
            <div className="relative">
              <img
                src={logoFs}
                alt="Admin"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-blue-500"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-white text-[8px] sm:text-[9px] font-bold">
                  A
                </span>
              </div>
            </div>
          ) : transaction.related_user || transaction.isBulkCheer ? (
            <img
              src={getUserAvatar(transaction)}
              alt={transaction.related_user || "User"}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <StarIconSolid className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs sm:text-sm text-gray-900 break-words leading-snug">
                {displayDescription ||
                  transaction.type.replace("_", " ").toUpperCase()}
              </p>
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1">
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                    {formatTimeAgo(
                      transaction.createdAt || transaction.created_at
                    )}
                  </span>
                </div>
                {transaction.isBulkCheer &&
                  transaction.type === "given" &&
                  transaction.recipients.length > 0 && (
                    <>
                      <span className="text-[10px] sm:text-xs text-gray-400">
                        •
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-600">
                        to{" "}
                        <span className="font-semibold text-primary">
                          {transaction.recipients.length}{" "}
                          {transaction.recipients.length === 1
                            ? "person"
                            : "people"}
                        </span>
                      </span>
                    </>
                  )}
                {transaction.isBulkCheer && transaction.type === "received" && (
                  <>
                    <span className="text-[10px] sm:text-xs text-gray-400">
                      •
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-600 break-words">
                      from{" "}
                      <span className="font-semibold text-primary">
                        {transaction.related_user || "Someone"}
                      </span>
                    </span>
                  </>
                )}
                {!transaction.isBulkCheer &&
                  transaction.related_user &&
                  !isAdminTransaction && (
                    <>
                      <span className="text-[10px] sm:text-xs text-gray-400">
                        •
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-600 break-words">
                        {transaction.type === "given" ? "to" : "from"}{" "}
                        <span className="font-semibold text-primary">
                          {senderLabel}
                        </span>
                      </span>
                    </>
                  )}
                {isAdminTransaction && (
                  <>
                    <span className="text-[10px] sm:text-xs text-gray-400">
                      •
                    </span>
                    <span className="text-[10px] sm:text-xs font-medium text-blue-600">
                      from Admin
                    </span>
                  </>
                )}
              </div>

              {/* Show recipient list for bulk cheers */}
              {transaction.isBulkCheer &&
                transaction.type === "given" &&
                transaction.recipients.length > 0 && (
                  <div className="mt-1.5 sm:mt-2">
                    <div className="w-full p-1.5 sm:p-2 border-none rounded-md bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary">
                      <p className="text-[10px] sm:text-xs text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                        <span className="font-semibold text-primary">
                          Cheered to:{" "}
                        </span>
                        {transaction.recipients
                          .slice(
                            0,
                            isExpanded ? transaction.recipients.length : 2
                          )
                          .map((name, idx, arr) => (
                            <span key={idx}>
                              {name}
                              {idx < arr.length - 1 && ", "}
                            </span>
                          ))}
                        {!isExpanded && transaction.recipients.length > 2 && (
                          <>
                            {" and "}
                            <button
                              onClick={toggleExpanded}
                              className="inline-block text-primary hover:text-primary/80 font-semibold underline transition-colors touch-manipulation"
                            >
                              {transaction.recipients.length - 2}{" "}
                              {transaction.recipients.length - 2 === 1
                                ? "other"
                                : "others"}
                            </button>
                          </>
                        )}
                        {isExpanded && transaction.recipients.length > 2 && (
                          <>
                            {". "}
                            <button
                              onClick={toggleExpanded}
                              className="inline-block text-primary hover:text-primary/80 font-semibold underline transition-colors touch-manipulation"
                            >
                              Show less
                            </button>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}
            </div>
            <span
              className={`flex-shrink-0 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                isNegative
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {isNegative ? "-" : "+"}
              {transaction.isBulkCheer
                ? transaction.totalAmount
                : transaction.amount}
              {["received", "given"].includes(transaction.type)
                ? " bits"
                : " pts"}
            </span>
          </div>

          {(isAdminTransaction ||
            (["received", "given"].includes(transaction.type) &&
              transaction.message)) && (
            <div className="mt-1.5 sm:mt-2">
              {renderMessageWithMedia(transaction.message)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="text-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500 mx-auto mb-2"></div>
    <p className="text-xs text-gray-500">Loading activity...</p>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12">
    <ChartBarIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
    <h3 className="text-base font-medium text-gray-900 mb-1">
      No recent activity
    </h3>
    <p className="text-xs text-gray-500">Your transactions will appear here</p>
  </div>
);

const Pagination = ({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPageChange,
}) => (
  <div className="px-4 py-2.5 border-t border-gray-200">
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-700">
        Showing {startIndex}-{endIndex} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <div className="flex gap-1 mx-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) pageNum = i + 1;
            else if (currentPage <= 3) pageNum = i + 1;
            else if (currentPage >= totalPages - 2)
              pageNum = totalPages - 4 + i;
            else pageNum = currentPage - 2 + i;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-7 h-7 text-xs font-medium rounded-md transition-colors ${
                  currentPage === pageNum
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  </div>
);

const CheerModal = ({
  selectedUser,
  setSelectedUser,
  cheerAmount,
  setCheerAmount,
  cheerMessage,
  setCheerMessage,
  usersData,
  pointsData,
  onSubmit,
  onClose,
  isSubmitting,
}) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
      <div className="px-5 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
              <HeartIconSolid className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Send Heartbits</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-5 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Select User
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-gray-700">
              Amount (Points)
            </label>
            <span className="text-xl font-bold text-blue-600">
              {cheerAmount}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max={pointsData?.data?.currentBalance || 0}
            value={cheerAmount}
            onChange={(e) => setCheerAmount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>1</span>
            <span>Max: {pointsData?.data?.currentBalance || 0}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Message (Optional)
          </label>
          <textarea
            value={cheerMessage}
            onChange={(e) => setCheerMessage(e.target.value)}
            placeholder="Add a nice message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            rows="3"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 text-sm"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <HeartIconSolid className="w-4 h-4" />
                <span>Send Heartbits</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default PointsDashboard;
