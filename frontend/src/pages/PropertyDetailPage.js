import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProperty, getOpenHouses } from "../api/client";

function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [openHouses, setOpenHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    async function loadProperty() {
      try {
        const data = await getProperty(id);
        setProperty(data);

        const openHouseData = await getOpenHouses(id);
        setOpenHouses(openHouseData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [id]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (loading) {
    return <p>Loading property...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

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
    event.stopPropagation();

    setCurrentPhotoIndex((currentIndex) =>
      currentIndex === 0 ? photos.length - 1 : currentIndex - 1
    );
  }

  function handleNextPhoto(event) {
    event.stopPropagation();

    setCurrentPhotoIndex((currentIndex) =>
      currentIndex === photos.length - 1 ? 0 : currentIndex + 1
    );
  }

  const latitude = property.LMD_MP_Latitude;
  const longitude = property.LMD_MP_Longitude;

  return (
    <div>
      <Link to="/">← Back to Listings</Link>

      {photos.length > 0 && (
        <div>
          <img
            src={photos[currentPhotoIndex]}
            alt={property.L_Address || "Property"}
            onClick={() => setLightboxOpen(true)}
            style={{
              width: "100%",
              maxWidth: "800px",
              height: "450px",
              objectFit: "cover",
              cursor: "pointer",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              maxWidth: "800px",
              marginTop: "8px",
            }}
          >
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Property ${index + 1}`}
                onClick={() => setCurrentPhotoIndex(index)}
                style={{
                  width: "100px",
                  height: "70px",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>
      )}

    <h1>{property.L_Address}</h1>

    <h2>${Number(property.L_SystemPrice).toLocaleString()}</h2>

    <p>
      {property.L_City}, {property.L_State} {property.L_Zip}
    </p>

    <p>
      {property.L_Keyword2 ?? "N/A"} beds ·{" "}
      {property.LM_Dec_3 ?? "N/A"} baths ·{" "}
      {property.LM_Int2_3
        ? `${Number(property.LM_Int2_3).toLocaleString()} sqft`
        : "N/A sqft"}
    </p>

    <h2>Description</h2>
    <p>{property.L_Remarks || "No description available."}</p>

    <h2>Property Details</h2>

    <p>Property Type: {property.L_Type_ || "N/A"}</p>
    <p>Year Built: {property.YearBuilt || "N/A"}</p>
    <p>Stories: {property.StoriesTotal || "N/A"}</p>

    <p>
      Lot Size:{" "}
      {property.LotSizeAcres
        ? `${property.LotSizeAcres} acres`
        : "N/A"}
    </p>

    <p>Status: {property.L_Status || "N/A"}</p>

    {latitude && longitude && (
      <div>
        <h2>Location</h2>

        <iframe
          title="Property location"
          width="800"
          height="400"
          style={{ border: 0, maxWidth: "100%" }}
          loading="lazy"
          allowFullScreen
          src={`https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
        />

        <p>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get Directions
          </a>
        </p>
      </div>
    )}

    <h2>Open Houses</h2>

    {openHouses.length > 0 ? (
      openHouses.map((openHouse, index) => {
        let remarks = "";

        try {
          const parsed = JSON.parse(openHouse.all_data || "{}");
          remarks = parsed.OpenHouseRemarks || "";
        } catch (error) {
          remarks = "";
        }

        return (
          <div key={index}>
            <p>
              {new Date(openHouse.OpenHouseDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <p>
              {new Date(`1970-01-01T${openHouse.OH_StartTime}`).toLocaleTimeString(
                "en-US",
                {
                  hour: "numeric",
                  minute: "2-digit",
                }
              )}
              {" - "}
              {new Date(`1970-01-01T${openHouse.OH_EndTime}`).toLocaleTimeString(
                "en-US",
                {
                  hour: "numeric",
                  minute: "2-digit",
                }
              )}
            </p>
            
            {remarks && <p>{remarks}</p>}
          </div>
        );
      })
    ) : (
      <p>No open houses scheduled</p>
    )}

    {lightboxOpen && (
      <div
        onClick={() => setLightboxOpen(false)}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0, 0, 0, 0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
      {photos.length > 1 && (
        <>
        <button
          type="button"
          onClick={handlePreviousPhoto}
          style={{
            position: "absolute",
            left: "30px",
            fontSize: "40px",
            cursor: "pointer",
          }}
        >
          ←
        </button>

        <button
          type="button"
          onClick={handleNextPhoto}
          style={{
            position: "absolute",
            right: "30px",
            fontSize: "40px",
            cursor: "pointer",
          }}
        >
          →
        </button>
        </>
      )}

        <img
          src={photos[currentPhotoIndex]}
          alt={property.L_Address || "Property"}
          onClick={(event) => event.stopPropagation()}
          style={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            objectFit: "contain",
          }}
        />

      </div>
    )}
    </div>
  );
}

export default PropertyDetailPage;