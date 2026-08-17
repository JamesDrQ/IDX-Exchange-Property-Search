import "./PropertyCard.css";
import { Link } from "react-router-dom";
import { useState } from "react";

function PropertyCard({ property }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoError, setPhotoError] = useState(false);
  let photos = [];

  try {
    const parsedPhotos = JSON.parse(property.L_Photos || "[]");

    if (Array.isArray(parsedPhotos)) {
      photos = parsedPhotos;
    }
  } catch (error) {
    photos = [];
  }

  function handlePreviousPhoto(event) {
    event.preventDefault();
    event.stopPropagation();

    setPhotoError(false);

    setCurrentPhotoIndex((currentIndex) =>
      currentIndex === 0 ? photos.length - 1 : currentIndex - 1
    );
  }

  function handleNextPhoto(event) {
    event.preventDefault();
    event.stopPropagation();

    setPhotoError(false);

    setCurrentPhotoIndex((currentIndex) =>
      currentIndex === photos.length - 1 ? 0 : currentIndex + 1
    );
  }

  return (
    <Link
      to={`/property/${property.L_DisplayId}`}
      className="property-card-link"
    >
      <div className="property-card">
        {photos.length > 0 && !photoError ? (
          <div className="property-photo-container">
            <img
              className="property-photo"
              src={photos[currentPhotoIndex]}
              alt={property.L_Address || "Property"}
              onError={() => setPhotoError(true)}
            />
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className="photo-arrow photo-arrow-left"
                  onClick={handlePreviousPhoto}
                >
                  ←
                </button>

                <button
                  type="button"
                  className="photo-arrow photo-arrow-right"
                  onClick={handleNextPhoto}
                >
                  →
                </button>

                <div className="photo-counter">
                  {currentPhotoIndex + 1} / {photos.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="property-photo-placeholder">
            No photo available
          </div>
        )}

        <h2>{property.L_Address || "Address unavailable"}</h2>

        <p className="property-location">
          {property.L_City}, {property.L_State}
        </p>

        <p className="property-price">
          ${Number(property.L_SystemPrice || 0).toLocaleString()}
        </p>

        <p className="property-details">
          {property.bedrooms ?? "N/A"} beds ·{" "}
          {property.bathrooms ?? "N/A"} baths ·{" "}
          {property.sqft
            ? `${Number(property.sqft).toLocaleString()} sqft`
            : "N/A sqft"}
        </p>
      </div>
    </Link>
  );
}

export default PropertyCard;