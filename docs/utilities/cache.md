# Cache System

The cache system provides in-memory caching with database fallback for frequently accessed data like cooldowns, reminders, and temporary actions.

## Overview

The cache system combines fast in-memory storage with persistent database storage, providing both performance and reliability.

## Usage

```javascript
const cache = require('@axrxvm/betterdiscordjs/utils/cache');

// Set and get cooldowns
await cache.setCooldown(userId, 'ping', Date.now() + 5000);
const cooldown = await cache.getCooldown(userId, 'ping');
```

## Methods

### Cooldown Management

#### setCooldown(userId, command, until)

Sets a command cooldown for a user.

**Parameters:**
- `userId` (string) - The user ID
- `command` (string) - The command name
- `until` (number) - Timestamp when cooldown expires

#### getCooldown(userId, command)

Gets the cooldown timestamp for a user's command.

**Parameters:**
- `userId` (string) - The user ID
- `command` (string) - The command name

**Returns:** `Promise<number|undefined>` - Expiration timestamp or undefined

### Reminder Management

#### setReminder(userId, time, message)

Sets a reminder for a user.

**Parameters:**
- `userId` (string) - The user ID
- `time` (number) - Reminder timestamp
- `message` (string) - Reminder message

#### getReminder(userId)

Gets a user's reminder.

**Parameters:**
- `userId` (string) - The user ID

**Returns:** `Promise<object|undefined>` - Reminder object with time and message

### Temporary Mute Management

#### setTempMute(userId, until)

Sets a temporary mute for a user.

**Parameters:**
- `userId` (string) - The user ID
- `until` (number) - Timestamp when mute expires

#### getTempMute(userId)

Gets the temporary mute expiration for a user.

**Parameters:**
- `userId` (string) - The user ID

**Returns:** `Promise<number|undefined>` - Expiration timestamp or undefined

## Examples

### Command Cooldowns

```javascript
const cache = require('@axrxvm/betterdiscordjs/utils/cache');
const time = require('@axrxvm/betterdiscordjs/utils/time');

bot.command('daily', async (ctx) => {
  const userId = ctx.user.id;
  const cooldown = await cache.getCooldown(userId, 'daily');
  
  if (cooldown && Date.now() < cooldown) {
    const remaining = Math.ceil((cooldown - Date.now()) / 1000 / 60 / 60);
    return ctx.error(`⏳ You can claim your daily reward in ${remaining} hours!`);
  }
  
  // Give reward
  await ctx.success('🎁 You claimed your daily reward!');
  
  // Set 24-hour cooldown
  const nextDaily = Date.now() + time.parse('24h');
  await cache.setCooldown(userId, 'daily', nextDaily);
});
```

### Reminder System

```javascript
bot.command('remind', async (ctx) => {
  const duration = ctx.getOption('duration'); // e.g., "30m"
  const message = ctx.getOption('message');
  
  const ms = time.parse(duration);
  const reminderTime = Date.now() + ms;
  
  await cache.setReminder(ctx.user.id, reminderTime, message);
  await ctx.success(`⏰ I'll remind you in ${duration}: ${message}`);
});

// Check for due reminders every minute
bot.every('1m', async () => {
  const now = Date.now();
  
  // This would need to be implemented to check all users
  // In practice, you'd store reminders in a more accessible way
  for (const userId of getAllUsersWithReminders()) {
    const reminder = await cache.getReminder(userId);
    
    if (reminder && now >= reminder.time) {
      try {
        const user = await bot.client.users.fetch(userId);
        await user.send(`⏰ Reminder: ${reminder.message}`);
        
        // Clear the reminder
        await cache.setReminder(userId, null, null);
      } catch (error) {
        console.error('Failed to send reminder:', error);
      }
    }
  }
});
```

### Temporary Mutes

```javascript
bot.command('tempmute', async (ctx) => {
  const member = ctx.getMember('user');
  const duration = ctx.getOption('duration') || '10m';
  const reason = ctx.getOption('reason') || 'No reason provided';
  
  const ms = time.parse(duration);
  const muteUntil = Date.now() + ms;
  
  // Apply Discord timeout
  await member.timeout(ms, reason);
  
  // Store in cache for tracking
  await cache.setTempMute(member.id, muteUntil);
  
  await ctx.success(`🔇 Muted ${member.user.tag} for ${duration}`);
});

// Check for expired mutes every minute
bot.every('1m', async () => {
  const now = Date.now();
  
  for (const userId of getAllMutedUsers()) {
    const muteExpiry = await cache.getTempMute(userId);
    
    if (muteExpiry && now >= muteExpiry) {
      try {
        // Find the member across all guilds
        for (const guild of bot.client.guilds.cache.values()) {
          try {
            const member = await guild.members.fetch(userId);
            if (member.isCommunicationDisabled()) {
              await member.timeout(null, 'Temporary mute expired');
              
              // Clear from cache
              await cache.setTempMute(userId, null);
              
              console.log(`Unmuted ${member.user.tag} (expired)`);
            }
          } catch (error) {
            // Member not in this guild, continue
          }
        }
      } catch (error) {
        console.error('Failed to unmute user:', error);
      }
    }
  }
});
```

### Advanced Cooldown System

```javascript
class AdvancedCooldowns {
  constructor() {
    this.cache = require('@axrxvm/betterdiscordjs/utils/cache');
  }
  
  async setCooldown(userId, command, duration, options = {}) {
    const until = Date.now() + duration;
    
    // Support for different cooldown types
    const key = options.global ? `global_${command}` : command;
    
    await this.cache.setCooldown(userId, key, until);
    
    // Optional: Set guild-wide cooldowns
    if (options.guildId && options.guildWide) {
      await this.cache.setCooldown(options.guildId, `guild_${command}`, until);
    }
  }
  
  async checkCooldown(userId, command, options = {}) {
    const key = options.global ? `global_${command}` : command;
    const cooldown = await this.cache.getCooldown(userId, key);
    
    if (cooldown && Date.now() < cooldown) {
      return {
        active: true,
        remaining: cooldown - Date.now()
      };
    }
    
    // Check guild-wide cooldowns
    if (options.guildId) {
      const guildCooldown = await this.cache.getCooldown(options.guildId, `guild_${command}`);
      if (guildCooldown && Date.now() < guildCooldown) {
        return {
          active: true,
          remaining: guildCooldown - Date.now(),
          type: 'guild'
        };
      }
    }
    
    return { active: false };
  }
}

const cooldowns = new AdvancedCooldowns();

bot.command('vote', async (ctx) => {
  const check = await cooldowns.checkCooldown(ctx.user.id, 'vote', {
    global: true,
    guildId: ctx.guild.id
  });
  
  if (check.active) {
    const minutes = Math.ceil(check.remaining / 1000 / 60);
    const type = check.type === 'guild' ? 'server-wide' : 'personal';
    return ctx.error(`⏳ ${type} cooldown: ${minutes} minutes remaining`);
  }
  
  // Process vote
  await ctx.success('✅ Vote recorded!');
  
  // Set 12-hour global cooldown
  await cooldowns.setCooldown(ctx.user.id, 'vote', time.parse('12h'), {
    global: true,
    guildId: ctx.guild.id,
    guildWide: true
  });
});
```

### Cache Statistics

```javascript
class CacheStats {
  constructor() {
    this.hits = 0;
    this.misses = 0;
    this.cache = require('@axrxvm/betterdiscordjs/utils/cache');
  }
  
  async getCooldown(userId, command) {
    const result = await this.cache.getCooldown(userId, command);
    
    if (result !== undefined) {
      this.hits++;
    } else {
      this.misses++;
    }
    
    return result;
  }
  
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total * 100).toFixed(2) : 0;
    
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: `${hitRate}%`
    };
  }
  
  reset() {
    this.hits = 0;
    this.misses = 0;
  }
}

const cacheStats = new CacheStats();

bot.command('cachestats', async (ctx) => {
  const stats = cacheStats.getStats();
  
  const embed = ctx.embed()
    .title('📊 Cache Statistics')
    .field('Cache Hits', stats.hits.toString(), true)
    .field('Cache Misses', stats.misses.toString(), true)
    .field('Hit Rate', stats.hitRate, true)
    .color('blue');
  
  await embed.send();
});
```

### Custom Cache Implementation

```javascript
class CustomCache {
  constructor() {
    this.memory = new Map();
    this.db = require('@axrxvm/betterdiscordjs/utils/db');
  }
  
  async get(key) {
    // Try memory first
    if (this.memory.has(key)) {
      return this.memory.get(key);
    }
    
    // Fallback to database
    const value = await this.db.get(key);
    if (value !== undefined) {
      // Cache in memory for next time
      this.memory.set(key, value);
    }
    
    return value;
  }
  
  async set(key, value, ttl = null) {
    // Store in memory
    this.memory.set(key, value);
    
    // Store in database
    await this.db.set(key, value);
    
    // Set TTL if provided
    if (ttl) {
      setTimeout(() => {
        this.memory.delete(key);
        this.db.delete(key);
      }, ttl);
    }
  }
  
  async delete(key) {
    this.memory.delete(key);
    await this.db.delete(key);
  }
  
  clear() {
    this.memory.clear();
    // Note: This doesn't clear the database
  }
  
  size() {
    return this.memory.size;
  }
}

const customCache = new CustomCache();

// Usage
await customCache.set('user:123:level', 50, time.parse('1h'));
const level = await customCache.get('user:123:level');
```

## Best Practices

1. **Use appropriate cache keys**
   ```javascript
   // Good - descriptive and unique
   await cache.setCooldown(userId, 'daily_reward', expiry);
   await cache.setCooldown(userId, 'vote_reminder', expiry);
   
   // Less clear
   await cache.setCooldown(userId, 'cmd1', expiry);
   ```

2. **Handle cache misses gracefully**
   ```javascript
   const cooldown = await cache.getCooldown(userId, command);
   if (cooldown === undefined) {
     // No cooldown set, user can proceed
     return true;
   }
   ```

3. **Clean up expired data**
   ```javascript
   // Periodic cleanup
   bot.every('1h', async () => {
     await cleanupExpiredCooldowns();
     await cleanupExpiredReminders();
   });
   ```

4. **Monitor cache performance**
   ```javascript
   // Log cache statistics periodically
   bot.every('1h', () => {
     console.log('Cache stats:', cacheStats.getStats());
   });
   ```

5. **Use TTL for automatic cleanup**
   ```javascript
   // Set data with automatic expiration
   setTimeout(() => {
     cache.clearExpiredData();
   }, time.parse('1h'));
   ```

## Limitations

- **Memory usage**: Large caches consume RAM
- **Single instance**: Cache is not shared between bot instances
- **No persistence**: Memory cache is lost on restart (database persists)
- **No automatic cleanup**: Expired data needs manual cleanup

For production applications with multiple instances, consider using Redis or similar distributed cache solutions.## 
Next Steps

Optimize your bot's performance:

1. 💾 [Database & Storage](../core/database.md) - Combine caching with persistent storage
2. 🚦 [Rate Limiting](./rate-limiting.md) - Cache rate limit data efficiently
3. 📅 [Scheduler](./scheduler.md) - Automate cache maintenance
4. 📊 [Advanced Use Cases](../examples/advanced.md) - Implement distributed caching






