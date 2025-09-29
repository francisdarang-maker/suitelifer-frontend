import React, { useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Tooltip, Fade } from "@mui/material";
import EventImageCarousel from '../events/EventImageCarousel'

const localizer = momentLocalizer(moment);

const eventColors = {
  party: { bg: "from-pink-500 to-rose-500", text: "white", label: "Party" },
  aunchpod: { bg: "from-blue-500 to-indigo-500", text: "white", label: "Launchpod" },
  holiday: { bg: "from-green-500 to-emerald-500", text: "white", label: "Holiday" },
  payroll: { bg: "from-orange-500 to-amber-500", text: "white", label: "Payroll" },
  default: { bg: "from-cyan-600 to-sky-600", text: "white", label: "Other" },
};

const EventCalendar = ({ events, onSelectSlot, onSelectEvent }) => {
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [hoveredEvent, setHoveredEvent] = useState(null);

const CustomEvent = ({ event }) => {
  const category = event.category?.toLowerCase() || "default";
  const colors = eventColors[category] || eventColors.default;

  return (
    <Tooltip
      title={<EventImageCarousel />}
      placement="top"
      arrow 
      followCursor
      slot={{ transition: Fade }}
      slotProps={{ 
        transition: { 
          timeout: 600 
        }, 
        tooltip: {
          sx: {
            background: `linear-gradient(to right, var(--tw-gradient-stops))`,
            "--tw-gradient-from": colors.bg.split(" ")[0], 
            "--tw-gradient-to": colors.bg.split(" ")[1], 
            color: colors.text,
            borderRadius: "12px",
            padding: "10px",
          },
        }
      }}
      enterDelay={1000}
      leaveDelay={200}
      

    >
      <div
        onMouseEnter={() => setHoveredEvent(event)}
        onMouseLeave={() => setHoveredEvent(null)}
        className={`bg-gradient-to-r ${colors.bg} text-${colors.text} 
          rounded-lg text-center px-2 py-1 
          hover:scale-[1.05] hover:shadow-md cursor-pointer transition`}
      >
        {event.title}
      </div>

    </Tooltip>
  );
};


  const CustomToolbar = ({ label, onNavigate, onView }) => (
    <div className="flex flex-col md:flex-row justify-between items-center w-full gap-3 px-4 py-3 bg-white shadow-sm rounded-xl mb-4">
      {/* Left - Today Button */}
      <button
        className="px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition"
        onClick={() => onNavigate("TODAY")}
      >
        Today
      </button>

      {/* Center - Navigation */}
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
          onClick={() => onNavigate("PREV")}
        >
          ◀
        </button>

        <h2 className="font-semibold text-xl md:text-2xl text-gray-800 text-center min-w-[150px]">
          {label}
        </h2>

        <button
          className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
          onClick={() => onNavigate("NEXT")}
        >
          ▶
        </button>
      </div>

      {/* Right - View Selector */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        {[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA].map((v) => (
          <button
            key={v}
            onClick={() => {
              setView(v);
              onView(v);
            }}
            className={`px-3 py-1 rounded-md text-sm font-medium transition ${
              view === v
                ? "bg-primary text-white shadow"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="rounded-xl shadow-lg bg-white p-4">
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

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        {Object.entries(eventColors).map(([key, { bg, label }]) => (
          <span
            key={key}
            className={`px-3 py-1 text-xs rounded-full bg-gradient-to-r ${bg} text-white shadow-sm`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default EventCalendar;
