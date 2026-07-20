import "./ListingsPage.css";
import PropertyCard from "../components/PropertyCard";
import { useEffect, useState } from "react";
import { getProperties } from "../api/client";

function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await getProperties();
        setProperties(data.results || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  if (loading) {
    return <p>Loading properties...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="listings-page">
      <h1>Property Listings</h1>
      <p>
        Showing {properties.length} of {total.toLocaleString()} properties
      </p>

      <div className="property-grid">
        {properties.map((property) => (
          <PropertyCard
            key={property.id || property.L_ListingID || property.L_DisplayId}
            property={property}
          />
        ))}
      </div>
    </div>
  );
}

export default ListingsPage;