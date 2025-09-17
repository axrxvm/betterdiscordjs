# Time Parser Utility

The time parser utility converts human-readable time strings into milliseconds for use with cooldowns, timeouts, and scheduling.

## Overview

The time parser supports common time units and provides a simple API for parsing duration strings.

## Usage

```javascript
const { time } = require('@axrxvm/betterdiscordjs');

// Or import directly
const time = require('@axrxvm/betterdiscordjs/utils/time');
```

## Methods

### parse(timeString)

Parses a time string and returns the equivalent milliseconds.

**Parameters:**
- `timeString` (string|number) - The time string to parse or number in milliseconds

**Returns:** `number` - Time in milliseconds

## Supported Time Units

| Unit | Description | Example |
|------|-------------|---------|
| `s` | Seconds | `30s` = 30 seconds |
| `m` | Minutes | `5m` = 5 minutes |
| `h` | Hours | `2h` = 2 hours |
| `d` | Days | `7d` = 7 days |
| (none) | Milliseconds | `1000` = 1000 milliseconds |

## Examples

### Basic Usage

```javascript
const time = require('./utils/time');

console.log(time.parse('30s'));    // 30000 (30 seconds)
console.log(time.parse('5m'));     // 300000 (5 minutes)
console.log(time.parse('2h'));     // 7200000 (2 hours)
console.log(time.parse('1d'));     // 86400000 (1 day)
console.log(time.parse('1000'));   // 1000 (1000 milliseconds)
console.log(time.parse(5000));     // 5000 (already a number)
```

### Command Cooldowns

```javascript
bot.command('ping', async (ctx) => {
  await ctx.reply('Pong!');
}, {
  description: 'Ping the bot',
  cooldown: '5s' // 5 second cooldown
});

bot.command('daily', async (ctx) => {
  await ctx.reply('Here\'s your daily reward!');
}, {
  description: 'Get daily reward',
  cooldown: '24h' // 24 hour cooldown
});
```

### Timeouts and Delays

```javascript
bot.command('remind', async (ctx) => {
  const duration = ctx.args[0]; // e.g., "30m"
  const message = ctx.args.slice(1).join(' ');
  
  const ms = time.parse(duration);
  
  await ctx.reply(`I'll remind you in ${duration}!`);
  
  setTimeout(async () => {
    await ctx.user.send(`Reminder: ${message}`);
  }, ms);
});
```

### Temporary Actions

```javascript
bot.command('mute', async (ctx) => {
  const member = ctx.getMember('user');
  const duration = ctx.getOption('duration') || '10m';
  
  const ms = time.parse(duration);
  
  // Mute the member
  await member.timeout(ms, 'Muted by command');
  
  await ctx.success(`Muted ${member.user.tag} for ${duration}`);
});
```

### Scheduler Integration

```javascript
// Schedule a task to run every 30 minutes
bot.every('30m', () => {
  console.log('Running scheduled task...');
});

// Schedule a task to run in 1 hour
setTimeout(() => {
  console.log('One hour has passed!');
}, time.parse('1h'));
```

### Validation

```javascript
bot.command('ban', async (ctx) => {
  const durationStr = ctx.getOption('duration');
  
  if (durationStr) {
    const ms = time.parse(durationStr);
    
    if (ms === 0) {
      return ctx.error('Invalid duration format! Use formats like: 30s, 5m, 2h, 7d');
    }
    
    if (ms > time.parse('30d')) {
      return ctx.error('Duration cannot exceed 30 days!');
    }
    
    // Proceed with temporary ban
    await ctx.success(`Banned for ${durationStr}`);
  }
});
```

## Advanced Examples

### Dynamic Cooldown System

```javascript
const cooldowns = new Map();

bot.beforeCommand(async (cmd, ctx) => {
  const cooldownTime = cmd.cooldown;
  if (!cooldownTime) return;
  
  const key = `${ctx.user.id}-${cmd.name}`;
  const now = Date.now();
  const cooldownMs = time.parse(cooldownTime);
  
  if (cooldowns.has(key)) {
    const expiresAt = cooldowns.get(key);
    if (now < expiresAt) {
      const remaining = Math.ceil((expiresAt - now) / 1000);
      await ctx.error(`Please wait ${remaining}s before using this command again.`);
      return false; // Block command execution
    }
  }
  
  cooldowns.set(key, now + cooldownMs);
});
```

### Time-based Rewards

```javascript
const lastDaily = new Map();

bot.command('daily', async (ctx) => {
  const userId = ctx.user.id;
  const now = Date.now();
  const dayMs = time.parse('24h');
  
  if (lastDaily.has(userId)) {
    const lastClaim = lastDaily.get(userId);
    const timeSince = now - lastClaim;
    
    if (timeSince < dayMs) {
      const remaining = dayMs - timeSince;
      const hours = Math.ceil(remaining / time.parse('1h'));
      return ctx.error(`You can claim your daily reward in ${hours} hours!`);
    }
  }
  
  lastDaily.set(userId, now);
  await ctx.success('You claimed your daily reward! 🎁');
});
```

### Event Scheduling

```javascript
bot.command('event', async (ctx) => {
  const eventTime = ctx.getOption('when'); // e.g., "2h"
  const eventName = ctx.getOption('name');
  
  const ms = time.parse(eventTime);
  
  await ctx.success(`Event "${eventName}" scheduled for ${eventTime} from now!`);
  
  setTimeout(async () => {
    await ctx.channel.send(`🎉 Event "${eventName}" is starting now!`);
  }, ms);
});
```

## Error Handling

The parser returns `0` for invalid time strings:

```javascript
console.log(time.parse('invalid'));  // 0
console.log(time.parse(''));         // 0
console.log(time.parse('abc'));      // 0
```

Always validate the result:

```javascript
const duration = time.parse(userInput);
if (duration === 0) {
  return ctx.error('Invalid time format! Use: 30s, 5m, 2h, 7d');
}
```

## Best Practices

1. **Always validate user input**
   ```javascript
   const ms = time.parse(input);
   if (ms === 0) {
     return ctx.error('Invalid time format!');
   }
   ```

2. **Set reasonable limits**
   ```javascript
   if (ms > time.parse('30d')) {
     return ctx.error('Duration too long!');
   }
   ```

3. **Provide clear examples to users**
   ```javascript
   // In command descriptions
   description: 'Mute a user (duration: 30s, 5m, 2h, 7d)'
   ```

4. **Use consistent time formats**
   - Prefer shorter units for short durations (`30s` vs `0.5m`)
   - Use appropriate units for context (`24h` for daily cooldowns)##
 Next Steps

Expand your time management toolkit:

1. 📅 [Scheduler](./scheduler.md) - Automate time-based tasks
2. 🚦 [Rate Limiting](./rate-limiting.md) - Implement time-based restrictions
3. 💾 [Cache System](./cache.md) - Add time-based cache expiration
4. 🎯 [Commands](../core/commands.md) - Build time-aware command systems






