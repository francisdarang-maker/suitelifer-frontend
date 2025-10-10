import React from "react";

const ActiveFilters = ({ searchQuery, filterType, onClearAll }) => {
  // Don't show if no filters are active
  if (!searchQuery && filterType === "All") {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center px-4">
      <span className="text-sm text-gray-600 font-medium">
        Active filters:
      </span>
      
      {filterType !== "All" && (
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          Type: {filterType}
        </span>
      )}
      
      {searchQuery && (
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          Search: "{searchQuery}"
        </span>
      )}
      
      <button
        onClick={onClearAll}
        className="text-sm text-primary hover:text-primary/80 font-medium underline transition-colors"
      >
        Clear all
      </button>
    </div>
  );
};

export default ActiveFilters;