import { useState, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Grid,
  List,
  Clock,
} from "lucide-react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
import eventColors from "../../constants/eventColor";
import EventFilter from "./EventFilters";

import AgendaView from "./EventAgendaView";
import WeekView from "./EventWeekView";
import DayView from "./EventDayView";
import MonthView from "./EventMonthView";

const EventCalendar = ({
  events = [],
  onSelectSlot,
  onSelectEvent,
  enableDragDrop = true,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [eventImages, setEventImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const [activeFilters, setActiveFilters] = useState(
    Object.keys(eventColors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [expandedDates, setExpandedDates] = useState(new Set());

  // Helper functions
  const getDaysInMonth = useCallback((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay(), firstDay, lastDay };
  }, []);

  const isSameDay = (d1, d2) =>
    d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  const isToday = (d) => isSameDay(d, new Date());
  const isPast = (d) => new Date(d.setHours(0, 0, 0, 0)) < new Date().setHours(0, 0, 0, 0);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const cat = event.category?.toLowerCase() || "others";
      return activeFilters[cat];
    });
  }, [events, activeFilters]);

  const getEventsForDate = useCallback(
    (date) => filteredEvents.filter((e) => isSameDay(new Date(e.start), date)),
    [filteredEvents]
  );

  // Navigation
  const navigate = (dir) => {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() + (dir === "next" ? 1 : -1));
    if (view === "week") d.setDate(d.getDate() + (dir === "next" ? 7 : -7));
    if (view === "day") d.setDate(d.getDate() + (dir === "next" ? 1 : -1));
    setCurrentDate(d);
  };
  const goToToday = () => setCurrentDate(new Date());

  // Filters
  const toggleFilter = (cat) => setActiveFilters((p) => ({ ...p, [cat]: !p[cat] }));
  const toggleAllFilters = () => {
    const allActive = Object.values(activeFilters).every(Boolean);
    setActiveFilters(Object.fromEntries(Object.keys(activeFilters).map((k) => [k, !allActive])));
  };

  // Drag and drop
  const handleDragStart = (c) => setDraggedCategory(c);
  const handleDragEnd = () => setDraggedCategory(null);
  const handleDateDrop = (date) => {
    if (!draggedCategory) return;
    const start = new Date(date);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    onSelectSlot({ start, end, category: draggedCategory });
    setDraggedCategory(null);
  };

  // Google Drive fetch
  const extractFolderId = (url) => {
    if (!url) return null;
    const match = url.split("?")[0].match(/folders\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const fetchImagesForEvent = async (id, link) => {
    const folderId = extractFolderId(link);
    if (!folderId) return [];
    try {
      setLoadingImages((p) => ({ ...p, [id]: true }));
      const res = await axios.get(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents and mimeType contains 'image/'&key=${API_KEY}&fields=files(id,name,mimeType,thumbnailLink,createdTime)&orderBy=createdTime desc&pageSize=5`
      );
      return (res.data.files || [])
        .filter((f) => f.mimeType.startsWith("image/"))
        .map((f) => `https://lh3.googleusercontent.com/d/${f.id}=w1000`);
    } catch (e) {
      console.error(`Error fetching images for event ${id}:`, e);
      return [];
    } finally {
      setLoadingImages((p) => ({ ...p, [id]: false }));
    }
  };

  const handleEventHover = async (event) => {
    const key = event.eventId || event.id;
    if (eventImages[key] || loadingImages[key]) return;
    const link = event.gdriveLink || event.gdrive_link;
    if (link) {
      const imgs = await fetchImagesForEvent(key, link);
      setEventImages((p) => ({ ...p, [key]: imgs }));
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 px-2 sm:px-4">
      {/* === Calendar Header (scoped only to the calendar section) === */}
      <div className="p-4 sm:p-6 bg-primary rounded-xl sm:rounded-2xl shadow-xl text-white">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-3 sm:gap-4">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all backdrop-blur-sm"
          >
            Today
          </button>

          {view !== "agenda" && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("prev")}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all hover:scale-110"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h2 className="text-xl sm:text-2xl font-bold text-center min-w-[200px]">
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
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all hover:scale-110"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex gap-1 bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
            {[
              { id: "month", icon: Grid, label: "Month" },
              { id: "week", icon: Calendar, label: "Week" },
              { id: "day", icon: Clock, label: "Day" },
              { id: "agenda", icon: List, label: "Agenda" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`px-1 lg:px-3 md:px-2 py-1.5 rounded-md font-semibold flex items-center gap-1 transition-all ${
                  view === id
                    ? "bg-white text-cyan-700 shadow-lg scale-105"
                    : "text-white hover:bg-white/20"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* === Drag Info Banner === */}
      {draggedCategory && (
        <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-xl flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
          <span className="text-blue-800 text-sm font-semibold">
            Drag <strong>{eventColors[draggedCategory]?.label}</strong> category
            to any date to create an event
          </span>
        </div>
      )}

      {/* === Calendar + Filter Layout === */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 sm:gap-8 items-start">
        {/* Calendar Section */}
        <div className="space-y-6">
          {view === "month" && (
            <MonthView
              getDaysInMonth={getDaysInMonth}
              currentDate={currentDate}
              getEventsForDate={getEventsForDate}
              isToday={isToday}
              isPast={isPast}
              hoveredDate={hoveredDate}
              expandedDates={expandedDates}
              eventImages={eventImages}
              loadingImages={loadingImages}
              onSelectEvent={onSelectEvent}
              draggedCategory={draggedCategory}
              handleEventHover={handleEventHover}
              onSelectSlot={onSelectSlot}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              getEventsForDate={getEventsForDate}
              isToday={isToday}
              isPast={isPast}
              onSelectEvent={onSelectEvent}
              onSelectSlot={onSelectSlot}
            />
          )}
          {view === "day" && (
            <DayView
              getEventsForDate={getEventsForDate}
              currentDate={currentDate}
              isToday={isToday}
              onSelectSlot={onSelectSlot}
            />
          )}
          {view === "agenda" && <AgendaView filteredEvents={filteredEvents} onSelectEvent={onSelectEvent} />}
        </div>

        {/* Sticky Filter Sidebar */}
       <div className="h-full lg:sticky lg:top-20 self-start">
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
      </div> 
     
    </div>
  );
};

export default EventCalendar;
