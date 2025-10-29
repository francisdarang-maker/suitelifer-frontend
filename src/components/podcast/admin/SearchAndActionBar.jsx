import React from "react";
import { PlusCircleIcon, ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import SearchBar from "./SearchBar";
import Button from "./Button";

const SearchAndActionsBar = ({
  searchQuery,
  onSearchChange,
  onSearchClear,
  sortOrder,
  onSortToggle,
  onAddClick,
  filterType,
}) => {
  const getAddButtonText = () => {
    if (filterType === "Episodes") return "Add Episode";
    if (filterType === "Playlists") return "Add Playlist";
    return "Add New";
  };

  return (
    <div className="px-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 lg:flex-col ">
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          onClear={onSearchClear}
          placeholder="Search by Spotify ID, creator, or type..."
        />

        {/* Sort Button */}
        <Button
          onClick={onSortToggle}
          variant="outline"
          icon={<ArrowsUpDownIcon className="h-5 w-5" />}
          className="whitespace-nowrap"
        >
          {sortOrder === "newest" ? "Newest First" : "Oldest First"}
        </Button>

        {/* Add Button */}
        <Button
          onClick={onAddClick}
          variant="primary"
          icon={<PlusCircleIcon className="h-5 w-5" />}
          className="whitespace-nowrap"
        >
          {getAddButtonText()}
        </Button>
      </div>
    </div>
  );
};

export default SearchAndActionsBar;
