const { createIncident } = require("./incident.service");
const { emitEmergencyAlert } = require("../websocket/socket");
const logger = require("../utils/logger");

// ── Configuration ───────────────────────────────────────────────
const threshold = Number(process.env.ACCIDENT_FORCE_THRESHOLD) || 30;
const confirmationWindowMs =
  Number(process.env.ACCIDENT_CONFIRMATION_WINDOW_MS) || 3000;
const cooldownPeriodMs = Number(process.env.COOLDOWN_PERIOD_MS) || 30_000;

// ── State ───────────────────────────────────────────────────────
let lastOverThresholdAt = null;

// Per-device cooldown map:  device_id → timestamp of last alert
const cooldownMap = new Map();

// Periodically purge stale entries (every 60 s) to prevent memory leaks
const CLEANUP_INTERVAL_MS = 60_000;
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, ts] of cooldownMap) {
    if (now - ts > cooldownPeriodMs) {
      cooldownMap.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);
cleanupTimer.unref(); // don't prevent Node from exiting

// ── Helpers ─────────────────────────────────────────────────────
function computeForce(acceleration) {
  const { x, y, z } = acceleration;
  return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
}

function mapSeverity(force) {
  if (force >= 60) return "CRITICAL";
  if (force >= 45) return "HIGH";
  return "MODERATE";
}

/**
 * Returns true if the device is still inside its cooldown window.
 */
function isInCooldown(deviceId) {
  const key = deviceId || "default";
  const lastAlert = cooldownMap.get(key);
  if (!lastAlert) return false;
  return Date.now() - lastAlert < cooldownPeriodMs;
}

/**
 * Records the current time as the last alert for a device.
 */
function setCooldown(deviceId) {
  cooldownMap.set(deviceId || "default", Date.now());
}

// ── Main pipeline ───────────────────────────────────────────────
async function processSensorReading(payload) {
  const force = computeForce(payload.acceleration);
  const overThreshold = force >= threshold;
  const eventTime = new Date(payload.timestamp).getTime();
  const nowMs = Number.isNaN(eventTime) ? Date.now() : eventTime;
  const deviceId = payload.device_id || "default";

  // 1. Below threshold — reset confirmation window
  if (!overThreshold) {
    lastOverThresholdAt = null;
    return { detected: false, force };
  }

  // 2. Cooldown check — suppress alert storms from the same device
  if (isInCooldown(deviceId)) {
    logger.info("Sensor reading suppressed (cooldown active)", {
      deviceId,
      force,
    });
    return { detected: false, force, cooldown: true };
  }

  // 3. First reading above threshold — start confirmation window
  if (
    !lastOverThresholdAt ||
    nowMs - lastOverThresholdAt > confirmationWindowMs
  ) {
    lastOverThresholdAt = nowMs;
    return { detected: false, force };
  }

  // 4. Confirmed incident — persist, broadcast, and set cooldown
  const severity = mapSeverity(force);
  const incident = await createIncident({
    type: "ACCIDENT",
    severity,
    force,
    latitude: payload.location.lat,
    longitude: payload.location.lng,
  });

  logger.info("Emergency incident detected", {
    incidentId: incident.id,
    severity,
    force,
    deviceId,
    location: payload.location,
  });

  emitEmergencyAlert({
    id: incident.id,
    type: incident.type,
    severity: incident.severity,
    force: incident.force,
    location: {
      lat: incident.latitude,
      lng: incident.longitude,
    },
    createdAt: incident.createdAt,
  });

  // Set cooldown for this device so duplicate alerts are suppressed
  setCooldown(deviceId);
  lastOverThresholdAt = null;

  return { detected: true, force, incident };
}

module.exports = {
  processSensorReading,
  computeForce,
  mapSeverity,
};
