# better-djs

A modern, modular, and extensible Discord bot framework for Node.js.

## Features
- Slash & prefix commands
- Context menus
- Advanced context helpers (ctx)
- Powerful embed builder
- Scheduler & cron jobs
- Per-guild/user config
- Hot-reload for commands/events
- Middleware, inhibitors, overloads
- Event groups & wildcard listeners
- Caching, sessions, queues
- Command logging, stats, rate limits
- Beautiful color-coded logs

## Quick Start
1. Clone this repo
2. Install dependencies: `npm install`
3. Set up your `.env` with your bot token and client ID
4. Run: `node index.js`

## Structure
- `Bot.js` — main bot class
- `utils/ctx.js` — context helpers
- `utils/` — advanced utilities (db, cache, scheduler, session, queue)
- `loaders/` — command/event loaders
- `testbot/` — example bot setup

## Philosophy
- Clean, readable code
- Easy to extend and customize
- Scales from small bots to large, sharded deployments

## License
MIT

---
For full documentation and usage, see the upcoming docs site!
