import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rectangle" | "circle" | "card";
  count?: number;
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "text",
  count = 1,
  width,
  height,
}) => {
  // Base styles
  let baseStyle = "animate-pulse bg-gray-700 rounded";

  // Variant styles
  if (variant === "text") {
    baseStyle += " h-4 my-2";
  } else if (variant === "circle") {
    baseStyle += " rounded-full";
  } else if (variant === "card") {
    baseStyle += " h-40 rounded-lg";
  }

  // Dimensional styles
  const dimensionalStyle = {
    width: width || "100%",
    height: height || undefined,
  };

  // Generate multiple skeletons if count > 1
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`${baseStyle} ${className}`}
      style={dimensionalStyle}
    />
  ));

  return <>{skeletons}</>;
};

export default Skeleton;
