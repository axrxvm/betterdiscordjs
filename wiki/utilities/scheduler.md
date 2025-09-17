# Scheduler Utility

The scheduler utility provides task scheduling capabilities using intervals and cron expressions for recurring bot operations.

## Overview

The scheduler supports two types of scheduling:
- **Interval-based**: Run tasks at regular intervals
- **Cron-based**: Run tasks based on cron expressions using node-cron

## Usage

```javascript
const scheduler = require('@axrxvm/betterdiscordjs/utils/scheduler');

// Or access through bot instance
bot.every('5m', () => {
  console.log('This runs every 5 minutes');
});

bot.cron('0 0 * * *', () => {
  console.log('This runs daily at midnight');
});
```

## Methods

### every(interval, function)

Schedules a function to run at regular intervals.

**Parameters:**
- `interval` (string|number) - Time interval (e.g., '5m', '30s', or milliseconds)
- `function` (Function) - The function to execute

**Returns:** `number` - The interval ID

### cron(expression, function)

Schedules a function to run based on a cron expression.

**Parameters:**
- `expression` (string) - Cron expression (e.g., '0 0 * * *')
- `function` (Function) - The function to execute

**Returns:** `object` - The cron job object

### stopAll()

Stops all scheduled jobs (both intervals and cron jobs).

## Interval Examples

### Basic Intervals

```javascript
const scheduler = require('@axrxvm/betterdiscordjs/utils/scheduler');

// Every 30 seconds
scheduler.every('30s', () => {
  console.log('Heartbeat check');
});

// Every 5 minutes
scheduler.every('5m', () => {
  console.log('Status update');
});

// Every hour
scheduler.every('1h', () => {
  console.log('Hourly maintenance');
});

// Every day
scheduler.every('1d', () => {
  console.log('Daily cleanup');
});
```

### Bot Integration

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');
const bot = new Bot(process.env.DISCORD_TOKEN);

// Status rotation every 10 minutes
bot.every('10m', () => {
  const statuses = [
    'Helping users',
    'Processing commands',
    'Monitoring servers'
  ];
  
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  bot.client.user.setActivity(status);
});

// Cleanup expired data every hour
bot.every('1h', async () => {
  // Clean up expired cooldowns, temp bans, etc.
  console.log('Running cleanup tasks...');
});
```

### Database Maintenance

```javascript
// Clean up old messages every 6 hours
bot.every('6h', async () => {
  const db = require('./utils/db');
  const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
  // your own db module
  await db.deleteOldMessages(cutoff);
  console.log('Cleaned up old messages');
});

// Backup database daily
bot.every('1d', async () => {
  const db = require('./utils/db');
  await db.backup();
  console.log('Database backup completed');
});
```

## Cron Examples

### Basic Cron Jobs

```javascript
const scheduler = require('@axrxvm/betterdiscordjs/utils/scheduler');

// Daily at midnight
scheduler.cron('0 0 * * *', () => {
  console.log('Daily reset');
});

// Every Monday at 9 AM
scheduler.cron('0 9 * * 1', () => {
  console.log('Weekly report');
});

// Every 15 minutes
scheduler.cron('*/15 * * * *', () => {
  console.log('Quarter-hourly check');
});

// First day of every month at noon
scheduler.cron('0 12 1 * *', () => {
  console.log('Monthly maintenance');
});
```

### Advanced Cron Scheduling

```javascript
// Daily rewards reset at midnight
bot.cron('0 0 * * *', async () => {
  const db = require('./utils/db');
  await db.resetDailyRewards();
  
  // Notify in announcement channel
  const channel = bot.client.channels.cache.get('ANNOUNCEMENT_CHANNEL_ID');
  if (channel) {
    await channel.send('🎁 Daily rewards have been reset!');
  }
});

// Weekly leaderboard update (Sunday at 6 PM)
bot.cron('0 18 * * 0', async () => {
  const db = require('./utils/db');
  const leaderboard = await db.getWeeklyLeaderboard();
  
  const channel = bot.client.channels.cache.get('LEADERBOARD_CHANNEL_ID');
  if (channel) {
    const embed = new EmbedBuilder()
      .setTitle('📊 Weekly Leaderboard')
      .setDescription(leaderboard.map((user, i) => 
        `${i + 1}. ${user.username}: ${user.points} points`
      ).join(' .setColor(0x00ff00);
    
    await channel.send({ embeds: [embed] });
  }
});

// Reminder system (every minute)
bot.cron('* * * * *', async () => {
  const db = require('./utils/db');
  const dueReminders = await db.getDueReminders();
  
  for (const reminder of dueReminders) {
    try {
      const user = await bot.client.users.fetch(reminder.userId);
      await user.send(`⏰ Reminder: ${reminder.message}`);
      await db.deleteReminder(reminder.id);
    } catch (error) {
      console.error('Failed to send reminder:', error);
    }
  }
});
```

## Cron Expression Format

Cron expressions consist of 5 fields:

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of Week (0-7, Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of Month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

### Common Cron Patterns

| Expression | Description |
|------------|-------------|
| `* * * * *` | Every minute |
| `0 * * * *` | Every hour |
| `0 0 * * *` | Every day at midnight |
| `0 0 * * 0` | Every Sunday at midnight |
| `0 0 1 * *` | First day of every month |
| `*/15 * * * *` | Every 15 minutes |
| `0 9-17 * * 1-5` | Every hour from 9 AM to 5 PM, Monday to Friday |

## Advanced Examples

### Dynamic Scheduling

```js
activeJobs = new Map();

bot.command('schedule', async (ctx) => {
  const interval = ctx.getOption('interval');
  const message = ctx.getOption('message');
  const channelId = ctx.channel.id;
  
  // Schedule a recurring message
  const jobId = boy(interval, async () => {
    const channel = bot.client.channels.cache.get(channelId);
    if (channel) {
      await channel.send(message);
    }
  });
  
  activeJobs.set(`${ctx.guild.id}_${Date.now()}`, jobId);
  await ctx.success(`Scheduled message every ${interval}`);
});

bot.command('unschedule', async (ctx) => {
  // Stop all scheduled jobs for this guild
  for (const [key, jof activeJobs) {
    if (key.startsWith(ctx.guild.id)) {
      clearInterval(jobId);
      activeJobs.delete(key);
    }
  }
  
  await ctx.success('All scheduled mesopped');
});
```

### Event-Based Scheduling

```javascript
// Schedule events based on server activity
bot.on('guildMemberAdd', async (ctx) => {
  const member = ctx.raw;
  
  // Welcome message after 5 minutes
 Timeout(async () => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
    if (channel) {
    nnel.send(`Welcome ${member.user.tag}! 🎉`);
    }
  }, 5 * 60 * 1000);
  
  // Check if user is still in server after 24 hours
  setTimeout(asyn    try {
      await member.guild.members.fetch(member.id);
      // User is still here, send follow-up
      const channel = member.guild.channels.cache.find(ch => ch.name === 'general');
      if (channel) {
        await channel.send(`${member.user.tag} has been with us for 24 hours! 🎊`);
      }
    } catch (error) {
      // User left, do nothing
    }
  }, 24 * 60 * 60 * 1000);
});
```

### Maintenance Windows

```javascript
// Maintenance mode during low activity hours
bot.cron('0 3 * * *', async () => {
  console.log('Starting maintenance mode...');
  
  // Set bot status to maintenance
  bot.client.user.setPresence({
    status: 'dnd',
    activities: [{ name: 'Maintenance Mode', type: 'WATCHING' }]
  });
  
  // Perform maintenance tasks
  await performDatabaseMaintenance();
  await cleanupTempFiles();
  await updateCaches();
  
  console.log('Maintenance completed');
  
  // Reset status
  bot.client.user.setPresence({
    status: 'online',
    activities: [{ name: 'Serving users', type: 'PLAYING' }]
  });
});
```

### Resource Monitoring

```javascript
// Monitor bot resources every 5 minutes
bot.every('5m', () => {
  const memUsage = process.memoryUsage();
  const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  
  console.log(`Memory usage: ${memUsedMB} MB`);
  
  // Alert if memory usage is high
  if (memUsedMB > 500) {
    const alertChannel = bot.client.channels.cache.get('ALERT_CHANNEL_ID');
    if (alertChannel) {
      alertChannel.send(`⚠️ High memory usage: ${memUsedMB} MB`);
    }
  }
});

// Check bot latency every minute
bot.every('1m', () => {
  const ping = bot.client.ws.ping;
  console.log(`Bot latency: ${ping}ms`);
  
  if (ping > 1000) {
    console.warn('High latency detected');
  }
});
```

## Best Practices

1. **Use appropriate intervals**
   - Frequent tasks: Every few minutes
   - Maintenance: Hourly or daily
   - Reports: Daily or weekly

2. **Handle errors gracefully**
   ```javascript
   bot.every('1h', async () => {
     try {
       await performTask();
     } catch (error) {
       console.error('Scheduled task failed:', error);
     }
   });
   ```

3. **Clean up resources**
   ```javascript
   process.on('SIGINT', () => {
     scheduler.stopAll();
     process.exit(0);
   });
   ```

4. **Use cron for specific times, intervals for regular periods**
   - Cron: Daily resets, weekly reports
   - Intervals: Status updates, health checks

5. **Consider timezone implications for cron jobs**
   - Server timezone affects cron execution
   - Document expected timezone behavior

## Stopping Jobs

```javascript
// Stop all jobs
scheduler.stopAll();

// Stop specific interval job
const jobId = scheduler.every('5m', myFunction);
clearInterval(jobId);

// Stop specific cron job
const cronJob = scheduler.cron('0 0 * * *', myFunction);
cronJob.stop();
```
# Next Steps

Master automated task scheduling:

1. ⏰ [Time Parser](./time.md) - Parse complex time expressions
2. 💾 [Cache System](./cache.md) - Schedule cache cleanup tasks
3. 🔧 [Bot Class API](../api/bot.md) - Integrate scheduling with bot lifecycle
4. 📊 [Advanced Use Cases](../examples/advanced.md) - Build complex automation systems






