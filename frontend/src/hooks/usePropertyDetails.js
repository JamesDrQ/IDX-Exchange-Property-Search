import { useEffect, useState } from "react";
import { getProperty, getOpenHouses } from "../api/client";

function usePropertyDetails(id) {
  const [property, setProperty] = useState(null);
  const [openHouses, setOpenHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return { property, openHouses, loading, error };
}

export default usePropertyDetails;