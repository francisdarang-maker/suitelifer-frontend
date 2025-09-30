import { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../css/eventCalendar/EventImageCarousel.css";

export default function EventImageCarousel({ isLoading, hasLink, images }) {
  const [imageErrors, setImageErrors] = useState({});
  const [loadedImages, setLoadedImages] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);

  const settings = {
    dots: false,
    infinite: images.length > 1,
    speed: 600,
    arrows: false,
    autoplay: images.length > 1,
    autoplaySpeed: 3500,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    cssEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    beforeChange: (current, next) => setCurrentSlide(next),
  };

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  const handleImageLoad = (index) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <>
      <div
        className="glass-card relative overflow-hidden"
        style={{
          width: "320px",
          height: "240px",
          borderRadius: "16px",
        }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="spinner" />
            <div className="flex flex-col items-center gap-2">
              <span className="text-gray-300 text-sm font-medium">
                Loading gallery
              </span>
              <div className="flex gap-1">
                <div
                  className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        ) : !hasLink ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-30" />
              <svg
                className="w-16 h-16 text-gray-500 relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <div className="text-center space-y-1">
              <p className="text-gray-300 text-sm font-medium">No Drive Link</p>
              <p className="text-gray-500 text-xs">
                Add a Google Drive folder to display images
              </p>
            </div>
          </div>
        ) : images.length > 0 ? (
          <div className="h-full w-full relative">
            <Slider {...settings}>
              {images.map((src, i) => (
                <div key={i} className="relative">
                  {/* Loading skeleton */}
                  {!loadedImages[i] && !imageErrors[i] && (
                    <div
                      className="image-skeleton absolute inset-0 z-10"
                      style={{ width: "320px", height: "240px" }}
                    />
                  )}

                  {/* Actual image */}
                  {!imageErrors[i] && (
                    <img
                      src={src}
                      alt={`Event ${i + 1}`}
                      style={{
                        width: "320px",
                        height: "240px",
                        objectFit: "cover",
                        display: loadedImages[i] ? "block" : "none",
                      }}
                      onLoad={() => handleImageLoad(i)}
                      onError={() => handleImageError(i)}
                    />
                  )}

                  {/* Error state */}
                  {imageErrors[i] && (
                    <div
                      className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800"
                      style={{ width: "320px", height: "240px" }}
                    >
                      <svg
                        className="w-12 h-12 text-gray-600 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-500 text-xs">
                        Image unavailable
                      </span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  {loadedImages[i] && (
                    <div className="gradient-overlay absolute inset-0 pointer-events-none" />
                  )}
                </div>
              ))}
            </Slider>

            {/* Image counter badge */}
            {images.length > 1 && (
              <div className="absolute top-3 right-3 z-20">
                <div className="glass-card px-3 py-1.5 rounded-full">
                  <span className="text-white text-xs font-semibold tracking-wide">
                    {currentSlide + 1} <span className="text-gray-400">/</span>{" "}
                    {images.length}
                  </span>
                </div>
              </div>
            )}

            {/* Custom dots navigation */}
            {images.length > 1 && (
              <div className="custom-dots">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`dot ${index === currentSlide ? "active" : ""}`}
                  />
                ))}
              </div>
            )}

            {/* Gallery icon indicator */}
            <div className="absolute top-3 left-3 z-20">
              <div className="glass-card px-2.5 py-1.5 rounded-lg">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-xl opacity-20 animate-pulse" />
              <svg
                className="w-16 h-16 text-gray-600 relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ animation: "float 3s ease-in-out infinite" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <div className="text-center space-y-1">
              <p className="text-gray-300 text-sm font-medium">Empty Folder</p>
              <p className="text-gray-500 text-xs">
                No images found in this location
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
