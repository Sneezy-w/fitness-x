import React from "react";
import Button from "./Button";

interface HeroProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
  overlay?: boolean;
  children?: React.ReactNode;
  height?: "small" | "medium" | "large" | "full";
  align?: "left" | "center" | "right";
}

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  buttonText,
  buttonLink,
  backgroundImage,
  overlay = true,
  children,
  height = "medium",
  align = "center",
}) => {
  // Height classes
  const heightClasses = {
    small: "min-h-[300px]",
    medium: "min-h-[500px]",
    large: "min-h-[700px]",
    full: "min-h-screen",
  };

  // Alignment classes
  const alignClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  // Background style
  const bgStyle = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  return (
    <div
      className={`relative flex flex-col justify-center ${heightClasses[height]} ${alignClasses[align]} px-4 sm:px-6 lg:px-8`}
      style={bgStyle}
    >
      {/* Dark overlay */}
      {overlay && backgroundImage && (
        <div className="absolute inset-0 bg-black/60" />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
        {buttonText && buttonLink && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => (window.location.href = buttonLink)}
          >
            {buttonText}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Hero;
