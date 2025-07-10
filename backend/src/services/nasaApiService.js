const axios = require("axios");
const config = require("../config");
const AppError = require("../utils/AppError");

// Simple in-memory cache. In a fully fledged production app this could be a Redis or something similar
const cache = new Map();

// Helper to manage cache invalidation (optional, can be more sophisticated with a real caching system)
const getCacheKey = (endpoint, params) =>
  `${endpoint}-${JSON.stringify(params)}`;

const nasaApi = axios.create({
  baseURL: config.nasaApiBaseUrl,
  params: {
    api_key: config.nasaApiKey,
  },
  timeout: 10000, // 10 seconds timeout
});

const fetchFromNasaApi = async (endpoint, params = {}) => {
  const cacheKey = getCacheKey(endpoint, params);

  // Check cache first
  if (
    cache.has(cacheKey) &&
    Date.now() - cache.get(cacheKey).timestamp < config.cacheDuration * 1000
  ) {
    console.log(`Cache hit for ${endpoint}`);
    return cache.get(cacheKey).data;
  }

  // If not in cache or expired, fetch from NASA API
  console.log(`Cache miss for ${endpoint}, fetching from NASA API...`);
  try {
    const response = await nasaApi.get(endpoint, { params });
    const data = response.data;

    // Cache the response with a timestamp
    cache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  } catch (error) {
    // Log the actual NASA API error for debugging
    console.error(
      `Error calling NASA API endpoint ${endpoint} with params ${JSON.stringify(
        params
      )}:`
    );

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
      const message =
        error.response.data.msg ||
        error.response.data.error_message ||
        error.message ||
        `NASA API error: ${error.response.status}`;
      throw new AppError(message, error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.message);
      throw new AppError(
        "No response from NASA API. Please try again later.",
        503
      ); // Service Unavailable
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request setup error:", error.message);
      throw new AppError(
        `Failed to make request to NASA API: ${error.message}`,
        500
      );
    }
  }
};

// Specific API calls using the generic fetcher
const getApod = async (date) => {
  // NASA APOD API often returns an empty object or a specific error message if date is invalid or no data
  // We can handle this by throwing an AppError if the response is not what we expect.
  const apodData = await fetchFromNasaApi("/planetary/apod", { date });
  if (Object.keys(apodData).length === 0 || apodData.code === 400) {
    throw new AppError(
      apodData.msg || "Astronomy Picture of the Day not found or invalid date.",
      404
    );
  }
  return apodData;
};

const getMarsRoverPhotos = async (rover, sol, camera, page) => {
  const photosData = await fetchFromNasaApi(
    `/mars-photos/api/v1/rovers/${rover}/photos`,
    { sol, camera, page }
  );
  // NASA Mars Rover Photos API returns { photos: [] } if no photos are found, not a 404
  if (!photosData || !photosData.photos || photosData.photos.length === 0) {
    throw new AppError(
      "No photos found for the given Mars Rover criteria.",
      404
    );
  }
  return photosData;
};

module.exports = {
  getApod,
  getMarsRoverPhotos,
  // Export for testing purposes, but not part of public API
  _clearCache: () => cache.clear(),
  _getCache: () => cache,
};
