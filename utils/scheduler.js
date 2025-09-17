const cron = require('node-cron');

/**
 * A list of all scheduled jobs.
 * @type {Array<object>}
 */
const jobs = [];

/**
 * Schedules a function to run at a specified interval.
 * @param {string|number} interval - The interval at which to run the function.
 * @param {Function} fn - The function to run.
 * @returns {object} The scheduled job.
 */
function every(interval, fn) {
  const ms = typeof interval === 'string' ? parseMs(interval) : interval;
  const id = setInterval(fn, ms);
  jobs.push({ type: 'interval', id });
  return id;
}

/**
 * Schedules a function to run based on a cron expression.
 * @param {string} expr - The cron expression.
 * @param {Function} fn - The function to run.
 * @returns {object} The scheduled job.
 */
function cronJob(expr, fn) {
  const job = cron.schedule(expr, fn);
  jobs.push({ type: 'cron', job });
  return job;
}

/**
 * Stops all scheduled jobs.
 */
function stopAll() {
  jobs.forEach(j => {
    if (j.type === 'interval') clearInterval(j.id);
    if (j.type === 'cron') j.job.stop();
  });
}

/**
 * Parses a string into milliseconds.
 * @param {string} str - The string to parse.
 * @returns {number} The parsed milliseconds.
 */
function parseMs(str) {
  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 0;
  const n = parseInt(match[1]);
  const unit = match[2];
  return unit === 's' ? n*1000 : unit === 'm' ? n*60000 : unit === 'h' ? n*3600000 : n*86400000;
}

module.exports = { every, cron: cronJob, stopAll };


