/**
 * A simple in-memory session manager.
 * @type {object}
 */
const sessions = {};

/**
 * Gets the session for a user.
 * @param {string} userId - The ID of the user.
 * @returns {object} The user's session.
 */
function getSession(userId) {
  sessions[userId] = sessions[userId] || {};
  return sessions[userId];
}

/**
 * Sets a value in a user's session.
 * @param {string} userId - The ID of the user.
 * @param {string} key - The key to set.
 * @param {*} value - The value to set.
 */
function setSession(userId, key, value) {
  sessions[userId] = sessions[userId] || {};
  sessions[userId][key] = value;
}

/**
 * Clears a user's session.
 * @param {string} userId - The ID of the user.
 */
function clearSession(userId) {
  delete sessions[userId];
}

module.exports = { getSession, setSession, clearSession };
