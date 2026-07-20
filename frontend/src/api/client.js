export async function getProperties() {
  const response = await fetch("/api/properties");

  if (!response.ok) {
    throw new Error("Failed to fetch properties");
  }

  return response.json();
}