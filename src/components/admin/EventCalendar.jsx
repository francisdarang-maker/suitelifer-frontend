import React, { useState, useCallback, useMemo } from "react";
import { Tooltip, Fade } from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Grid,
  List,
  Clock,
  Filter,
  Plus,
} from "lucide-react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Import your event colors from constants
import eventColors from "../../constants/eventColor";

// Import EventImageCarousel component
import EventImageCarousel from "../events/EventImageCarousel";

// Event filter component
const EventFilter = ({
  activeFilters,
  toggleFilter,
  toggleAllFilters,
  onDragStart,
  onDragEnd,
  draggedCategory,
  enableDragDrop,
}) => {
  const activeCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="mt-6 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-700" />
          <h3 className="text-base sm:text-lg font-bold text-gray-800">
            Filter Events
          </h3>
          <span className="text-xs sm:text-sm text-gray-500">
            ({activeCount} active)
          </span>
        </div>
        <button
          onClick={toggleAllFilters}
          className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50 rounded-lg transition-all"
        >
          {activeCount === Object.keys(activeFilters).length
            ? "Clear All"
            : "Select All"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {Object.entries(eventColors).map(([key, value]) => (
          <div
            key={key}
            draggable={enableDragDrop}
            onDragStart={() => enableDragDrop && onDragStart(key)}
            onDragEnd={() => enableDragDrop && onDragEnd()}
            className={`
              relative group cursor-pointer
              ${enableDragDrop ? "hover:scale-105 active:scale-95" : ""}
              ${draggedCategory === key ? "scale-110 ring-4 ring-blue-400" : ""}
              transition-all duration-300
            `}
          >
            <button
              onClick={() => toggleFilter(key)}
              className={`
                w-full p-2 sm:p-3 rounded-xl font-medium text-xs sm:text-sm
                transition-all duration-300
                ${
                  activeFilters[key]
                    ? `bg-gradient-to-r ${value.bg} text-white shadow-lg`
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                }
              `}
              style={
                activeFilters[key]
                  ? { boxShadow: `0 4px 12px ${value.glow}` }
                  : {}
              }
            >
              {value.label}
            </button>
            {/* {enableDragDrop && ( */}
            {/* // <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              //   <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              //     Drag me
              //   </div>
              // </div> */}
            {/* )} */}
          </div>
        ))}
      </div>
    </div>
  );
};

const EventCalendar = ({
  events = [],
  onSelectSlot,
  onSelectEvent,
  enableDragDrop = true,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // month, week, day, agenda
  const [eventImages, setEventImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const [activeFilters, setActiveFilters] = useState(
    Object.keys(eventColors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [expandedDates, setExpandedDates] = useState(new Set());
  const [completedPage, setCompletedPage] = useState(1);
  const COMPLETED_EVENTS_PER_PAGE = 5;

  // Date utilities
  const getDaysInMonth = useCallback((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, firstDay, lastDay };
  }, []);

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isToday = (date) => isSameDay(date, new Date());

  const isPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const category = event.category?.toLowerCase() || "others";
      return activeFilters[category];
    });
  }, [events, activeFilters]);

  // Get events for a specific date
  const getEventsForDate = useCallback(
    (date) => {
      return filteredEvents.filter((event) => {
        const eventStart = new Date(event.start);
        return isSameDay(eventStart, date);
      });
    },
    [filteredEvents]
  );

  // Navigation
  const navigate = useCallback(
    (direction) => {
      const newDate = new Date(currentDate);
      if (view === "month") {
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
      } else if (view === "week") {
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
      } else if (view === "day") {
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
      }
      setCurrentDate(newDate);
    },
    [currentDate, view]
  );

  const goToToday = () => setCurrentDate(new Date());

  // Filter handlers
  const toggleFilter = useCallback((category) => {
    setActiveFilters((prev) => ({ ...prev, [category]: !prev[category] }));
  }, []);

  const toggleAllFilters = useCallback(() => {
    const allActive = Object.values(activeFilters).every((v) => v);
    setActiveFilters(
      Object.keys(activeFilters).reduce(
        (acc, key) => ({ ...acc, [key]: !allActive }),
        {}
      )
    );
  }, [activeFilters]);

  // Drag and drop
  const handleDragStart = useCallback((category) => {
    setDraggedCategory(category);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedCategory(null);
    setHoveredDate(null);
  }, []);

  const handleDateDrop = useCallback(
    (date) => {
      if (!draggedCategory) return;

      const eventStart = new Date(date);
      eventStart.setHours(9, 0, 0, 0);
      const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);

      onSelectSlot({
        start: eventStart,
        end: eventEnd,
        category: draggedCategory,
      });

      setDraggedCategory(null);
      setHoveredDate(null);
    },
    [draggedCategory, onSelectSlot]
  );

  // Image fetching
  const extractFolderId = useCallback((gdriveLink) => {
    if (!gdriveLink) return null;
    const cleanLink = gdriveLink.split("?")[0];
    const match = cleanLink.match(/folders\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }, []);

  const fetchImagesForEvent = useCallback(
    async (eventId, gdriveLink) => {
      const folderId = extractFolderId(gdriveLink);
      if (!folderId) return [];

      try {
        setLoadingImages((prev) => ({ ...prev, [eventId]: true }));
        const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents and mimeType contains 'image/'&key=${API_KEY}&fields=files(id,name,mimeType,thumbnailLink,createdTime)&orderBy=createdTime desc&pageSize=5`;
        const res = await axios.get(url);
        const files = res.data.files || [];
        return files
          .filter((file) => file.mimeType.startsWith("image/"))
          .map(
            (file) => `https://lh3.googleusercontent.com/d/${file.id}=w1000`
          );
      } catch (err) {
        console.error(`Error fetching images for event ${eventId}:`, err);
        return [];
      } finally {
        setLoadingImages((prev) => ({ ...prev, [eventId]: false }));
      }
    },
    [extractFolderId]
  );

  const handleEventHover = useCallback(
    async (event) => {
      const eventKey = event.eventId || event.id;
      if (eventImages[eventKey] || loadingImages[eventKey]) return;

      const driveLink = event.gdriveLink || event.gdrive_link;
      if (driveLink) {
        const images = await fetchImagesForEvent(eventKey, driveLink);
        setEventImages((prev) => ({ ...prev, [eventKey]: images }));
      }
    },
    [eventImages, loadingImages, fetchImagesForEvent]
  );

  // Replace your existing EventBadge component with this updated version:

  const EventBadge = ({ event, compact = false }) => {
    // Use solid colors matching WeekView instead of gradients
    const CATEGORY_COLORS = {
      party: "#ec4899",
      launchpod: "#3b82f6",
      holiday: "#22c55e",
      payroll: "#f97316",
      others: "#0097b2",
    };

    const category = event.category?.toLowerCase() || "others";
    const solidColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.others;
    const eventKey = event.eventId || event.id;
    const images = eventImages[eventKey] || [];
    const isLoading = loadingImages[eventKey];

    return (
      <Tooltip
        title={
          <EventImageCarousel
            isLoading={isLoading}
            hasLink={!!(event.gdriveLink || event.gdrive_link)}
            images={images}
          />
        }
        arrow
        placement="top"
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
        enterDelay={500}
        leaveDelay={100}
        slotProps={{
          tooltip: {
            sx: {
              backgroundColor: "transparent",
              padding: 0,
              maxWidth: "none",
              boxShadow: "none",
            },
          },
          arrow: {
            sx: { color: "rgba(17, 24, 39, 0.95)" },
          },
        }}
      >
        <div
          onMouseEnter={() => handleEventHover(event)}
          onClick={() => onSelectEvent(event)}
          className={`
          relative group cursor-pointer
          ${
            compact
              ? "px-2 py-1.5 text-xs mb-1"
              : "px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm mb-2"
          }
          rounded-lg transition-all duration-300
          hover:shadow-lg
          overflow-hidden
        `}
          style={{
            backgroundColor: `${solidColor}20`,
            borderLeft: `3px solid ${solidColor}`,
          }}
        >
          <div
            className="relative z-10 font-semibold truncate"
            style={{ color: solidColor }}
          >
            {event.title}
          </div>
        </div>
      </Tooltip>
    );
  };

  // Month view - Complete with solid colors matching WeekView
  const MonthView = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];

    const toggleDateExpansion = (dateStr) => {
      setExpandedDates((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(dateStr)) {
          newSet.delete(dateStr);
        } else {
          newSet.add(dateStr);
        }
        return newSet;
      });
    };

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="bg-gray-50 min-h-[100px] sm:min-h-[120px] border border-gray-200"
        />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dateStr = date.toISOString().split("T")[0];
      const dayEvents = getEventsForDate(date);
      const isCurrentDay = isToday(date);
      const isPastDay = isPast(date);
      const isHovered = hoveredDate && isSameDay(hoveredDate, date);
      const isExpanded = expandedDates.has(dateStr);
      const visibleEvents = isExpanded ? dayEvents : dayEvents.slice(0, 3);

      days.push(
        <div
          key={day}
          className={`
          min-h-[100px] sm:min-h-[120px] border border-gray-200 p-1.5 sm:p-2 transition-all cursor-pointer
          ${
            isCurrentDay
              ? "bg-blue-50 ring-2 ring-blue-400"
              : "bg-white hover:bg-gray-50"
          }
          ${isPastDay ? "opacity-60" : ""}
          ${
            isHovered && draggedCategory
              ? "bg-blue-100 ring-2 ring-blue-500 ring-dashed"
              : ""
          }
        `}
          onClick={(e) => {
            // Only trigger slot selection if clicking on empty space (not on events or +more button)
            if (!draggedCategory && e.target === e.currentTarget) {
              const start = new Date(date);
              start.setHours(9, 0, 0, 0);
              const end = new Date(start.getTime() + 60 * 60 * 1000);
              onSelectSlot({ start, end });
            }
          }}
          onDragOver={(e) => {
            if (enableDragDrop && draggedCategory) {
              e.preventDefault();
              setHoveredDate(date);
            }
          }}
          onDragLeave={() => {
            if (enableDragDrop) setHoveredDate(null);
          }}
          onDrop={(e) => {
            if (enableDragDrop) {
              e.preventDefault();
              handleDateDrop(date);
            }
          }}
        >
          <div
            className={`
          text-xs sm:text-sm font-bold mb-1 sm:mb-2
          ${
            isCurrentDay
              ? "text-blue-600"
              : isPastDay
              ? "text-gray-400"
              : "text-gray-700"
          }
        `}
          >
            {day}
          </div>
          <div className={`space-y-1 ${isExpanded ? "" : ""}`}>
            {visibleEvents.map((event, idx) => (
              <EventBadge key={idx} event={event} compact />
            ))}
            {dayEvents.length > 3 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDateExpansion(dateStr);
                }}
                className="text-xs text-cyan-600 hover:text-cyan-800 font-semibold hover:underline transition-colors w-full text-left px-1"
              >
                {isExpanded ? `Show less` : `+${dayEvents.length - 3} more`}
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-gradient-to-r from-gray-100 to-gray-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center py-2 sm:py-3 font-bold text-gray-700 text-xs sm:text-sm border-b border-gray-300"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">{days}</div>
      </div>
    );
  };

  // Week view - Modern and Compact Design
  const WeekView = () => {
    const CATEGORY_COLORS = {
      party: "#ec4899",
      launchpod: "#3b82f6",
      holiday: "#22c55e",
      payroll: "#f97316",
      others: "#0097b2",
    };

    const [expandedDays, setExpandedDays] = React.useState({});

    const toggleDayExpansion = (dayIndex) => {
      setExpandedDays((prev) => ({
        ...prev,
        [dayIndex]: !prev[dayIndex],
      }));
    };

    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Week Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-600"
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
              <h3 className="text-lg font-bold text-gray-900">
                {startOfWeek.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {startOfWeek.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {days[6].toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-7 divide-x divide-gray-200">
          {days.map((date, idx) => {
            const dayEvents = getEventsForDate(date);
            const isCurrentDay = isToday(date);
            const isPastDay = isPast(date);
            const now = new Date();
            const isExpanded = expandedDays[idx];
            const MAX_VISIBLE_EVENTS = 3;
            const hasMoreEvents = dayEvents.length > MAX_VISIBLE_EVENTS;
            const visibleEvents = isExpanded
              ? dayEvents
              : dayEvents.slice(0, MAX_VISIBLE_EVENTS);

            return (
              <div
                key={idx}
                className={`
                min-h-[240px] transition-all
                ${
                  isCurrentDay
                    ? "bg-cyan-50/50"
                    : isPastDay
                    ? "bg-gray-50/50"
                    : "bg-white"
                }
              `}
              >
                {/* Day Header */}
                <div
                  className={`
                sticky top-0 z-10 px-2 py-2.5 border-b transition-all
                ${
                  isCurrentDay
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-700"
                    : isPastDay
                    ? "bg-gray-100 border-gray-200"
                    : "bg-white border-gray-200"
                }
              `}
                >
                  <div className="text-center">
                    <div
                      className={`
                    text-xs font-semibold uppercase tracking-wide
                    ${
                      isCurrentDay
                        ? "text-white"
                        : isPastDay
                        ? "text-gray-400"
                        : "text-gray-600"
                    }
                  `}
                    >
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div
                      className={`
                    flex items-center justify-center gap-1.5 mt-1
                  `}
                    >
                      <div
                        className={`
                      text-xl font-bold
                      ${
                        isCurrentDay
                          ? "text-white"
                          : isPastDay
                          ? "text-gray-400"
                          : "text-gray-900"
                      }
                    `}
                      >
                        {date.getDate()}
                      </div>
                      {dayEvents.length > 0 && (
                        <span
                          className={`
                        px-1.5 py-0.5 rounded-full text-xs font-bold
                        ${
                          isCurrentDay
                            ? "bg-white text-cyan-600"
                            : "bg-cyan-100 text-cyan-700"
                        }
                      `}
                        >
                          {dayEvents.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Events List - With expand/collapse */}
                <div className="p-2 space-y-1.5">
                  {dayEvents.length === 0 ? (
                    <div
                      onClick={() => {
                        const start = new Date(date);
                        start.setHours(9, 0, 0, 0);
                        const end = new Date(start.getTime() + 60 * 60 * 1000);
                        onSelectSlot({ start, end });
                      }}
                      className={`
                        mt-4 p-2 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all
                        ${
                          isPastDay
                            ? "border-gray-200 hover:border-gray-300"
                            : "border-gray-300 hover:border-cyan-400 hover:bg-cyan-50"
                        }
                      `}
                    >
                      <svg
                        className="w-5 h-5 text-gray-300 mx-auto mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <p className="text-xs text-gray-400">Add event</p>
                    </div>
                  ) : (
                    <>
                      {visibleEvents.map((event, eventIdx) => {
                        const eventStart = new Date(event.start);
                        const eventEnd = new Date(event.end || event.start);
                        const isCompleted = eventEnd < now;
                        const isOngoing = eventStart <= now && eventEnd >= now;

                        return (
                          <div
                            key={eventIdx}
                            onClick={() => onSelectEvent(event)}
                            className={`
                          group relative p-2 rounded-lg cursor-pointer transition-all border-l-4
                          ${
                            isCompleted
                              ? "bg-gray-100 hover:bg-gray-200 opacity-75"
                              : isOngoing
                              ? "bg-cyan-100 hover:bg-cyan-200 shadow-sm"
                              : "bg-white hover:bg-gray-50 shadow-sm border border-gray-200"
                          }
                        `}
                            style={{
                              borderLeftColor: CATEGORY_COLORS[event.category],
                            }}
                          >
                            {/* Time */}
                            <div
                              className={`
                          flex items-center gap-1 text-xs font-semibold mb-1
                          ${
                            isCompleted
                              ? "text-gray-400"
                              : isOngoing
                              ? "text-cyan-700"
                              : "text-gray-600"
                          }
                        `}
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
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {eventStart.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>

                            {/* Title */}
                            <h4
                              className={`
                          text-xs font-semibold line-clamp-2 mb-1
                          ${isCompleted ? "text-gray-500" : "text-gray-900"}
                        `}
                            >
                              {event.title}
                            </h4>

                            {/* Category Badge */}
                            <div className="flex items-center justify-between">
                              <span
                                className="text-xs font-medium px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${
                                    CATEGORY_COLORS[event.category]
                                  }20`,
                                  color: CATEGORY_COLORS[event.category],
                                }}
                              >
                                {event.category}
                              </span>

                              {/* Status Indicators */}
                              {isOngoing && (
                                <span className="flex items-center gap-0.5 text-xs font-bold text-cyan-700">
                                  <span className="w-1.5 h-1.5 bg-cyan-600 rounded-full animate-pulse" />
                                </span>
                              )}
                              {isCompleted && (
                                <svg
                                  className="w-3.5 h-3.5 text-green-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Show More/Less Button */}
                      {hasMoreEvents && (
                        <button
                          onClick={() => toggleDayExpansion(idx)}
                          className={`
                        w-full mt-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all
                        ${
                          isExpanded
                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                        }
                      `}
                        >
                          {isExpanded ? (
                            <span className="flex items-center justify-center gap-1">
                              Show Less
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1">
                              +{dayEvents.length - MAX_VISIBLE_EVENTS} More
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </span>
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Day view - Modern and Compact Design
  const DayView = () => {
    const CATEGORY_COLORS = {
      party: "#ec4899",
      launchpod: "#3b82f6",
      holiday: "#22c55e",
      payroll: "#f97316",
      others: "#0097b2",
    };

    const dayEvents = getEventsForDate(currentDate);
    const isCurrentDay = isToday(currentDate);

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header - Compact and Modern */}
        <div
          className={`
        px-5 py-4 border-b border-gray-200
        ${
          isCurrentDay
            ? "bg-gradient-to-r from-cyan-50 to-blue-50"
            : "bg-gray-50"
        }
      `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`
              flex flex-col items-center justify-center w-14 h-14 rounded-xl
              ${
                isCurrentDay
                  ? "bg-gradient-to-br from-cyan-600 to-blue-600 text-white"
                  : "bg-white text-gray-900 border-2 border-gray-200"
              }
            `}
              >
                <div className="text-xs font-semibold uppercase">
                  {currentDate.toLocaleDateString("en-US", { month: "short" })}
                </div>
                <div className="text-2xl font-bold leading-none">
                  {currentDate.getDate()}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">
                  {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
                </div>
                <div
                  className={`text-lg font-bold ${
                    isCurrentDay ? "text-cyan-700" : "text-gray-900"
                  }`}
                >
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isCurrentDay && (
                <span className="px-3 py-1 bg-cyan-600 text-white text-xs font-bold rounded-full">
                  TODAY
                </span>
              )}
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                {dayEvents.length} {dayEvents.length === 1 ? "Event" : "Events"}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {dayEvents.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
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
              </div>
              <p className="text-gray-500 text-sm mb-4">
                No events scheduled for this day
              </p>
              <button
                onClick={() => {
                  const start = new Date(currentDate);
                  start.setHours(9, 0, 0, 0);
                  const end = new Date(start.getTime() + 60 * 60 * 1000);
                  onSelectSlot({ start, end });
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white text-sm font-semibold rounded-lg hover:from-cyan-700 hover:to-cyan-800 hover:shadow-lg transition-all transform hover:scale-105"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Event
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {dayEvents.map((event, idx) => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end || event.start);
                const now = new Date();
                const isCompleted = eventEnd < now;
                const isOngoing = eventStart <= now && eventEnd >= now;

                return (
                  <div
                    key={idx}
                    onClick={() => onSelectEvent(event)}
                    className={`
                    group relative flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer
                    ${
                      isCompleted
                        ? "border-gray-200 bg-gray-50 hover:bg-gray-100"
                        : isOngoing
                        ? "border-cyan-300 bg-cyan-50 hover:border-cyan-400 hover:shadow-md"
                        : "border-gray-200 bg-white hover:border-cyan-300 hover:shadow-md"
                    }
                  `}
                  >
                    {/* Time Badge */}
                    <div className="flex-shrink-0 text-center min-w-[60px]">
                      <div
                        className={`
                      text-xs font-semibold
                      ${
                        isCompleted
                          ? "text-gray-400"
                          : isOngoing
                          ? "text-cyan-700"
                          : "text-gray-600"
                      }
                    `}
                      >
                        {eventStart.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {event.end && (
                        <>
                          <div className="text-gray-300 text-xs my-0.5">↓</div>
                          <div
                            className={`
                          text-xs font-semibold
                          ${
                            isCompleted
                              ? "text-gray-400"
                              : isOngoing
                              ? "text-cyan-700"
                              : "text-gray-600"
                          }
                        `}
                          >
                            {eventEnd.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Color Indicator */}
                    <div
                      className="flex-shrink-0 w-1 h-full rounded-full -ml-1"
                      style={{
                        backgroundColor: CATEGORY_COLORS[event.category],
                      }}
                    />

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4
                          className={`
                        font-semibold text-sm
                        ${isCompleted ? "text-gray-500" : "text-gray-900"}
                      `}
                        >
                          {event.title}
                        </h4>
                        {isOngoing && (
                          <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 bg-cyan-600 text-white rounded-md text-xs font-bold">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            LIVE
                          </span>
                        )}
                        {isCompleted && (
                          <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Done
                          </span>
                        )}
                      </div>

                      {event.description && (
                        <p
                          className={`
                        text-xs mb-2 line-clamp-2
                        ${isCompleted ? "text-gray-400" : "text-gray-600"}
                      `}
                        >
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${
                              CATEGORY_COLORS[event.category]
                            }20`,
                            color: CATEGORY_COLORS[event.category],
                          }}
                        >
                          {event.category}
                        </span>

                        {(event.gdriveLink || event.gdrive_link) && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                              />
                            </svg>
                            Attachment
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Add Button (when events exist) */}
        {dayEvents.length > 0 && (
          <div className="px-5 pb-5">
            <button
              onClick={() => {
                const start = new Date(currentDate);
                start.setHours(9, 0, 0, 0);
                const end = new Date(start.getTime() + 60 * 60 * 1000);
                onSelectSlot({ start, end });
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 text-gray-600 text-sm font-semibold rounded-lg hover:border-cyan-400 hover:text-cyan-700 hover:bg-cyan-50 transition-all"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Another Event
            </button>
          </div>
        )}
      </div>
    );
  };

  // Agenda view - Compact and Clean Design
  const AgendaView = () => {
    const CATEGORY_COLORS = {
      party: "#ec4899",
      launchpod: "#3b82f6",
      holiday: "#22c55e",
      payroll: "#f97316",
      others: "#0097b2",
    };

    const [isCompletedMinimized, setIsCompletedMinimized] =
      React.useState(false);
    const [upcomingPage, setUpcomingPage] = React.useState(1);

    const now = new Date();
    const sortedEvents = [...filteredEvents].sort(
      (a, b) => new Date(a.start) - new Date(b.start)
    );

    const upcomingEvents = sortedEvents.filter(
      (e) => new Date(e.end || e.start) >= now
    );
    const completedEvents = sortedEvents.filter(
      (e) => new Date(e.end || e.start) < now
    );

    // Pagination for upcoming events
    const UPCOMING_EVENTS_PER_PAGE = 5;
    const totalUpcomingPages = Math.ceil(
      upcomingEvents.length / UPCOMING_EVENTS_PER_PAGE
    );
    const upcomingStartIndex = (upcomingPage - 1) * UPCOMING_EVENTS_PER_PAGE;
    const upcomingEndIndex = upcomingStartIndex + UPCOMING_EVENTS_PER_PAGE;
    const paginatedUpcomingEvents = upcomingEvents.slice(
      upcomingStartIndex,
      upcomingEndIndex
    );

    // Pagination for completed events
    const totalCompletedPages = Math.ceil(
      completedEvents.length / COMPLETED_EVENTS_PER_PAGE
    );
    const startIndex = (completedPage - 1) * COMPLETED_EVENTS_PER_PAGE;
    const endIndex = startIndex + COMPLETED_EVENTS_PER_PAGE;
    const paginatedCompletedEvents = completedEvents.slice(
      startIndex,
      endIndex
    );

    const handleUpcomingPageChange = (newPage) => {
      setUpcomingPage(newPage);
      setTimeout(() => {
        const upcomingSection = document.getElementById(
          "upcoming-events-section"
        );
        if (upcomingSection) {
          upcomingSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    };

    const handleCompletedPageChange = (newPage) => {
      setCompletedPage(newPage);
      setTimeout(() => {
        const completedSection = document.getElementById(
          "completed-events-section"
        );
        if (completedSection) {
          completedSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    };

    const renderEventList = (events, isCompleted = false) => (
      <div className="space-y-2">
        {events.map((event, idx) => {
          const eventDate = new Date(event.start);
          const eventEnd = new Date(event.end || event.start);
          const isDone = eventEnd < now;

          return (
            <div
              key={idx}
              onClick={() => onSelectEvent(event)}
              className={`
              group flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer
              ${
                isDone
                  ? "border border-gray-200 bg-gray-50/50 hover:bg-gray-100"
                  : "border border-gray-200 bg-white hover:border-cyan-300 hover:shadow-md"
              }
            `}
            >
              {/* Date Badge - Compact */}
              <div
                className={`
              flex flex-col items-center justify-center min-w-[50px] h-[50px] rounded-lg
              ${
                isDone
                  ? "bg-gray-100"
                  : "bg-gradient-to-br from-cyan-50 to-blue-50"
              }
            `}
              >
                <div
                  className={`text-xs font-semibold ${
                    isDone ? "text-gray-400" : "text-cyan-700"
                  }`}
                >
                  {eventDate
                    .toLocaleDateString("en-US", { month: "short" })
                    .toUpperCase()}
                </div>
                <div
                  className={`text-xl font-bold leading-none ${
                    isDone ? "text-gray-500" : "text-gray-900"
                  }`}
                >
                  {eventDate.getDate()}
                </div>
              </div>

              {/* Event Details - Compact */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[event.category] }}
                  />
                  <h4
                    className={`
                  text-sm font-semibold truncate
                  ${isDone ? "text-gray-500" : "text-gray-900"}
                `}
                  >
                    {event.title}
                  </h4>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
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
                    {eventDate.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[event.category]}20`,
                      color: CATEGORY_COLORS[event.category],
                    }}
                  >
                    {event.category}
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              {isDone && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-md text-xs font-medium">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Done
                </div>
              )}
            </div>
          );
        })}
      </div>
    );

    const renderPagination = (currentPage, totalPages, onPageChange) => {
      if (totalPages <= 1) return null;

      return (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`
              px-3 py-1.5 rounded-lg font-medium text-sm transition-all flex items-center gap-1
              ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-cyan-600 text-white hover:bg-cyan-700"
              }
            `}
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Prev
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                const showPage =
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  Math.abs(pageNum - currentPage) <= 1;

                const showEllipsis =
                  (pageNum === 2 && currentPage > 3) ||
                  (pageNum === totalPages - 1 && currentPage < totalPages - 2);

                if (showEllipsis) {
                  return (
                    <span key={pageNum} className="px-1 text-gray-400">
                      ...
                    </span>
                  );
                }

                if (!showPage) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`
                    w-8 h-8 rounded-lg font-semibold text-sm transition-all
                    ${
                      currentPage === pageNum
                        ? "bg-cyan-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                  `}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`
              px-3 py-1.5 rounded-lg font-medium text-sm transition-all flex items-center gap-1
              ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-cyan-600 text-white hover:bg-cyan-700"
              }
            `}
            >
              Next
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {/* Upcoming Events Section */}
        <div
          id="upcoming-events-section"
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-cyan-600"
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
                <h3 className="text-lg font-bold text-gray-900">
                  Upcoming Events
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-cyan-600 text-white rounded-full text-xs font-bold">
                {upcomingEvents.length}
              </span>
            </div>
          </div>

          <div className="p-4">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg
                  className="w-12 h-12 text-gray-300 mx-auto mb-2"
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
                <p className="text-gray-500 text-sm">No upcoming events</p>
              </div>
            ) : (
              <>
                {renderEventList(paginatedUpcomingEvents)}
                {renderPagination(
                  upcomingPage,
                  totalUpcomingPages,
                  handleUpcomingPageChange
                )}
                {totalUpcomingPages > 1 && (
                  <div className="mt-2 text-center text-xs text-gray-500">
                    {upcomingStartIndex + 1}-
                    {Math.min(upcomingEndIndex, upcomingEvents.length)} of{" "}
                    {upcomingEvents.length}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Completed Events Section */}
        {completedEvents.length > 0 && (
          <div
            id="completed-events-section"
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-900">
                    Completed Events
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
                    {completedEvents.length}
                  </span>
                  <button
                    onClick={() =>
                      setIsCompletedMinimized(!isCompletedMinimized)
                    }
                    className="p-1.5 hover:bg-white/50 rounded-lg transition-all"
                    title={isCompletedMinimized ? "Expand" : "Minimize"}
                  >
                    <svg
                      className={`w-5 h-5 text-green-700 transition-transform ${
                        isCompletedMinimized ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {!isCompletedMinimized && (
              <div className="p-4">
                {renderEventList(paginatedCompletedEvents, true)}
                {renderPagination(
                  completedPage,
                  totalCompletedPages,
                  handleCompletedPageChange
                )}
                {totalCompletedPages > 1 && (
                  <div className="mt-2 text-center text-xs text-gray-500">
                    {startIndex + 1}-
                    {Math.min(endIndex, completedEvents.length)} of{" "}
                    {completedEvents.length}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-primary rounded-xl sm:rounded-2xl shadow-xl text-white">
        <button
          onClick={goToToday}
          className="w-full lg:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all backdrop-blur-sm"
        >
          Today
        </button>

        {/* Conditional navigation - hide when in agenda view */}
        {view !== "agenda" && (
          <div className="flex items-center gap-2 sm:gap-4 w-full lg:w-auto justify-center">
            <button
              onClick={() => navigate("prev")}
              className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl transition-all backdrop-blur-sm hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold min-w-[200px] sm:min-w-[280px] text-center">
              {view === "month" &&
                currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              {view === "week" &&
                `Week of ${currentDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}`}
              {view === "day" &&
                currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
            </h2>

            <button
              onClick={() => navigate("next")}
              className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl transition-all backdrop-blur-sm hover:scale-110"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        )}

        {/* Show title only for agenda view */}
        {view === "agenda" && (
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-center">
            Event Agenda
          </h2>
        )}

        <div className="flex gap-1 justify-evenly sm:gap-2 bg-white/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl backdrop-blur-sm w-full lg:w-auto overflow-x-auto">
          {[
            { id: "month", icon: Grid, label: "Month" },
            { id: "week", icon: Calendar, label: "Week" },
            { id: "day", icon: Clock, label: "Day" },
            { id: "agenda", icon: List, label: "Agenda" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`
                px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-base font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap
                ${
                  view === id
                    ? "bg-white text-cyan-700 shadow-lg scale-105"
                    : "text-white hover:bg-white/20"
                }
              `}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Drag indicator */}
      {draggedCategory && (
        <div className="p-3 sm:p-4 bg-blue-50 border-2 border-blue-300 rounded-xl flex items-center gap-2 sm:gap-3 animate-pulse">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-ping" />
          <span className="text-blue-800 text-xs sm:text-sm font-semibold">
            Drag <strong>{eventColors[draggedCategory]?.label}</strong> category
            to any date to create an event
          </span>
        </div>
      )}

      {/* Calendar views */}
      {view === "month" && <MonthView />}
      {view === "week" && <WeekView />}
      {view === "day" && <DayView />}
      {view === "agenda" && <AgendaView />}

      {/* Event filter */}
      <EventFilter
        activeFilters={activeFilters}
        toggleFilter={toggleFilter}
        toggleAllFilters={toggleAllFilters}
        onDragStart={enableDragDrop ? handleDragStart : undefined}
        onDragEnd={enableDragDrop ? handleDragEnd : undefined}
        draggedCategory={draggedCategory}
        enableDragDrop={enableDragDrop}
      />
    </div>
  );
};

export default EventCalendar;
