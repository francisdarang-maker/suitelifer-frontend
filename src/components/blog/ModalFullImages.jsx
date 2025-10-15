import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const ModalFullImages = ({
  viewFull,
  handleViewFull,
  images = [],
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when modal opens
  useEffect(() => {
    if (viewFull && initialIndex >= 0 && initialIndex < images.length) {
      setCurrentIndex(initialIndex);
    }
  }, [viewFull, initialIndex, images.length]);

  // Prevent body scroll
  useEffect(() => {
    if (viewFull) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [viewFull]);

  // Keyboard navigation
  useEffect(() => {
    if (!viewFull) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleViewFull();
      else if (e.key === "ArrowLeft")
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      else if (e.key === "ArrowRight")
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewFull, images.length, handleViewFull]);

  if (!viewFull || !images || images.length === 0) return null;

  const goToNext = () =>
    setCurrentIndex((prev) => (prev + 1) % images.length);
  const goToPrevious = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  const goToImage = (index) => setCurrentIndex(index);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md"
      onClick={handleViewFull}
    >
      {/* Glass Window Container */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 
                   max-w-5xl w-[90%] md:w-[70%] p-4 md:p-6
                   bg-gradient-to-br from-white/15 via-white/5 to-transparent 
                   backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative glass glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-white/10 via-transparent to-white/5 opacity-50 pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleViewFull}
          className="absolute top-3 right-3 z-[10000] p-2 rounded-full 
                     bg-white/20 hover:bg-white/30 backdrop-blur-lg 
                     border border-white/30 transition-all duration-200"
        >
          <X className="w-5 h-5 text-white drop-shadow-md" />
        </button>

        {/* Image Counter */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[10000] px-3 py-1.5 
                        rounded-full bg-white/20 backdrop-blur-lg border border-white/20 
                        text-sm text-white shadow-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Image Viewer */}
        <div className="flex items-center justify-center relative bg-white/10 rounded-2xl p-4 md:p-6">
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="max-h-[75vh] w-auto rounded-2xl object-contain 
                       shadow-lg transition-transform duration-500 ease-in-out"
          />

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 
                           p-3 rounded-full bg-white/20 hover:bg-white/30 
                           backdrop-blur-lg border border-white/30 
                           transition-all duration-200"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 
                           p-3 rounded-full bg-white/20 hover:bg-white/30 
                           backdrop-blur-lg border border-white/30 
                           transition-all duration-200"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4 p-3 md:p-4 
                          bg-white/10 rounded-2xl backdrop-blur-lg border border-white/10">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(idx);
                }}
                className={`relative flex-shrink-0 w-12 h-12 md:w-16 md:h-16 
                            rounded-lg overflow-hidden transition-all duration-200 
                            border border-white/20 
                            ${
                              idx === currentIndex
                                ? "ring-2 ring-white/80 scale-110 shadow-lg"
                                : "opacity-70 hover:opacity-100"
                            }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalFullImages;
