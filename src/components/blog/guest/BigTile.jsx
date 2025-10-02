import React, { useState } from "react";

function BigTile({ blogId, imageUrl, title, article, onClick }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = article && article.length > 160;

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
      className="flex flex-col w-full h-full rounded-xl overflow-hidden bg-white shadow hover:shadow-lg transition-all duration-300 cursor-pointer" 
      onClick={handleTileClick}
    >
      {/* Cover Image */}
      <div className="w-full h-64 md:h-72 lg:h-80">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h2 className="text-xl font-avenir-black text-gray-800 mb-3 leading-snug">
          {title}
        </h2>

        <p className="text-gray-600 text-sm md:text-base flex-1 mb-4">
          {expanded
            ? article
            : isLong
            ? `${article.slice(0, 160)}...`
            : article}
        </p>

        <div className="flex items-center gap-3 mt-auto">
          {isLong && (
            <button 
              className="px-4 py-2 text-xs md:text-sm font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200" 
              onClick={handleReadMore}
            >
              {expanded ? 'Show Less' : 'Read More'}
            </button>
          )}
          
          <button
            className="px-4 py-2 text-xs md:text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              handleTileClick();
            }}
          >
            View Full Article
          </button>
        </div>
      </div>
    </div>
  );
}

export default BigTile;