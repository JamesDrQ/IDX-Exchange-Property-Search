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