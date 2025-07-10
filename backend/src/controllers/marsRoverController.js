const nasaApiService = require("../services/nasaApiService");
const AppError = require("../utils/AppError");

// Valid rovers and their cameras.
// In a real application, we  might fetch available cameras dynamically from the /manifests endpoint for example
// or keep the list in a more configurable place.
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

exports.getPhotos = async (req, res, next) => {
  const { rover, sol, camera, page = 1 } = req.query;

  // --- Input Validation ---
  if (!rover) {
    return next(new AppError("Rover is a required parameter.", 400));
  }
  const lowerCaseRover = rover.toLowerCase();
  if (!VALID_ROVERS.includes(lowerCaseRover)) {
    return next(
      new AppError(
        `Invalid rover name. Valid rovers are: ${VALID_ROVERS.join(", ")}.`,
        400
      )
    );
  }

  if (!sol) {
    return next(
      new AppError("Sol (Martian day) is a required parameter.", 400)
    );
  }
  const parsedSol = parseInt(sol, 10);
  if (isNaN(parsedSol) || parsedSol < 0) {
    return next(new AppError("Sol must be a non-negative integer.", 400));
  }

  const parsedPage = parseInt(page, 10);
  if (isNaN(parsedPage) || parsedPage < 1) {
    return next(new AppError("Page must be a positive integer.", 400));
  }

  if (camera) {
    const lowerCaseCamera = camera.toLowerCase();
    if (
      !VALID_CAMERAS[lowerCaseRover] ||
      !VALID_CAMERAS[lowerCaseRover].includes(lowerCaseCamera)
    ) {
      return next(
        new AppError(
          `Invalid camera for ${rover}. Valid cameras for ${rover} are: ${VALID_CAMERAS[
            lowerCaseRover
          ].join(", ")}.`,
          400
        )
      );
    }
  }
  // --- End Validation ---

  const photos = await nasaApiService.getMarsRoverPhotos(
    lowerCaseRover,
    parsedSol,
    camera ? camera.toLowerCase() : undefined,
    parsedPage
  );

  // nasaApiService already handles 404 for no photos, so if we get here, data is valid
  res.status(200).json({
    status: "success",
    results: photos.photos.length,
    data: photos.photos,
  });
};
