import React from "react";

const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "h-6 w-6 border-2",
    md: "h-12 w-12 border-b-2",
    lg: "h-16 w-16 border-b-3",
  };

  return (
    <div className={`flex justify-center items-center py-12 ${className}`}>
      <div className={`animate-spin rounded-full border-primary ${sizes[size]}`} />
    </div>
  );
};

export default LoadingSpinner;