import React from "react";

const Button = ({
  children,
  onClick,
  variant = "primary",
  icon,
  className = "",
  disabled = false,
  type = "button",
  ...props
}) => {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 disabled:bg-primary/50",
    secondary:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400",
    outline:
      "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;
