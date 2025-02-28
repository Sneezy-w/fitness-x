import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: "primary" | "white";
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  color = "primary",
  fullPage = false,
}) => {
  // Determine size based on prop
  let sizeClass = "h-8 w-8";
  if (size === "small") sizeClass = "h-5 w-5";
  if (size === "large") sizeClass = "h-12 w-12";

  // Determine color based on prop
  const borderColor = color === "primary" ? "border-primary" : "border-white";

  const spinner = (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClass} animate-spin rounded-full border-4 border-solid ${borderColor} border-t-transparent`}
      ></div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/75 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
