const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://smart-emergency-response-system-sand.vercel.app",
];

function getAllowedOrigins() {
  const rawOrigins =
    process.env.CORS_ORIGIN || DEFAULT_ALLOWED_ORIGINS.join(",");
  return rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function createCorsOriginChecker(allowedOrigins) {
  if (allowedOrigins.includes("*")) {
    return "*";
  }

  return (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  };
}

module.exports = {
  DEFAULT_ALLOWED_ORIGINS,
  getAllowedOrigins,
  createCorsOriginChecker,
};
