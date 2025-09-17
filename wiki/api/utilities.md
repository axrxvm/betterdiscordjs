# Utilities API

The utilities API provides helper functions and classes for common bot operations like logging, time parsing, caching, and more.

## Logger

### logger.info(message)

Log an informational message.

**Parameters:**
- `message` (string) - Message to log

**Example:**
```javascript
const { logger } = require('@axrxvm/betterdiscordjs');
logger.info('Bot started successfully');
```

### logger.warn(message)

Log a warning message.

**Parameters:**
- `message` (string) - Warning message

### logger.error(message)

Log an error message.

**Parameters:**
- `message` (string) - Error message

## Time Parser

### time.parse(timeString)

Parse a time string into milliseconds.

**Parameters:**
- `timeString` (string|number) - Time string (e.g., '5m', '1h') or milliseconds

**Returns:** `number` - Time in milliseconds

**Supported Units:**
- `s` - Seconds
- `m` - Minutes  
- `h` - Hours
- `d` - Days

**Example:**
```javascript
const { time } = require('@axrxvm/betterdiscordjs');

console.log(time.parse('30s'));    // 30000
console.log(time.parse('5m'));     // 300000
console.log(time.parse('2h'));     // 7200000
console.log(time.parse('1d'));     // 86400000
```

## Rate Limiter

### rateLimit.check(userId, key, max, windowMs)

Check if a user is rate-limited for a specific action.

**Parameters:**
- `userId` (string) - User ID
- `key` (string) - Action identifier
- `max` (number, optional) - Maximum actions allowed (default: 5)
- `windowMs` (number, optional) - Time window in milliseconds (default: 5000)

**Returns:** `boolean` - True if allowed, false if rate-limited

**Example:**
```javascript
const rateLimit = require('./utils/rateLimit');

if (!rateLimit.check(ctx.user.id, 'search', 3, 30000)) {
  return ctx.error('⏳ Please wait before searching again.');
}
```

## Scheduler

### scheduler.every(interval, function)

Schedule a recurring task.

**Parameters:**
- `interval` (string|number) - Interval between executions
- `function` (Function) - Function to execute

**Returns:** `number` - Interval ID

**Example:**
```javascript
const scheduler = require('./utils/scheduler');

// Every 5 minutes
scheduler.every('5m', () => {
  console.log('Periodic task executed');
});

// Every 30 seconds
scheduler.every(30000, () => {
  updateStats();
});
```

### scheduler.cron(expression, function)

Schedule a task using cron expression.

**Parameters:**
- `expression` (string) - Cron expression
- `function` (Function) - Function to execute

**Returns:** `object` - Cron job object

**Example:**
```javascript
// Daily at midnight
scheduler.cron('0 0 * * *', () => {
  performDailyMaintenance();
});

// Every Monday at 9 AM
scheduler.cron('0 9 * * 1', () => {
  sendWeeklyReport();
});
```

### scheduler.stopAll()

Stop all scheduled tasks.

**Example:**
```javascript
process.on('SIGINT', () => {
  scheduler.stopAll();
  process.exit(0);
});
```

## Cache System

### cache.setCooldown(userId, command, until)

Set a command cooldown for a user.

**Parameters:**
- `userId` (string) - User ID
- `command` (string) - Command name
- `until` (number) - Timestamp when cooldown expires

**Returns:** `Promise<void>`

### cache.getCooldown(userId, command)

Get a user's command cooldown.

**Parameters:**
- `userId` (string) - User ID
- `command` (string) - Command name

**Returns:** `Promise<number|undefined>` - Expiration timestamp or undefined

### cache.setReminder(userId, time, message)

Set a reminder for a user.

**Parameters:**
- `userId` (string) - User ID
- `time` (number) - Reminder timestamp
- `message` (string) - Reminder message

**Returns:** `Promise<void>`

### cache.getReminder(userId)

Get a user's reminder.

**Parameters:**
- `userId` (string) - User ID

**Returns:** `Promise<object|undefined>` - Reminder object or undefined

### cache.setTempMute(userId, until)

Set a temporary mute for a user.

**Parameters:**
- `userId` (string) - User ID
- `until` (number) - Timestamp when mute expires

**Returns:** `Promise<void>`

### cache.getTempMute(userId)

Get a user's temporary mute expiration.

**Parameters:**
- `userId` (string) - User ID

**Returns:** `Promise<number|undefined>` - Expiration timestamp or undefined

**Example:**
```javascript
const cache = require('./utils/cache');

// Set daily cooldown
const nextDaily = Date.now() + time.parse('24h');
await cache.setCooldown(userId, 'daily', nextDaily);

// Check cooldown
const cooldown = await cache.getCooldown(userId, 'daily');
if (cooldown && Date.now() < cooldown) {
  return ctx.error('⏳ Daily reward already claimed!');
}
```

## Database Utilities

### db.init()

Initialize the database connection.

**Returns:** `Promise<void>`

### db.getUserConfig(userId, key, defaultValue)

Get user configuration value.

**Parameters:**
- `userId` (string) - User ID
- `key` (string) - Configuration key
- `defaultValue` (any, optional) - Default value

**Returns:** `Promise<any>`

### db.setUserConfig(userId, key, value)

Set user configuration value.

**Parameters:**
- `userId` (string) - User ID
- `key` (string) - Configuration key
- `value` (any) - Value to set

**Returns:** `Promise<void>`

### db.getGuildConfig(guildId, key, defaultValue)

Get guild configuration value.

**Parameters:**
- `guildId` (string) - Guild ID
- `key` (string) - Configuration key
- `defaultValue` (any, optional) - Default value

**Returns:** `Promise<any>`

### db.setGuildConfig(guildId, key, value)

Set guild configuration value.

**Parameters:**
- `guildId` (string) - Guild ID
- `key` (string) - Configuration key
- `value` (any) - Value to set

**Returns:** `Promise<void>`

**Example:**
```javascript
const db = require('./utils/db');

// Get user data
const userData = await db.getUserConfig(userId, 'profile', {
  level: 1,
  xp: 0,
  balance: 0
});

// Update user data
userData.xp += 50;
await db.setUserConfig(userId, 'profile', userData);

// Guild settings
const prefix = await db.getGuildConfig(guildId, 'prefix', '!');
await db.setGuildConfig(guildId, 'welcomeChannel', channelId);
```

## Statistics Utilities

### stats.logCommand(commandName, userId)

Log command usage for statistics.

**Parameters:**
- `commandName` (string) - Command name
- `userId` (string) - User ID

### stats.getCommandStats(commandName)

Get statistics for a specific command.

**Parameters:**
- `commandName` (string) - Command name

**Returns:** `object` - Command statistics

### stats.getTopCommands(limit)

Get most used commands.

**Parameters:**
- `limit` (number, optional) - Number of commands to return (default: 10)

**Returns:** `Array<object>` - Array of command statistics

**Example:**
```javascript
const stats = require('./utils/stats');

// Log command usage
stats.logCommand('ping', ctx.user.id);

// Get command statistics
const pingStats = stats.getCommandStats('ping');
console.log(`Ping used ${pingStats.count} times`);

// Get top commands
const topCommands = stats.getTopCommands(5);
topCommands.forEach(cmd => {
  console.log(`${cmd.name}: ${cmd.count} uses`);
});
```

## Session Management

### session.create(userId, data)

Create a user session.

**Parameters:**
- `userId` (string) - User ID
- `data` (object) - Session data

**Returns:** `string` - Session ID

### session.get(sessionId)

Get session data.

**Parameters:**
- `sessionId` (string) - Session ID

**Returns:** `object|null` - Session data or null

### session.update(sessionId, data)

Update session data.

**Parameters:**
- `sessionId` (string) - Session ID
- `data` (object) - Updated data

### session.destroy(sessionId)

Destroy a session.

**Parameters:**
- `sessionId` (string) - Session ID

**Example:**
```javascript
const session = require('./utils/session');

// Create session for multi-step command
const sessionId = session.create(ctx.user.id, {
  step: 1,
  data: { name: null, age: null }
});

// Later, retrieve and update session
const sessionData = session.get(sessionId);
if (sessionData) {
  sessionData.data.name = 'John';
  sessionData.step = 2;
  session.update(sessionId, sessionData);
}

// Clean up when done
session.destroy(sessionId);
```

## Queue System

### Queue Class

A simple task queue implementation.

#### new Queue()

Create a new queue instance.

#### queue.add(task, priority)

Add a task to the queue.

**Parameters:**
- `task` (Function) - Task function
- `priority` (number, optional) - Task priority (higher = first)

#### queue.process()

Process all tasks in the queue.

**Returns:** `Promise<void>`

#### queue.clear()

Clear all tasks from the queue.

#### queue.size()

Get the number of tasks in the queue.

**Returns:** `number`

**Example:**
```javascript
const Queue = require('./utils/queue');

const taskQueue = new Queue();

// Add tasks
taskQueue.add(async () => {
  console.log('Task 1');
}, 1);

taskQueue.add(async () => {
  console.log('High priority task');
}, 10);

// Process queue
await taskQueue.process();
```

## Color Utilities

### colors

Predefined color constants for logging and embeds.

**Available Colors:**
- `colors.red` - Red color code
- `colors.green` - Green color code
- `colors.blue` - Blue color code
- `colors.yellow` - Yellow color code
- `colors.purple` - Purple color code
- `colors.orange` - Orange color code

**Example:**
```javascript
const { colors } = require('@axrxvm/betterdiscordjs');

const embed = ctx.embed()
  .title('Success!')
  .color(colors.green);
```

## Utility Functions

### formatTime(milliseconds)

Format milliseconds into human-readable time.

**Parameters:**
- `milliseconds` (number) - Time in milliseconds

**Returns:** `string` - Formatted time string

### formatNumber(number)

Format a number with thousand separators.

**Parameters:**
- `number` (number) - Number to format

**Returns:** `string` - Formatted number string

### randomInt(min, max)

Generate a random integer between min and max (inclusive).

**Parameters:**
- `min` (number) - Minimum value
- `max` (number) - Maximum value

**Returns:** `number` - Random integer

### escapeMarkdown(text)

Escape Discord markdown characters in text.

**Parameters:**
- `text` (string) - Text to escape

**Returns:** `string` - Escaped text

**Example:**
```javascript
const { formatTime, formatNumber, randomInt, escapeMarkdown } = require('@axrxvm/betterdiscordjs');

console.log(formatTime(3661000)); // "1h 1m 1s"
console.log(formatNumber(1234567)); // "1,234,567"
console.log(randomInt(1, 100)); // Random number between 1-100
console.log(escapeMarkdown('**bold** text')); // "\\*\\*bold\\*\\* text"
```

## Error Utilities

### createError(message, code, details)

Create a structured error object.

**Parameters:**
- `message` (string) - Error message
- `code` (string, optional) - Error code
- `details` (object, optional) - Additional error details

**Returns:** `Error` - Enhanced error object

### handleError(error, context)

Handle and log errors consistently.

**Parameters:**
- `error` (Error) - Error to handle
- `context` (string, optional) - Error context

**Example:**
```javascript
const { createError, handleError } = require('@axrxvm/betterdiscordjs');

try {
  throw createError('User not found', 'USER_NOT_FOUND', { userId: '123' });
} catch (error) {
  handleError(error, 'userCommand');
}
```

## Validation Utilities

### isValidUserId(id)

Check if a string is a valid Discord user ID.

**Parameters:**
- `id` (string) - ID to validate

**Returns:** `boolean`

### isValidChannelId(id)

Check if a string is a valid Discord channel ID.

**Parameters:**
- `id` (string) - ID to validate

**Returns:** `boolean`

### isValidGuildId(id)

Check if a string is a valid Discord guild ID.

**Parameters:**
- `id` (string) - ID to validate

**Returns:** `boolean`

### sanitizeInput(input, maxLength)

Sanitize user input by removing dangerous characters.

**Parameters:**
- `input` (string) - Input to sanitize
- `maxLength` (number, optional) - Maximum length (default: 2000)

**Returns:** `string` - Sanitized input

**Example:**
```javascript
const { isValidUserId, sanitizeInput } = require('@axrxvm/betterdiscordjs');

if (isValidUserId(userInput)) {
  const user = await bot.client.users.fetch(userInput);
}

const safeInput = sanitizeInput(userMessage, 100);
```

## Best Practices

1. **Use appropriate utility functions for common operations**
2. **Always validate user input before processing**
3. **Handle errors gracefully with error utilities**
4. **Use caching for expensive operations**
5. **Implement rate limiting for user actions**
6. **Use scheduling for recurring tasks**
7. **Clean up resources when done**
8. **Log important events for debugging**

## Next Steps

Explore more utility features:

1. ⏰ [Time Parser](../utilities/time.md) - Handle time-based operations
2. 🚦 [Rate Limiting](../utilities/rate-limiting.md) - Prevent spam and abuse
3. 📅 [Scheduler](../utilities/scheduler.md) - Automate recurring tasks
4. 💾 [Cache System](../utilities/cache.md) - Optimize performance with caching






