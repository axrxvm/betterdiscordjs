/**
 * Parses a time string into milliseconds.
 * @param {string|number} str - The time string to parse.
 * @returns {number} The parsed time in milliseconds.
 */
function parse(str) {
  if (typeof str === "number") return str;
  const match = /^(\d+)(s|m|h|d)?$/.exec(str);
  if (!match) return 0;
  const num = parseInt(match[1]);
  const unit = match[2] || "ms";
  switch (unit) {
    case "s": return num * 1000;
    case "m": return num * 60 * 1000;
    case "h": return num * 60 * 60 * 1000;
    case "d": return num * 24 * 60 * 60 * 1000;
    default: return num;
  }
}

module.exports = { parse };
