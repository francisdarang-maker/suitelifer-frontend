import React, { useState, useCallback } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Tooltip, Fade } from "@mui/material";
import axios from "axios";
import EventImageCarousel from "../events/EventImageCarousel";
import eventColors from "../../constants/eventColor";
import EventFilter from "../../components/events/EventFilter";

const localizer = momentLocalizer(moment);
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const EventCalendar = ({ events, onSelectSlot, onSelectEvent }) => {
  // State management
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [eventImages, setEventImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const [activeFilters, setActiveFilters] = useState(
    Object.keys(eventColors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );

  // Computed values
  const filteredEvents = events.filter((event) => {
    const category = event.category?.toLowerCase() || "others";
    return activeFilters[category];
  });

  const activeCount = Object.values(activeFilters).filter(Boolean).length;

  // Filter handlers
  const toggleFilter = useCallback((category) => {
    setActiveFilters((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  const toggleAllFilters = useCallback(() => {
    const allActive = Object.values(activeFilters).every((v) => v);
    const newState = Object.keys(activeFilters).reduce(
      (acc, key) => ({ ...acc, [key]: !allActive }),
      {}
    );
    setActiveFilters(newState);
  }, [activeFilters]);

  // Google Drive utilities
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

  // Calendar prop getters
  const dayPropGetter = useCallback((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);

    const isPast = currentDate < today;

    return {
      style: {
        backgroundColor: isPast ? "#f3f4f6" : "white",
        color: isPast ? "#9ca3af" : "inherit",
        opacity: isPast ? 0.6 : 1,
      },
    };
  }, []);

  const eventPropGetter = useCallback(
    () => ({
      style: {
        backgroundColor: "transparent",
        border: "none",
        padding: 0,
      },
    }),
    []
  );

  // Custom components
  const CustomEvent = useCallback(
    ({ event }) => {
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
            className={`
              relative group
              bg-gradient-to-r ${colors.bg} text-${colors.text}
              rounded-lg text-center px-2 py-1
              cursor-pointer transition-all duration-300
              hover:scale-105 hover:shadow-lg
              before:absolute before:inset-0 before:rounded-lg
              before:bg-white/10 before:opacity-0
              hover:before:opacity-100 before:transition-opacity
              overflow-hidden
            `}
            style={{ boxShadow: `0 4px 12px ${colors.glow}` }}
          >
            <span className="relative z-10 font-medium text-sm">
              {event.title}
            </span>
          </div>
        </Tooltip>
      );
    },
    [eventImages, loadingImages, handleEventHover]
  );

  const CustomToolbar = useCallback(
    ({ label, onNavigate, onView }) => (
      <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl mb-6 border border-gray-200 shadow-sm">
        <button
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:from-cyan-700 hover:to-cyan-800 transition-all duration-300 hover:scale-105 active:scale-95"
          onClick={() => onNavigate("TODAY")}
        >
          Today
        </button>

        <div className="flex items-center gap-3">
          <button
            className="p-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110 active:scale-95"
            onClick={() => onNavigate("PREV")}
          >
            <svg
              className="w-5 h-5 text-gray-700"
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
          </button>

          <h2 className="font-bold text-2xl md:text-3xl text-gray-800 text-center min-w-[200px] px-4">
            {label}
          </h2>

          <button
            className="p-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110 active:scale-95"
            onClick={() => onNavigate("NEXT")}
          >
            <svg
              className="w-5 h-5 text-gray-700"
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

        <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200">
          {[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA].map((v) => (
            <button
              key={v}
              onClick={() => {
                setView(v);
                onView(v);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                view === v
                  ? "bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md scale-105"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
    ),
    [view]
  );

  return (
    <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-white to-gray-50 p-6 border border-gray-200">
      <style>
        {`
          .rbc-day-bg.rbc-today {
            background-color: #e0f2fe !important;
          }
          .rbc-off-range-bg {
            background-color: #fafafa !important;
          }
        `}
      </style>

      <Calendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        style={{ height: 650, width: "100%" }}
        components={{
          toolbar: CustomToolbar,
          event: CustomEvent,
        }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        dayPropGetter={dayPropGetter}
        eventPropGetter={eventPropGetter}
      />

      <EventFilter
        activeFilters={activeFilters}
        toggleFilter={toggleFilter}
        toggleAllFilters={toggleAllFilters}
      />
    </div>
  );
};

export default EventCalendar;
