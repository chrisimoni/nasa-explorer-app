// backend/src/routes/marsRoverRoutes.js
const express = require("express");
const marsRoverController = require("../controllers/marsRoverController");

const router = express.Router();

router.get("/photos", marsRoverController.getPhotos);

module.exports = router;
