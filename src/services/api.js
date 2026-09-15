const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5005/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("badfish_token");
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(
      "Could not reach the BadFish server. Check if the backend is running.",
    );
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && token) {
    localStorage.removeItem("badfish_token");
    window.dispatchEvent(new Event("badfish:unauthorized"));
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
