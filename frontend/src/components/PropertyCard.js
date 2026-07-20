import "./PropertyCard.css";
function PropertyCard({ property }) {
  let photoUrl = "";

  try {
    const photos = JSON.parse(property.L_Photos || "[]");

    if (Array.isArray(photos) && photos.length > 0) {
      photoUrl = photos[0];
    }
  } catch (error) {
    photoUrl = "";
  }
  return (
    <div className="property-card">
      {photoUrl ? (
        <img
          className="property-photo"
          src={photoUrl}
          alt={property.L_Address || "Property"}
        />
      ) : (
        <div className="property-photo-placeholder">No photo available</div>
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
  );
}

export default PropertyCard;