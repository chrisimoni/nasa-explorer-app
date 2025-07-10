const nasaApiService = require("../services/nasaApiService");

exports.getPhotos = async (req, res, next) => {
  try {
    const { rover, sol, camera, page = 1 } = req.query;

    const photos = await nasaApiService.getMarsRoverPhotos(
      rover,
      sol,
      camera,
      page
    );

    res.status(200).json({
      status: "success",
      results: photos.photos.length,
      data: photos.photos,
    });
  } catch (error) {
    next(error);
  }
};
