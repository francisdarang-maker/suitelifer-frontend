// BigTile.jsx
import React, { useState } from "react";

function BigTile({ blogId, imageUrl, title, article }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = article && article.length > 160;

  const handleClick = ()=> {
     console.log(blogId)
  }

  return (
    <div className="flex flex-col w-full h-full rounded-xl overflow-hidden bg-white shadow hover:scale-103 transition-all duration-300" onClick={handleClick}>
      {/* Cover Image */}
      <div className="w-full h-64 md:h-72 lg:h-94">
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

        <p className="text-gray-600 text-sm md:text-base flex-1">
          {expanded
            ? article
            : isLong
            ? `${article.slice(0, 160)}...`
            : article}
        </p>

        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-sm text-primary font-semibold hover:underline"
          >
          </button>
        )}

        
          <span className="mt-4 px-4 py-1 text-xs md:text-sm font-medium bg-primary/10 text-primary rounded-full w-fit hover:bg-primary hover:text-white" onClick={handleClick}>
            Read More
          </span>

      </div>
    </div>
  );
}

export default BigTile