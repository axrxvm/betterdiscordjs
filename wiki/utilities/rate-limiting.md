# Rate Limiting Utility

The rate limiting utility provides in-memory rate limiting to prevent spam and abuse in your Discord bot.

## Overview

The rate limiter tracks user actions within time windows and blocks requests that exceed the configured limits.

## Usage

```javascript
const rateLimit = require('@axrxvm/betterdiscordjs/utils/rateLimit');

// Or access through bot context (automatically used)
// Rate limiting is built into command execution
```

## Methods

### check(userId, key, max, windowMs)

Checks if a user is rate-limited for a specific action.

**Parameters:**
- `userId` (string) - The ID of the user
- `key` (string) - The key for the action being rate-limited
- `max` (number, optional) - Maximum actions allowed (default: 5)
- `windowMs` (number, optional) - Time window in milliseconds (default: 5000)

**Returns:** `boolean` - `true` if allowed, `false` if rate-limited

## Examples

### Basic Rate Limiting

```javascript
const rateLimit = require('@axrxvm/betterdiscordjs/utils/rateLimit');

bot.command('ping', async (ctx) => {
  // Check if user can use this command (5 times per 10 seconds)
  if (!rateLimit.check(ctx.user.id, 'ping', 5, 10000)) {
    return ctx.error('⏳ You are being rate limited. Please slow down!');
  }
  
  await ctx.reply('Pong!');
});
```

### Custom Rate Limits per Command

```javascript
bot.command('search', async (ctx) => {
  // More restrictive: 3 searches per 30 seconds
  if (!rateLimit.check(ctx.user.id, 'search', 3, 30000)) {
    return ctx.error('⏳ Please wait before searching again.');
  }
  
  // Perform search
  await ctx.reply('Search results...');
});

bot.command('joke', async (ctx) => {
  // Less restrictive: 10 jokes per 60 seconds
  if (!rateLimit.check(ctx.user.id, 'joke', 10, 60000)) {
    return ctx.error('⏳ Too many jokes! Take a break.');
  }
  
  await ctx.reply('Here\'s a joke...');
});
```

### Global Rate Limiting

```javascript
// Apply rate limiting to all commands
bot.beforeCommand(async (cmd, ctx) => {
  // Global limit: 20 commands per minute
  if (!rateLimit.check(ctx.user.id, 'global', 20, 60000)) {
    await ctx.error('⏳ You are sending commands too quickly. Please slow down!');
    return false; // Block command execution
  }
});
```

### Action-Specific Rate Limiting

```javascript
bot.command('report', async (ctx) => {
  // Very restrictive for reports: 1 per 5 minutes
  if (!rateLimit.check(ctx.user.id, 'report', 1, 300000)) {
    return ctx.error('⏳ You can only submit one report every 5 minutes.');
  }
  
  // Process report
  await ctx.success('Report submitted successfully!');
});

bot.command('vote', async (ctx) => {
  // One vote per hour
  if (!rateLimit.check(ctx.user.id, 'vote', 1, 3600000)) {
    return ctx.error('⏳ You can only vote once per hour.');
  }
  
  // Process vote
  await ctx.success('Vote recorded!');
});
```

### Message-Based Rate Limiting

```javascript
bot.on('messageCreate', async (ctx) => {
  if (ctx.raw.author.bot) return;
  
  // Prevent message spam: 10 messages per 30 seconds
  if (!rateLimit.check(ctx.user.id, 'messages', 10, 30000)) {
    // Optionally delete the message or warn the user
    await ctx.raw.delete().catch(() => {});
    
    // Send warning (but rate limit warnings too!)
    if (rateLimit.check(ctx.user.id, 'spam_warning', 1, 60000)) {
      await ctx.user.send('⚠️ You are sending messages too quickly!');
    }
    return;
  }
  
  // Process message normally
});
```

### Integration with Bot Class

The rate limiter is automatically integrated into the Bot class:

```javascript
// In Bot.js, rate limiting is applied automatically
bot.on("messageCreate", async msg => {
  // ... command parsing ...
  
  // Rate limit check (built-in)
  if (!rateLimit.check(ctx.user.id, cmdName)) {
    return ctx.reply('⏳ You are being rate limited.');
  }
  
  // Execute command
});
```

## Advanced Examples

### Role-Based Rate Limiting

```javascript
bot.beforeCommand(async (cmd, ctx) => {
  let maxCommands = 10; // Default limit
  let windowMs = 60000; // 1 minute
  
  // VIP users get higher limits
  if (ctx.member.roles.cache.has('VIP_ROLE_ID')) {
    maxCommands = 50;
  }
  
  // Moderators get even higher limits
  if (ctx.member.permissions.has('MANAGE_MESSAGES')) {
    maxCommands = 100;
  }
  
  if (!rateLimit.check(ctx.user.id, 'commands', maxCommands, windowMs)) {
    await ctx.error('⏳ Rate limit exceeded!');
    return false;
  }
});
```

### Channel-Specific Rate Limiting

```javascript
bot.command('meme', async (ctx) => {
  const channelKey = `meme_${ctx.channel.id}`;
  
  // Different limits for different channels
  let limit = 5;
  if (ctx.channel.name.includes('spam')) {
    limit = 20; // More relaxed in spam channels
  }
  
  if (!rateLimit.check(ctx.user.id, channelKey, limit, 60000)) {
    return ctx.error('⏳ Too many memes in this channel!');
  }
  
  await ctx.reply('Here\'s a meme!');
});
```

### Progressive Rate Limiting

```javascript
const warnings = new Map();

bot.beforeCommand(async (cmd, ctx) => {
  const userId = ctx.user.id;
  
  if (!rateLimit.check(userId, 'commands', 15, 60000)) {
    const warningCount = warnings.get(userId) || 0;
    warnings.set(userId, warningCount + 1);
    
    if (warningCount >= 3) {
      // Temporary ban after multiple warnings
      await ctx.member.timeout(300000, 'Excessive rate limit violations');
      await ctx.error('⛔ You have been temporarily muted for spam.');
      warnings.delete(userId);
    } else {
      await ctx.error(`⏳ Rate limit exceeded! Warning ${warningCount + 1}/3`);
    }
    
    return false;
  }
  
  // Reset warnings on successful command
  if (warnings.has(userId)) {
    warnings.delete(userId);
  }
});
```

### Custom Rate Limiter Class

```javascript
class CustomRateLimit {
  constructor() {
    this.limits = new Map();
  }
  
  check(key, max = 5, windowMs = 5000) {
    const now = Date.now();
    
    if (!this.limits.has(key)) {
      this.limits.set(key, []);
    }
    
    const timestamps = this.limits.get(key);
    
    // Remove old timestamps
    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
    
    if (validTimestamps.length >= max) {
      return false;
    }
    
    validTimestamps.push(now);
    this.limits.set(key, validTimestamps);
    
    return true;
  }
  
  reset(key) {
    this.limits.delete(key);
  }
  
  clear() {
    this.limits.clear();
  }
}

const customLimiter = new CustomRateLimit();

bot.command('special', async (ctx) => {
  if (!customLimiter.check(`special_${ctx.user.id}`, 3, 120000)) {
    return ctx.error('⏳ Special command rate limited!');
  }
  
  await ctx.reply('Special action performed!');
});
```

## Best Practices

1. **Set appropriate limits for different actions**
   - Frequent commands: 10-20 per minute
   - Resource-intensive commands: 3-5 per minute
   - Sensitive actions (reports, votes): 1 per hour/day

2. **Use descriptive keys**
   ```javascript
   // Good
   rateLimit.check(userId, 'music_play', 10, 60000);
   rateLimit.check(userId, 'image_search', 5, 30000);
   
   // Less clear
   rateLimit.check(userId, 'cmd1', 10, 60000);
   ```

3. **Provide clear error messages**
   ```javascript
   if (!rateLimit.check(userId, 'search', 3, 30000)) {
     return ctx.error('⏳ Please wait 30 seconds between searches.');
   }
   ```

4. **Consider different limits for different user types**
   - Regular users: Standard limits
   - Premium users: Higher limits
   - Moderators: Very high or no limits

5. **Monitor and adjust limits based on usage patterns**

## Limitations

- **Memory-based**: Rate limits are lost on bot restart
- **Per-instance**: Doesn't work across multiple bot instances
- **No persistence**: Consider using Redis for production applications

For production bots with multiple instances, consider implementing a Redis-based rate limiter.## Next
 Steps

Build robust rate limiting systems:

1. ⏰ [Time Parser](./time.md) - Handle complex time-based limits
2. 💾 [Cache System](./cache.md) - Optimize rate limit storage
3. 🔧 [Middleware & Hooks](../advanced/middleware.md) - Integrate rate limiting globally
4. 📋 [Best Practices](../deployment/best-practices.md) - Follow security guidelines






