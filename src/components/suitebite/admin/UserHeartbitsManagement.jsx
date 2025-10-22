import React, { useState, useEffect } from "react";
import { suitebiteAPI } from "../../../utils/suitebiteAPI";
import { pointsSystemApi } from "../../../api/pointsSystemApi";

import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
  CogIcon,
  UserGroupIcon,
  HeartIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  MinusIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { useStore } from "../../../store/authStore";
import defaultAvatar from "../../../assets/images/defaultAvatar.svg";
import Loading from "../../loader/Loading";

const UserHeartbitsManagement = () => {
  const currentUser = useStore((state) => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  //
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  //
  const [globalLimit, setGlobalLimit] = useState(1000);
  const [showGlobalLimitModal, setShowGlobalLimitModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [bulkAmount, setBulkAmount] = useState("");
  const [bulkReason, setBulkReason] = useState("");


  useEffect(() => {
    loadUsersWithHeartbits();
    loadGlobalLimit();
  }, []);

  const loadGlobalLimit = async () => {
    try {
      const response = await suitebiteAPI.getSystemConfiguration();
      if (response.success && response.config) {
        const globalLimit = response.config.global_monthly_limit?.value || 1000;
        setGlobalLimit(globalLimit);
      } else {
        // Fallback to default if no config found
        setGlobalLimit(1000);
      }
    } catch (error) {
      console.error("Error loading global limit:", error);
      // Fallback to default
      setGlobalLimit(1000);
    }
  };
  //
  const defaultValues = {
    selectedUsers: [],
    searchTerm: "",
    sortBy: "name",
    sortOrder: "asc",
  };
  const showResetButton =
    selectedUsers.length > 0 ||
    searchTerm !== defaultValues.searchTerm ||
    sortBy !== defaultValues.sortBy ||
    sortOrder !== defaultValues.sortOrder;
  //

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(
      () => setNotification({ show: false, type: "", message: "" }),
      5000
    );
  };

  const loadUsersWithHeartbits = async () => {
    try {
      setLoading(true);
      const response = await pointsSystemApi.getAllUserPoints();

      if (response.success) {
        // Transform the data to match the expected format

        const transformedUsers = response.data.map((user) => ({
          user_id: user.user_id,
          first_name: user.userName ? user.userName.split(" ")[0] : "",
          last_name: user.userName
            ? user.userName.split().slice(1).join(" ")
            : "",
          user_email: user.email,
          avatar: user.avatar, // Now available from backend
          heartbits_balance: user.available_points || 0,
          total_heartbits_earned: user.total_earned || 0,
          total_heartbits_spent: user.total_spent || 0,
          monthly_cheer_limit: user.monthly_cheer_limit || 100,
          monthly_cheer_used: user.monthly_cheer_used || 0,
          last_monthly_reset: user.last_monthly_reset,
          user_type: user.user_type ? user.user_type.toLowerCase() : "employee",
          isActive: user.isActive
        }));
        setUsers(transformedUsers);
      } else {
        showNotification(
          "error",
          "Failed to load users data. Please try again."
        );
      }
    } catch (error) {
      console.error("Error loading users:", error);
      showNotification(
        "error",
        "Failed to load users data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserHeartbits = async (userId, updates, reason = "") => {
    try {
      // Format reason to match peer cheer style: 'Received X points from cheer'
      const amount = updates.balance || 0;
      const adminReason = `Received ${amount} points from cheer`;
      if (updates.balance !== undefined) {
        const response = await pointsSystemApi.addPointsToUser(
          userId,
          updates.balance,
          reason
        );
        if (!response.success) {
          throw new Error("Failed to update balance");
        }
      }
      loadUsersWithHeartbits();
      setSelectedUser(null);
      showNotification(
        "success",
        `Successfully gave ${updates.balance} heartbits to user!`
      );
    } catch (error) {
      console.error("Error updating heartbits:", error);
      showNotification(
        "error",
        "Failed to give heartbits. Please check your connection and try again."
      );
    }
  };

  const handleSetGlobalLimit = async (newLimit) => {
    try {
      // Save global limit to system configuration
      const response = await suitebiteAPI.updateSystemConfiguration(
        "global_monthly_limit",
        newLimit,
        "Global monthly heartbits limit for all users"
      );

      if (response.success) {
        setGlobalLimit(newLimit);
        showNotification(
          "success",
          `Global monthly limit updated to ${newLimit} heartbits successfully!`
        );
      } else {
        throw new Error(response.message || "Failed to update global limit");
      }
    } catch (error) {
      console.error("Error updating global limit:", error);
      showNotification(
        "error",
        "Failed to update global limit. Please try again."
      );
    }
  };

  const handleBulkGiveHeartbits = async (amount, reason) => {
    try {
      const updatePromises = selectedUsers.map((userId) =>
        pointsSystemApi.addPointsToUser(userId, amount, reason)
      );

      const results = await Promise.allSettled(updatePromises);
      const successCount = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      const failCount = results.length - successCount;

      loadUsersWithHeartbits();
      setSelectedUsers([]);

      if (failCount === 0) {
        showNotification(
          "success",
          `Successfully gave ${amount} heartbits to ${successCount} selected users!`
        );
      } else {
        showNotification(
          "warning",
          `Partial success: ${successCount} users updated, ${failCount} failed.`
        );
      }
    } catch (error) {
      console.error("Error with bulk heartbits update:", error);
      showNotification(
        "error",
        "Failed to give heartbits to selected users. Please try again."
      );
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length
        ? []
        : filteredUsers.map((user) => user.user_id)
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSortBy("name");
    setSortOrder("asc");
    setSelectedUsers([]);
    // showNotification("info", "All filters and selections reset");
  };

  // Simplified filtering logic
  const filteredUsers = users.filter((user) => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = `${user.first_name || ""} ${user.last_name || ""}`
      .toLowerCase()
      .includes(searchLower);
    const emailMatch = (user.user_email || "")
      .toLowerCase()
      .includes(searchLower);
    return nameMatch || emailMatch;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "points":
        aValue = a.heartbits_balance || 0;
        bValue = b.heartbits_balance || 0;
        break;
      default:
        aValue = `${a.first_name || ""} ${a.last_name || ""}`.toLowerCase();
        bValue = `${b.first_name || ""} ${b.last_name || ""}`.toLowerCase();
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // User Edit Modal Component
  const UserEditModal = ({ user, onClose }) => {
    const [heartbitsToGive, setHeartbitsToGive] = useState(0);
    const [reason, setReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (reason.trim() && heartbitsToGive > 0) {
        setIsLoading(true);
        await handleUpdateUserHeartbits(
          user.user_id,
          { balance: heartbitsToGive },
          reason
        );
        setIsLoading(false);
      }
    };

    const hasChanges = heartbitsToGive > 0 && reason.trim();

    if(isLoading){
      return <Loading/>
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 ">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0097b2] to-[#007a8e] text-white px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <HeartIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Give Heartbits</h3>
                  <p className="text-white text-opacity-90 text-sm">
                    {`${user.first_name || ""} ${user.last_name || ""}`.trim()}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Current Stats */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CogIcon className="w-4 h-4" />
                Current Statistics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#0097b2] flex items-center justify-center gap-1">
                    <HeartIcon className="w-5 h-5" />
                    {user.heartbits_balance || 0}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    Current Balance
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">
                    <div className="font-semibold">Activity</div>
                    <div className="text-xs">
                      Given: {user.total_heartbits_given || 0}
                    </div>
                    <div className="text-xs">
                      Received: {user.total_heartbits_received || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Heartbits to Give */}
              <div>
                <label
                  htmlFor="heartbits-to-give"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Heartbits to Give
                </label>
                <div className="relative">
                  <HeartIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-500" />
                  <input
                    id="heartbits-to-give"
                    name="heartbits-to-give"
                    type="number"
                    value={heartbitsToGive}
                    onChange={(e) =>
                      setHeartbitsToGive(parseInt(e.target.value) || 0)
                    }
                    min="1"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-transparent text-lg font-semibold"
                    placeholder="0"
                    aria-describedby="give-help"
                  />
                </div>
                <div id="give-help" className="mt-1 text-xs text-gray-500">
                  Amount of heartbits to give to this user
                </div>
              </div>

              {/* Reason Input */}
              <div>
                <label
                  htmlFor="edit-reason"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Reason for Giving Heartbits
                </label>
                <textarea
                  id="edit-reason"
                  name="edit-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-transparent resize-none"
                  rows="3"
                  placeholder="Explain why you're giving heartbits..."
                  aria-describedby="reason-help"
                />
                <div id="reason-help" className="mt-1 text-xs text-gray-500">
                  This will be logged for audit purposes
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!hasChanges || isLoading}
                  className="flex-1 px-4 py-3 bg-[#0097b2] text-white rounded-lg font-semibold hover:bg-[#007a8e] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="animate-spin w-4 h-4" />
                      Giving Heartbits...
                    </>
                  ) : (
                    <>
                      <HeartIcon className="w-4 h-4" />
                      Give Heartbits
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Helper to map user_type to display label
  const getRoleLabel = (type) => {
    if (!type) return "Employee";
    switch (type.toUpperCase()) {
      case "SUPER ADMIN":
      case "SUPER_ADMIN":
      case "SUPERADMIN":
        return "Super Admin";
      case "ADMIN":
        return "Admin";
      case "EMPLOYEE":
        return "Employee";
      default:
        return "Employee";
    }
  };

  return (
    <div className="user-heartbits-management rounded-lg  pb-10 px-5 pt-2">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg text-sm font-medium max-w-sm ${
            notification.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : notification.type === "error"
              ? "bg-red-50 text-red-800 border border-red-200"
              : notification.type === "warning"
              ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
              : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Concise Search and Filter Controls */}

      <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50/30 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/60 mt-0 mb-0">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search Section - Enhanced Modern Design */}
          <div className="relative group flex-1 min-w-[280px] max-w-md">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0097b2]/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-[#0097b2] transition-all duration-300 group-focus-within:scale-110" />
              </div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-white/80 border-2 border-gray-200 rounded-2xl text-sm font-medium
            placeholder:text-gray-400 placeholder:font-normal
            focus:outline-none focus:ring-4 focus:ring-[#0097b2]/20 focus:border-[#0097b2] focus:bg-white 
            hover:border-gray-300 hover:shadow-lg
            transition-all duration-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-all duration-200 group/clear"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400 group-hover/clear:text-gray-600" />
                </button>
              )}
              {!searchTerm && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex gap-1">
                  {/* <kbd className="px-2 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded"></kbd> */}
                </div>
              )}
            </div>
          </div>

          {/* Sort Dropdown - Glassmorphic */}
          <div className="relative group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-5 pr-12 py-3.5 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl 
          focus:ring-4 focus:outline-none focus:ring-[#0097b2]/20 focus:border-[#0097b2] focus:bg-white
          text-sm font-semibold text-gray-700 cursor-pointer
          hover:border-gray-300 hover:shadow-lg
          transition-all duration-300"
              style={{ minWidth: "170px" }}
            >
              <option value="name">Sort by Name</option>
              <option value="points">Sort by Points</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-500 group-hover:text-[#0097b2] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Sort Order Toggle - Premium Pill */}
          <div className="flex items-center gap-2">
            <label htmlFor="sortOrder" className="sr-only">
              Sort Order
            </label>
            <button
              id="sortOrder"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="group px-5 py-3.5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl 
          text-sm font-semibold text-gray-700 
          hover:from-[#0097b2]/5 hover:to-[#0097b2]/10 hover:border-[#0097b2]/50 hover:shadow-lg hover:shadow-[#0097b2]/10
          transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#0097b2]/20 
          active:scale-95"
              style={{ minWidth: "150px" }}
              title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="group-hover:text-[#0097b2] transition-colors">
                  {sortOrder === "asc" ? "Ascending" : "Descending"}
                </span>
                {sortOrder === "desc" ? (
                  <ArrowDownIcon className="w-5 h-5 text-gray-500 group-hover:text-[#0097b2] transition-all duration-300 group-hover:translate-y-0.5" />
                ) : (
                  <ArrowUpIcon className="w-5 h-5 text-gray-500 group-hover:text-[#0097b2] transition-all duration-300 group-hover:-translate-y-0.5" />
                )}
              </div>
            </button>
          </div>

          {/* Select All - Modern Toggle */}
          <button
            onClick={selectAllUsers}
            className={`group px-5 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-3
        transition-all duration-300 active:scale-95 border-2
        ${
          selectedUsers.length === filteredUsers.length
            ? "bg-gradient-to-br from-[#0097b2] to-[#0097b2]/80 text-white shadow-xl shadow-[#0097b2]/30 hover:shadow-2xl hover:shadow-[#0097b2]/40 border-transparent"
            : "border-gray-200 bg-white/90 text-gray-700 hover:bg-gradient-to-br hover:from-[#0097b2]/5 hover:to-[#0097b2]/10 hover:border-[#0097b2]/50 hover:shadow-lg"
        }
      `}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all
        ${
          selectedUsers.length === filteredUsers.length
            ? "bg-white/20"
            : "bg-gray-100 border-2 border-gray-300 group-hover:border-[#0097b2]/50 group-hover:bg-[#0097b2]/5"
        }`}
            >
              <CheckIcon
                className={`w-4 h-4 font-bold ${
                  selectedUsers.length === filteredUsers.length
                    ? "text-white"
                    : "text-transparent"
                }`}
              />
            </div>
            {selectedUsers.length === filteredUsers.length
              ? "Deselect All"
              : "Select All"}
          </button>

          {/* Reset Button - Subtle Alert Style */}
          {showResetButton && (
            <button
              onClick={resetFilters}
              className="px-5 py-3.5 bg-gradient-to-br from-rose-50 to-red-50 border-2 border-rose-200 rounded-2xl 
          hover:from-rose-100 hover:to-red-100 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-200/50
          text-sm font-bold text-rose-700 
          transition-all duration-300 active:scale-95
          focus:outline-none focus:ring-4 focus:ring-rose-500/20"
            >
              Reset
            </button>
          )}

          {/* Global Limit - Premium Badge */}
          <button
            onClick={() => setShowGlobalLimitModal(true)}
            className="px-5 py-3.5 bg-primary text-white rounded-2xl 
        hover:from-purple-600 hover:via-purple-700 hover:to-indigo-700 
        hover:shadow-xl 
        text-sm font-bold flex items-center gap-3
        transition-all duration-300 active:scale-95
        focus:outline-none focus:ring-4 focus:ring-purple-500/30"
          >
            <CogIcon className="w-5 h-5" />
            <span className="flex items-center gap-2">
              Global Limit:
              <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg font-extrabold">
                {globalLimit}
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Results Summary & Bulk Actions */}

      <div className="mt-1 pt-1">
        <div className="w-full text-center py-4 text-lg font-medium text-gray-700">
          {selectedUsers.length > 0 ? (
            <></>
          ) : (
            <>Select users to send Heartbits</>
          )}
        </div>
      </div>

      {/* Users Grid - Responsive */}

      <div className="bg-gray-10 rounded-lg">
        <div
          className="users-table-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4"
          style={{
            overflowY: "auto",
            background: "",
            borderRadius: "1rem",
          }}
        >
          {sortedUsers.length === 0 ? (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 text-center text-gray-500 py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </p>
              <p className="text-sm">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "No users are currently registered in the system."}
              </p>
            </div>
          ) : (
            sortedUsers.map((user) => {
              const isSelected = selectedUsers.includes(user.user_id);
              const isActive = user.isActive === 1 || user.isActive === true
              return (
                <div
                  key={user.user_id}
                  className={`
                    relative group rounded-2xl border bg-white/80 backdrop-blur-sm 
                    shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer
                    flex flex-col p-4 sm:p-5
                    ${
                      isSelected
                        ? "border-primary/60 ring-2 ring-primary/20 bg-primary/5"
                        : "border-gray-200 hover:border-primary/30"
                    }
                    ${!isActive ? "opacity-50 grayscale cursor-not-allowed hover:shadow-none hover:border-gray-200" : ""}
                  `}
                  onClick={() => {
                    if (isActive) toggleUserSelection(user.user_id);
                  }}
                >
                  {/* ✅ Checkbox / Selection Indicator */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`
                        w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full border-2
                        ${
                          isSelected
                            ? "border-primary bg-primary text-white shadow-md"
                            : "border-gray-300 bg-white text-transparent"
                        }
                        transition-all duration-200
                      `}
                    >
                      {isSelected && (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </div>

                  {/* 🧍 User Info Section */}
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <img
                        src={user.avatar || "/default-avatar.png"}
                        alt={`${user.first_name || ""} ${user.last_name || ""}`.trim()}
                        className="w-14 h-14 rounded-full object-cover shadow-sm border border-gray-100"
                      />
                      {/* Status Indicator */}
                      <span
                        className={`
                          absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                          ${isActive ? "bg-green-500" : "bg-gray-400"}
                        `}
                      />
                    </div>

                    {/* Name and Role */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-base truncate">
                        {`${user.first_name || ""} ${user.last_name || ""}`.trim()}
                      </p>
                      <p className="text-sm text-gray-500">{getRoleLabel(user.user_type)}</p>

                      {/* Active Pill */}
                      <div
                        className={`flex items-center gap-1 px-2 py-0.5 mt-2 rounded-full text-xs font-medium w-fit
                          ${
                            isActive
                              ? "bg-green-50 border border-green-300 text-green-700"
                              : "bg-gray-100 border border-gray-300 text-gray-600"
                          }
                        `}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></span>
                        {isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>

                  {/* ❤️ Heartbits Row */}
                  <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                    <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                    <span className="font-semibold text-[#0097b2] text-base">
                      {user.heartbits_balance || 0}
                    </span>
                    <span className="text-xs text-gray-500">Heartbits</span>
                  </div>
                </div>
              );


            })
          )}
        </div>
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 mb-3 text-sm text-gray-600 w-full">
            <span className="text-[#0097b2] font-medium">
              {selectedUsers.length} selected
            </span>
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setShowBulkUpdateModal(true)}
                className="px-6 py-3 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 text-base font-bold transition-all duration-200 flex items-center gap-3"
                style={{ minWidth: "220px" }}
              >
                <HeartIcon className="w-6 h-6" />
                Give to Selected ({selectedUsers.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* Global Limit Modal */}
      {showGlobalLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Set Global Monthly Limit
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Set the monthly heartbits allowance that all users will receive.
              This is the default limit applied to all users in the system.
            </p>
            <div className="mb-4">
              <label
                htmlFor="global-limit-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Monthly Limit (heartbits)
              </label>
              <input
                id="global-limit-input"
                type="number"
                value={globalLimit}
                onChange={(e) => setGlobalLimit(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowGlobalLimitModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSetGlobalLimit(globalLimit);
                  setShowGlobalLimitModal(false);
                }}
                className="flex-1 px-4 py-2 bg-[#0097b2] text-white rounded-lg hover:bg-[#007a8e]"
              >
                Set Limit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkUpdateModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Give Heartbits to Selected Users
      </h3>

      {/* Track input states */}
      <div className="mb-4">
        <label
          htmlFor="bulk-amount"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Amount to Give
        </label>
        <input
          id="bulk-amount"
          type="number"
          min="1"
          value={bulkAmount}
          onChange={(e) => setBulkAmount(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-transparent"
          placeholder="Enter amount"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="bulk-reason"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Reason
        </label>
        <textarea
          id="bulk-reason"
          rows="3"
          value={bulkReason}
          onChange={(e) => setBulkReason(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-transparent"
          placeholder="Explain why you're giving heartbits..."
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setShowBulkUpdateModal(false)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          disabled={!bulkAmount || !bulkReason}
          onClick={() => {
            const amount = parseInt(bulkAmount);
            if (amount && bulkReason) {
              handleBulkGiveHeartbits(amount, bulkReason);
              setShowBulkUpdateModal(false);
              setBulkAmount("");
              setBulkReason("");
            }
          }}
          className={`flex-1 px-4 py-2 rounded-lg text-white transition ${
            !bulkAmount || !bulkReason
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#0097b2] hover:bg-[#007a8e]"
          }`}
        >
          Give Heartbits
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default UserHeartbitsManagement;
