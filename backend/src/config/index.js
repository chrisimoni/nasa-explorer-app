// backend/src/config/index.js
require("dotenv").config();

const config = {
  port: process.env.PORT || 5000,
  nasaApiKey: process.env.NASA_API_KEY,
  nasaApiBaseUrl: process.env.NASA_BASE_URL,
  cacheDuration: process.env.CACHE_DURATION_SECONDS
    ? parseInt(process.env.CACHE_DURATION_SECONDS, 10)
    : 3600, // 1 hour default
  nodeEnv: process.env.NODE_ENV || "development",
};

// Basic validation and warning for NASA API Key
if (!config.nasaApiKey || config.nasaApiKey === "YOUR_NASA_API_KEY_HERE") {
  console.warn(
    "WARNING: NASA_API_KEY not found or is placeholder in environment variables. Using DEMO_KEY. This will have strict rate limits and is not suitable for production or heavy testing."
  );
  config.nasaApiKey = "DEMO_KEY";
}

module.exports = config;
