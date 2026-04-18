const { processSensorReading } = require("../services/detection.service");
const logger = require("../utils/logger");

async function ingestSensorData(req, res, next) {
  try {
    logger.info("Incoming sensor data payload", { payload: req.validatedBody });
    // req.validatedBody is set by the Zod validation middleware
    const result = await processSensorReading(req.validatedBody);

    if (!result.detected) {
      return res.status(200).json({
        detected: false,
        force: result.force,
        ...(result.cooldown && { cooldown: true }),
        message: result.cooldown
          ? "Alert suppressed (cooldown active)."
          : "No incident detected.",
      });
    }

    return res.status(201).json({
      detected: true,
      force: result.force,
      incident: result.incident,
      message: "Emergency incident detected and broadcast.",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  ingestSensorData,
};
