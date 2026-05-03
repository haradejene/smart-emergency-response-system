const express = require("express");

const { ingestSensorData } = require("../controllers/sensor.controller");
const { validateSensorData } = require("../middleware/validation.middleware");
const { sensorDataLimiter } = require("../middleware/rateLimiter.middleware");

const router = express.Router();

router.post(
  "/sensor-data",
  sensorDataLimiter,
  validateSensorData,
  ingestSensorData,
);

module.exports = router;
