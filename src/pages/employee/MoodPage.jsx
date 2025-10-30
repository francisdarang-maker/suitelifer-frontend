import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
import { useStore } from "../../store/authStore";
import moodApi from "../../utils/moodApi";
import Loading from "../../components/loader/Loading";
import { toast } from "react-hot-toast";

const MoodPage = () => {
  const user = useStore((state) => state.user);
  const [currentMoodLevel, setCurrentMoodLevel] = useState(3);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const [moodStats, setMoodStats] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (showSuccessMessage) {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex items-center gap-3 px-4 py-3 border border-green-300`}
        >
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <svg
              className="h-6 w-6 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-green-900">Mood Submitted!</p>
            <p className="text-sm text-green-700">
              Your mood has been logged successfully 🎉
            </p>
          </div>
        </div>
      ));
    }
  }, [showSuccessMessage]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [historyData, statsData] = await Promise.all([
        moodApi.getMoodHistory().catch(() => ({ data: [] })),
        moodApi.getMoodStats().catch(() => ({ data: null })),
      ]);
      setMoodHistory(historyData.data || []);
      setMoodStats(statsData.data);
    } catch (error) {
      console.error("Error fetching mood data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMood = async () => {
    if (sending) return;
    try {
      setSending(true);
      await moodApi.submitMood({ mood_level: currentMoodLevel, note });
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      setNote("");
      fetchAllData();
    } catch (error) {
      console.error("Error submitting mood:", error);
      alert("Failed to submit mood. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMood = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteMood = async () => {
    if (!deleteId) return;
    try {
      await moodApi.deleteMoodEntry(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchAllData();
    } catch (error) {
      setShowDeleteModal(false);
      setDeleteId(null);
      console.error("Error deleting mood log:", error);
      alert("Failed to delete mood log. Please try again.");
    }
  };

  const getMoodEmoji = (level) => {
    const emojis = { 1: "😢", 2: "😔", 3: "😐", 4: "😊", 5: "😄" };
    return emojis[level] || "😐";
  };

  const getMoodLabel = (level) => {
    const labels = {
      1: "Very Bad",
      2: "Bad",
      3: "Neutral",
      4: "Good",
      5: "Excellent",
    };
    return labels[level] || "Neutral";
  };

  const getMoodColor = (level) => {
    const colors = {
      1: "#dc2626",
      2: "#f59e0b",
      3: "#eab308",
      4: "#10b981",
      5: "#059669",
    };
    return colors[level] || colors[3];
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

  const getMoodDistribution = () => {
    if (!moodHistory || moodHistory.length === 0) return [];
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    moodHistory.forEach((mood) => {
      distribution[mood.mood_level]++;
    });
    return [
      {
        level: 1,
        count: distribution[1],
        label: "Very Bad",
        emoji: "😢",
        color: "#dc2626",
      },
      {
        level: 2,
        count: distribution[2],
        label: "Bad",
        emoji: "😔",
        color: "#f59e0b",
      },
      {
        level: 3,
        count: distribution[3],
        label: "Neutral",
        emoji: "😐",
        color: "#eab308",
      },
      {
        level: 4,
        count: distribution[4],
        label: "Good",
        emoji: "😊",
        color: "#10b981",
      },
      {
        level: 5,
        count: distribution[5],
        label: "Excellent",
        emoji: "😄",
        color: "#059669",
      },
    ];
  };

  const avgMood =
    moodHistory.length > 0
      ? (
          moodHistory.reduce((sum, m) => sum + m.mood_level, 0) /
          moodHistory.length
        ).toFixed(1)
      : "0";

  if (loading) {
    return <Loading />;
  }

  // Prepare chart data
  const last30Days = moodHistory.slice(0, 30).reverse();
  const chartLabels = last30Days.map((mood) => {
    const d = new Date(mood.created_at);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
  const chartData = last30Days.map((m) => m.mood_level);

  return (
    <>
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-blur bg-opacity-40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md transform transition-all scale-100">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900">
                Delete Mood Log?
              </h4>
              <p className="text-sm text-gray-600">
                This action cannot be undone. Your mood entry will be
                permanently removed.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteMood}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Success Message */}
          {/* {showSuccessMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <svg
                  className="h-6 w-6 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )} */}

          <div className="grid grid-cols-1  xl:grid-cols-3 gap-6">
            {/* LEFT COLUMN - Mood Input & Quick Stats */}
            <div className="space-y-6">
              {/* Mood Input Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  How are you feeling?
                </h2>

                {/* Mood Display */}
                <div className="text-center mb-8 bg-white rounded-2xl p-6 shadow-sm">
                  <div className="text-6xl mb-4 transform transition-transform hover:scale-110">
                    {getMoodEmoji(currentMoodLevel)}
                  </div>
                  <div
                    className="text-3xl font-bold mb-1"
                    style={{ color: getMoodColor(currentMoodLevel) }}
                  >
                    {currentMoodLevel}.0
                  </div>
                  <div className="text-base font-semibold text-gray-600">
                    {getMoodLabel(currentMoodLevel)}
                  </div>
                </div>

                {/* Mood Slider */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select your mood level
                  </label>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">😢</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={currentMoodLevel}
                      onChange={(e) =>
                        setCurrentMoodLevel(parseInt(e.target.value))
                      }
                      className="flex-1 mx-4 h-3 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #dc2626 0%, #f59e0b 25%, #eab308 50%, #10b981 75%, #059669 100%)`,
                      }}
                    />
                    <span className="text-3xl">😄</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 px-8">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                  </div>
                </div>

                {/* Note Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's on your mind? (optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Share your thoughts, feelings, or what made this moment special..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none shadow-sm focus:outline-none"
                    rows="4"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitMood}
                  disabled={sending}
                  className="w-full bg-primary text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {sending ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </span>
                  ) : (
                    "Log My Mood"
                  )}
                </button>
              </div>

              {/* Quick Stats Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Your Statistics
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                    <div className="text-3xl font-bold text-blue-700 mb-1">
                      {moodHistory.length}
                    </div>
                    <div className="text-xs font-medium text-blue-600">
                      Total Entries
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                    <div className="text-3xl font-bold text-green-700 mb-1">
                      {avgMood}
                    </div>
                    <div className="text-xs font-medium text-green-600">
                      Average Mood
                    </div>
                  </div>
                </div>

                {/* Mood Distribution */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Mood Distribution
                  </p>
                  <div className="space-y-3">
                    {getMoodDistribution().map((item) => (
                      <div key={item.level}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{item.emoji}</span>
                            <span className="text-xs font-medium text-gray-700">
                              {item.label}
                            </span>
                          </div>
                          <span
                            className="text-sm font-bold"
                            style={{ color: item.color }}
                          >
                            {item.count}
                          </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                          <div
                            className="h-full transition-all duration-500 rounded-full"
                            style={{
                              width: `${
                                moodHistory.length > 0
                                  ? (item.count / moodHistory.length) * 100
                                  : 0
                              }%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Chart & History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Chart Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                      />
                    </svg>
                    Your Mood Journey
                  </h3>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-xs font-semibold text-blue-700">
                      Last 30 days
                    </span>
                  </div>
                </div>

                <div className="h-72 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4">
                  {moodHistory.length > 0 ? (
                    <Line
                      data={{
                        labels: chartLabels,
                        datasets: [
                          {
                            label: "Mood Level",
                            data: chartData,
                            fill: true,
                            borderColor: "#3b82f6",
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            tension: 0.4,
                            pointRadius: 5,
                            pointBackgroundColor: "#3b82f6",
                            pointBorderColor: "#fff",
                            pointBorderWidth: 2,
                            pointHoverRadius: 7,
                            pointHoverBackgroundColor: "#2563eb",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: "#ffffff",
                            titleColor: "#1f2937",
                            bodyColor: "#4b5563",
                            borderColor: "#e5e7eb",
                            borderWidth: 1,
                            padding: 12,
                            displayColors: false,
                            callbacks: {
                              label: function (context) {
                                const level = context.parsed.y;
                                const labels = {
                                  1: "Very Bad",
                                  2: "Bad",
                                  3: "Neutral",
                                  4: "Good",
                                  5: "Excellent",
                                };
                                return `${labels[level]} (${level})`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            min: 0.5,
                            max: 5.5,
                            ticks: {
                              stepSize: 1,
                              color: "#6b7280",
                              font: { size: 12, weight: "500" },
                              callback: function (value) {
                                return value >= 1 && value <= 5 ? value : "";
                              },
                            },
                            grid: {
                              color: "#e5e7eb",
                              drawBorder: false,
                            },
                          },
                          x: {
                            ticks: {
                              color: "#6b7280",
                              font: { size: 11 },
                              maxRotation: 45,
                              minRotation: 45,
                            },
                            grid: { display: false },
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl mb-3">📊</div>
                        <p className="text-sm font-medium text-gray-600">
                          No data yet
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Start logging your moods to see trends
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Logs Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Recent Entries
                  </h3>
                  <span className="text-sm font-medium text-gray-500">
                    {moodHistory.length} total
                  </span>
                </div>

                <div className="max-h-[690px] overflow-y-auto p-6 mb-15 lg:mb-0">
                  {moodHistory.length > 0 ? (
                    <div className="space-y-3">
                      {moodHistory.slice(0, 20).map((mood) => (
                        <div
                          key={mood.id}
                          className="group border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all bg-gradient-to-r hover:from-blue-50 hover:to-transparent"
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-4xl flex-shrink-0 transform group-hover:scale-110 transition-transform">
                              {getMoodEmoji(mood.mood_level)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold text-white shadow-sm"
                                  style={{
                                    backgroundColor: getMoodColor(
                                      mood.mood_level
                                    ),
                                  }}
                                >
                                  <span>{getMoodLabel(mood.mood_level)}</span>
                                </span>
                                <span className="text-xs text-gray-500 font-medium">
                                  {formatTimeAgo(mood.created_at)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-400 mb-2">
                                {new Date(mood.created_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                              {mood.notes && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {mood.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteMood(mood.id)}
                              className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 opacity-100"
                              title="Delete entry"
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
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-10 h-10 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        No entries yet
                      </h4>
                      <p className="text-sm text-gray-500">
                        Start tracking your mood to see your entries here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MoodPage;
