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

const MoodPage = () => {
  const user = useStore((state) => state.user);
  const [currentMoodLevel, setCurrentMoodLevel] = useState(3);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const [moodStats, setMoodStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [historyData, , statsData, weeklyData, monthlyData, yearlyData] =
        await Promise.all([
          moodApi.getMoodHistory().catch(() => ({ data: [] })),
          moodApi.getTodayMood().catch(() => ({ data: null })),
          moodApi.getMoodStats().catch(() => ({ data: null })),
          moodApi.getWeeklyStats().catch(() => ({ data: null })),
          moodApi.getMonthlyStats().catch(() => ({ data: null })),
          moodApi.getYearlyStats().catch(() => ({ data: null })),
        ]);
      setMoodHistory(historyData.data || []);
      setMoodStats(statsData.data);
      setWeeklyStats(weeklyData.data);
      setMonthlyStats(monthlyData.data);
      setYearlyStats(yearlyData.data);
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

  const getMoodGradient = (level) => {
    const gradients = {
      1: "linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)",
      2: "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)",
      3: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      4: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
      5: "linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)",
    };
    return gradients[level] || gradients[3];
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

  const formatMoodStats = (stats) => {
    if (!stats || !stats.avg_mood) return "0";
    return Math.round(parseFloat(stats.avg_mood));
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-green-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 "
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm mx-4 transform transition-all scale-100 animate-in">
            <h4
              className="text-xl font-bold mb-3"
              style={{ color: "#1a0202", fontFamily: "Avenir, sans-serif" }}
            >
              Delete Mood Log?
            </h4>
            <p
              className="mb-6 text-sm"
              style={{ color: "#4a6e7e", fontFamily: "Avenir, sans-serif" }}
            >
              This action cannot be undone. Your mood entry will be permanently
              removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                  color: "#475569",
                  fontFamily: "Avenir, sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteMood}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)",
                  color: "#dc2626",
                  fontFamily: "Avenir, sans-serif",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className="max-w-7xl mx-auto p-6 space-y-6 pb-20 rounded-2xl"
        style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}
      >
        {/* Success Message */}
        {showSuccessMessage && (
          <div
            className="rounded-2xl p-4 shadow-lg transform transition-all animate-in slide-in-from-top"
            style={{
              background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
              border: "2px solid #10b981",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-white"
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
              <p
                className="text-sm font-bold"
                style={{ color: "#065f46", fontFamily: "Avenir, sans-serif" }}
              >
                🎉 Mood submitted successfully!
              </p>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-black mb-2"
            style={{ fontFamily: "Avenir, sans-serif", color: "#1a0202" }}
          >
            How are you feeling today?
          </h1>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-30">
          {/* Left Column - Mood Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mood Input Card */}
            <div
              className="rounded-3xl shadow-2xl p-8 overflow-hidden relative group"
              style={{
                background: getMoodGradient(currentMoodLevel),
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              {/* Animated glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 70%)",
                }}
              />

              <div className="relative">
                {/* Mood Display */}
                <div className="text-center mb-8">
                  <div
                    className="text-9xl mb-4 transition-transform duration-300 hover:scale-110 inline-block"
                    style={{
                      filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.1))",
                    }}
                  >
                    {getMoodEmoji(currentMoodLevel)}
                  </div>
                  <div
                    className="text-6xl font-black mb-2"
                    style={{
                      fontFamily: "Avenir, sans-serif",
                      color: getMoodColor(currentMoodLevel),
                    }}
                  >
                    {currentMoodLevel}.0
                  </div>
                  <div
                    className="text-2xl font-bold"
                    style={{
                      fontFamily: "Avenir, sans-serif",
                      color: getMoodColor(currentMoodLevel),
                    }}
                  >
                    {getMoodLabel(currentMoodLevel)}
                  </div>
                </div>

                {/* Mood Slider */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">😢</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={currentMoodLevel}
                      onChange={(e) =>
                        setCurrentMoodLevel(parseInt(e.target.value))
                      }
                      className="flex-1 mx-4 h-3 rounded-full appearance-none cursor-pointer transition-all"
                      style={{
                        background: `linear-gradient(to right, #dc2626 0%, #f59e0b 25%, #eab308 50%, #10b981 75%, #059669 100%)`,
                      }}
                    />
                    <span className="text-4xl">😄</span>
                  </div>
                </div>

                {/* Note Input */}
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Share what's on your mind... (optional)"
                  className="w-full rounded-2xl px-4 py-3 mb-4 resize-none transition-all duration-200 focus:scale-[1.02] shadow-lg"
                  style={{
                    fontFamily: "Avenir, sans-serif",
                    border: "2px solid rgba(255,255,255,0.5)",
                    backgroundColor: "rgba(255,255,255,0.9)",
                    height: "100px",
                  }}
                />

                {/* Submit Button */}
                <button
                  onClick={handleSubmitMood}
                  disabled={sending}
                  className="w-full py-4 rounded-2xl font-black text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(135deg, #0097b2 0%, #007a92 100%)",
                    color: "#ffffff",
                    fontFamily: "Avenir, sans-serif",
                  }}
                >
                  {sending ? "✨ Submitting..." : "🚀 Submit My Mood"}
                </button>
              </div>
            </div>

            {/* Mood Trend Chart */}
            <div
              className="rounded-3xl shadow-xl p-6 overflow-hidden"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3
                  className="text-2xl font-black"
                  style={{ color: "#1a0202", fontFamily: "Avenir, sans-serif" }}
                >
                  📈 Your Mood Journey
                </h3>
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200">
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: "#0097b2",
                      fontFamily: "Avenir, sans-serif",
                    }}
                  >
                    {moodStats?.total_entries || 0} logs
                  </span>
                </div>
              </div>

              <div
                className="h-64 rounded-2xl p-4"
                style={{ backgroundColor: "#f8fafc" }}
              >
                {(() => {
                  const grouped = {};
                  moodHistory.forEach((mood) => {
                    const dateObj = new Date(mood.created_at);
                    const isoDate = dateObj.toISOString().slice(0, 10);
                    if (!grouped[isoDate]) grouped[isoDate] = [];
                    grouped[isoDate].push(mood);
                  });

                  const sortedIsoDates = Object.keys(grouped).sort(
                    (a, b) => new Date(a) - new Date(b)
                  );
                  const labels = sortedIsoDates.map((iso) => {
                    const d = new Date(iso);
                    return d.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  });

                  const positiveData = sortedIsoDates.map((date) => {
                    const moods = grouped[date].filter(
                      (m) => m.mood_level >= 4
                    );
                    if (moods.length === 0) return null;
                    return (
                      moods.reduce((sum, m) => sum + m.mood_level, 0) /
                      moods.length
                    );
                  });

                  const neutralData = sortedIsoDates.map((date) => {
                    const moods = grouped[date].filter(
                      (m) => m.mood_level === 3
                    );
                    if (moods.length === 0) return null;
                    return (
                      moods.reduce((sum, m) => sum + m.mood_level, 0) /
                      moods.length
                    );
                  });

                  const negativeData = sortedIsoDates.map((date) => {
                    const moods = grouped[date].filter(
                      (m) => m.mood_level <= 2
                    );
                    if (moods.length === 0) return null;
                    return (
                      moods.reduce((sum, m) => sum + m.mood_level, 0) /
                      moods.length
                    );
                  });

                  return (
                    <Line
                      data={{
                        labels,
                        datasets: [
                          {
                            label: "😄 Positive (4-5)",
                            data: positiveData,
                            fill: false,
                            borderColor: "#10b981",
                            backgroundColor: "#10b981",
                            tension: 0.4,
                            pointRadius: 6,
                            pointBackgroundColor: "#10b981",
                            pointBorderColor: "#fff",
                            pointBorderWidth: 2,
                            pointHoverRadius: 8,
                          },
                          {
                            label: "😐 Neutral (3)",
                            data: neutralData,
                            fill: false,
                            borderColor: "#eab308",
                            backgroundColor: "#eab308",
                            tension: 0.4,
                            pointRadius: 6,
                            pointBackgroundColor: "#eab308",
                            pointBorderColor: "#fff",
                            pointBorderWidth: 2,
                            pointHoverRadius: 8,
                          },
                          {
                            label: "😢 Negative (1-2)",
                            data: negativeData,
                            fill: false,
                            borderColor: "#dc2626",
                            backgroundColor: "#dc2626",
                            tension: 0.4,
                            pointRadius: 6,
                            pointBackgroundColor: "#dc2626",
                            pointBorderColor: "#fff",
                            pointBorderWidth: 2,
                            pointHoverRadius: 8,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            labels: {
                              font: { family: "Avenir, sans-serif", size: 12 },
                              padding: 15,
                            },
                          },
                          tooltip: {
                            backgroundColor: "#ffffff",
                            titleColor: "#1a0202",
                            bodyColor: "#4a6e7e",
                            borderColor: "#e2e8f0",
                            borderWidth: 2,
                            padding: 12,
                            bodyFont: { family: "Avenir, sans-serif" },
                            titleFont: {
                              family: "Avenir, sans-serif",
                              weight: "bold",
                            },
                          },
                        },
                        scales: {
                          y: {
                            min: 1,
                            max: 5,
                            reverse: true,
                            ticks: {
                              stepSize: 1,
                              color: "#4a6e7e",
                              font: { family: "Avenir, sans-serif", size: 12 },
                            },
                            grid: { color: "#e2e8f0" },
                          },
                          x: {
                            ticks: {
                              color: "#4a6e7e",
                              font: { family: "Avenir, sans-serif", size: 11 },
                            },
                            grid: { display: false },
                          },
                        },
                      }}
                    />
                  );
                })()}
              </div>

              {/* Average Display */}
              <div className="mt-4 text-center">
                <div
                  className="inline-block px-6 py-3 rounded-2xl shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                  }}
                >
                  <span
                    className="text-sm font-bold mr-2"
                    style={{
                      color: "#1e40af",
                      fontFamily: "Avenir, sans-serif",
                    }}
                  >
                    Average Mood:
                  </span>
                  <span
                    className="text-2xl font-black"
                    style={{
                      color: "#1e40af",
                      fontFamily: "Avenir, sans-serif",
                    }}
                  >
                    {moodStats?.avg_mood
                      ? parseFloat(moodStats.avg_mood).toFixed(1)
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* una */}
          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Mood Logs */}
            <div
              className="rounded-3xl shadow-xl p-6 overflow-hidden"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
              }}
            >
              <h3
                className="text-xl font-black mb-4"
                style={{ color: "#1a0202", fontFamily: "Avenir, sans-serif" }}
              >
                📝 Recent Logs
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {moodHistory.slice(0, 10).map((mood) => (
                  <div
                    key={mood.id}
                    className="group rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                    style={{
                      background: getMoodGradient(mood.mood_level),
                      border: "1px solid rgba(255,255,255,0.5)",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-3xl transition-transform duration-200 group-hover:scale-110">
                          {getMoodEmoji(mood.mood_level)}
                        </div>
                        <div className="flex-1">
                          <div
                            className="font-bold text-sm mb-1"
                            style={{
                              color: getMoodColor(mood.mood_level),
                              fontFamily: "Avenir, sans-serif",
                            }}
                          >
                            {getMoodLabel(mood.mood_level)} • Level{" "}
                            {mood.mood_level}
                          </div>
                          <div
                            className="text-xs mb-2"
                            style={{
                              color: getMoodColor(mood.mood_level),
                              fontFamily: "Avenir, sans-serif",
                              opacity: 0.8,
                            }}
                          >
                            {new Date(mood.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                          {mood.notes && (
                            <div
                              className="mt-2 p-2 rounded-xl"
                              style={{
                                backgroundColor: "rgba(255,255,255,0.7)",
                              }}
                            >
                              <p
                                className="text-xs italic"
                                style={{
                                  color: getMoodColor(mood.mood_level),
                                  fontFamily: "Avenir, sans-serif",
                                }}
                              >
                                "{mood.notes}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMood(mood.id)}
                        className="ml-2 px-3 py-1.5 text-xs rounded-xl font-bold transition-all duration-200 hover:scale-110 active:scale-95 shadow-md"
                        style={{
                          background:
                            "linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)",
                          color: "#dc2626",
                          fontFamily: "Avenir, sans-serif",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                {moodHistory.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <div
                      className="text-sm font-medium"
                      style={{
                        color: "#4a6e7e",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      No mood logs yet
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{
                        color: "#94a3b8",
                        fontFamily: "Avenir, sans-serif",
                      }}
                    >
                      Start tracking your mood today!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mood Distribution */}
            <div
              className="rounded-3xl shadow-xl p-6 overflow-hidden"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
              }}
            >
              <h3
                className="text-xl font-black mb-4"
                style={{ color: "#1a0202", fontFamily: "Avenir, sans-serif" }}
              >
                📊 Mood Distribution
              </h3>
              <div className="space-y-3">
                {getMoodDistribution().map((item) => (
                  <div key={item.level} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl transition-transform duration-200 group-hover:scale-125">
                          {item.emoji}
                        </span>
                        <span
                          className="text-sm font-bold"
                          style={{
                            color: "#1a0202",
                            fontFamily: "Avenir, sans-serif",
                          }}
                        >
                          {item.label}
                        </span>
                      </div>
                      <span
                        className="text-sm font-black"
                        style={{
                          color: item.color,
                          fontFamily: "Avenir, sans-serif",
                        }}
                      >
                        {item.count}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: "#e2e8f0" }}
                    >
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

              {/* Weekly Average */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div
                    className="text-sm font-bold mb-2"
                    style={{
                      color: "#4a6e7e",
                      fontFamily: "Avenir, sans-serif",
                    }}
                  >
                    Weekly Average
                  </div>
                  <div
                    className="text-4xl font-black"
                    style={{
                      color: "#0097b2",
                      fontFamily: "Avenir, sans-serif",
                    }}
                  >
                    {formatMoodStats(weeklyStats)}
                  </div>
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
