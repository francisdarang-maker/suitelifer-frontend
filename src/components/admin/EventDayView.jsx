function EventDayView({getEventsForDate, currentDate, isToday, onSelectSlot}) {

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
    <>
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
    </>
  )
}

export default EventDayView
