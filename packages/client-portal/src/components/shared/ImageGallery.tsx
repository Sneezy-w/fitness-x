import React, { useState } from "react";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Image {
  src: string;
  alt: string;
}

interface ImageGalleryProps {
  images: Image[];
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: "small" | "medium" | "large";
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className = "",
  columns = 3,
  gap = "medium",
}) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Gap classes
  const gapClasses = {
    small: "gap-2",
    medium: "gap-4",
    large: "gap-6",
  };

  // Column classes
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const handleOpenImage = (index: number) => {
    setSelectedImage(index);
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage === null) return;
    setSelectedImage((prev) =>
      prev === images.length - 1 ? 0 : (prev || 0) + 1
    );
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage === null) return;
    setSelectedImage((prev) =>
      prev === 0 ? images.length - 1 : (prev || 0) - 1
    );
  };

  return (
    <>
      <div
        className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => handleOpenImage(index)}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Modal for selected image */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={handleCloseImage}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl p-2 hover:bg-white/10 rounded-full transition"
            onClick={handleCloseImage}
          >
            <FiX />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl p-2 hover:bg-white/10 rounded-full transition"
            onClick={handlePrevImage}
          >
            <FiChevronLeft />
          </button>

          <img
            src={images[selectedImage].src}
            alt={images[selectedImage].alt}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl p-2 hover:bg-white/10 rounded-full transition"
            onClick={handleNextImage}
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
