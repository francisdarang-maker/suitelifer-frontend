import React from "react";

const FilterButtons = ({ buttons, activeFilter, onFilterChange }) => (
  <div className="flex gap-3 px-4 mb-4 flex-wrap">
    {buttons.map((button) => (
      <button
        key={button.label}
        onClick={() => onFilterChange(button.label)}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          activeFilter === button.label
            ? "bg-primary text-white shadow-md"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        {button.label}
      </button>
    ))}
  </div>
);

export default FilterButtons;