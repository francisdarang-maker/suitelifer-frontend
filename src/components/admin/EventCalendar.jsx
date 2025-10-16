import React, { useState, useCallback, useMemo } from "react";
import { Tooltip, Fade } from "@mui/material";
import { ChevronLeft, ChevronRight, Calendar, Grid, List, Clock, Filter, Plus } from "lucide-react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Import your event colors from constants
import eventColors from "../../constants/eventColor";

// Import EventImageCarousel component
import EventImageCarousel from "../events/EventImageCarousel";

// Event filter component
const EventFilter = ({ activeFilters, toggleFilter, toggleAllFilters, onDragStart, onDragEnd, draggedCategory, enableDragDrop }) => {
  const activeCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="mt-6 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-700" />
          <h3 className="text-base sm:text-lg font-bold text-gray-800">Filter Events</h3>
          <span className="text-xs sm:text-sm text-gray-500">({activeCount} active)</span>
        </div>
        <button
          onClick={toggleAllFilters}
          className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50 rounded-lg transition-all"
        >
          {activeCount === Object.keys(activeFilters).length ? "Clear All" : "Select All"}
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
              ${enableDragDrop ? 'hover:scale-105 active:scale-95' : ''}
              ${draggedCategory === key ? 'scale-110 ring-4 ring-blue-400' : ''}
              transition-all duration-300
            `}
          >
            <button
              onClick={() => toggleFilter(key)}
              className={`
                w-full p-2 sm:p-3 rounded-xl font-medium text-xs sm:text-sm
                transition-all duration-300
                ${activeFilters[key]
                  ? `bg-gradient-to-r ${value.bg} text-white shadow-lg`
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                }
              `}
              style={activeFilters[key] ? { boxShadow: `0 4px 12px ${value.glow}` } : {}}
            >
              {value.label}
            </button>
            {enableDragDrop && (
              <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Drag me
                </div>
              </div>
            )}
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
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
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
  const getEventsForDate = useCallback((date) => {
    return filteredEvents.filter(event => {
      const eventStart = new Date(event.start);
      return isSameDay(eventStart, date);
    });
  }, [filteredEvents]);

  // Navigation
  const navigate = useCallback((direction) => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else if (view === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  }, [currentDate, view]);

  const goToToday = () => setCurrentDate(new Date());

  // Filter handlers
  const toggleFilter = useCallback((category) => {
    setActiveFilters(prev => ({ ...prev, [category]: !prev[category] }));
  }, []);

  const toggleAllFilters = useCallback(() => {
    const allActive = Object.values(activeFilters).every(v => v);
    setActiveFilters(
      Object.keys(activeFilters).reduce((acc, key) => ({ ...acc, [key]: !allActive }), {})
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

  const handleDateDrop = useCallback((date) => {
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
  }, [draggedCategory, onSelectSlot]);

  // Image fetching
  const extractFolderId = useCallback((gdriveLink) => {
    if (!gdriveLink) return null;
    const cleanLink = gdriveLink.split("?")[0];
    const match = cleanLink.match(/folders\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }, []);

  const fetchImagesForEvent = useCallback(async (eventId, gdriveLink) => {
    const folderId = extractFolderId(gdriveLink);
    if (!folderId) return [];

    try {
      setLoadingImages(prev => ({ ...prev, [eventId]: true }));
      const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents and mimeType contains 'image/'&key=${API_KEY}&fields=files(id,name,mimeType,thumbnailLink,createdTime)&orderBy=createdTime desc&pageSize=5`;
      const res = await axios.get(url);
      const files = res.data.files || [];
      return files
        .filter(file => file.mimeType.startsWith("image/"))
        .map(file => `https://lh3.googleusercontent.com/d/${file.id}=w1000`);
    } catch (err) {
      console.error(`Error fetching images for event ${eventId}:`, err);
      return [];
    } finally {
      setLoadingImages(prev => ({ ...prev, [eventId]: false }));
    }
  }, [extractFolderId]);

  const handleEventHover = useCallback(async (event) => {
    const eventKey = event.eventId || event.id;
    if (eventImages[eventKey] || loadingImages[eventKey]) return;

    const driveLink = event.gdriveLink || event.gdrive_link;
    if (driveLink) {
      const images = await fetchImagesForEvent(eventKey, driveLink);
      setEventImages(prev => ({ ...prev, [eventKey]: images }));
    }
  }, [eventImages, loadingImages, fetchImagesForEvent]);

  // Render event
  const EventBadge = ({ event, compact = false }) => {
    const category = event.category?.toLowerCase() || "others";
    const colors = eventColors[category] || eventColors.others;
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
            bg-gradient-to-r ${colors.bg} text-white
            ${compact ? 'px-2 py-1 text-xs mb-1' : 'px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm mb-2'}
            rounded-lg transition-all duration-300
            hover:scale-105 hover:shadow-lg
            overflow-hidden
          `}
          style={{ boxShadow: `0 2px 8px ${colors.glow}` }}
        >
          <div className="relative z-10 font-medium truncate">
            {event.title}
          </div>
        </div>
      </Tooltip>
    );
  };

  // Month view
  const MonthView = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];
    
    const toggleDateExpansion = (dateStr) => {
      setExpandedDates(prev => {
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
      days.push(<div key={`empty-${i}`} className="bg-gray-50 min-h-[100px] sm:min-h-[120px] border border-gray-200" />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
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
            ${isCurrentDay ? 'bg-blue-50 ring-2 ring-blue-400' : 'bg-white hover:bg-gray-50'}
            ${isPastDay ? 'opacity-60' : ''}
            ${isHovered && draggedCategory ? 'bg-blue-100 ring-2 ring-blue-500 ring-dashed' : ''}
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
          <div className={`
            text-xs sm:text-sm font-bold mb-1 sm:mb-2
            ${isCurrentDay ? 'text-blue-600' : isPastDay ? 'text-gray-400' : 'text-gray-700'}
          `}>
            {day}
          </div>
          <div className={`space-y-1 ${isExpanded ? '' : ''}`}>
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
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center py-2 sm:py-3 font-bold text-gray-700 text-xs sm:text-sm border-b border-gray-300">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    );
  };

  // Week view
  const WeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 p-2 sm:p-4">
          {days.map((date, idx) => {
            const dayEvents = getEventsForDate(date);
            const isCurrentDay = isToday(date);
            const isPastDay = isPast(date);
            
            return (
              <div key={idx} className={`
                border-2 rounded-lg p-2 sm:p-3 min-h-[200px] sm:min-h-[300px]
                ${isCurrentDay ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}
                ${isPastDay ? 'opacity-60' : ''}
              `}>
                <div className="text-center mb-2 sm:mb-3">
                  <div className="text-xs text-gray-500 font-medium">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`
                    text-xl sm:text-2xl font-bold
                    ${isCurrentDay ? 'text-blue-600' : 'text-gray-800'}
                  `}>
                    {date.getDate()}
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  {dayEvents.map((event, idx) => (
                    <EventBadge key={idx} event={event} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Day view
  const DayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const isCurrentDay = isToday(currentDate);

    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="text-center mb-4 sm:mb-6">
          <div className="text-xs sm:text-sm text-gray-500 font-medium mb-1">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
          <div className={`text-2xl sm:text-4xl font-bold ${isCurrentDay ? 'text-blue-600' : 'text-gray-800'}`}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        
        {dayEvents.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-500 text-base sm:text-lg">No events scheduled for this day</p>
            <button
              onClick={() => {
                const start = new Date(currentDate);
                start.setHours(9, 0, 0, 0);
                const end = new Date(start.getTime() + 60 * 60 * 1000);
                onSelectSlot({ start, end });
              }}
              className="mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white text-sm sm:text-base font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
              Add Event
            </button>
          </div>
        ) : (
          <div className="space-y-1 sm:space-y-2">
            {dayEvents.map((event, idx) => (
              <EventBadge key={idx} event={event} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Agenda view
  const AgendaView = () => {
    const now = new Date();
    const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.start) - new Date(b.start));
    
    const upcomingEvents = sortedEvents.filter(e => new Date(e.end || e.start) >= now);
    const completedEvents = sortedEvents.filter(e => new Date(e.end || e.start) < now);

    // Pagination for completed events
    const totalCompletedPages = Math.ceil(completedEvents.length / COMPLETED_EVENTS_PER_PAGE);
    const startIndex = (completedPage - 1) * COMPLETED_EVENTS_PER_PAGE;
    const endIndex = startIndex + COMPLETED_EVENTS_PER_PAGE;
    const paginatedCompletedEvents = completedEvents.slice(startIndex, endIndex);

    const handlePageChange = (newPage) => {
      setCompletedPage(newPage);
      // Scroll to completed section smoothly
      setTimeout(() => {
        const completedSection = document.getElementById('completed-events-section');
        if (completedSection) {
          completedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    };

    const renderEventList = (events, isCompleted = false) => (
      <div className="space-y-3 sm:space-y-4">
        {events.map((event, idx) => {
          const eventDate = new Date(event.start);
          const eventEnd = new Date(event.end || event.start);
          const isDone = eventEnd < now;
          
          return (
            <div 
              key={idx} 
              className={`
                flex gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg transition-all
                ${isDone 
                  ? 'border-gray-300 bg-gray-50 opacity-75' 
                  : 'border-gray-200 bg-white hover:shadow-md'
                }
              `}
            >
              <div className="text-center min-w-[60px] sm:min-w-[80px]">
                <div className={`text-xs sm:text-sm font-medium ${isDone ? 'text-gray-400' : 'text-gray-500'}`}>
                  {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                </div>
                <div className={`text-2xl sm:text-3xl font-bold ${isDone ? 'text-gray-400' : 'text-gray-800'}`}>
                  {eventDate.getDate()}
                </div>
                <div className={`text-xs ${isDone ? 'text-gray-400' : 'text-gray-500'}`}>
                  {eventDate.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className={isDone ? 'opacity-60' : ''}>
                  <EventBadge event={event} />
                </div>
                <div className={`text-xs sm:text-sm mt-2 flex items-center gap-2 flex-wrap ${isDone ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline" />
                  {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  {isDone && (
                    <span className="ml-auto flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6">
          {/* Upcoming Events Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Upcoming Events</h3>
              <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold">
                {upcomingEvents.length}
              </span>
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg">
                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                <p className="text-gray-500 text-sm sm:text-base">No upcoming events</p>
              </div>
            ) : (
              renderEventList(upcomingEvents)
            )}
          </div>

          {/* Completed Events Section */}
          {completedEvents.length > 0 && (
            <div id="completed-events-section">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Completed Events</h3>
                <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-semibold">
                  {completedEvents.length}
                </span>
              </div>
              {renderEventList(paginatedCompletedEvents, true)}
              
              {/* Pagination Controls */}
              {totalCompletedPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => handlePageChange(completedPage - 1)}
                    disabled={completedPage === 1}
                    className={`
                      px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition-all
                      ${completedPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-cyan-600 text-white hover:bg-cyan-700 hover:shadow-lg'
                      }
                    `}
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1 sm:gap-2">
                    {[...Array(totalCompletedPages)].map((_, index) => {
                      const pageNum = index + 1;
                      // Show first page, last page, current page, and pages around current
                      const showPage = 
                        pageNum === 1 || 
                        pageNum === totalCompletedPages || 
                        Math.abs(pageNum - completedPage) <= 1;
                      
                      const showEllipsis = 
                        (pageNum === 2 && completedPage > 3) ||
                        (pageNum === totalCompletedPages - 1 && completedPage < totalCompletedPages - 2);

                      if (showEllipsis) {
                        return (
                          <span key={pageNum} className="px-2 py-2 text-gray-400">
                            ...
                          </span>
                        );
                      }

                      if (!showPage) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`
                            w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-semibold text-sm transition-all
                            ${completedPage === pageNum
                              ? 'bg-cyan-600 text-white shadow-lg scale-110'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
                          `}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(completedPage + 1)}
                    disabled={completedPage === totalCompletedPages}
                    className={`
                      px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition-all
                      ${completedPage === totalCompletedPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-cyan-600 text-white hover:bg-cyan-700 hover:shadow-lg'
                      }
                    `}
                  >
                    Next
                  </button>
                </div>
              )}
              
              {/* Page info */}
              {totalCompletedPages > 1 && (
                <div className="mt-3 text-center text-sm text-gray-500">
                  Showing {startIndex + 1} - {Math.min(endIndex, completedEvents.length)} of {completedEvents.length} completed events
                </div>
              )}
            </div>
          )}
        </div>
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

        <div className="flex items-center gap-2 sm:gap-4 w-full lg:w-auto justify-center">
          <button
            onClick={() => navigate("prev")}
            className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl transition-all backdrop-blur-sm hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold min-w-[200px] sm:min-w-[280px] text-center">
            {view === "month" && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            {view === "week" && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            {view === "day" && currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {view === "agenda" && "Event Agenda"}
          </h2>

          <button
            onClick={() => navigate("next")}
            className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl transition-all backdrop-blur-sm hover:scale-110"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex gap-1 sm:gap-2 bg-white/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl backdrop-blur-sm w-full lg:w-auto overflow-x-auto">
          {[
            { id: "month", icon: Grid, label: "Month" },
            { id: "week", icon: Calendar, label: "Week" },
            { id: "day", icon: Clock, label: "Day" },
            { id: "agenda", icon: List, label: "Agenda" }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`
                px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-base font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap
                ${view === id
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
            Drag <strong>{eventColors[draggedCategory]?.label}</strong> category to any date to create an event
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