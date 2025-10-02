import React, { useState } from "react";

function SmallTile({ blogId, imageUrl, title, article, onClick }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = article && article.length > 100;

  const handleReadMore = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleTileClick = () => {
    if (onClick && blogId) {
      onClick(blogId);
    }
  };

  return (
    <div 
      className="flex gap-4 items-start rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer" 
      onClick={handleTileClick}
    >
      {/* Image Thumbnail */}
      <div className="w-32 h-24 md:w-40 md:h-28 flex-shrink-0 rounded-md overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <h3 className="font-semibold text-base text-gray-800 mb-1 line-clamp-2">
          {title}
        </h3>
        <p className={`text-gray-600 text-sm flex-1 mb-2 ${expanded ? '' : 'line-clamp-2'}`}>
          {article}
        </p>
        
        <div className="flex items-center gap-2 mt-auto">
          {isLong && (
            <button 
              className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200" 
              onClick={handleReadMore}
            >
              {expanded ? 'Less' : 'More'}
            </button>
          )}
          
          <button
            className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              handleTileClick();
            }}
          >
            View Article
          </button>
        </div>
      </div>
    </div>
  );
}

export default SmallTile;