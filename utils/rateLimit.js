const limits = {};

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
