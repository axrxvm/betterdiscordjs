# Built-in Plugins

@axrxvm/betterdiscordjs comes with several built-in plugins that provide common Discord bot functionality out of the box. These plugins demonstrate best practices and can be used as examples for creating your own plugins.

## Available Built-in Plugins

### Welcome Plugin
Handles member welcome and goodbye messages with customizable settings.

### Moderation Plugin
Provides essential moderation commands and auto-moderation features.

### AutoMod Plugin
Automated moderation system with spam detection and content filtering.

## Welcome Plugin

The Welcome Plugin provides a comprehensive welcome system for new members.

### Features

- Customizable welcome messages
- Welcome channel configuration
- Role assignment on join
- Welcome DMs
- Member count updates
- Leave messages

### Usage

```javascript
const { Bot, plugins } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(token);

// Load the welcome plugin
bot.use(plugins.WelcomePlugin);

bot.start();
```

### Commands

#### `!setwelcome <channel>`
Sets the welcome channel for the server.

```
!setwelcome #welcome
!setwelcome #general
```

#### `!welcomemsg <message>`
Sets a custom welcome message. Use `{user}` for user mention and `{server}` for server name.

```
!welcomemsg Welcome to {server}, {user}! Please read the rules.
!welcomemsg {user} has joined the party! 🎉
```

#### `!autorole <role>`
Sets a role to be automatically assigned to new members.

```
!autorole @Member
!autorole @Newcomer
```

#### `!welcomedm <enable|disable>`
Enables or disables welcome DMs to new members.

```
!welcomedm enable
!welcomedm disable
```

### Configuration

The plugin stores configuration per guild:

```json
{
  "welcomeChannel": "channel_id",
  "welcomeMessage": "Welcome to {server}, {user}!",
  "autoRole": "role_id",
  "welcomeDM": true,
  "leaveMessages": true,
  "memberCountChannel": "channel_id"
}
```

### Events Handled

- `guildMemberAdd` - Welcome new members
- `guildMemberRemove` - Handle member leaves
- `ready` - Initialize plugin settings

## Moderation Plugin

The Moderation Plugin provides essential moderation tools for server management.

### Features

- Kick and ban commands
- Temporary mutes
- Warning system
- Moderation logging
- Bulk message deletion
- User information commands

### Usage

```javascript
const { Bot, plugins } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(token);

bot.use(plugins.ModerationPlugin);
bot.start();
```

### Commands

#### `!kick <user> [reason]`
Kicks a user from the server.

```
!kick @spammer Spamming in chat
!kick @troublemaker
```

#### `!ban <user> [reason]`
Bans a user from the server.

```
!ban @griefer Griefing and harassment
!ban @bot_account
```

#### `!tempban <user> <duration> [reason]`
Temporarily bans a user.

```
!tempban @user 7d Temporary ban for review
!tempban @spammer 1h Spam timeout
```

#### `!mute <user> <duration> [reason]`
Mutes a user for a specified duration.

```
!mute @user 30m Excessive caps
!mute @troublemaker 2h Inappropriate behavior
```

#### `!unmute <user>`
Removes mute from a user.

```
!unmute @user
```

#### `!warn <user> <reason>`
Issues a warning to a user.

```
!warn @user Please follow the rules
!warn @member Inappropriate language
```

#### `!warnings <user>`
Shows warnings for a user.

```
!warnings @user
!warnings @member
```

#### `!purge <amount> [user]`
Deletes messages from the channel.

```
!purge 10
!purge 50 @spammer
```

#### `!userinfo <user>`
Shows information about a user.

```
!userinfo @user
!userinfo @member
```

### Configuration Commands

#### `!modlog <channel>`
Sets the moderation log channel.

```
!modlog #mod-log
!modlog #staff-logs
```

#### `!muterole <role>`
Sets the mute role for the server.

```
!muterole @Muted
!muterole @Timeout
```

### Permissions Required

- `KICK_MEMBERS` - For kick command
- `BAN_MEMBERS` - For ban commands
- `MANAGE_MESSAGES` - For purge command
- `MANAGE_ROLES` - For mute commands
- `MANAGE_GUILD` - For configuration commands

## AutoMod Plugin

The AutoMod Plugin provides automated moderation features to help maintain server quality.

### Features

- Spam detection and prevention
- Link filtering
- Profanity filter
- Caps lock detection
- Repeated message detection
- Auto-mute for violations
- Configurable thresholds

### Usage

```javascript
const { Bot, plugins } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(token);

bot.use(plugins.AutoModPlugin);
bot.start();
```

### Commands

#### `!automod <enable|disable>`
Enables or disables auto-moderation.

```
!automod enable
!automod disable
```

#### `!automod config`
Shows current auto-moderation configuration.

```
!automod config
```

#### `!automod spam <enable|disable>`
Toggles spam detection.

```
!automod spam enable
!automod spam disable
```

#### `!automod links <enable|disable>`
Toggles link filtering.

```
!automod links enable
!automod links disable
```

#### `!automod profanity <enable|disable>`
Toggles profanity filtering.

```
!automod profanity enable
!automod profanity disable
```

#### `!automod whitelist <add|remove> <channel>`
Manages channel whitelist (channels exempt from auto-mod).

```
!automod whitelist add #staff-chat
!automod whitelist remove #general
```

### Configuration

Default configuration:

```json
{
  "enabled": true,
  "spamDetection": true,
  "linkFilter": false,
  "profanityFilter": true,
  "capsFilter": true,
  "duplicateFilter": true,
  "thresholds": {
    "spam": 5,
    "caps": 70,
    "duplicates": 3
  },
  "actions": {
    "delete": true,
    "warn": true,
    "mute": true,
    "muteDuration": "10m"
  },
  "whitelist": {
    "channels": [],
    "roles": [],
    "users": []
  }
}
```

### Auto-Moderation Rules

#### Spam Detection
- Monitors message frequency per user
- Triggers on rapid message sending
- Configurable threshold (default: 5 messages in 5 seconds)

#### Link Filtering
- Blocks unauthorized links
- Whitelist system for allowed domains
- Bypass for trusted roles

#### Profanity Filter
- Filters inappropriate language
- Customizable word list
- Severity levels

#### Caps Lock Detection
- Monitors excessive capital letters
- Configurable percentage threshold
- Ignores short messages

#### Duplicate Message Detection
- Detects repeated identical messages
- Configurable count threshold
- Time-based detection window

### Events Handled

- `messageCreate` - Analyze messages for violations
- `messageUpdate` - Check edited messages
- `guildMemberAdd` - Initialize user tracking

## Plugin Configuration

### Global Plugin Settings

```javascript
// Enable/disable plugins globally
bot.command('plugins', async (ctx) => {
  if (!ctx.hasPerms(['MANAGE_GUILD'])) return;
  
  const action = ctx.args[0];
  const pluginName = ctx.args[1];
  
  switch (action) {
    case 'enable':
      await bot.enablePlugin(pluginName);
      ctx.reply(`✅ Enabled ${pluginName}`);
      break;
    case 'disable':
      await bot.disablePlugin(pluginName);
      ctx.reply(`❌ Disabled ${pluginName}`);
      break;
    case 'list':
      const plugins = bot.listPlugins();
      const list = plugins.map(p => `${p.name} - ${p.enabled ? '✅' : '❌'}`).join('\n');
      ctx.reply(`**Plugins:**\n${list}`);
      break;
  }
});
```

### Per-Guild Plugin Configuration

Each plugin can be configured per guild:

```javascript
// Example: Configure welcome plugin per guild
const welcomeConfig = await bot.db.getGuildConfig(guildId, 'plugins.welcome', {
  enabled: true,
  welcomeChannel: null,
  welcomeMessage: 'Welcome {user}!',
  autoRole: null
});
```

## Plugin Dependencies

Some plugins may depend on others:

```javascript
// Example: Economy plugin that depends on leveling
class EconomyPlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.dependencies = ['leveling']; // Requires leveling plugin
  }
  
  async onLoad() {
    // Access leveling plugin
    this.levelingPlugin = this.pluginManager.getPlugin('leveling');
  }
}
```

## Custom Plugin Integration

You can extend built-in plugins or create plugins that interact with them:

```javascript
class CustomWelcomePlugin extends BasePlugin {
  constructor(bot, pluginManager) {
    super(bot, pluginManager);
    
    this.name = 'customwelcome';
    this.dependencies = ['welcome'];
  }
  
  async onLoad() {
    const welcomePlugin = this.pluginManager.getPlugin('welcome');
    
    // Listen for welcome events
    this.bot.on('plugin:welcome:memberJoined', (data) => {
      // Custom welcome logic
      this.handleCustomWelcome(data);
    });
  }
  
  async handleCustomWelcome(data) {
    // Add custom welcome features
    const { member, guild } = data;
    
    // Send custom embed, assign special roles, etc.
  }
}
```

## Best Practices

1. **Configure plugins per server** - Each guild may have different needs
2. **Test plugin interactions** - Ensure plugins work well together
3. **Monitor plugin performance** - Some plugins may impact bot performance
4. **Regular updates** - Keep plugins updated for security and features
5. **Backup configurations** - Save plugin settings before major changes
6. **Use plugin APIs** - Leverage plugin methods for integration
7. **Handle permissions** - Ensure proper permission checks
8. **Log plugin actions** - Track plugin activities for debugging

## Troubleshooting

### Common Issues

#### Plugin Not Loading
- Check plugin dependencies
- Verify plugin file structure
- Check for syntax errors in plugin code

#### Commands Not Working
- Verify bot permissions
- Check command registration
- Ensure plugin is enabled

#### Configuration Not Saving
- Check database permissions
- Verify configuration format
- Look for validation errors

### Debug Mode

Enable debug logging for plugins:

```javascript
const bot = new Bot(token, {
  debug: true,
  pluginDebug: true
});
```

This will provide detailed logging for plugin operations and help identify issues.## N
ext Steps

Leverage built-in plugins effectively:

1. 🔌 [Creating Plugins](./creating-plugins.md) - Build your own custom plugins
2. 📚 [Plugin API Reference](./api-reference.md) - Understand the plugin architecture
3. 📝 [Plugin Examples](../examples/plugins.md) - See advanced plugin patterns
4. 🔧 [Bot Class API](../api/bot.md) - Integrate plugins with bot features






