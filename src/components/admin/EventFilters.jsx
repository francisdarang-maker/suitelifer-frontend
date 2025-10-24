import { Filter, Plus } from "lucide-react";
import eventColors from "../../constants/eventColor";

export default function EventFilter({
  activeFilters,
  toggleFilter,
  toggleAllFilters,
}) {
  const activeCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-700" />
          <h3 className="text-base sm:text-lg font-bold text-gray-800">
            Filter Events
          </h3>
          <span className="text-xs sm:text-sm text-gray-500">
            ({activeCount} active)
          </span>
        </div>

        <button
          onClick={toggleAllFilters}
          className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50 rounded-lg transition-all"
        >
          {activeCount === Object.keys(activeFilters).length
            ? "Clear All"
            : "Select All"}
        </button>
      </div>

      {/* Filter Buttons — now in a single vertical column */}
      <div className="flex flex-col gap-2 sm:gap-3">
        {Object.entries(eventColors).map(([key, value]) => (
          <div
            key={key}
            className={`
              relative group cursor-pointer
            `}
          >
            <button
              onClick={() => toggleFilter(key)}
              className={`
                w-full text-left p-3 rounded-xl font-medium text-sm
                flex items-center justify-between
                transition-all duration-300
                ${
                  activeFilters[key]
                    ? `bg-gradient-to-r ${value.bg} text-white shadow-md`
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }
              `}
              style={
                activeFilters[key]
                  ? { boxShadow: `0 4px 12px ${value.glow}` }
                  : {}
              }
            >
              <span>{value.label}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
