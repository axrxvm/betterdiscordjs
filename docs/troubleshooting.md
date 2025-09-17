# Troubleshooting Guide

This guide covers common issues and their solutions when using @axrxvm/betterdiscordjs.

## Installation Issues

### "Cannot find module '@axrxvm/betterdiscordjs'"

**Cause**: The module isn't installed or the path is incorrect.

**Solutions**:
1. Install dependencies: `npm install`
2. Check your require path:
   ```javascript
   // If using the cloned repository
   const { Bot } = require('./path/to/betterdiscordjs');
   
   // If using npm package (when available)
   const { Bot } = require('@axrxvm/betterdiscordjs');
   ```
3. Verify the module exists in `node_modules`

### "Module not found" for dependencies

**Cause**: Missing peer dependencies.

**Solution**: Install required dependencies:
```bash
npm install discord.js@14.22.1 dotenv chalk lowdb node-cron
```

### Permission denied errors during installation

**Cause**: Insufficient permissions or npm cache issues.

**Solutions**:
1. Clear npm cache: `npm cache clean --force`
2. Use sudo (Linux/Mac): `sudo npm install`
3. Fix npm permissions: [npm docs](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)

## Bot Connection Issues

### "Invalid token" error

**Cause**: Incorrect or missing bot token.

**Solutions**:
1. Verify your token in the Discord Developer Portal
2. Check your `.env` file:
   ```env
   DISCORD_TOKEN=your_actual_token_here
   ```
3. Ensure no extra spaces or characters
4. Regenerate the token if necessary

### Bot doesn't come online

**Cause**: Various connection issues.

**Solutions**:
1. Check your internet connection
2. Verify the token is correct
3. Ensure the bot isn't already running elsewhere
4. Check Discord's status page for outages
5. Add error handling:
   ```javascript
   bot.start().catch(error => {
     console.error('Failed to start bot:', error);
   });
   ```

### "Missing Access" or "Missing Permissions"

**Cause**: Bot lacks necessary permissions.

**Solutions**:
1. Check bot permissions in server settings
2. Ensure bot role is above roles it needs to manage
3. Required permissions for basic functionality:
   - Send Messages
   - Use Slash Commands
   - Embed Links
   - Read Message History

## Command Issues

### Commands not responding

**Cause**: Multiple possible issues.

**Debugging steps**:
1. Check console for errors
2. Verify command syntax:
   ```javascript
   bot.command('test', async (ctx) => {
     await ctx.reply('Working!');
   });
   ```
3. Ensure bot can see the channel
4. Check if command has cooldown active
5. Verify prefix is correct

### Slash commands not appearing

**Cause**: Commands not registered with Discord.

**Solutions**:
1. Set `clientId` in bot configuration:
   ```javascript
   const bot = new Bot(token, {
     clientId: process.env.CLIENT_ID
   });
   ```
2. For development, use `devGuild`:
   ```javascript
   const bot = new Bot(token, {
     clientId: process.env.CLIENT_ID,
     devGuild: process.env.DEV_GUILD
   });
   ```
3. Wait for Discord to update (up to 1 hour for global commands)
4. Check bot has `applications.commands` scope

### File-based commands not loading

**Cause**: Incorrect file structure or syntax.

**Solutions**:
1. Verify directory structure:
   ```
   commands/
   ├── general/
   │   └── ping.js
   └── fun/
       └── joke.js
   ```
2. Check command file format:
   ```javascript
   module.exports = {
     name: 'ping',
     description: 'Ping command',
     async run(ctx) {
       await ctx.reply('Pong!');
     }
   };
   ```
3. Ensure `commandsDir` path is correct in bot config

## Event Issues

### Events not firing

**Cause**: Incorrect event setup or missing intents.

**Solutions**:
1. Check event file format:
   ```javascript
   module.exports = {
     name: 'messageCreate',
     once: false,
     async execute(ctx, message) {
       // Event logic
     }
   };
   ```
2. Verify required intents:
   ```javascript
   const bot = new Bot(token, {
     intents: ['Guilds', 'GuildMessages', 'MessageContent']
   });
   ```
3. Check `eventsDir` path in configuration

### "Missing intent" errors

**Cause**: Required intents not enabled.

**Solutions**:
1. Add intents to bot configuration:
   ```javascript
   const bot = new Bot(token, {
     intents: [
       'Guilds',
       'GuildMessages',
       'MessageContent', // Required for message events
       'GuildMembers'    // Required for member events
     ]
   });
   ```
2. Enable privileged intents in Discord Developer Portal

## Plugin Issues

### Plugin not loading

**Cause**: Plugin file issues or configuration problems.

**Solutions**:
1. Check plugin file structure:
   ```javascript
   const { BasePlugin } = require('@axrxvm/betterdiscordjs');
   
   class MyPlugin extends BasePlugin {
     constructor() {
       super('MyPlugin', '1.0.0');
     }
   }
   
   module.exports = MyPlugin;
   ```
2. Verify plugin is enabled in configuration
3. Check console for plugin-specific errors

### Plugin conflicts

**Cause**: Multiple plugins affecting the same functionality.

**Solutions**:
1. Disable conflicting plugins
2. Check plugin load order
3. Review plugin documentation for compatibility

## Database Issues

### Database connection errors

**Cause**: Database configuration or connection issues.

**Solutions**:
1. Check database configuration:
   ```javascript
   const bot = new Bot(token, {
     database: {
       type: 'sqlite',
       path: './data/bot.db'
     }
   });
   ```
2. Ensure database directory exists
3. Check file permissions
4. Verify database server is running (for external databases)

### Data not persisting

**Cause**: Database not properly configured or transactions not committed.

**Solutions**:
1. Use the built-in database utilities
2. Ensure proper error handling
3. Check database file permissions

## Performance Issues

### High memory usage

**Cause**: Memory leaks or inefficient code.

**Solutions**:
1. Enable garbage collection monitoring
2. Check for event listener leaks
3. Use the built-in cache system properly
4. Implement proper cleanup in plugins

### Slow response times

**Cause**: Blocking operations or rate limiting.

**Solutions**:
1. Use async/await properly
2. Implement caching for frequently accessed data
3. Check for rate limiting issues
4. Optimize database queries

## Development Issues

### Hot reloading not working

**Cause**: File watching issues or syntax errors.

**Solutions**:
1. Check for syntax errors in files
2. Ensure file paths are correct
3. Restart the bot if hot reloading fails
4. Check console for file watching errors

### TypeScript compilation errors

**Cause**: Type mismatches or missing type definitions.

**Solutions**:
1. Install type definitions: `npm install @types/node`
2. Check TypeScript configuration
3. Use proper type annotations

## Production Issues

### Bot crashes in production

**Cause**: Unhandled errors or resource limitations.

**Solutions**:
1. Implement proper error handling:
   ```javascript
   process.on('unhandledRejection', (error) => {
     console.error('Unhandled promise rejection:', error);
   });
   
   process.on('uncaughtException', (error) => {
     console.error('Uncaught exception:', error);
     process.exit(1);
   });
   ```
2. Use a process manager like PM2
3. Monitor resource usage
4. Implement proper logging

### Memory leaks in production

**Cause**: Improper cleanup or event listener accumulation.

**Solutions**:
1. Monitor memory usage
2. Implement proper cleanup in event handlers
3. Use weak references where appropriate
4. Regular bot restarts as a temporary measure

## Getting Help

### Debugging steps

1. **Enable debug logging**:
   ```javascript
   const bot = new Bot(token, {
     debug: true,
     logLevel: 'debug'
   });
   ```

2. **Check console output** for error messages

3. **Test with minimal code** to isolate issues

4. **Check Discord Developer Portal** for application issues

### Information to provide when asking for help

1. Node.js version: `node --version`
2. @axrxvm/betterdiscordjs version
3. Operating system
4. Full error message and stack trace
5. Minimal code that reproduces the issue
6. Steps taken to resolve the issue

### Where to get help

1. **Documentation**: Check the full documentation first
2. **FAQ**: Review the [FAQ](./faq.md) for common questions
3. **Discord Server**: Join our community Discord for real-time help
4. **GitHub Issues**: Create an issue for bugs or feature requests
5. **Stack Overflow**: Tag questions with `betterdiscordjs`

## Common Error Messages

### "Cannot read property 'send' of undefined"

**Cause**: Trying to send a message to a channel that doesn't exist or bot can't access.

**Solution**: Check if channel exists and bot has permissions:
```javascript
if (channel && channel.permissionsFor(bot.user).has('SendMessages')) {
  await channel.send('Message');
}
```

### "Missing permissions"

**Cause**: Bot lacks required permissions for the action.

**Solution**: Check and add necessary permissions in server settings.

### "Rate limited"

**Cause**: Too many API requests in a short time.

**Solution**: Implement proper rate limiting and use the built-in utilities.

---

*Still having issues? Join our Discord server or create a GitHub issue with detailed information about your problem.*