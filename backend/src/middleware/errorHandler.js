const AppError = require("../utils/AppError");
const config = require("../config");

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err); // Log the original error for debugging server-side
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (config.nodeEnv === "development") {
    sendErrorDev(err, res);
  } else if (config.nodeEnv === "production") {
    let error = { ...err };
    // Ensure message is copied for AppError instances, as spread operator might not copy native Error properties reliably
    error.message = err.message;
    error.name = err.name;

    sendErrorProd(error, res);
  }
};
