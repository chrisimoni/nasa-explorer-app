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
  // Only validate if a date is provided, otherwise NASA API defaults to today
  if (date) {
    _validateApodDate(date); // Call the new validation method
  }

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
  // Validate and normalize parameters before fetching
  const validatedParams = _validateMarsRoverPhotosParams(
    rover,
    sol,
    camera,
    page
  );

  const photosData = await fetchFromNasaApi(
    `/mars-photos/api/v1/rovers/${validatedParams.rover}/photos`,
    {
      sol: validatedParams.sol,
      camera: validatedParams.camera, // will be undefined if no camera was provided or valid
      page: validatedParams.page,
    }
  );
  if (!photosData || !photosData.photos || photosData.photos.length === 0) {
    throw new AppError(
      "No photos found for the given Mars Rover criteria.",
      404
    );
  }
  return photosData;
};

// Rover and Camera definitions are moved to the service
const VALID_ROVERS = ["curiosity", "opportunity", "spirit", "perseverance"];
const VALID_CAMERAS = {
  curiosity: ["fhaz", "rhaz", "mast", "chemcam", "mahli", "mardi", "navcam"],
  opportunity: ["fhaz", "rhaz", "navcam", "pancam", "minites"],
  spirit: ["fhaz", "rhaz", "navcam", "pancam", "minites"],
  perseverance: [
    "fhaz",
    "rhaz",
    "mastcam_z",
    "navcam",
    "chemcam",
    "marfa",
    "mcc",
    "sherloc_rmi",
    "watson",
  ],
};

/**
 * Validates parameters for Mars Rover photo requests.
 * Throws an AppError if any parameter is invalid.
 * @param {string} rover - The rover name.
 * @param {number} sol - The Martian day.
 * @param {string} camera - The camera name (optional).
 * @param {number} page - The page number (optional, defaults to 1).
 * @returns {object} An object with validated and normalized parameters.
 */
const _validateMarsRoverPhotosParams = (rover, sol, camera, page) => {
  const normalizedParams = {};

  if (!rover) {
    throw new AppError("Rover is a required parameter.", 400);
  }
  const lowerCaseRover = rover.toLowerCase();
  if (!VALID_ROVERS.includes(lowerCaseRover)) {
    throw new AppError(
      `Invalid rover name. Valid rovers are: ${VALID_ROVERS.join(", ")}.`,
      400
    );
  }
  normalizedParams.rover = lowerCaseRover;

  // The 'sol' parameter is critical; if it's not provided or not a valid number
  // the API call won't work correctly. Ensure its presence and type.
  if (sol === undefined || sol === null || sol === "") {
    // Explicitly check for these "falsy" values
    throw new AppError("Sol (Martian day) is a required parameter.", 400);
  }
  const parsedSol = parseInt(sol, 10);
  if (isNaN(parsedSol) || parsedSol < 0) {
    throw new AppError("Sol must be a non-negative integer.", 400);
  }
  normalizedParams.sol = parsedSol;

  // The 'page' parameter might be optional in the query string,
  // but for internal validation, it's safer to default it if it's missing or invalid
  const parsedPage = parseInt(page, 10); // parseInt(undefined, 10) is NaN
  if (isNaN(parsedPage) || parsedPage < 1) {
    // FIX: Removed duplicate 'new' keyword
    throw new AppError("Page must be a positive integer.", 400);
  }
  normalizedParams.page = parsedPage;

  if (camera) {
    const lowerCaseCamera = camera.toLowerCase();
    if (
      !VALID_CAMERAS[lowerCaseRover] ||
      !VALID_CAMERAS[lowerCaseRover].includes(lowerCaseCamera)
    ) {
      throw new AppError(
        `Invalid camera for ${rover}. Valid cameras for ${lowerCaseRover} are: ${VALID_CAMERAS[
          lowerCaseRover
        ].join(", ")}.`,
        400
      );
    }
    normalizedParams.camera = lowerCaseCamera;
  }

  return normalizedParams;
};

/**
 * Validates the date for APOD requests.
 * Throws an AppError if the date is invalid.
 * @param {string} date - The date string in YYYY-MM-DD format.
 */
const _validateApodDate = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AppError("Invalid date format. Please use YYYY-MM-DD.", 400);
  }

  const inputDate = new Date(date);
  const today = new Date();

  // Set hours, minutes, seconds, milliseconds to 0 for accurate date comparison
  inputDate.setUTCHours(0, 0, 0, 0);
  today.setUTCHours(0, 0, 0, 0);

  if (inputDate > today) {
    throw new AppError("Date cannot be in the future.", 400);
  }

  // APOD's earliest date is 1995-06-16.
  const earliestApodDate = new Date("1995-06-16");
  earliestApodDate.setUTCHours(0, 0, 0, 0);
  if (inputDate < earliestApodDate) {
    throw new AppError(
      `Date cannot be earlier than ${
        earliestApodDate.toISOString().split("T")[0]
      }.`,
      400
    );
  }
};

module.exports = {
  getApod,
  getMarsRoverPhotos,
  // Export for testing purposes, but not part of public API
  _clearCache: () => cache.clear(),
  _getCache: () => cache,
};
