# Best Practices

This guide covers best practices for developing, deploying, and maintaining Discord bots with @axrxvm/betterdiscordjs.

## Development Best Practices

### Code Organization

#### Project Structure

```
your-bot/
├── commands/
│   ├── general/
│   ├── moderation/
│   └── fun/
├── events/
├── plugins/
├── utils/
├── config/
├── database/
├── tests/
├── docs/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

#### Modular Design

```javascript
// Good: Modular command structure
// commands/general/ping.js
module.exports = {
  name: 'ping',
  description: 'Check bot latency',
  cooldown: '3s',
  async execute(ctx) {
    const start = Date.now();
    const msg = await ctx.reply('🏓 Pinging...');
    const latency = Date.now() - start;
    
    await msg.edit(`🏓 Pong! Latency: ${latency}ms | API: ${ctx.bot.client.ws.ping}ms`);
  }
};

// Bad: Everything in one file
// index.js with 1000+ lines of commands
```

### Error Handling

#### Comprehensive Error Handling

```javascript
// Good: Proper error handling
bot.command('weather', async (ctx) => {
  try {
    const location = ctx.args.join(' ');
    
    if (!location) {
      return ctx.error('❌ Please provide a location!');
    }
    
    const weather = await fetchWeather(location);
    await ctx.reply(`Weather in ${location}: ${weather.description}`);
    
  } catch (error) {
    console.error('Weather command error:', error);
    
    if (error.code === 'LOCATION_NOT_FOUND') {
      await ctx.error('❌ Location not found. Please check the spelling.');
    } else if (error.code === 'API_LIMIT_EXCEEDED') {
      await ctx.error('⏳ Weather service is temporarily unavailable.');
    } else {
      await ctx.error('❌ Failed to get weather information.');
    }
  }
});

// Bad: No error handling
bot.command('weather', async (ctx) => {
  const weather = await fetchWeather(ctx.args.join(' ')); // Can throw
  await ctx.reply(`Weather: ${weather.description}`);
});
```

#### Global Error Handlers

```javascript
// Set up global error handlers
bot.onCommandError(async (error, cmd, ctx) => {
  console.error(`Command ${cmd.name} failed:`, error);
  
  // Log to external service
  if (process.env.NODE_ENV === 'production') {
    await logError(error, { command: cmd.name, user: ctx.user.id });
  }
  
  // User-friendly error message
  if (!ctx.replied) {
    await ctx.error('❌ Something went wrong. Please try again later.');
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

### Input Validation

#### Validate All User Input

```javascript
// Good: Input validation
bot.command('ban', async (ctx) => {
  const target = ctx.getMember('user');
  const reason = ctx.getOption('reason') || 'No reason provided';
  
  // Validate target
  if (!target) {
    return ctx.error('❌ User not found in this server!');
  }
  
  if (target.id === ctx.user.id) {
    return ctx.error('❌ You cannot ban yourself!');
  }
  
  if (target.roles.highest.position >= ctx.member.roles.highest.position) {
    return ctx.error('❌ You cannot ban someone with equal or higher roles!');
  }
  
  // Validate reason length
  if (reason.length > 512) {
    return ctx.error('❌ Reason must be less than 512 characters!');
  }
  
  // Sanitize reason
  const sanitizedReason = reason.replace(/[<>@]/g, '');
  
  try {
    await target.ban({ reason: sanitizedReason });
    await ctx.success(`✅ Banned ${target.user.tag}`);
  } catch (error) {
    await ctx.error('❌ Failed to ban user!');
  }
});
```

#### Input Sanitization

```javascript
// Utility function for input sanitization
function sanitizeInput(input, options = {}) {
  const {
    maxLength = 2000,
    allowMarkdown = false,
    allowMentions = false,
    allowLinks = false
  } = options;
  
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  let sanitized = input.slice(0, maxLength).trim();
  
  if (!allowMarkdown) {
    sanitized = sanitized.replace(/[*_`~|]/g, '\\$&');
  }
  
  if (!allowMentions) {
    sanitized = sanitized.replace(/<@[!&]?\d+>/g, '[mention]');
  }
  
  if (!allowLinks) {
    sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[link]');
  }
  
  return sanitized;
}
```

### Performance Optimization

#### Database Optimization

```javascript
// Good: Efficient database queries
class UserService {
  constructor(db) {
    this.db = db;
    this.cache = new Map();
  }
  
  async getUser(userId) {
    // Check cache first
    if (this.cache.has(userId)) {
      const cached = this.cache.get(userId);
      if (Date.now() - cached.timestamp < 300000) { // 5 minutes
        return cached.data;
      }
    }
    
    // Query database
    const user = await this.db.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    // Cache result
    this.cache.set(userId, {
      data: user,
      timestamp: Date.now()
    });
    
    return user;
  }
  
  async updateUser(userId, data) {
    // Update database
    await this.db.query(
      'UPDATE users SET data = $2, updated_at = NOW() WHERE id = $1',
      [userId, JSON.stringify(data)]
    );
    
    // Invalidate cache
    this.cache.delete(userId);
  }
}

// Bad: No caching, inefficient queries
async function getUser(userId) {
  return await db.query('SELECT * FROM users WHERE id = ?', [userId]);
}
```

#### Memory Management

```javascript
// Good: Proper cleanup
class EventManager {
  constructor() {
    this.listeners = new Map();
    this.timers = new Set();
  }
  
  addListener(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
  }
  
  removeListener(event, handler) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(handler);
    }
  }
  
  setTimeout(callback, delay) {
    const timer = setTimeout(() => {
      callback();
      this.timers.delete(timer);
    }, delay);
    
    this.timers.add(timer);
    return timer;
  }
  
  cleanup() {
    // Clear all listeners
    this.listeners.clear();
    
    // Clear all timers
    for (const timer of this.timers) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}
```

## Security Best Practices

### Environment Variables

```javascript
// Good: Use environment variables for sensitive data
const config = {
  token: process.env.DISCORD_TOKEN,
  database: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME
  },
  apiKeys: {
    weather: process.env.WEATHER_API_KEY,
    translate: process.env.TRANSLATE_API_KEY
  }
};

// Bad: Hardcoded secrets
const config = {
  token: 'MTIzNDU2Nzg5MDEyMzQ1Njc4.GhIjKl.MnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWx',
  database: {
    password: 'mypassword123'
  }
};
```

### Permission Validation

```javascript
// Good: Proper permission checks
bot.command('kick', async (ctx) => {
  // Check user permissions
  if (!ctx.member.permissions.has('KICK_MEMBERS')) {
    return ctx.error('❌ You need the "Kick Members" permission!');
  }
  
  // Check bot permissions
  if (!ctx.guild.members.me.permissions.has('KICK_MEMBERS')) {
    return ctx.error('❌ I need the "Kick Members" permission!');
  }
  
  const target = ctx.getMember('user');
  
  // Check role hierarchy
  if (target.roles.highest.position >= ctx.member.roles.highest.position) {
    return ctx.error('❌ You cannot kick someone with equal or higher roles!');
  }
  
  if (target.roles.highest.position >= ctx.guild.members.me.roles.highest.position) {
    return ctx.error('❌ I cannot kick someone with equal or higher roles than me!');
  }
  
  // Proceed with kick
  await target.kick();
});
```

### Rate Limiting

```javascript
// Implement comprehensive rate limiting
class RateLimiter {
  constructor() {
    this.limits = new Map();
    this.globalLimits = new Map();
  }
  
  check(userId, action, limit = 5, window = 60000) {
    const key = `${userId}:${action}`;
    const now = Date.now();
    
    // Check global rate limit
    if (!this.checkGlobal(userId, 50, 60000)) {
      return false;
    }
    
    if (!this.limits.has(key)) {
      this.limits.set(key, []);
    }
    
    const attempts = this.limits.get(key);
    const validAttempts = attempts.filter(time => now - time < window);
    
    if (validAttempts.length >= limit) {
      return false;
    }
    
    validAttempts.push(now);
    this.limits.set(key, validAttempts);
    return true;
  }
  
  checkGlobal(userId, limit, window) {
    const now = Date.now();
    
    if (!this.globalLimits.has(userId)) {
      this.globalLimits.set(userId, []);
    }
    
    const attempts = this.globalLimits.get(userId);
    const validAttempts = attempts.filter(time => now - time < window);
    
    if (validAttempts.length >= limit) {
      return false;
    }
    
    validAttempts.push(now);
    this.globalLimits.set(userId, validAttempts);
    return true;
  }
}
```

## Database Best Practices

### Connection Management

```javascript
// Good: Connection pooling
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Handle connection errors
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});
```

### Query Optimization

```javascript
// Good: Prepared statements and indexing
class DatabaseService {
  constructor(pool) {
    this.pool = pool;
  }
  
  async getUserData(userId) {
    const query = `
      SELECT data, updated_at 
      FROM users 
      WHERE id = $1
    `;
    
    const result = await this.pool.query(query, [userId]);
    return result.rows[0];
  }
  
  async updateUserData(userId, data) {
    const query = `
      INSERT INTO users (id, data, updated_at) 
      VALUES ($1, $2, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET data = $2, updated_at = NOW()
    `;
    
    await this.pool.query(query, [userId, JSON.stringify(data)]);
  }
  
  async getLeaderboard(guildId, limit = 10) {
    const query = `
      SELECT id, data->>'level' as level, data->>'xp' as xp
      FROM users 
      WHERE data->>'guild_${guildId}' IS NOT NULL
      ORDER BY (data->>'xp')::int DESC
      LIMIT $1
    `;
    
    const result = await this.pool.query(query, [limit]);
    return result.rows;
  }
}
```

### Data Validation

```javascript
// Good: Schema validation
const Joi = require('joi');

const userDataSchema = Joi.object({
  level: Joi.number().integer().min(1).max(1000).default(1),
  xp: Joi.number().integer().min(0).default(0),
  balance: Joi.number().integer().min(0).default(0),
  inventory: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required()
  })).default([]),
  settings: Joi.object({
    notifications: Joi.boolean().default(true),
    theme: Joi.string().valid('light', 'dark').default('light')
  }).default({})
});

async function validateAndSaveUserData(userId, data) {
  try {
    const validatedData = await userDataSchema.validateAsync(data);
    await database.updateUserData(userId, validatedData);
    return validatedData;
  } catch (error) {
    throw new Error(`Invalid user data: ${error.message}`);
  }
}
```

## Logging and Monitoring

### Structured Logging

```javascript
// Good: Structured logging with Winston
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'discord-bot',
    version: process.env.npm_package_version 
  },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Console logging for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Usage
logger.info('Bot started', { 
  guilds: bot.client.guilds.cache.size,
  users: bot.client.users.cache.size 
});

logger.error('Command failed', { 
  command: 'weather',
  user: ctx.user.id,
  error: error.message 
});
```

### Health Monitoring

```javascript
// Health check system
class HealthMonitor {
  constructor(bot) {
    this.bot = bot;
    this.metrics = {
      startTime: Date.now(),
      commandsExecuted: 0,
      errorsCount: 0,
      lastError: null
    };
    
    this.setupMonitoring();
  }
  
  setupMonitoring() {
    // Track command executions
    this.bot.afterCommand(() => {
      this.metrics.commandsExecuted++;
    });
    
    // Track errors
    this.bot.onCommandError((error) => {
      this.metrics.errorsCount++;
      this.metrics.lastError = {
        message: error.message,
        timestamp: Date.now()
      };
    });
    
    // Periodic health checks
    setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Every minute
  }
  
  performHealthCheck() {
    const health = this.getHealthStatus();
    
    if (health.status === 'unhealthy') {
      logger.warn('Health check failed', health);
      
      // Alert administrators
      this.sendHealthAlert(health);
    }
  }
  
  getHealthStatus() {
    const uptime = Date.now() - this.metrics.startTime;
    const memoryUsage = process.memoryUsage();
    const errorRate = this.metrics.errorsCount / Math.max(this.metrics.commandsExecuted, 1);
    
    const status = {
      status: 'healthy',
      uptime,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024)
      },
      bot: {
        guilds: this.bot.client.guilds.cache.size,
        users: this.bot.client.users.cache.size,
        ping: this.bot.client.ws.ping
      },
      metrics: {
        commandsExecuted: this.metrics.commandsExecuted,
        errorsCount: this.metrics.errorsCount,
        errorRate: Math.round(errorRate * 100) / 100
      }
    };
    
    // Determine health status
    if (memoryUsage.heapUsed > 1024 * 1024 * 1024) { // 1GB
      status.status = 'unhealthy';
      status.reason = 'High memory usage';
    } else if (errorRate > 0.1) { // 10% error rate
      status.status = 'unhealthy';
      status.reason = 'High error rate';
    } else if (this.bot.client.ws.ping > 1000) {
      status.status = 'degraded';
      status.reason = 'High latency';
    }
    
    return status;
  }
  
  async sendHealthAlert(health) {
    const alertChannel = this.bot.client.channels.cache.get(process.env.ALERT_CHANNEL_ID);
    if (alertChannel) {
      const embed = {
        title: '🚨 Health Alert',
        description: `Bot health status: ${health.status}`,
        fields: [
          { name: 'Reason', value: health.reason || 'Unknown', inline: true },
          { name: 'Memory Usage', value: `${health.memory.used}MB`, inline: true },
          { name: 'Error Rate', value: `${health.metrics.errorRate}%`, inline: true }
        ],
        color: health.status === 'unhealthy' ? 0xff0000 : 0xffaa00,
        timestamp: new Date().toISOString()
      };
      
      await alertChannel.send({ embeds: [embed] });
    }
  }
}
```

## Testing Best Practices

### Unit Testing

```javascript
// Good: Comprehensive unit tests
const { expect } = require('chai');
const sinon = require('sinon');
const TimeParser = require('../utils/time');

describe('Time Parser', () => {
  describe('parse()', () => {
    it('should parse seconds correctly', () => {
      expect(TimeParser.parse('30s')).to.equal(30000);
      expect(TimeParser.parse('1s')).to.equal(1000);
    });
    
    it('should parse minutes correctly', () => {
      expect(TimeParser.parse('5m')).to.equal(300000);
      expect(TimeParser.parse('1m')).to.equal(60000);
    });
    
    it('should handle invalid input', () => {
      expect(TimeParser.parse('invalid')).to.equal(0);
      expect(TimeParser.parse('')).to.equal(0);
      expect(TimeParser.parse(null)).to.equal(0);
    });
    
    it('should handle numbers as milliseconds', () => {
      expect(TimeParser.parse(5000)).to.equal(5000);
      expect(TimeParser.parse('5000')).to.equal(5000);
    });
  });
});
```

### Integration Testing

```javascript
// Integration tests for commands
const { expect } = require('chai');
const { createMockContext } = require('./helpers/mockContext');

describe('Weather Command', () => {
  let weatherCommand;
  let mockCtx;
  
  beforeEach(() => {
    weatherCommand = require('../commands/weather');
    mockCtx = createMockContext();
  });
  
  it('should return weather data for valid location', async () => {
    mockCtx.args = ['London'];
    
    await weatherCommand.execute(mockCtx);
    
    expect(mockCtx.reply.calledOnce).to.be.true;
    expect(mockCtx.reply.firstCall.args[0]).to.include('Weather in London');
  });
  
  it('should handle invalid location', async () => {
    mockCtx.args = ['InvalidLocation123'];
    
    await weatherCommand.execute(mockCtx);
    
    expect(mockCtx.error.calledOnce).to.be.true;
    expect(mockCtx.error.firstCall.args[0]).to.include('Location not found');
  });
  
  it('should handle missing location argument', async () => {
    mockCtx.args = [];
    
    await weatherCommand.execute(mockCtx);
    
    expect(mockCtx.error.calledOnce).to.be.true;
    expect(mockCtx.error.firstCall.args[0]).to.include('provide a location');
  });
});
```

## Deployment Best Practices

### Environment Configuration

```javascript
// Good: Environment-specific configuration
const config = {
  development: {
    logLevel: 'debug',
    database: {
      host: 'localhost',
      port: 5432
    },
    cache: {
      ttl: 300 // 5 minutes
    }
  },
  production: {
    logLevel: 'info',
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      ssl: true
    },
    cache: {
      ttl: 3600 // 1 hour
    }
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];
```

### Graceful Shutdown

```javascript
// Implement graceful shutdown
class GracefulShutdown {
  constructor(bot) {
    this.bot = bot;
    this.isShuttingDown = false;
    this.setupSignalHandlers();
  }
  
  setupSignalHandlers() {
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('SIGUSR2', () => this.shutdown('SIGUSR2')); // Nodemon restart
  }
  
  async shutdown(signal) {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress');
      return;
    }
    
    this.isShuttingDown = true;
    logger.info(`Received ${signal}, starting graceful shutdown...`);
    
    try {
      // Stop accepting new commands
      this.bot.maintenance = true;
      
      // Wait for ongoing operations to complete
      await this.waitForOperations();
      
      // Close database connections
      await this.closeDatabaseConnections();
      
      // Destroy Discord client
      this.bot.client.destroy();
      
      logger.info('Graceful shutdown completed');
      process.exit(0);
      
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
  
  async waitForOperations(timeout = 30000) {
    const start = Date.now();
    
    while (this.bot.activeOperations > 0 && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (this.bot.activeOperations > 0) {
      logger.warn(`Forced shutdown with ${this.bot.activeOperations} operations still active`);
    }
  }
  
  async closeDatabaseConnections() {
    if (this.bot.database) {
      await this.bot.database.close();
    }
    
    if (this.bot.redis) {
      await this.bot.redis.quit();
    }
  }
}
```

## Documentation Best Practices

### Code Documentation

```javascript
/**
 * Weather service for fetching weather data from external APIs
 * @class WeatherService
 */
class WeatherService {
  /**
   * Create a weather service instance
   * @param {string} apiKey - API key for weather service
   * @param {object} options - Configuration options
   * @param {number} options.timeout - Request timeout in milliseconds
   * @param {number} options.retries - Number of retry attempts
   */
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.timeout = options.timeout || 5000;
    this.retries = options.retries || 3;
  }
  
  /**
   * Get current weather for a location
   * @param {string} location - Location name or coordinates
   * @returns {Promise<WeatherData>} Weather information
   * @throws {WeatherError} When location is not found or API fails
   * 
   * @example
   * const weather = await weatherService.getCurrentWeather('London');
   * console.log(`Temperature: ${weather.temperature}°C`);
   */
  async getCurrentWeather(location) {
    // Implementation
  }
}

/**
 * @typedef {object} WeatherData
 * @property {string} location - Location name
 * @property {number} temperature - Temperature in Celsius
 * @property {string} description - Weather description
 * @property {number} humidity - Humidity percentage
 * @property {number} windSpeed - Wind speed in km/h
 */
```

### README Documentation

```markdown
# Your Bot Name

Brief description of what your bot does.

## Features

- ✅ Modular command system
- ✅ Plugin support
- ✅ Database integration
- ✅ Rate limiting
- ✅ Comprehensive error handling

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Run the bot: `npm start`

## Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Bot token from Discord Developer Portal | Yes |
| `CLIENT_ID` | Bot client ID | Yes |
| `DATABASE_URL` | Database connection string | No |

## Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `!ping` | Check bot latency | `!ping` |
| `!help` | Show help message | `!help [command]` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
```

These best practices will help you create maintainable, secure, and scalable Discord bots with @axrxvm/betterdiscordjs. Remember to adapt these practices to your specific use case and requirements.## 
Next Steps

Apply these best practices to your bot:

1. 🚀 [Deployment Guide](./deployment.md) - Deploy your bot to production
2. 🔧 [Bot Class API](../api/bot.md) - Implement advanced bot features
3. 📊 [Advanced Use Cases](../examples/advanced.md) - Scale your bot architecture
4. 🔌 [Plugin System](../plugins/overview.md) - Build modular, maintainable bots






