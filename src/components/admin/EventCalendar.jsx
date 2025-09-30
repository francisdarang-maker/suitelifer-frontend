import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Tooltip, Fade } from "@mui/material";
import axios from "axios";
import EventImageCarousel from "../events/EventImageCarousel";

const localizer = momentLocalizer(moment);

const eventColors = {
  party: {
    bg: "from-pink-500 via-rose-500 to-pink-600",
    text: "white",
    label: "Party",
    glow: "rgba(236, 72, 153, 0.3)",
  },
  launchpod: {
    bg: "from-blue-500 via-indigo-500 to-blue-600",
    text: "white",
    label: "Launchpod",
    glow: "rgba(99, 102, 241, 0.3)",
  },
  holiday: {
    bg: "from-green-500 via-emerald-500 to-green-600",
    text: "white",
    label: "Holiday",
    glow: "rgba(16, 185, 129, 0.3)",
  },
  payroll: {
    bg: "from-orange-500 via-amber-500 to-orange-600",
    text: "white",
    label: "Payroll",
    glow: "rgba(245, 158, 11, 0.3)",
  },
  default: {
    bg: "from-cyan-500 via-sky-500 to-cyan-600",
    text: "white",
    label: "Other",
    glow: "rgba(14, 165, 233, 0.3)",
  },
};

const EventCalendar = ({ events, onSelectSlot, onSelectEvent }) => {
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [eventImages, setEventImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});

  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  // Extract folder ID from Google Drive link
  const extractFolderId = (gdriveLink) => {
    if (!gdriveLink) return null;

    const cleanLink = gdriveLink.split("?")[0];
    const match = cleanLink.match(/folders\/([a-zA-Z0-9_-]+)/);

    return match ? match[1] : null;
  };

  // Fetch images for a specific event
  const fetchImagesForEvent = async (eventId, gdriveLink) => {
    const folderId = extractFolderId(gdriveLink);
    if (!folderId) {
      console.log(`No valid folder ID for event ${eventId}`);
      return [];
    }

    try {
      setLoadingImages((prev) => ({ ...prev, [eventId]: true }));

      const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents and mimeType contains 'image/'&key=${API_KEY}&fields=files(id,name,mimeType,thumbnailLink,createdTime)&orderBy=createdTime desc&pageSize=5`;

      const res = await axios.get(url);
      const files = res.data.files || [];

      const imgs = files
        .filter((file) => file.mimeType.startsWith("image/"))
        .map((file) => `https://lh3.googleusercontent.com/d/${file.id}=w1000`);

      return imgs;
    } catch (err) {
      console.error(`Error fetching images for event ${eventId}:`, err);
      return [];
    } finally {
      setLoadingImages((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  // Load images when hovering over an event
  const handleEventHover = async (event) => {
    setHoveredEvent(event);
    const eventKey = event.eventId || event.id;

    if (eventImages[eventKey] || loadingImages[eventKey]) return;

    if (event.gdriveLink) {
      const images = await fetchImagesForEvent(eventKey, event.gdriveLink);
      setEventImages((prev) => ({ ...prev, [eventKey]: images }));
    }
  };

  const CustomEvent = ({ event }) => {
    const category = event.category?.toLowerCase() || "default";
    const colors = eventColors[category] || eventColors.default;
    const eventKey = event.eventId || event.id;
    const images = eventImages[eventKey] || [];
    const isLoading = loadingImages[eventKey];

    return (
      <Tooltip
        title={
          <EventImageCarousel
            isLoading={isLoading}
            hasLink={!!event.gdriveLink}
            images={images}
          />
        }
        arrow
        placement="top"
        TransitionComponent={Fade}
        TransitionProps={{
          timeout: 300,
        }}
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
            sx: {
              color: "rgba(17, 24, 39, 0.95)",
            },
          },
        }}
      >
        <div
          onMouseEnter={() => handleEventHover(event)}
          onMouseLeave={() => setHoveredEvent(null)}
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
          style={{
            boxShadow: `0 4px 12px ${colors.glow}`,
          }}
        >
          <span className="relative z-10 font-medium text-sm">
            {event.title}
          </span>
        </div>
      </Tooltip>
    );
  };

  const CustomToolbar = ({ label, onNavigate, onView }) => (
    <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl mb-6 border border-gray-200 shadow-sm">
      <button
        className="
          px-5 py-2.5 
          bg-gradient-to-r from-cyan-600 to-cyan-700
          text-white font-medium rounded-xl 
          shadow-lg hover:shadow-xl
          hover:from-cyan-700 hover:to-cyan-800
          transition-all duration-300
          hover:scale-105
          active:scale-95
        "
        onClick={() => onNavigate("TODAY")}
      >
        Today
      </button>

      <div className="flex items-center gap-3">
        <button
          className="
            p-2.5 rounded-xl 
            bg-white hover:bg-gray-50
            border border-gray-200
            shadow-sm hover:shadow-md
            transition-all duration-300
            hover:scale-110
            active:scale-95
          "
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
          className="
            p-2.5 rounded-xl 
            bg-white hover:bg-gray-50
            border border-gray-200
            shadow-sm hover:shadow-md
            transition-all duration-300
            hover:scale-110
            active:scale-95
          "
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
            className={`
              px-4 py-2 rounded-lg text-sm font-semibold
              transition-all duration-300
              ${
                view === v
                  ? "bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md scale-105"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }
            `}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-white to-gray-50 p-6 border border-gray-200">
      <Calendar
        localizer={localizer}
        events={events}
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
        eventPropGetter={() => ({
          style: {
            backgroundColor: "transparent",
            border: "none",
            padding: 0,
          },
        })}
      />

      <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-gray-200">
        {Object.entries(eventColors).map(([key, { bg, label, glow }]) => (
          <div
            key={key}
            className={`
              relative group
              px-4 py-2 text-sm font-medium rounded-xl 
              bg-gradient-to-r ${bg} text-white 
              shadow-md hover:shadow-lg
              transition-all duration-300
              hover:scale-105
              cursor-pointer
            `}
            style={{
              boxShadow: `0 4px 12px ${glow}`,
            }}
          >
            <span className="relative z-10">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCalendar;
