import { useState } from "react";

function EventWeekView({
  currentDate,
  getEventsForDate,
  isToday,
  isPast,
  onSelectEvent,
  onSelectSlot,
}) {
  const CATEGORY_COLORS = {
    party: "#ec4899",
    launchpod: "#3b82f6",
    holiday: "#22c55e",
    payroll: "#f97316",
    others: "#0097b2",
  };

  const [expandedDays, setExpandedDays] = useState({});

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
    <>
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

        {/* Week Grid - Responsive */}
        <div
          className="
            grid grid-cols-7 divide-x divide-gray-200
            sm:grid-cols-7
            [@media(max-width:768px)]:grid-cols-4
            [@media(max-width:640px)]:grid-cols-3
            [@media(max-width:480px)]:grid-cols-1
            overflow-x-auto snap-x snap-mandatory scroll-smooth
            scrollbar-thin scrollbar-thumb-gray-300
          "
        >
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
                  min-h-[240px] transition-all snap-center flex-shrink-0
                  w-full sm:w-auto
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
                    <div className="flex items-center justify-center gap-1.5 mt-1">
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

                {/* Events List */}
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
                        const isOngoing =
                          eventStart <= now && eventEnd >= now;

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
                              borderLeftColor:
                                CATEGORY_COLORS[event.category],
                            }}
                          >
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

                            <h4
                              className={`
                                text-xs font-semibold line-clamp-2 mb-1
                                ${isCompleted ? "text-gray-500" : "text-gray-900"}
                              `}
                            >
                              {event.title}
                            </h4>

                            <div className="flex items-center justify-between">
                              <span
                                className="text-xs font-medium px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${CATEGORY_COLORS[event.category]}20`,
                                  color: CATEGORY_COLORS[event.category],
                                }}
                              >
                                {event.category}
                              </span>

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

      {/* Scroll hint for mobile */}
      <p className="text-center text-xs text-gray-400 sm:hidden mt-2">
        Swipe → to view more days
      </p>
    </>
  );
}

export default EventWeekView;
