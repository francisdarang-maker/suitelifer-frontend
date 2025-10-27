import React, { useState } from "react";

function EventAgendaView({ filteredEvents, onSelectEvent }) {
  const [completedPage, setCompletedPage] = useState(1);
  const COMPLETED_EVENTS_PER_PAGE = 5;
  const CATEGORY_COLORS = {
    party: "#ec4899",
    launchpod: "#3b82f6",
    holiday: "#22c55e",
    payroll: "#f97316",
    others: "#0097b2",
  };

  const [isCompletedMinimized, setIsCompletedMinimized] = React.useState(false);
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
  const paginatedCompletedEvents = completedEvents.slice(startIndex, endIndex);

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
    <>
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
    </>
  );
}

export default EventAgendaView;
