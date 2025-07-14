// Define your backend API base URL
// For local development, it's usually http://localhost:PORT
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000/api/v1";

// Helper function for making GET requests
async function get(path, params = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);
  // Add query parameters if provided
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });

  try {
    const response = await fetch(url);

    // Check if the response was successful (2xx status code)
    if (!response.ok) {
      // Attempt to parse error message from body if available
      const errorData = await response
        .json()
        .catch(() => ({ message: "Something went wrong on the server." }));
      throw new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
    }

    const data = await response.json();
    return data; // Your backend usually returns { status, data, message, etc. }
  } catch (error) {
    console.error("API call failed:", error);
    // Re-throw a custom error or just the original for consistent handling
    throw error;
  }
}

// Specific API calls
export const fetchApod = async (date) => {
  // The API expects 'YYYY-MM-DD' for date
  const params = date ? { date } : {};
  const response = await get("/apod", params);
  // Assuming your backend returns { status: 'success', data: {...} } for APOD
  if (response.status === "success") {
    return response.data;
  } else {
    throw new Error(response.message || "Failed to fetch APOD data.");
  }
};

export const fetchMarsRoverPhotos = async ({ rover, sol, camera, page }) => {
  const params = { rover, sol, camera, page };
  const response = await get(`/mars-rover/photos`, params);
  if (response.status === "success") {
    return response.data; // This should be an array of photos
  } else {
    throw new Error(response.message || "Failed to fetch Mars Rover photos.");
  }
};
