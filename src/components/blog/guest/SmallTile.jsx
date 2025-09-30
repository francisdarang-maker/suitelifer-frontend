// SmallTile.jsx
import React from "react";

function SmallTile({ blogId, imageUrl, title, article }) {
  return (
    <div className="flex gap-4 items-start rounded-xl p-4 bg-white shadow-sm hover:scale-103 transition-all duration-300" onClick={()=> console.log(blogId)} >
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
        <p className="text-gray-600 text-sm line-clamp-2 flex-1">
          {article}
        </p>
        
          <span className="mt-2 px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full w-fit hover:bg-primary hover:text-white" onClick={()=> console.log(blogId)}>
            Read More
          </span>
      
      </div>
    </div>
  );
}

export default SmallTile;