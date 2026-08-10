export async function getProperties(filters = {}) {
  const params = new URLSearchParams(filters);

  const response = await fetch(
    `http://localhost:5000/api/properties?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch properties");
  }

  return response.json();
}

export async function getProperty(id) {
  const response = await fetch(
    `http://localhost:5000/api/properties/${id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch property");
  }

  return response.json();
}

export async function getOpenHouses(id) {
  const response = await fetch(
    `http://localhost:5000/api/properties/${id}/openhouses`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch open houses");
  }

  return response.json();
}