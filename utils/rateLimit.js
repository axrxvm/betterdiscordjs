/**
 * A simple in-memory rate limiter.
 * @type {object}
 */
const limits = {};

/**
 * Checks if a user is rate-limited for a specific action.
 * @param {string} userId - The ID of the user.
 * @param {string} key - The key for the action being rate-limited.
 * @param {number} [max=5] - The maximum number of actions allowed within the window.
 * @param {number} [windowMs=5000] - The time window in milliseconds.
 * @returns {boolean} Whether the user is allowed to perform the action.
 */
function check(userId, key, max = 5, windowMs = 5000) {
  const now = Date.now();
  if (!limits[userId]) limits[userId] = {};
  if (!limits[userId][key]) limits[userId][key] = [];
  limits[userId][key] = limits[userId][key].filter(ts => now - ts < windowMs);
  if (limits[userId][key].length >= max) return false;
  limits[userId][key].push(now);
  return true;
}

module.exports = { check };
