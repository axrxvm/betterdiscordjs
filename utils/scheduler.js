const cron = require('node-cron');
const jobs = [];

function every(interval, fn) {
  const ms = typeof interval === 'string' ? parseMs(interval) : interval;
  const id = setInterval(fn, ms);
  jobs.push({ type: 'interval', id });
  return id;
}

function cronJob(expr, fn) {
  const job = cron.schedule(expr, fn);
  jobs.push({ type: 'cron', job });
  return job;
}

function stopAll() {
  jobs.forEach(j => {
    if (j.type === 'interval') clearInterval(j.id);
    if (j.type === 'cron') j.job.stop();
  });
}

function parseMs(str) {
  // Simple ms parser: "5m" => 300000
  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 0;
  const n = parseInt(match[1]);
  const unit = match[2];
  return unit === 's' ? n*1000 : unit === 'm' ? n*60000 : unit === 'h' ? n*3600000 : n*86400000;
}

module.exports = { every, cron: cronJob, stopAll };
