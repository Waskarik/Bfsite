export async function getMarketPrice(itemId) {
  const response = await fetch(
    `https://universalis.app/api/v2/Raiden/${itemId}`,
  );

  if (!response.ok) {
    throw new Error("Could not load the Raiden market price.");
  }

  return response.json();
}
