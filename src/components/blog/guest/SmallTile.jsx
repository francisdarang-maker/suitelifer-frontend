
import { useNavigate } from "react-router-dom";

function SmallTile({ blogId, imageUrl, title, article }) {

  const isLong = article && article.length > 100;
const sliceArticle =  isLong ? `${article.slice(0, 160)}...` : article 
  const navigate = useNavigate()
    const handleTileClick = () => {
    if (blogId) {
      navigate(`/blogs/${blogId}`);
    }
  };

  return (
    <div 
      className="flex gap-4 items-start rounded-xl p-4 bg-white shadow-sm hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer" 
      onClick={handleTileClick}
    >

      {/* Image Thumbnail */}
      <div className="w-32 h-24 md:w-40 md:h-28 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-xs">No Image</span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <h3 className="font-semibold text-base text-gray-800 mb-1 line-clamp-2">
          {title}
        </h3>
        <p className={`text-gray-600 text-sm flex-1 mb-2 line-clamp-2`} dangerouslySetInnerHTML={{ __html: sliceArticle }}/>
        
        <div className="flex items-center gap-2 mt-auto">
         
          
          <button
            className="px-3 py-1 text-xs font-medium bg-primary text-white rounded-full hover:scale-105 transition-colors duration-200"
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