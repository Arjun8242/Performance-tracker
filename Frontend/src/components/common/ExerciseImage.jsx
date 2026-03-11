import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './ExerciseImage.css';

/**
 * ExerciseImage Component
 * 
 * Reusable component for displaying exercise images with lazy loading,
 * fallback handling, and responsive sizing.
 * 
 */
const ExerciseImage = React.forwardRef(
  ({ src, alt = 'Exercise image', variant = 'card', className = '' }, ref) => {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Handle image load error
    const handleImageError = (e) => {
      console.warn(`Failed to load image: ${src}`);
      setImageError(true);
      e.target.src = '/images/exercise-placeholder.png';
    };

    // Handle successful image load
    const handleImageLoad = () => {
      setIsLoading(false);
    };

    const containerClass = `exercise-image-container exercise-image-container--${variant} ${className}`;

    return (
      <div className={containerClass} ref={ref}>
        <img
          src={src}
          alt={alt}
          className={`exercise-image exercise-image--${variant} ${
            isLoading ? 'exercise-image--loading' : ''
          }`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
          decoding="async"
        />
        {isLoading && !imageError && (
          <div className="exercise-image-skeleton"></div>
        )}
      </div>
    );
  }
);

ExerciseImage.displayName = 'ExerciseImage';

ExerciseImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  variant: PropTypes.oneOf(['card', 'analytics', 'thumbnail']),
  className: PropTypes.string,
};

export default ExerciseImage;
