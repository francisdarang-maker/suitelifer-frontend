import { useState } from "react";
import {
  useMediaQuery,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar, PickersDay } from "@mui/x-date-pickers";
import EventBadge from "./EventBadge";
import { Calendar } from "lucide-react";

function EventMonthView({
  getDaysInMonth,
  currentDate,
  getEventsForDate,
  isToday,
  isPast,
  hoveredDate,
  expandedDates,
  eventImages,
  loadingImages,
  onSelectEvent,
  handleEventHover,
  draggedCategory,
  onSelectSlot,
}) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [expanded, setExpanded] = useState(expandedDates || new Set());

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const days = [];

  const toggleDateExpansion = (dateStr) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) newSet.delete(dateStr);
      else newSet.add(dateStr);
      return newSet;
    });
  };

  // --- Generate Empty Slots for Start of Month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(
      <div
        key={`empty-${i}`}
        className="bg-gray-50 border border-gray-200 aspect-square"
      />
    );
  }

  // --- Generate Day Boxes
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
    const isExpanded = expanded.has(dateStr);
    const visibleEvents = isExpanded ? dayEvents : dayEvents.slice(0, 1);

    days.push(
      <div
        key={day}
        className={`
          border border-gray-200 p-1 sm:p-2 transition-all cursor-pointer flex flex-col
          justify-start aspect-square relative
          ${
            isCurrentDay
              ? "bg-blue-50 ring-2 ring-blue-400"
              : "bg-white hover:bg-gray-50"
          }
          ${isPastDay ? "opacity-60" : ""}
        `}
        onClick={(e) => {
          if (!draggedCategory && e.target === e.currentTarget) {
            const start = new Date(date);
            start.setHours(9, 0, 0, 0);
            const end = new Date(start.getTime() + 60 * 60 * 1000);
            onSelectSlot({ start, end });
          }
        }}
      >
        <div
          className={`text-[10px] sm:text-xs font-bold mb-0.5 sm:mb-1 ${
            isCurrentDay
              ? "text-blue-600"
              : isPastDay
              ? "text-gray-400"
              : "text-gray-700"
          }`}
        >
          {day}
        </div>

        <div className="flex flex-col gap-0.5 sm:gap-1 overflow-hidden ">
          {visibleEvents.map((event, idx) => (
            <EventBadge
              key={idx}
              event={event}
              compact
              eventImages={eventImages}
              loadingImages={loadingImages}
              onSelectEvent={onSelectEvent}
              handleEventHover={handleEventHover}
            />
          ))}

          {dayEvents.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDateExpansion(dateStr);
              }}
              className="text-[10px] sm:text-xs text-cyan-600 hover:text-cyan-800 font-semibold hover:underline transition-colors text-left"
            >
              {isExpanded ? "Show less" : `+${dayEvents.length - 1} more`}
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- MOBILE VIEW ---
  if (isMobile) {
    const selectedEvents = getEventsForDate(selectedDate);

    return (
      <div className="overflow-y-autop py-1">
        <Typography
          sx={{
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          Events
        </Typography>
        {/* Calendar Section */}

        <Box
          sx={{
            width: "100%",
            maxWidth: 320,
            overflow: "auto",
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            pl: { xs: 0, sm: 0 },
            mb: 2,
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateCalendar
              value={selectedDate}
              onChange={(newDate) => setSelectedDate(newDate)}
              views={["day"]}
              displayWeekNumber={false}
              showDaysOutsideCurrentMonth
              sx={{
                width: "100%",
                maxWidth: "425px",

                // Base styles (320px)
                "& .MuiPickersDay-root": {
                  width: 35,
                  height: 35,
                  fontSize: "0.75rem",
                  margin: "0px",
                },
                "& .MuiDayCalendar-weekDayLabel": {
                  width: 35,
                  textAlign: "center",
                  fontSize: "0.65rem",
                  padding: "2px 0",
                  margin: "0px",
                },
                "& .MuiDayCalendar-header": {
                  paddingLeft: 1,
                  display: "flex",
                  justifyContent: "center",
                  gap: "0px",
                },
                "& .MuiDayCalendar-weekContainer": {
                  paddingLeft: 1,
                  display: "flex",
                  justifyContent: "center",
                  gap: "0px",
                },
                "& .MuiPickersCalendarHeader-root": {
                  marginTop: 3,
                  paddingLeft: 1.5,
                },
                "& .MuiPickersArrowSwitcher-root": {
                  gap: "0px",
                  paddingLeft: 0,
                  paddingRight: 0,
                  marginLeft: 0,
                  marginRight: 0,
                  justifyContent: "center",
                  alignItems: "center",
                },
                "& .MuiPickersArrowSwitcher-button": {
                  fontSize: "0.8rem",
                  marginRight: "20px",
                  minWidth: "auto",
                },
                "& .MuiPickersArrowSwitcher-spacer": {
                  display: "none",
                  width: 0,
                  padding: 0,
                  margin: 0,
                },

                // 🔁 Slight bump for 375px and up
                "@media (min-width: 375px)": {
                  "& .MuiPickersDay-root": {
                    width: 42,
                    height: 42,
                    fontSize: "0.8rem",
                  },
                  "& .MuiDayCalendar-weekDayLabel": {
                    width: 42,
                    fontSize: "0.7rem",
                  },
                  "& .MuiPickersArrowSwitcher-button": {
                    fontSize: "0.85rem",
                    marginRight: "16px",
                  },
                  "& .MuiPickersCalendarHeader-root": {
                    marginTop: 3,
                    paddingLeft: 3,
                  },
                },
              }}
              slots={{
                day: (props) => {
                  const dayEvents = getEventsForDate(props.day);
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <PickersDay
                      {...props}
                      sx={{
                        position: "relative",
                        fontSize: { xs: "0.85rem", sm: "1rem" },
                        "&::after": hasEvents
                          ? {
                              content: '""',
                              position: "absolute",
                              bottom: 4,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              backgroundColor: "#0097b2",
                            }
                          : {},
                      }}
                    />
                  );
                },
                toolbar: () => null,
              }}
            />
          </LocalizationProvider>
        </Box>
        {/* Event Cards Section */}
        {selectedEvents.length > 0 ? (
          <Box
            sx={{
              maxHeight: "15vh",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
              mt: 2,
              mb: 10,
            }}
          >
            {selectedEvents.map((event, idx) => {
              const CATEGORY_COLORS = {
                party: "#ec4899",
                launchpod: "#3b82f6",
                holiday: "#22c55e",
                payroll: "#f97316",
                others: "#0097b2",
              };

              const color = CATEGORY_COLORS[event.category] || "#94a3b8";

              return (
                <Box
                  key={idx}
                  sx={{
                    height: 150,
                    minHeight: 150,
                    maxHeight: 150,
                    backdropFilter: "blur(600px)",
                    WebkitBackdropFilter: "blur(6px)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 3,
                    bgcolor: "#fff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                    transition: "0.3s ease",
                    overflow: "hidden",
                    "&:hover": {
                      transform: { sm: "translateY(-3px)" },
                      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                    },
                  }}
                  onClick={() => onSelectEvent(event)}
                >
                  {/* Colored Strip */}
                  <Box
                    sx={{
                      height: 6,
                      width: "100%",
                      borderRadius: "8px 8px 0 0",
                      backgroundColor: color,
                      mb: 1,
                    }}
                  />

                  {/* Title and Category */}
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    sx={{ gap: 0.5 }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      sx={{
                        color,
                        textTransform: "capitalize",
                        fontSize: { xs: "0.95rem", sm: "1rem" },
                      }}
                    >
                      {event.title}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        backgroundColor: `${color}22`,
                        color,
                        px: 1,
                        py: 0.3,
                        borderRadius: 1,
                        fontWeight: 600,
                      }}
                    >
                      {event.category}
                    </Typography>
                  </Box>

                  {/* Date */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748b",
                      fontSize: { xs: "0.75rem", sm: "0.8rem" },
                    }}
                  >
                    {event.start?.toDateString()} - {event.end?.toDateString()}
                  </Typography>

                  {/* Description */}

                  {event.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#475569",
                        fontStyle: "italic",
                        lineHeight: 1.4,
                        fontSize: { xs: "0.85rem", sm: "0.9rem" },
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 5,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      “{event.description}”
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        ) : (
          /* Fallback No Event */
          <Box
            sx={{
              p: { xs: 2.5, sm: 3 },

              borderRadius: 3,
              bgcolor: "#f9fafb",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "inset 0 0 8px rgba(0,0,0,0.05)",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #cbd5e1, #e2e8f0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography fontSize={28} sx={{ color: "#475569" }}>
                <Calendar />
              </Typography>
            </Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ color: "#334155", fontSize: { xs: "1rem", sm: "1.1rem" } }}
            >
              No events for today
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#64748b",

                maxWidth: "280px",
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
              }}
            >
              Relax and enjoy your day — no scheduled activities.
            </Typography>
          </Box>
        )}
      </div>
    );
  }

  // --- DESKTOP VIEW ---
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full">
      <div className="grid grid-cols-7 bg-gradient-to-r from-gray-100 to-gray-200">
        {["S", "M", "T", "W", "Th", "F", "Sa"].map((day) => (
          <div
            key={day}
            className="text-center font-bold text-gray-700 text-[10px] sm:text-xs md:text-sm border-b border-gray-300 flex items-center justify-center py-4"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">{days}</div>
    </div>
  );
}

export default EventMonthView;
