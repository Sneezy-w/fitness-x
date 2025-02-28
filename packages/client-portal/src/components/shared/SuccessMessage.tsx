import React from "react";
import { FiCheckCircle } from "react-icons/fi";

interface SuccessMessageProps {
  message: string;
  className?: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  className = "",
}) => {
  if (!message) return null;

  return (
    <div
      className={`bg-green-900/20 border border-green-700 text-green-100 px-4 py-3 rounded relative mb-4 ${className}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FiCheckCircle className="h-5 w-5 text-green-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;
