const app = require("./app");
const config = require("./config");

const server = app.listen(config.port, () => {
  console.log(
    `Server running on port ${config.port} in ${config.nodeEnv} mode`
  );
});

// Handle unhandled promise rejections (e.g., errors in async operations outside express routes)
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1); // Exit with a failure code
  });
});

// Handle uncaught exceptions (synchronous errors not caught by try/catch)
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1); // Exit with a failure code
  });
});
