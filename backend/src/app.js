const express = require("express");
require("express-async-errors"); // Must be required early to automatically catch async errors
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");

const apiRouter = require("./routes/api");
const notFoundHandler = require("./middleware/notFoundHandler");
const errorHandler = require("./middleware/errorHandler");
const config = require("./config");

const app = express();

// Security Middlewares
app.use(helmet());
// Configure CORS to allow requests from your frontend origin (e.g., http://localhost:3000)
// For development, '*' is fine, but specify in production for security.
app.use(
  cors({
    origin: config.nodeEnv === "development" ? "*" : "http://localhost:3000", // Replace with your actual frontend URL for production
  })
);

// Logging middleware
if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// API Routes
app.use("/api/v1", apiRouter);

// Handle undefined routes (404)
app.all("*", notFoundHandler);

// Global Error Handling Middleware (must be last)
app.use(errorHandler);

module.exports = app;
