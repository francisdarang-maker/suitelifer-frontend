import React from 'react'

function MonthView() {\const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
      const days = [];
  return (
    <>
    
      
    
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

    </>
  )
}

export default MonthView
