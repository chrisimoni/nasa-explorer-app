const express = require("express");
const apodRoutes = require("./apodRoutes");
const marsRoverRoutes = require("./marsRoverRoutes");

const router = express.Router();

router.use("/apod", apodRoutes);
router.use("/mars-rover", marsRoverRoutes);

module.exports = router;
