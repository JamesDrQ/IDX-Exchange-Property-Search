import "./ListingsPage.css";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import Pagination from "../components/Pagination";
import { useEffect, useState } from "react";
import { getProperties } from "../api/client";

function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await getProperties({
          ...activeFilters,
          limit: itemsPerPage,
          offset: (currentPage - 1) * itemsPerPage,
        });
        setProperties(data.results || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, [currentPage, itemsPerPage, activeFilters]);

  async function handleSearch(filters){
    try {
      setLoading(true);
      setError("");
      setActiveFilters(filters);
      setCurrentPage(1);
      const data = await getProperties({
        ...filters,
        limit: itemsPerPage,
        offset: 0,
      });
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
      setActiveFilters({});
      setCurrentPage(1);
      const data = await getProperties({
        limit: itemsPerPage,
        offset: 0,
      });
      setProperties(data.results || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / itemsPerPage);

  function handlePageChange(page) {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }
  
  const startItem =
    total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;

  const endItem = Math.min(
    currentPage * itemsPerPage,
    total
  );

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
            Showing {startItem.toLocaleString()}-
            {endItem.toLocaleString()} of{" "}
            {total.toLocaleString()} properties
          </p>

          {properties.length === 0 ? (
            <p>No properties found. Try changing your filters.</p>
          ) : (
            <>
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

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ListingsPage;