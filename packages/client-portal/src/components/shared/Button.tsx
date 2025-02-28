import React from "react";
import { FiLoader } from "react-icons/fi";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  disabled,
  ...rest
}) => {
  // Base classes
  const baseClasses = "font-medium rounded-md transition focus:outline-none ";

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  // Variant classes
  const variantClasses = {
    primary: "bg-primary hover:bg-accent text-white disabled:bg-primary/50",
    secondary:
      "bg-neutral hover:bg-neutral/80 text-white disabled:bg-neutral/50",
    outline:
      "border border-primary text-primary hover:bg-primary hover:text-white disabled:border-primary/50 disabled:text-primary/50",
    danger: "bg-red-600 hover:bg-red-700 text-white disabled:bg-red-600/50",
  };

  // Width classes
  const widthClasses = fullWidth ? "w-full" : "";

  // Combine classes
  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${className}`;

  return (
    <button
      disabled={isLoading || disabled}
      className={buttonClasses}
      {...rest}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <FiLoader className="animate-spin mr-2" />
          <span>{children}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
