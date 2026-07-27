import "./ListingsPage.css";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
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

  async function handleSearch(filters){
    try {
      setLoading(true);
      setError("");
      const data = await getProperties(filters);
      setProperties(data.results || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    try {
      setLoading(true);
      setError("");
      const data = await getProperties();
      setProperties(data.results || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="listings-page">
      <h1>Property Listings</h1>
      <PropertyFilters 
        onSearch={handleSearch}
        onClear={handleClear}  
      />
      {loading && <p>Loading properties...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && (
        <>
          <p>
            Showing {properties.length} of {total.toLocaleString()} properties
          </p>

          {properties.length === 0 ? (
            <p>No properties found. Try changing your filters.</p>
          ) : (
            <div className="property-grid">
              {properties.map((property) => (
                <PropertyCard
                  key={
                    property.id ||
                    property.L_ListingID ||
                    property.L_DisplayId
                  }
                  property={property}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ListingsPage;