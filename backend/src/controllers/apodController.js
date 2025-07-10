const nasaApiService = require("../services/nasaApiService");

exports.getApod = async (req, res, next) => {
  try {
    const { date } = req.query; // date format: YYYY-MM-DD

    // Validation is now handled inside nasaApiService.getApod
    const apodData = await nasaApiService.getApod(date);

    res.status(200).json({
      status: "success",
      data: apodData,
    });
  } catch (error) {
    // The service will throw an AppError if validation fails,
    // which will be caught here and passed to the global error handler.
    next(error);
  }
};
