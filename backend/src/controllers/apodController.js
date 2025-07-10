const nasaApiService = require("../services/nasaApiService");
const AppError = require("../utils/AppError");

exports.getApod = async (req, res, next) => {
  console.log("THIS is it");
  console.log("req:", req.query);
  const { date } = req.query; // date format: YYYY-MM-DD

  // --- Input Validation ---
  if (date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return next(
        new AppError("Invalid date format. Please use YYYY-MM-DD.", 400)
      );
    }
    const inputDate = new Date(date);
    const today = new Date();
    // Set hours, minutes, seconds, milliseconds to 0 for accurate date comparison
    inputDate.setUTCHours(0, 0, 0, 0);
    today.setUTCHours(0, 0, 0, 0);

    if (inputDate > today) {
      return next(new AppError("Date cannot be in the future.", 400));
    }
    // APOD's earliest date is 1995-06-16.
    const earliestApodDate = new Date("1995-06-16");
    earliestApodDate.setUTCHours(0, 0, 0, 0);
    if (inputDate < earliestApodDate) {
      return next(
        new AppError(
          `Date cannot be earlier than ${
            earliestApodDate.toISOString().split("T")[0]
          }.`,
          400
        )
      );
    }
  }
  // --- End Validation ---

  const apodData = await nasaApiService.getApod(date);

  // nasaApiService already handles 404 for no data, so if we get here, data is valid
  res.status(200).json({
    status: "success",
    data: apodData,
  });
};
