import React, { useState } from "react";
import { X, Share2, Bookmark, Twitter, Facebook, Linkedin } from "lucide-react";

function TileModal({ isOpen, onClose, blog }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  if (!isOpen || !blog) return null;

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = encodeURIComponent(blog.title);
    const encodedUrl = encodeURIComponent(url);

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  const handleClose = () => {
    setShowShareMenu(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-gray-900">Article</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-full transition-all duration-300 ${
                isBookmarked 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300"
              >
                <Share2 size={18} />
              </button>
              
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                  <button 
                    onClick={() => handleShare('twitter')}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors duration-200 text-left"
                  >
                    <Twitter size={16} className="text-blue-400" />
                    <span className="text-sm font-medium text-gray-700">Twitter</span>
                  </button>
                  <button 
                    onClick={() => handleShare('facebook')}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors duration-200 text-left"
                  >
                    <Facebook size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Facebook</span>
                  </button>
                  <button 
                    onClick={() => handleShare('linkedin')}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors duration-200 text-left"
                  >
                    <Linkedin size={16} className="text-blue-700" />
                    <span className="text-sm font-medium text-gray-700">LinkedIn</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {/* Hero Image */}
          <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden mb-6 shadow-lg">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
              {blog.article}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-600">Did you enjoy this article?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isBookmarked
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isBookmarked ? 'Bookmarked ✓' : 'Bookmark'}
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TileModal;