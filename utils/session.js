const sessions = {};

function getSession(userId) {
  sessions[userId] = sessions[userId] || {};
  return sessions[userId];
}

function setSession(userId, key, value) {
  sessions[userId] = sessions[userId] || {};
  sessions[userId][key] = value;
}

function clearSession(userId) {
  delete sessions[userId];
}

module.exports = { getSession, setSession, clearSession };
