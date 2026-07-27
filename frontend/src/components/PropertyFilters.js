import { useState } from "react";

function PropertyFilters({ onSearch, onClear }) {
  const [filters, setFilters] = useState({
    city: "",
    zipcode: "",
    minPrice: "",
    maxPrice: "",
    beds: "",
    baths: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "")
    );

    onSearch(cleanedFilters);
  }

  function handleClear(){
    setFilters({
      city: "",
      zipcode: "",
      minPrice: "",
      maxPrice: "",
      beds: "",
      baths: "",
    });

    onClear();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="city"
        value={filters.city}
        onChange={handleChange}
        placeholder="City"
      />

      <input
        name="zipcode"
        value={filters.zipcode}
        onChange={handleChange}
        placeholder="ZIP code"
      />

      <input
        type="number"
        name="minPrice"
        value={filters.minPrice}
        onChange={handleChange}
        placeholder="Minimum price"
      />

      <input
        type="number"
        name="maxPrice"
        value={filters.maxPrice}
        onChange={handleChange}
        placeholder="Maximum price"
      />

      <select
        aria-label="Beds"
        name="beds"
        value={filters.beds}
        onChange={handleChange}
      >
        <option value="">Any beds</option>
        <option value="1">1+ bed</option>
        <option value="2">2+ beds</option>
        <option value="3">3+ beds</option>
        <option value="4">4+ beds</option>
      </select>

      <select
        aria-label="Baths"
        name="baths"
        value={filters.baths}
        onChange={handleChange}
      >
        <option value="">Any baths</option>
        <option value="1">1+ bath</option>
        <option value="2">2+ baths</option>
        <option value="3">3+ baths</option>
        <option value="4">4+ baths</option>
      </select>

      <button type="submit">Search</button>
      <button type="button" onClick={handleClear}>
        Clear Filters
      </button>
    </form>
  );
}

export default PropertyFilters;