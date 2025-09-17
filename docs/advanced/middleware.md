# Middleware & Hooks

Middleware and hooks provide powerful ways to intercept and modify bot behavior at various stages of command execution and event handling.

## Overview

@axrxvm/betterdiscordjs provides several middleware and hook systems:
- Command middleware (before/after command execution)
- Event middleware
- Global hooks
- Plugin hooks
- Custom middleware chains

## Command Middleware

### Before Command Hooks

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');
const bot = new Bot(process.env.DISCORD_TOKEN);

// Global before-command middleware
bot.beforeCommand(async (cmd, ctx) => {
  console.log(`Executing command: ${cmd.name} by ${ctx.user.tag}`);
  
  // Permission checks
  if (cmd.adminOnly && !ctx.member.permissions.has('ADMINISTRATOR')) {
    await ctx.error('❌ This command requires administrator permissions.');
    return false; // Block command execution
  }
  
  // Maintenance mode check
  if (process.env.MAINTENANCE_MODE === 'true' && ctx.user.id !== process.env.BOT_OWNER_ID) {
    await ctx.error('🔧 Bot is currently in maintenance mode. Please try again later.');
    return false;
  }
  
  // Rate limiting
  const rateLimit = require('./utils/rateLimit');
  if (!rateLimit.check(ctx.user.id, 'global', 10, 60000)) {
    await ctx.error('⏳ You are sending commands too quickly. Please slow down.');
    return false;
  }
  
  return true; // Allow command execution
});
```

### After Command Hooks

```javascript
// Global after-command middleware
bot.afterCommand(async (cmd, ctx) => {
  // Log command usage
  const logger = require('./utils/logger');
  logger.info(`Command ${cmd.name} completed for ${ctx.user.tag}`);
  
  // Update statistics
  const stats = require('./utils/stats');
  await stats.incrementCommandUsage(cmd.name, ctx.user.id, ctx.guild?.id);
  
  // XP system
  if (ctx.guild) {
    const xp = Math.floor(Math.random() * 10) + 5; // 5-15 XP
    await addUserXP(ctx.user.id, ctx.guild.id, xp);
  }
  
  // Cleanup temporary data
  if (cmd.cleanup) {
    try {
      await cmd.cleanup(ctx);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
});
```

### Per-Command Middleware

```javascript
bot.command('sensitive', async (ctx) => {
  await ctx.success('Sensitive operation completed!');
}, {
  description: 'A sensitive command',
  
  // Before middleware for this specific command
  before: async (ctx) => {
    // Additional security checks
    if (!ctx.channel.name.includes('admin')) {
      await ctx.error('❌ This command can only be used in admin channels.');
      return false;
    }
    
    // Log access attempt
    const auditChannel = bot.client.channels.cache.get('AUDIT_CHANNEL_ID');
    if (auditChannel) {
      await auditChannel.send(`🔒 ${ctx.user.tag} accessed sensitive command in ${ctx.channel.name}`);
    }
    
    return true;
  },
  
  // After middleware for this specific command
  after: async (ctx) => {
    // Send confirmation to audit channel
    const auditChannel = bot.client.channels.cache.get('AUDIT_CHANNEL_ID');
    if (auditChannel) {
      await auditChannel.send(`✅ Sensitive operation completed by ${ctx.user.tag}`);
    }
  },
  
  // Error handler for this specific command
  onError: async (error, ctx) => {
    console.error('Sensitive command error:', error);
    await ctx.error('❌ Sensitive operation failed. Incident has been logged.');
    
    // Alert administrators
    const alertChannel = bot.client.channels.cache.get('ALERT_CHANNEL_ID');
    if (alertChannel) {
      await alertChannel.send(`🚨 Sensitive command failed for ${ctx.user.tag}: ${error.message}`);
    }
  }
});
```

## Event Middleware

### Global Event Hooks

```javascript
// Before event middleware
bot.beforeEvent(async (eventName, ctx, ...args) => {
  // Log all events (be careful with spam)
  if (!eventName.includes('typing') && !eventName.includes('presence')) {
    console.log(`Event: ${eventName} in ${ctx.guild?.name || 'DM'}`);
  }
  
  // Block events during maintenance
  if (process.env.MAINTENANCE_MODE === 'true' && eventName !== 'ready') {
    return false; // Block event processing
  }
  
  return true; // Allow event processing
});

// Global event handler for all events
bot.onAllEvents(async (eventName, ctx, ...args) => {
  // Custom event analytics
  const analytics = require('./utils/analytics');
  await analytics.trackEvent(eventName, {
    guild: ctx.guild?.id,
    user: ctx.user?.id,
    timestamp: Date.now()
  });
});
```

### Event-Specific Middleware

```javascript
// Message middleware
bot.on('messageCreate', async (ctx) => {
  // Skip bots
  if (ctx.raw.author.bot) return;
  
  // Auto-moderation
  const automod = require('./utils/automod');
  const result = await automod.checkMessage(ctx.raw);
  
  if (result.shouldDelete) {
    await ctx.raw.delete();
    await ctx.user.send(`Your message was deleted: ${result.reason}`);
    return; // Stop processing
  }
  
  // XP for messages
  if (ctx.guild) {
    const xp = Math.floor(Math.random() * 5) + 1; // 1-5 XP
    await addUserXP(ctx.user.id, ctx.guild.id, xp);
  }
  
  // Continue with normal message processing
}, {
  // Event-specific options
  priority: 1, // Higher priority = runs first
  once: false
});
```

## Custom Middleware Chains

### Middleware Manager

```javascript
class MiddlewareManager {
  constructor() {
    this.middlewares = [];
  }
  
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }
  
  async execute(ctx, next) {
    let index = 0;
    
    const dispatch = async (i) => {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;
      
      let fn = this.middlewares[i];
      if (i === this.middlewares.length) fn = next;
      if (!fn) return;
      
      try {
        return await fn(ctx, () => dispatch(i + 1));
      } catch (error) {
        return Promise.reject(error);
      }
    };
    
    return dispatch(0);
  }
}

// Usage
const commandMiddleware = new MiddlewareManager();

// Add middleware layers
commandMiddleware
  .use(async (ctx, next) => {
    // Authentication middleware
    if (ctx.user.bot) return; // Skip bots
    await next();
  })
  .use(async (ctx, next) => {
    // Logging middleware
    console.log(`Command: ${ctx.command} by ${ctx.user.tag}`);
    const start = Date.now();
    await next();
    console.log(`Command completed in ${Date.now() - start}ms`);
  })
  .use(async (ctx, next) => {
    // Rate limiting middleware
    const rateLimit = require('./utils/rateLimit');
    if (!rateLimit.check(ctx.user.id, ctx.command, 5, 60000)) {
      throw new Error('Rate limited');
    }
    await next();
  });

// Apply middleware to command execution
bot.beforeCommand(async (cmd, ctx) => {
  try {
    await commandMiddleware.execute({ ...ctx, command: cmd.name }, async () => {
      // This runs after all middleware
      return true;
    });
    return true;
  } catch (error) {
    if (error.message === 'Rate limited') {
      await ctx.error('⏳ Please slow down!');
    } else {
      console.error('Middleware error:', error);
      await ctx.error('❌ Command processing failed.');
    }
    return false;
  }
});
```

## Plugin Hooks

### Plugin Middleware System

```javascript
class PluginWithMiddleware extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    this.name = 'middleware-plugin';
    this.version = '1.0.0';
  }
  
  async onLoad() {
    // Register plugin-specific middleware
    this.bot.beforeCommand(this.beforeCommandHook.bind(this));
    this.bot.afterCommand(this.afterCommandHook.bind(this));
    
    // Register event middleware
    this.bot.beforeEvent(this.beforeEventHook.bind(this));
  }
  
  async beforeCommandHook(cmd, ctx) {
    // Plugin-specific command preprocessing
    if (cmd.category === 'music') {
      // Check if user is in voice channel
      if (!ctx.member.voice.channel) {
        await ctx.error('❌ You must be in a voice channel to use music commands.');
        return false;
      }
    }
    
    return true;
  }
  
  async afterCommandHook(cmd, ctx) {
    // Plugin-specific command postprocessing
    if (cmd.category === 'economy') {
      // Update economy statistics
      await this.updateEconomyStats(ctx.user.id, cmd.name);
    }
  }
  
  async beforeEventHook(eventName, ctx, ...args) {
    // Plugin-specific event preprocessing
    if (eventName === 'messageCreate' && this.config.get('autoResponse', false)) {
      await this.handleAutoResponse(ctx);
    }
    
    return true;
  }
}
```

## Advanced Middleware Patterns

### Conditional Middleware

```javascript
// Middleware that only applies to certain commands
bot.beforeCommand(async (cmd, ctx) => {
  // Only apply to moderation commands
  if (cmd.category !== 'moderation') return true;
  
  // Check if user has moderation role
  const modRole = ctx.guild.roles.cache.find(role => role.name === 'Moderator');
  if (!modRole || !ctx.member.roles.cache.has(modRole.id)) {
    await ctx.error('❌ You need the Moderator role to use this command.');
    return false;
  }
  
  // Log moderation action
  const logChannel = ctx.guild.channels.cache.find(ch => ch.name === 'mod-log');
  if (logChannel) {
    await logChannel.send(`🛡️ ${ctx.user.tag} used ${cmd.name} command`);
  }
  
  return true;
});
```

### Async Middleware Chain

```javascript
class AsyncMiddlewareChain {
  constructor() {
    this.middlewares = [];
  }
  
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }
  
  async run(ctx) {
    for (const middleware of this.middlewares) {
      try {
        const result = await middleware(ctx);
        if (result === false) {
          return false; // Stop chain
        }
      } catch (error) {
        console.error('Middleware error:', error);
        return false;
      }
    }
    return true;
  }
}

const authChain = new AsyncMiddlewareChain()
  .use(async (ctx) => {
    // Check if user is banned
    const banned = await checkUserBan(ctx.user.id);
    if (banned) {
      await ctx.error('❌ You are banned from using this bot.');
      return false;
    }
    return true;
  })
  .use(async (ctx) => {
    // Check if guild is blacklisted
    const blacklisted = await checkGuildBlacklist(ctx.guild?.id);
    if (blacklisted) {
      return false; // Silently ignore
    }
    return true;
  })
  .use(async (ctx) => {
    // Update user activity
    await updateUserActivity(ctx.user.id);
    return true;
  });

bot.beforeCommand(async (cmd, ctx) => {
  return await authChain.run(ctx);
});
```

### Context Enhancement Middleware

```javascript
// Middleware that enhances the context object
bot.beforeCommand(async (cmd, ctx) => {
  // Add database helpers to context
  ctx.db = {
    getUser: (id) => getUserData(id || ctx.user.id),
    getGuild: (id) => getGuildData(id || ctx.guild?.id),
    setUser: (id, data) => setUserData(id || ctx.user.id, data),
    setGuild: (id, data) => setGuildData(id || ctx.guild?.id, data)
  };
  
  // Add permission helpers
  ctx.hasRole = (roleName) => {
    if (!ctx.guild || !ctx.member) return false;
    return ctx.member.roles.cache.some(role => role.name === roleName);
  };
  
  ctx.isOwner = () => ctx.user.id === process.env.BOT_OWNER_ID;
  ctx.isMod = () => ctx.member?.permissions.has('MANAGE_MESSAGES') || ctx.hasRole('Moderator');
  ctx.isAdmin = () => ctx.member?.permissions.has('ADMINISTRATOR') || ctx.hasRole('Admin');
  
  // Add utility functions
  ctx.randomChoice = (array) => array[Math.floor(Math.random() * array.length)];
  ctx.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  return true;
});

// Now commands can use enhanced context
bot.command('profile', async (ctx) => {
  const userData = await ctx.db.getUser(); // Uses enhanced context
  
  if (ctx.isMod()) { // Uses enhanced context
    // Show additional mod info
  }
  
  await ctx.reply(`Profile for ${userData.username}`);
});
```

## Performance Monitoring Middleware

### Execution Time Tracking

```javascript
const performanceTracker = new Map();

bot.beforeCommand(async (cmd, ctx) => {
  // Start timing
  ctx._startTime = process.hrtime.bigint();
  return true;
});

bot.afterCommand(async (cmd, ctx) => {
  // Calculate execution time
  const endTime = process.hrtime.bigint();
  const executionTime = Number(endTime - ctx._startTime) / 1000000; // Convert to milliseconds
  
  // Track performance
  if (!performanceTracker.has(cmd.name)) {
    performanceTracker.set(cmd.name, {
      totalTime: 0,
      executions: 0,
      maxTime: 0,
      minTime: Infinity
    });
  }
  
  const stats = performanceTracker.get(cmd.name);
  stats.totalTime += executionTime;
  stats.executions++;
  stats.maxTime = Math.max(stats.maxTime, executionTime);
  stats.minTime = Math.min(stats.minTime, executionTime);
  
  // Log slow commands
  if (executionTime > 1000) { // Slower than 1 second
    console.warn(`Slow command: ${cmd.name} took ${executionTime.toFixed(2)}ms`);
  }
});

// Performance report command
bot.command('performance', async (ctx) => {
  const stats = Array.from(performanceTracker.entries())
    .map(([name, data]) => ({
      name,
      avgTime: (data.totalTime / data.executions).toFixed(2),
      maxTime: data.maxTime.toFixed(2),
      minTime: data.minTime.toFixed(2),
      executions: data.executions
    }))
    .sort((a, b) => parseFloat(b.avgTime) - parseFloat(a.avgTime));
  
  const embed = ctx.embed()
    .title('⚡ Performance Statistics')
    .desc(stats.slice(0, 10).map(s => 
      `**${s.name}**: ${s.avgTime}ms avg (${s.executions} uses)`
    ).join('\n'))
    .color('blue');
  
  await embed.send();
});
```

## Best Practices

1. **Keep middleware lightweight**
   ```javascript
   // Good - fast check
   bot.beforeCommand(async (cmd, ctx) => {
     if (ctx.user.bot) return false;
     return true;
   });
   
   // Avoid - heavy database operations
   bot.beforeCommand(async (cmd, ctx) => {
     const userData = await heavyDatabaseQuery(ctx.user.id);
     // ... complex processing
   });
   ```

2. **Handle middleware errors gracefully**
   ```javascript
   bot.beforeCommand(async (cmd, ctx) => {
     try {
       await middlewareOperation();
       return true;
     } catch (error) {
       console.error('Middleware error:', error);
       return true; // Don't block command execution
     }
   });
   ```

3. **Use return values to control flow**
   ```javascript
   bot.beforeCommand(async (cmd, ctx) => {
     if (shouldBlockCommand) {
       await ctx.error('Command blocked');
       return false; // Block execution
     }
     return true; // Allow execution
   });
   ```

4. **Order middleware by priority**
   ```javascript
   // Authentication first
   bot.beforeCommand(authMiddleware);
   // Then rate limiting
   bot.beforeCommand(rateLimitMiddleware);
   // Finally logging
   bot.beforeCommand(loggingMiddleware);
   ```

5. **Avoid modifying the original context destructively**
   ```javascript
   // Good - add properties
   ctx.helpers = { ... };
   
   // Avoid - overwriting existing properties
   ctx.user = modifiedUser;
   ```

6. **Clean up resources in after middleware**
   ```javascript
   bot.afterCommand(async (cmd, ctx) => {
     // Clean up temporary files
     if (ctx._tempFiles) {
       for (const file of ctx._tempFiles) {
         await fs.unlink(file).catch(() => {});
       }
     }
   });
   ```##
 Next Steps

Implement powerful middleware systems:

1. 🚦 [Rate Limiting](../utilities/rate-limiting.md) - Add rate limiting middleware
2. 🛡️ [Error Handling](./error-handling.md) - Create error handling middleware
3. 🔧 [Bot Class API](../api/bot.md) - Integrate middleware with bot lifecycle
4. 📊 [Advanced Use Cases](../examples/advanced.md) - Build complex middleware chains






