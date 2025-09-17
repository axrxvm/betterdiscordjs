# Database & Storage

@axrxvm/betterdiscordjs includes a built-in database system using LowDB for persistent data storage. This system provides easy-to-use methods for storing guild and user configurations.

## Database Initialization

The database is automatically initialized when you start your bot:

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');
const bot = new Bot(token);

// Database is automatically initialized on bot.start()
bot.start();
```

## Database Structure

The database stores data in JSON format with the following structure:

```json
{
  "guilds": {
    "guild_id": {
      "prefix": "!",
      "welcomeChannel": "channel_id",
      "customSetting": "value"
    }
  },
  "users": {
    "user_id": {
      "xp": 1500,
      "level": 5,
      "lastSeen": "2023-12-01T10:00:00.000Z"
    }
  }
}
```

## Guild Configuration

### Setting Guild Config

```javascript
const db = require('@axrxvm/betterdiscordjs/utils/db');

// Set a single guild configuration value
await db.setGuildConfig(guildId, 'prefix', '?');
await db.setGuildConfig(guildId, 'welcomeChannel', channelId);

// Set multiple values at once
await db.setGuildConfig(guildId, {
  prefix: '?',
  welcomeChannel: channelId,
  autoRole: roleId
});
```

### Getting Guild Config

```javascript
// Get a specific configuration value with default fallback
const prefix = await db.getGuildConfig(guildId, 'prefix', '!');

// Get all guild configuration
const guildConfig = await db.getGuildConfig(guildId);

// Check if a configuration exists
const hasWelcome = await db.hasGuildConfig(guildId, 'welcomeChannel');
```

### Removing Guild Config

```javascript
// Remove a specific configuration
await db.removeGuildConfig(guildId, 'welcomeChannel');

// Clear all guild configuration
await db.clearGuildConfig(guildId);
```

## User Configuration

### Setting User Config

```javascript
// Set user data
await db.setUserConfig(userId, 'xp', 1500);
await db.setUserConfig(userId, 'level', 5);

// Set multiple values
await db.setUserConfig(userId, {
  xp: 1500,
  level: 5,
  lastSeen: new Date().toISOString()
});
```

### Getting User Config

```javascript
// Get specific user data
const userXP = await db.getUserConfig(userId, 'xp', 0);
const userLevel = await db.getUserConfig(userId, 'level', 1);

// Get all user data
const userData = await db.getUserConfig(userId);
```

### User Data Operations

```javascript
// Increment user XP
const currentXP = await db.getUserConfig(userId, 'xp', 0);
await db.setUserConfig(userId, 'xp', currentXP + 10);

// Or use a helper function
async function addUserXP(userId, amount) {
  const current = await db.getUserConfig(userId, 'xp', 0);
  await db.setUserConfig(userId, 'xp', current + amount);
  return current + amount;
}
```

## Practical Examples

### Leveling System

```javascript
bot.on('messageCreate', async (ctx) => {
  if (ctx.author.bot) return;
  
  const userId = ctx.author.id;
  const currentXP = await db.getUserConfig(userId, 'xp', 0);
  const currentLevel = await db.getUserConfig(userId, 'level', 1);
  
  // Add XP for message
  const newXP = currentXP + Math.floor(Math.random() * 10) + 1;
  await db.setUserConfig(userId, 'xp', newXP);
  
  // Check for level up
  const requiredXP = currentLevel * 100;
  if (newXP >= requiredXP) {
    const newLevel = currentLevel + 1;
    await db.setUserConfig(userId, 'level', newLevel);
    
    ctx.reply(`🎉 Congratulations! You've reached level ${newLevel}!`);
  }
});

// Level command
bot.command('level', async (ctx) => {
  const userId = ctx.user.id;
  const xp = await db.getUserConfig(userId, 'xp', 0);
  const level = await db.getUserConfig(userId, 'level', 1);
  const requiredXP = level * 100;
  
  ctx.reply(`**Level:** ${level}\n**XP:** ${xp}/${requiredXP}`);
});
```

### Welcome System Configuration

```javascript
// Set welcome channel command
bot.command('setwelcome', async (ctx) => {
  if (!ctx.hasPerms(['MANAGE_GUILD'])) {
    return ctx.reply('❌ You need Manage Server permission to use this command.');
  }
  
  const channel = ctx.mentions.channels.first() || ctx.channel;
  await db.setGuildConfig(ctx.guild.id, 'welcomeChannel', channel.id);
  
  ctx.reply(`✅ Welcome channel set to ${channel}`);
});

// Welcome message on member join
bot.on('guildMemberAdd', async (ctx) => {
  const welcomeChannelId = await db.getGuildConfig(ctx.guild.id, 'welcomeChannel');
  
  if (welcomeChannelId) {
    const welcomeChannel = ctx.guild.channels.cache.get(welcomeChannelId);
    if (welcomeChannel) {
      welcomeChannel.send(`Welcome to ${ctx.guild.name}, ${ctx.user}! 🎉`);
    }
  }
});
```

### Custom Prefix System

```javascript
// Change prefix command
bot.command('prefix', async (ctx) => {
  if (!ctx.hasPerms(['MANAGE_GUILD'])) {
    return ctx.reply('❌ You need Manage Server permission to change the prefix.');
  }
  
  const newPrefix = ctx.args[0];
  if (!newPrefix) {
    const currentPrefix = await db.getGuildConfig(ctx.guild.id, 'prefix', '!');
    return ctx.reply(`Current prefix: \`${currentPrefix}\``);
  }
  
  await db.setGuildConfig(ctx.guild.id, 'prefix', newPrefix);
  ctx.reply(`✅ Prefix changed to \`${newPrefix}\``);
});

// The bot automatically uses the stored prefix for commands
```

### Economy System

```javascript
// Economy commands
bot.command('balance', async (ctx) => {
  const userId = ctx.user.id;
  const balance = await db.getUserConfig(userId, 'coins', 0);
  
  ctx.reply(`💰 You have **${balance}** coins!`);
});

bot.command('daily', async (ctx) => {
  const userId = ctx.user.id;
  const lastDaily = await db.getUserConfig(userId, 'lastDaily', 0);
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  if (now - lastDaily < oneDay) {
    const timeLeft = oneDay - (now - lastDaily);
    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    
    return ctx.reply(`⏰ You can claim your daily reward in ${hours}h ${minutes}m`);
  }
  
  const currentBalance = await db.getUserConfig(userId, 'coins', 0);
  const dailyAmount = 100;
  
  await db.setUserConfig(userId, {
    coins: currentBalance + dailyAmount,
    lastDaily: now
  });
  
  ctx.reply(`💰 You claimed your daily reward of **${dailyAmount}** coins!`);
});
```

## Advanced Database Operations

### Bulk Operations

```javascript
// Get all users with a specific condition
async function getTopUsers(limit = 10) {
  const db = require('@axrxvm/betterdiscordjs/utils/db');
  const data = await db.read();
  
  const users = Object.entries(data.users || {})
    .map(([id, userData]) => ({ id, ...userData }))
    .filter(user => user.xp > 0)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit);
  
  return users;
}

// Leaderboard command
bot.command('leaderboard', async (ctx) => {
  const topUsers = await getTopUsers(10);
  
  let leaderboard = '🏆 **XP Leaderboard**\n\n';
  for (let i = 0; i < topUsers.length; i++) {
    const user = topUsers[i];
    const discordUser = await ctx.client.users.fetch(user.id);
    leaderboard += `${i + 1}. ${discordUser.username} - ${user.xp} XP\n`;
  }
  
  ctx.reply(leaderboard);
});
```

### Data Migration

```javascript
// Migrate old data format to new format
async function migrateData() {
  const db = require('@axrxvm/betterdiscordjs/utils/db');
  const data = await db.read();
  
  // Example: Convert old XP format to new format
  if (data.users) {
    for (const [userId, userData] of Object.entries(data.users)) {
      if (typeof userData.xp === 'string') {
        userData.xp = parseInt(userData.xp) || 0;
      }
    }
    
    await db.write();
    console.log('Data migration completed');
  }
}
```

## Database Utilities

### Backup and Restore

```javascript
const fs = require('fs');
const path = require('path');

// Backup database
async function backupDatabase() {
  const db = require('@axrxvm/betterdiscordjs/utils/db');
  const data = await db.read();
  
  const backupPath = path.join(__dirname, 'backups', `backup-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
  
  console.log(`Database backed up to: ${backupPath}`);
}

// Restore database
async function restoreDatabase(backupPath) {
  const db = require('@axrxvm/betterdiscordjs/utils/db');
  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  
  await db.write(backupData);
  console.log('Database restored from backup');
}
```

## Best Practices

1. **Always provide default values** when getting configuration
2. **Use transactions** for related database operations
3. **Implement data validation** before storing
4. **Regular backups** of important data
5. **Clean up old data** periodically
6. **Use appropriate data types** (numbers, strings, objects)
7. **Handle database errors** gracefully
8. **Consider data privacy** and GDPR compliance

## Performance Tips

- Cache frequently accessed data in memory
- Use bulk operations when possible
- Implement data cleanup routines
- Monitor database file size
- Consider external databases for large-scale applications## Next
 Steps

Master data management in your bot:

1. 💾 [Cache System](../utilities/cache.md) - Optimize database performance
2. 🔧 [Bot Class API](../api/bot.md) - Integrate database with bot features
3. 📊 [Advanced Use Cases](../examples/advanced.md) - Scale with advanced database patterns
4. 📋 [Best Practices](../deployment/best-practices.md) - Follow database best practices






