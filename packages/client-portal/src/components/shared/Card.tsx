import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "bordered" | "accent" | "flat";
  hover?: boolean;
  padding?: "none" | "small" | "normal" | "large";
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
  hover = false,
  padding = "normal",
  onClick,
}) => {
  // Base classes
  const baseClasses = "rounded-lg overflow-hidden ";

  // Variant classes
  const variantClasses = {
    default: "bg-secondary",
    bordered: "bg-secondary border border-gray-700",
    accent: "bg-secondary border-l-4 border-l-primary",
    flat: "bg-neutral",
  };

  // Padding classes
  const paddingClasses = {
    none: "p-0",
    small: "p-3",
    normal: "p-6",
    large: "p-8",
  };

  // Hover classes
  const hoverClasses = hover
    ? "transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
    : "";

  // Combine classes
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${className}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
