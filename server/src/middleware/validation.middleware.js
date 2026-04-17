const { z } = require("zod");

/**
 * Zod schema for the POST /api/sensor-data payload.
 *
 * acceleration  — { x, y, z } finite numbers
 * location      — { lat: -90..90, lng: -180..180 } finite numbers
 * timestamp     — valid ISO-8601 date string
 * device_id     — optional string identifier (used for cooldown)
 */
const sensorDataSchema = z.object({
  acceleration: z.object({
    x: z.number({ required_error: "acceleration.x is required" }).finite(),
    y: z.number({ required_error: "acceleration.y is required" }).finite(),
    z: z.number({ required_error: "acceleration.z is required" }).finite(),
  }),

  location: z.object({
    lat: z
      .number({ required_error: "location.lat is required" })
      .finite()
      .min(-90, "latitude must be >= -90")
      .max(90, "latitude must be <= 90"),
    lng: z
      .number({ required_error: "location.lng is required" })
      .finite()
      .min(-180, "longitude must be >= -180")
      .max(180, "longitude must be <= 180"),
  }),

  timestamp: z
    .union([z.string(), z.number()], { required_error: "timestamp is required" })
    .refine((val) => !Number.isNaN(new Date(val).getTime()), {
      message: "timestamp must be a valid ISO-8601 date string or Unix epoch",
    }),

  device_id: z.string().optional(),
});

/**
 * Express middleware — validates req.body against sensorDataSchema.
 * On success: attaches parsed data to req.validatedBody and calls next().
 * On failure: returns 400 with Zod-formatted errors.
 */
function validateSensorData(req, res, next) {
  const result = sensorDataSchema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      issue: issue.message,
    }));

    return res.status(400).json({
      message: "Invalid data.",
      details,
    });
  }

  req.validatedBody = result.data;
  next();
}

module.exports = {
  sensorDataSchema,
  validateSensorData,
};
