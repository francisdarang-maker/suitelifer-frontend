import React from "react";
import eventColors from "../../constants/eventColor";

const EventFilter = ({
  activeFilters,
  toggleFilter,
  toggleAllFilters,
  onDragStart,
  onDragEnd,
  draggedCategory,
  enableDragDrop = true,
}) => {
  const activeCount = Object.values(activeFilters).filter(Boolean).length;
  const allActive = activeCount === Object.keys(eventColors).length;

  const handleDragStart = (e, category) => {
    if (!enableDragDrop) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", category);
    onDragStart(category);
  };

  const handleDragEnd = () => {
    if (!enableDragDrop) return;
    onDragEnd();
  };
  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between mb-3">
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <h3 className="font-semibold text-gray-800">
            Filter Events ({activeCount}/{Object.keys(eventColors).length})
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {enableDragDrop && (
            <span className="text-xs text-gray-500 hidden sm:inline">
              💡 Drag categories to calendar
            </span>
          )}
          <button
            onClick={toggleAllFilters}
            className="text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors"
          >
            {allActive ? "Deselect All" : "Select All"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(eventColors).map(([key, { bg, label, glow }]) => {
          const isActive = activeFilters[key];
          const isDragging = draggedCategory === key;

          return (
            <div
              key={key}
              draggable={isActive}
              onDragStart={(e) => handleDragStart(e, key)}
              onDragEnd={handleDragEnd}
              onClick={() => toggleFilter(key)}
              className={`
                relative group
                px-4 py-2 text-sm font-medium rounded-xl 
                transition-all duration-300
                ${
                  isActive
                    ? `bg-gradient-to-r ${bg} text-white shadow-md hover:shadow-lg scale-100 cursor-grab active:cursor-grabbing`
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200 scale-95 opacity-50 cursor-pointer"
                }
                ${isDragging ? "opacity-50 scale-90" : ""}
                hover:scale-105
                border-2
                ${isActive ? "border-transparent" : "border-gray-300"}
              `}
              style={{
                boxShadow: isActive ? `0 4px 12px ${glow}` : "none",
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isActive ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {!isDragging && (
                      <svg
                        className="w-3 h-3 opacity-70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                    )}
                  </>
                ) : (
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
                {label}
              </span>

              {/* Draggable indicator tooltip */}
              {isActive && !isDragging && enableDragDrop && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Drag to calendar
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeCount === 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            No event categories selected. Select at least one category to view
            events.
          </p>
        </div>
      )}
    </div>
  );
};

export default EventFilter;
