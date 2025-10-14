
import { useNavigate } from "react-router-dom";

function BigTile({ blogId, imageUrl, title, article }) {

  const isLong = article && article.length > 160;
  const sliceArticle = isLong ? `${article.slice(0, 160)}...` : article
  const navigate = useNavigate();


  const handleTileClick = () => {
    if (blogId) {
      navigate(`/blogs/${blogId}`);
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

        <p className="text-gray-600 text-sm md:text-base flex-1 mb-4" dangerouslySetInnerHTML={{ __html: sliceArticle}}/>

        <div className="flex items-center gap-3 mt-auto">
          <button
            className="px-4 py-2 text-xs md:text-sm font-medium bg-primary text-white rounded-full hover:scale-105 transition-colors duration-200"
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