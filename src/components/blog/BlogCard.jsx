import React, { useEffect, useState } from "react";
import {
  ArrowUpRightIcon,
  HeartIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/20/solid";
import { Link, useLocation } from "react-router-dom";
import { toSlug } from "../../utils/slugUrl";
import { Heart, Trash2 } from "lucide-react";
import Loader from '../../components/loader/Loading'
import defaultAvatar from "../../assets/images/defaultAvatar.svg";


import api from "../../utils/axios";
import ModalFullImages from "../../components/blog/ModalFullImages";

const BlogCard = ({ blog, isMine = false, onDelete }) => {
  const [isFullImages, setIsFullImages] = useState(false);
  const [clickedImageIndex, setClickedImageIndex] = useState(0);
  const [isHeart, setIsHeart] = useState(false);
  const [likeCount, setLikeCount] = useState(blog?.likeCount || 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const location = useLocation();

  // Parse title to extract feeling
  const parseTitleAndFeeling = (title) => {
    if (!title) return { cleanTitle: "", feeling: null };
    
    // Check if title contains feeling pattern: "Title - (feeling happy 😊)"
    const feelingMatch = title.match(/^(.+?)\s*-\s*\(feeling\s+(.+?)\)$/i);
    
    if (feelingMatch) {
      return {
        cleanTitle: feelingMatch[1].trim(),
        feeling: feelingMatch[2].trim() 
      };
    }
    
    return { cleanTitle: title, feeling: null };
  };

  const { cleanTitle, feeling } = parseTitleAndFeeling(blog?.title);

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    
    const utcDate = new Date(dateString);

    if (isNaN(utcDate.getTime())) return 'Invalid date';

    const now = new Date();

    const diffInSeconds = Math.floor((now - utcDate) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    const options = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    return utcDate.toLocaleDateString(undefined, options);
  };

  const handleViewImages = (index = 0) => {
    setClickedImageIndex(index);
    setIsFullImages((prev) => !prev);
  };

  const handleHeartClick = async () => {
    if (!blog?.eblogId) return;

    const newState = !isHeart;
    const previousState = isHeart;
    const previousCount = likeCount;

    setIsHeart(newState);
    setLikeCount((prev) => prev + (newState ? 1 : -1));

    try {
      await api.post(`/api/${blog.eblogId}/like`);
    } catch (err) {
      console.error("Error toggling like:", err);
      // Rollback on error
      setIsHeart(previousState);
      setLikeCount(previousCount);
    }
  };

  const handleDeleteAction = async () => {
    if (!blog?.eblogId || isDeleting) return;
    setShowDeleteModal(true);
  };

 const confirmDelete = async () => {
  if (!blog?.eblogId) return;

  setIsDeleting(true);
  setShowDeleteModal(false);

  try {
    const hasImages = blog?.images && blog?.images > 0;

    let blogRes, imageRes;

    if (hasImages) {
      // 🧹 Delete both blog and images (in parallel)
      [blogRes, imageRes] = await Promise.allSettled([
        api.delete(`/api/delete-employee-blog/${blog.eblogId}`),
        api.delete(`/api/delete-image-employee-blog/${blog.eblogId}`),
      ]);
    } else {
      // 📝 Delete blog only
      [blogRes] = await Promise.allSettled([
        api.delete(`/api/delete-employee-blog/${blog.eblogId}`),
      ]);
    }

    // ✅ Handle blog deletion success
    if (blogRes.status === "fulfilled") {
      if (onDelete && typeof onDelete === "function") onDelete(blog.eblogId);
      else window.location.reload();
    }

    // ⚠️ Handle image deletion failure
    if (imageRes?.status === "rejected") {
      console.warn("⚠️ Failed to delete images, but blog was deleted.");
    }
  } catch (error) {
    console.error("❌ Error deleting blog:", error);
    alert("Failed to delete the blog post. Please try again.");
  } finally {
    setIsDeleting(false);
  }
};


  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!blog?.eblogId) return;

      try {
        const { data } = await api.get(`/api/${blog.eblogId}/is-liked`);
        setIsHeart(data.liked);
      } catch (err) {
        console.error("Error fetching like status:", err);
      }
    };
    console.log(blog.commentCount)
    fetchLikeStatus();
  }, [blog?.eblogId]);

  useEffect(() => {
    setLikeCount(blog?.likeCount || 0);
  }, [blog?.likeCount]);

  const renderImageGrid = () => {
    const images = blog?.images || [];

    const validImages = images.filter(img => img && img.trim() !== '');
    const imageCount = validImages.length;

    if (imageCount === 0) return null;

    if (imageCount === 1) {
      return (
        <div 
          className="relative w-full h-[400px] group overflow-hidden rounded-xl cursor-pointer"
          onClick={() => handleViewImages(0)}
        >
          <img
            src={validImages[0]}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            alt="Blog image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      );
    }

    // Two images
    if (imageCount === 2) {
      return (
        <div className="grid grid-cols-2 gap-3 h-[400px]">
          {validImages.map((img, idx) => (
            <div
              key={idx}
              className="relative group overflow-hidden rounded-xl cursor-pointer"
              onClick={() => handleViewImages(idx)}
            >
              <img
                src={img}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                alt={`Blog image ${idx + 1}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      );
    }

    // Three images
    if (imageCount === 3) {
      return (
        <div className="grid grid-cols-2 gap-3 h-[400px]">
          <div 
            className="relative group overflow-hidden rounded-xl cursor-pointer"
            onClick={() => handleViewImages(0)}
          >
            <img
              src={validImages[0]}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              alt="Blog image 1"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
          <div className="grid grid-rows-2 gap-3">
            {validImages.slice(1, 3).map((img, idx) => (
              <div
                key={idx}
                className="relative group overflow-hidden rounded-xl cursor-pointer"
                onClick={() => handleViewImages(idx + 1)}
              >
                <img
                  src={img}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt={`Blog image ${idx + 2}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Four or more images (this handles 4, 5, 6, 7+ images)
    const displayImages = validImages.slice(0, 4);
    const remainingCount = imageCount - 4;

    return (
      <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[400px]">
        {/* First large image */}
        <div 
          className="col-span-2 row-span-2 relative group overflow-hidden rounded-xl cursor-pointer"
          onClick={() => handleViewImages(0)}
        >
          <img
            src={displayImages[0]}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            alt="Blog image 1"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Second image */}
        <div 
          className="col-span-1 row-span-1 relative group overflow-hidden rounded-xl cursor-pointer"
          onClick={() => handleViewImages(1)}
        >
          <img
            src={displayImages[1]}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            alt="Blog image 2"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Third image */}
        <div 
          className="col-span-1 row-span-1 relative group overflow-hidden rounded-xl cursor-pointer"
          onClick={() => handleViewImages(2)}
        >
          <img
            src={displayImages[2]}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            alt="Blog image 3"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Fourth image with overlay for more images */}
        <div className="col-span-2 row-span-1 relative group overflow-hidden rounded-xl">
          <img
            src={displayImages[3]}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
            onClick={() => handleViewImages(3)}
            alt="Blog image 4"
          />
          {remainingCount > 0 ? (
            <div
              className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer backdrop-blur-sm transition-all duration-300 hover:bg-black/70 z-10"
              onClick={(e) => {
                e.stopPropagation();
                handleViewImages(3);
              }}
            >
              <div className="text-center pointer-events-none">
                <span className="text-white text-4xl font-bold">
                  +{remainingCount}
                </span>
                <p className="text-white text-sm mt-1 opacity-90">View more</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          )}
        </div>
      </div>
    );
  };

  // Guard against missing blog data
  if (!blog) {
    return null;
  }

  // Get valid images
  const validImages = blog?.images?.filter(img => img && img.trim() !== '') || [];

  return (
    <>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={cancelDelete}
          >
            {/* Modal */}
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Delete Post</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-600 leading-relaxed">
                  Are you sure you want to delete this post? This will permanently remove the post, 
                  including all images, likes, and comments.
                </p>
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50 flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-6 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <section className="rounded-2xl p-6 xl:p-8 flex flex-col gap-6 bg-white border border-gray-200/60 shadow-sm hover:shadow-xl hover:border-gray-300/60 transition-all duration-300">
        {/* Modal for full images */}
        {validImages.length > 0 && (
          <ModalFullImages
            viewFull={isFullImages}
            handleViewFull={handleViewImages}
            images={validImages}
            initialIndex={clickedImageIndex}
          />
        )}

        {/* Header */}
        <section className="flex items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 ring-2 ring-gray-100 ring-offset-2 rounded-full overflow-hidden">
              <img
                src={blog.userPic || defaultAvatar}
                alt={blog.firstName || "User"}
                className="w-full h-full object-cover"
             
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-avenir-black text-gray-900">
                  {blog.firstName} {blog.lastName}
                </p>
                {feeling && (
                  <span className="text-sm text-gray-600">
                    — is feeling <span className="font-semibold">{feeling}</span>
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {formatDate(blog.date || blog.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMine && (
              <button
                onClick={handleDeleteAction}
                disabled={isDeleting}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Delete post"
              >
                <Trash2 className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" />
              </button>
            )}
            <Link
              to={`blog/${blog.eblogId}/${toSlug(blog.title)}`}
              state={{ previousPage: location.pathname }}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors duration-200 group"
              aria-label="View full blog post"
            >
              <ArrowUpRightIcon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Content */}
        <section className="space-y-3">
          <h3 className="font-avenir-black text-xl text-gray-900 leading-tight">
            {cleanTitle}
          </h3>
          <div
            className="text-gray-600 leading-relaxed line-clamp-3"
            dangerouslySetInnerHTML={{ __html: blog.description || "" }}
          />
        </section>

        {/* Image Grid - Only render if images exist */}
        {validImages.length > 0 && renderImageGrid()}

        {/* Actions */}
        <section className="flex items-center gap-6 pt-2 border-t border-gray-100">
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
            onClick={handleHeartClick}
            aria-label={isHeart ? "Unlike post" : "Like post"}
          >
            {isHeart ? (
              <HeartIcon className="w-5 h-5 text-red-500 animate-pulse" />
            ) : (
              <Heart className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
            )}
            <span className="text-sm font-medium text-gray-700">{likeCount}</span>
          </button>

          <Link
            to={`blog/${blog.eblogId}/${toSlug(blog.title)}`}
            state={{ previousPage: location.pathname }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 no-underline group"
            aria-label="View comments"
          >
            <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium text-gray-700">
              {blog.commentCount || 0}
            </span>
          </Link>
        </section>
        {isDeleting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm rounded-2xl z-50">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-gray-700 font-medium">Deleting...</p>
          </div>
        )}

      </section>
    </>
  );
};

export default BlogCard;