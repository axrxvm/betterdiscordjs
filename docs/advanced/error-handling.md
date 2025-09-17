# Error Handling

Proper error handling is crucial for creating robust Discord bots. @axrxvm/betterdiscordjs provides multiple layers of error handling to help you manage and respond to errors gracefully.

## Overview

@axrxvm/betterdiscordjs offers several error handling mechanisms:
- Global error handlers
- Command-specific error handlers
- Try-catch blocks
- Error middleware
- Automatic error reporting

## Global Error Handlers

### Bot-Level Error Handling

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');
const bot = new Bot(process.env.DISCORD_TOKEN);

// Global command error handler
bot.onCommandError(async (error, cmd, ctx) => {
  console.error(`Command ${cmd.name} failed:`, error);
  
  // Send user-friendly error message
  if (!ctx.replied) {
    await ctx.error('❌ Something went wrong while executing this command.');
  }
  
  // Log to error channel
  const errorChannel = bot.client.channels.cache.get('ERROR_LOG_CHANNEL_ID');
  if (errorChannel) {
    const embed = ctx.embed()
      .title('🚨 Command Error')
      .field('Command', cmd.name)
      .field('User', ctx.user.tag)
      .field('Guild', ctx.guild?.name || 'DM')
      .field('Error', error.message)
      .field('Stack', `\`\`\`${error.stack.slice(0, 1000)}\`\`\``)
      .color('red')
      .timestamp();
    
    await errorChannel.send({ embeds: [embed.embed] });
  }
});

// Global error handler for all bot errors
bot.onError((error, cmd, ctx) => {
  console.error('Bot error:', error);
  
  // Critical error handling
  if (error.code === 'ENOTFOUND') {
    console.error('Network connectivity issue detected');
  } else if (error.code === 50013) {
    console.error('Missing permissions error');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Graceful shutdown
  bot.stop().then(() => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

### Event Error Handling

```javascript
// Global event error handler
bot.onAllEvents(async (eventName, ctx, ...args) => {
  try {
    // Event processing logic
  } catch (error) {
    console.error(`Event ${eventName} error:`, error);
    
    // Don't let event errors crash the bot
    const logger = require('./utils/logger');
    logger.error(`Event handler failed for ${eventName}: ${error.message}`);
  }
});
```

## Command-Specific Error Handling

### Per-Command Error Handlers

```javascript
bot.command('risky', async (ctx) => {
  // This might fail
  const data = await fetchExternalAPI();
  await ctx.reply(`Data: ${data}`);
}, {
  description: 'A command that might fail',
  onError: async (error, ctx) => {
    if (error.code === 'ENOTFOUND') {
      await ctx.error('🌐 Unable to connect to external service. Please try again later.');
    } else if (error.code === 'TIMEOUT') {
      await ctx.error('⏱️ Request timed out. The service might be slow.');
    } else {
      await ctx.error('❌ An unexpected error occurred.');
    }
    
    // Log the actual error for debugging
    console.error('Risky command error:', error);
  }
});
```

### Try-Catch in Commands

```javascript
bot.command('database', async (ctx) => {
  try {
    const db = require('./utils/db');
    const userData = await db.getUserData(ctx.user.id);
    
    if (!userData) {
      return ctx.error('❌ No data found for your account.');
    }
    
    const embed = ctx.embed()
      .title('📊 Your Data')
      .field('Level', userData.level.toString())
      .field('XP', userData.xp.toString())
      .color('blue');
    
    await embed.send();
    
  } catch (error) {
    console.error('Database command error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      await ctx.error('🗄️ Database is currently unavailable. Please try again later.');
    } else if (error.name === 'ValidationError') {
      await ctx.error('❌ Invalid data format. Please contact support.');
    } else {
      await ctx.error('❌ Failed to retrieve your data. Please try again.');
    }
  }
});
```

## Error Types and Handling

### Discord API Errors

```javascript
bot.command('ban', async (ctx) => {
  const member = ctx.getMember('user');
  const reason = ctx.getOption('reason') || 'No reason provided';
  
  try {
    await member.ban({ reason });
    await ctx.success(`✅ Banned ${member.user.tag}`);
    
  } catch (error) {
    switch (error.code) {
      case 50013: // Missing Permissions
        await ctx.error('❌ I don\'t have permission to ban this user.');
        break;
      case 50035: // Invalid Form Body
        await ctx.error('❌ Invalid ban reason provided.');
        break;
      case 10007: // Unknown Member
        await ctx.error('❌ User not found in this server.');
        break;
      case 50001: // Missing Access
        await ctx.error('❌ I cannot ban this user (they might have higher permissions).');
        break;
      default:
        console.error('Ban command error:', error);
        await ctx.error('❌ Failed to ban user. Please try again.');
    }
  }
});
```

### Network and External API Errors

```javascript
bot.command('weather', async (ctx) => {
  const location = ctx.args.join(' ');
  
  try {
    const response = await fetch(`https://api.weather.com/v1/current?location=${location}`, {
      timeout: 5000 // 5 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const embed = ctx.embed()
      .title(`🌤️ Weather for ${data.location}`)
      .field('Temperature', `${data.temp}°C`)
      .field('Condition', data.condition)
      .color('blue');
    
    await embed.send();
    
  } catch (error) {
    console.error('Weather API error:', error);
    
    if (error.name === 'AbortError' || error.code === 'TIMEOUT') {
      await ctx.error('⏱️ Weather service is taking too long to respond. Please try again.');
    } else if (error.message.includes('404')) {
      await ctx.error('🗺️ Location not found. Please check the spelling.');
    } else if (error.message.includes('401')) {
      await ctx.error('🔑 Weather service authentication failed. Please contact support.');
    } else if (error.code === 'ENOTFOUND') {
      await ctx.error('🌐 Unable to connect to weather service. Please try again later.');
    } else {
      await ctx.error('❌ Failed to get weather data. Please try again.');
    }
  }
});
```

### Validation Errors

```javascript
bot.command('setage', async (ctx) => {
  const age = ctx.getOption('age');
  
  try {
    // Validation
    if (!age || isNaN(age)) {
      throw new ValidationError('Age must be a valid number');
    }
    
    if (age < 13 || age > 120) {
      throw new ValidationError('Age must be between 13 and 120');
    }
    
    // Save age
    const db = require('./utils/db');
    await db.setUserConfig(ctx.user.id, 'age', parseInt(age));
    
    await ctx.success(`✅ Age set to ${age}`);
    
  } catch (error) {
    if (error instanceof ValidationError) {
      await ctx.error(`❌ ${error.message}`);
    } else {
      console.error('Set age error:', error);
      await ctx.error('❌ Failed to save age. Please try again.');
    }
  }
});

// Custom error class
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

## Error Middleware

### Pre-Command Error Prevention

```javascript
bot.beforeCommand(async (cmd, ctx) => {
  try {
    // Check if bot has required permissions
    if (cmd.botPermissions) {
      const botMember = ctx.guild.members.cache.get(bot.client.user.id);
      if (!botMember.permissions.has(cmd.botPermissions)) {
        await ctx.error(`❌ I need the following permissions: ${cmd.botPermissions.join(', ')}`);
        return false; // Block command execution
      }
    }
    
    // Check if user has required permissions
    if (cmd.userPermissions) {
      if (!ctx.member.permissions.has(cmd.userPermissions)) {
        await ctx.error(`❌ You need the following permissions: ${cmd.userPermissions.join(', ')}`);
        return false;
      }
    }
    
    // Check if command is available in current context
    if (cmd.guildOnly && !ctx.guild) {
      await ctx.error('❌ This command can only be used in servers.');
      return false;
    }
    
    return true; // Allow command execution
    
  } catch (error) {
    console.error('Pre-command check error:', error);
    await ctx.error('❌ Failed to validate command requirements.');
    return false;
  }
});
```

### Post-Command Cleanup

```javascript
bot.afterCommand(async (cmd, ctx) => {
  try {
    // Log command usage
    const logger = require('./utils/logger');
    logger.info(`Command ${cmd.name} executed by ${ctx.user.tag} in ${ctx.guild?.name || 'DM'}`);
    
    // Update command statistics
    const stats = require('./utils/stats');
    await stats.incrementCommandUsage(cmd.name);
    
  } catch (error) {
    // Don't let logging errors affect the user
    console.error('Post-command error:', error);
  }
});
```

## Error Recovery Strategies

### Retry Mechanisms

```javascript
async function withRetry(operation, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error; // Final attempt failed
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
}

bot.command('retry', async (ctx) => {
  try {
    const result = await withRetry(async () => {
      // Operation that might fail
      return await unreliableAPICall();
    });
    
    await ctx.success(`✅ Operation succeeded: ${result}`);
    
  } catch (error) {
    console.error('All retry attempts failed:', error);
    await ctx.error('❌ Operation failed after multiple attempts. Please try again later.');
  }
});
```

### Graceful Degradation

```javascript
bot.command('profile', async (ctx) => {
  const userId = ctx.user.id;
  let userData = {};
  
  try {
    // Try to get data from primary database
    userData = await primaryDB.getUserData(userId);
  } catch (error) {
    console.error('Primary DB error:', error);
    
    try {
      // Fallback to cache
      userData = await cache.getUserData(userId);
      await ctx.warn('⚠️ Using cached data (some information might be outdated).');
    } catch (cacheError) {
      console.error('Cache error:', cacheError);
      
      // Final fallback to basic Discord data
      userData = {
        username: ctx.user.username,
        joinedAt: ctx.member?.joinedAt || 'Unknown',
        level: 1,
        xp: 0
      };
      await ctx.warn('⚠️ Using basic profile data (database unavailable).');
    }
  }
  
  const embed = ctx.embed()
    .title(`👤 Profile: ${userData.username}`)
    .field('Level', userData.level.toString())
    .field('XP', userData.xp.toString())
    .field('Joined', userData.joinedAt.toString())
    .color('blue');
  
  await embed.send();
});
```

## Error Monitoring and Reporting

### Error Analytics

```javascript
class ErrorTracker {
  constructor() {
    this.errors = new Map();
    this.startTime = Date.now();
  }
  
  track(error, context = {}) {
    const key = `${error.name}:${error.message}`;
    
    if (!this.errors.has(key)) {
      this.errors.set(key, {
        count: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        contexts: []
      });
    }
    
    const errorData = this.errors.get(key);
    errorData.count++;
    errorData.lastSeen = Date.now();
    errorData.contexts.push({
      timestamp: Date.now(),
      ...context
    });
    
    // Keep only last 10 contexts
    if (errorData.contexts.length > 10) {
      errorData.contexts = errorData.contexts.slice(-10);
    }
  }
  
  getReport() {
    const uptime = Date.now() - this.startTime;
    const errors = Array.from(this.errors.entries())
      .map(([key, data]) => ({ key, ...data }))
      .sort((a, b) => b.count - a.count);
    
    return {
      uptime,
      totalErrors: errors.reduce((sum, e) => sum + e.count, 0),
      uniqueErrors: errors.length,
      topErrors: errors.slice(0, 5)
    };
  }
}

const errorTracker = new ErrorTracker();

bot.onCommandError(async (error, cmd, ctx) => {
  // Track the error
  errorTracker.track(error, {
    command: cmd.name,
    user: ctx.user.id,
    guild: ctx.guild?.id
  });
  
  // Handle the error...
});

// Error report command
bot.command('errors', async (ctx) => {
  const report = errorTracker.getReport();
  
  const embed = ctx.embed()
    .title('📊 Error Report')
    .field('Uptime', `${Math.floor(report.uptime / 1000 / 60)} minutes`)
    .field('Total Errors', report.totalErrors.toString())
    .field('Unique Errors', report.uniqueErrors.toString())
    .color('orange');
  
  if (report.topErrors.length > 0) {
    embed.field('Top Errors', 
      report.topErrors.map(e => `${e.key}: ${e.count} times`).join('\n')
    );
  }
  
  await embed.send();
});
```

### Health Checks

```javascript
bot.command('health', async (ctx) => {
  const health = {
    bot: '✅ Online',
    database: '❓ Checking...',
    api: '❓ Checking...',
    memory: '❓ Checking...'
  };
  
  const embed = ctx.embed()
    .title('🏥 Health Check')
    .desc('Checking system status...')
    .color('yellow');
  
  const msg = await ctx.reply({ embeds: [embed.embed] });
  
  // Check database
  try {
    const db = require('./utils/db');
    await db.ping();
    health.database = '✅ Connected';
  } catch (error) {
    health.database = '❌ Disconnected';
  }
  
  // Check external API
  try {
    const response = await fetch('https://api.example.com/health', { timeout: 5000 });
    health.api = response.ok ? '✅ Available' : '❌ Unavailable';
  } catch (error) {
    health.api = '❌ Unavailable';
  }
  
  // Check memory usage
  const memUsage = process.memoryUsage();
  const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  health.memory = memUsedMB > 500 ? `⚠️ ${memUsedMB}MB (High)` : `✅ ${memUsedMB}MB`;
  
  const updatedEmbed = ctx.embed()
    .title('🏥 Health Check')
    .field('Bot Status', health.bot)
    .field('Database', health.database)
    .field('External API', health.api)
    .field('Memory Usage', health.memory)
    .color('green')
    .timestamp();
  
  await msg.edit({ embeds: [updatedEmbed.embed] });
});
```

## Best Practices

1. **Always handle errors gracefully**
   ```javascript
   try {
     await riskyOperation();
   } catch (error) {
     console.error('Operation failed:', error);
     await ctx.error('Something went wrong. Please try again.');
   }
   ```

2. **Provide meaningful error messages to users**
   ```javascript
   // Good
   await ctx.error('❌ User not found. Please check the username and try again.');
   
   // Less helpful
   await ctx.error('Error occurred.');
   ```

3. **Log errors for debugging**
   ```javascript
   console.error('Detailed error for developers:', error.stack);
   await ctx.error('User-friendly message');
   ```

4. **Don't expose sensitive information**
   ```javascript
   // Bad
   await ctx.error(`Database error: ${error.message}`);
   
   // Good
   console.error('Database error:', error);
   await ctx.error('Database temporarily unavailable.');
   ```

5. **Implement fallback mechanisms**
   ```javascript
   try {
     return await primaryMethod();
   } catch (error) {
     console.warn('Primary method failed, using fallback');
     return await fallbackMethod();
   }
   ```

6. **Set timeouts for external operations**
   ```javascript
   const controller = new AbortController();
   setTimeout(() => controller.abort(), 5000);
   
   try {
     const response = await fetch(url, { signal: controller.signal });
   } catch (error) {
     if (error.name === 'AbortError') {
       await ctx.error('Request timed out.');
     }
   }
   ```

7. **Monitor error patterns**
   - Track error frequency
   - Identify common failure points
   - Set up alerts for critical errors#
# Next Steps

Build robust, error-resistant bots:

1. 📝 [Logger](../utilities/logger.md) - Implement comprehensive error logging
2. 🔧 [Middleware & Hooks](./middleware.md) - Add global error handling
3. 📋 [Best Practices](../deployment/best-practices.md) - Follow error handling guidelines
4. 🚀 [Deployment Guide](../deployment/deployment.md) - Deploy with proper error monitoring






