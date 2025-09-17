# Advanced Use Cases

This section covers complex implementations and advanced patterns for building sophisticated Discord bots with @axrxvm/betterdiscordjs.

## Multi-Server Bot with Sharding

### Sharded Bot Implementation

```javascript
const { ShardingManager } = require('discord.js');
const path = require('path');

// shard-manager.js
const manager = new ShardingManager(path.join(__dirname, 'bot.js'), {
  token: process.env.DISCORD_TOKEN,
  totalShards: 'auto', // Auto-calculate based on guild count
  shardArgs: process.argv.slice(2),
  execArgv: process.execArgv
});

manager.on('shardCreate', shard => {
  console.log(`Launched shard ${shard.id}`);
  
  shard.on('ready', () => {
    console.log(`Shard ${shard.id} is ready`);
  });
  
  shard.on('error', error => {
    console.error(`Shard ${shard.id} error:`, error);
  });
  
  shard.on('disconnect', () => {
    console.warn(`Shard ${shard.id} disconnected`);
  });
  
  shard.on('reconnecting', () => {
    console.log(`Shard ${shard.id} reconnecting`);
  });
});

// Global statistics across shards
manager.on('shardCreate', shard => {
  setInterval(async () => {
    try {
      const results = await manager.broadcastEval(client => ({
        guilds: client.guilds.cache.size,
        users: client.users.cache.size,
        channels: client.channels.cache.size,
        uptime: client.uptime,
        memory: process.memoryUsage().heapUsed / 1024 / 1024
      }));
      
      const totalStats = results.reduce((acc, stats) => ({
        guilds: acc.guilds + stats.guilds,
        users: acc.users + stats.users,
        channels: acc.channels + stats.channels,
        memory: acc.memory + stats.memory
      }), { guilds: 0, users: 0, channels: 0, memory: 0 });
      
      console.log('Global Stats:', totalStats);
    } catch (error) {
      console.error('Stats collection error:', error);
    }
  }, 300000); // Every 5 minutes
});

manager.spawn();

// bot.js (individual shard)
const { Bot } = require('@axrxvm/betterdiscordjs');

const bot = new Bot(process.env.DISCORD_TOKEN, {
  prefix: process.env.PREFIX || '!',
  commandsDir: './commands',
  eventsDir: './events'
});

// Shard-aware commands
bot.command('shardinfo', async (ctx) => {
  const shardId = ctx.guild.shardId;
  const totalShards = bot.client.shard.count;
  
  // Get stats from all shards
  const shardStats = await bot.client.shard.broadcastEval(client => ({
    id: client.shard.ids[0],
    guilds: client.guilds.cache.size,
    users: client.users.cache.size,
    ping: client.ws.ping,
    uptime: client.uptime
  }));
  
  const embed = ctx.embed()
    .title('🔧 Shard Information')
    .field('Current Shard', `${shardId}/${totalShards}`, true)
    .field('Total Shards', totalShards.toString(), true)
    .color('blue');
  
  shardStats.forEach(shard => {
    embed.field(
      `Shard ${shard.id}`,
      `Guilds: ${shard.guilds}\nUsers: ${shard.users}\nPing: ${shard.ping}ms\nUptime: ${Math.floor(shard.uptime / 1000 / 60)}m`,
      true
    );
  });
  
  await embed.send();
}, {
  description: 'Show shard information'
});

bot.start();
```

## Advanced Database Integration

### Multi-Database Setup with Caching

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');
const Redis = require('redis');
const { MongoClient } = require('mongodb');

class AdvancedDatabase {
  constructor() {
    this.redis = null;
    this.mongo = null;
    this.cache = new Map();
  }
  
  async init() {
    // Initialize Redis for caching
    this.redis = Redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    });
    
    await this.redis.connect();
    console.log('✅ Redis connected');
    
    // Initialize MongoDB for persistent storage
    this.mongo = new MongoClient(process.env.MONGODB_URI);
    await this.mongo.connect();
    console.log('✅ MongoDB connected');
    
    this.db = this.mongo.db('discord_bot');
  }
  
  async getUserData(userId, useCache = true) {
    const cacheKey = `user:${userId}`;
    
    // Try cache first
    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Try Redis
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        this.cache.set(cacheKey, data);
        return data;
      }
    } catch (error) {
      console.error('Redis error:', error);
    }
    
    // Fallback to MongoDB
    try {
      const data = await this.db.collection('users').findOne({ userId });
      if (data) {
        // Cache the result
        this.cache.set(cacheKey, data);
        await this.redis.setex(cacheKey, 3600, JSON.stringify(data)); // 1 hour TTL
        return data;
      }
    } catch (error) {
      console.error('MongoDB error:', error);
    }
    
    // Return default data
    const defaultData = {
      userId,
      balance: 0,
      level: 1,
      xp: 0,
      createdAt: new Date()
    };
    
    await this.setUserData(userId, defaultData);
    return defaultData;
  }
  
  async setUserData(userId, data) {
    const cacheKey = `user:${userId}`;
    
    // Update cache
    this.cache.set(cacheKey, data);
    
    // Update Redis
    try {
      await this.redis.setex(cacheKey, 3600, JSON.stringify(data));
    } catch (error) {
      console.error('Redis set error:', error);
    }
    
    // Update MongoDB
    try {
      await this.db.collection('users').replaceOne(
        { userId },
        { ...data, userId, updatedAt: new Date() },
        { upsert: true }
      );
    } catch (error) {
      console.error('MongoDB set error:', error);
    }
  }
  
  async getGuildData(guildId) {
    const cacheKey = `guild:${guildId}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        this.cache.set(cacheKey, data);
        return data;
      }
    } catch (error) {
      console.error('Redis error:', error);
    }
    
    try {
      const data = await this.db.collection('guilds').findOne({ guildId });
      if (data) {
        this.cache.set(cacheKey, data);
        await this.redis.setex(cacheKey, 7200, JSON.stringify(data)); // 2 hours TTL
        return data;
      }
    } catch (error) {
      console.error('MongoDB error:', error);
    }
    
    const defaultData = {
      guildId,
      prefix: '!',
      settings: {},
      createdAt: new Date()
    };
    
    await this.setGuildData(guildId, defaultData);
    return defaultData;
  }
  
  async setGuildData(guildId, data) {
    const cacheKey = `guild:${guildId}`;
    
    this.cache.set(cacheKey, data);
    
    try {
      await this.redis.setex(cacheKey, 7200, JSON.stringify(data));
    } catch (error) {
      console.error('Redis set error:', error);
    }
    
    try {
      await this.db.collection('guilds').replaceOne(
        { guildId },
        { ...data, guildId, updatedAt: new Date() },
        { upsert: true }
      );
    } catch (error) {
      console.error('MongoDB set error:', error);
    }
  }
  
  async getLeaderboard(guildId, type = 'xp', limit = 10) {
    try {
      const pipeline = [
        { $match: { [`guilds.${guildId}`]: { $exists: true } } },
        { $sort: { [`guilds.${guildId}.${type}`]: -1 } },
        { $limit: limit },
        { $project: { 
          userId: 1, 
          username: 1,
          value: `$guilds.${guildId}.${type}`
        }}
      ];
      
      return await this.db.collection('users').aggregate(pipeline).toArray();
    } catch (error) {
      console.error('Leaderboard error:', error);
      return [];
    }
  }
  
  async cleanup() {
    // Clean up old cache entries
    const now = Date.now();
    for (const [key, data] of this.cache.entries()) {
      if (data.cachedAt && now - data.cachedAt > 3600000) { // 1 hour
        this.cache.delete(key);
      }
    }
  }
  
  async close() {
    if (this.redis) await this.redis.quit();
    if (this.mongo) await this.mongo.close();
  }
}

// Usage in bot
const bot = new Bot(process.env.DISCORD_TOKEN);
const db = new AdvancedDatabase();

bot.on('ready', async () => {
  await db.init();
  
  // Cleanup cache every hour
  setInterval(() => {
    db.cleanup();
  }, 3600000);
});

// Enhanced commands with database
bot.command('profile', async (ctx) => {
  const target = ctx.getUser('user') || ctx.user;
  const userData = await db.getUserData(target.id);
  
  const embed = ctx.embed()
    .title(`👤 ${target.tag}'s Profile`)
    .field('Balance', `${userData.balance} coins`, true)
    .field('Level', userData.level.toString(), true)
    .field('XP', `${userData.xp}/${userData.level * 100}`, true)
    .color('blue');
  
  await embed.send();
});

bot.command('leaderboard', async (ctx) => {
  const type = ctx.getOption('type') || 'xp';
  const leaderboard = await db.getLeaderboard(ctx.guild.id, type);
  
  if (leaderboard.length === 0) {
    return ctx.error('❌ No data available for leaderboard!');
  }
  
  const embed = ctx.embed()
    .title(`🏆 ${type.toUpperCase()} Leaderboard`)
    .color('gold');
  
  leaderboard.forEach((user, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
    embed.field(
      `${medal} #${index + 1}`,
      `${user.username || 'Unknown'}\n${user.value} ${type}`,
      true
    );
  });
  
  await embed.send();
});

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await db.close();
  process.exit(0);
});
```

## Advanced Plugin System

### Plugin Marketplace and Hot-Reloading

```javascript
const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

class AdvancedPluginManager extends EventEmitter {
  constructor(bot) {
    super();
    this.bot = bot;
    this.plugins = new Map();
    this.pluginConfigs = new Map();
    this.watchers = new Map();
    this.marketplace = new Map();
  }
  
  async init() {
    await this.loadMarketplace();
    await this.loadAllPlugins();
    this.setupHotReload();
  }
  
  async loadMarketplace() {
    try {
      const marketplaceData = await fs.readFile('./marketplace.json', 'utf8');
      const marketplace = JSON.parse(marketplaceData);
      
      marketplace.plugins.forEach(plugin => {
        this.marketplace.set(plugin.name, plugin);
      });
      
      console.log(`Loaded ${this.marketplace.size} plugins from marketplace`);
    } catch (error) {
      console.error('Failed to load marketplace:', error);
    }
  }
  
  async installPlugin(pluginName, version = 'latest') {
    const marketplacePlugin = this.marketplace.get(pluginName);
    if (!marketplacePlugin) {
      throw new Error(`Plugin ${pluginName} not found in marketplace`);
    }
    
    // Download plugin (simplified - in reality you'd download from a repository)
    const pluginCode = await this.downloadPlugin(marketplacePlugin, version);
    
    // Verify plugin signature/integrity
    if (!this.verifyPlugin(pluginCode, marketplacePlugin.signature)) {
      throw new Error('Plugin verification failed');
    }
    
    // Save plugin to disk
    const pluginPath = path.join('./plugins', `${pluginName}.js`);
    await fs.writeFile(pluginPath, pluginCode);
    
    // Load the plugin
    await this.loadPlugin(pluginName);
    
    console.log(`✅ Installed and loaded plugin: ${pluginName}`);
  }
  
  async downloadPlugin(marketplacePlugin, version) {
    // Simulate downloading plugin code
    // In reality, this would fetch from a repository
    return `
      const { BasePlugin } = require('@axrxvm/betterdiscordjs');
      
      class ${marketplacePlugin.className} extends BasePlugin {
        constructor(bot, pluginManager) {
          super(bot, pluginManager);
          this.name = '${marketplacePlugin.name}';
          this.version = '${version}';
          this.description = '${marketplacePlugin.description}';
        }
        
        async onLoad() {
          console.log('Marketplace plugin loaded: ${marketplacePlugin.name}');
        }
      }
      
      module.exports = ${marketplacePlugin.className};
    `;
  }
  
  verifyPlugin(code, signature) {
    // Simplified verification - in reality you'd use proper cryptographic verification
    return signature && signature.length > 0;
  }
  
  setupHotReload() {
    if (process.env.NODE_ENV !== 'development') return;
    
    const pluginsDir = './plugins';
    
    fs.watch(pluginsDir, { recursive: true }, async (eventType, filename) => {
      if (eventType === 'change' && filename.endsWith('.js')) {
        const pluginName = path.basename(filename, '.js');
        
        try {
          console.log(`🔄 Hot reloading plugin: ${pluginName}`);
          await this.reloadPlugin(pluginName);
          console.log(`✅ Hot reload complete: ${pluginName}`);
        } catch (error) {
          console.error(`❌ Hot reload failed for ${pluginName}:`, error);
        }
      }
    });
    
    console.log('🔥 Hot reload enabled for plugins');
  }
  
  async reloadPlugin(pluginName) {
    // Unload existing plugin
    if (this.plugins.has(pluginName)) {
      await this.unloadPlugin(pluginName);
    }
    
    // Clear require cache
    const pluginPath = path.resolve('./plugins', `${pluginName}.js`);
    delete require.cache[pluginPath];
    
    // Reload plugin
    await this.loadPlugin(pluginName);
    
    this.emit('pluginReloaded', pluginName);
  }
  
  async loadPlugin(pluginName) {
    try {
      const pluginPath = path.join('./plugins', `${pluginName}.js`);
      const PluginClass = require(pluginPath);
      
      // Create plugin instance
      const plugin = new PluginClass(this.bot, this);
      
      // Validate plugin
      if (!plugin.name || !plugin.version) {
        throw new Error(`Plugin ${pluginName} is missing required properties`);
      }
      
      // Check dependencies
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          if (!this.plugins.has(dep)) {
            throw new Error(`Plugin ${plugin.name} requires ${dep} which is not loaded`);
          }
        }
      }
      
      // Load plugin configuration
      const config = await this.loadPluginConfig(plugin.name);
      plugin.config = config;
      
      // Initialize plugin
      await plugin.onLoad();
      
      this.plugins.set(plugin.name, plugin);
      this.emit('pluginLoaded', plugin.name);
      
      console.log(`✅ Loaded plugin: ${plugin.name} v${plugin.version}`);
      
      return plugin;
    } catch (error) {
      console.error(`❌ Failed to load plugin ${pluginName}:`, error);
      throw error;
    }
  }
  
  async loadPluginConfig(pluginName) {
    try {
      const configPath = path.join('./plugins/configs', `${pluginName}.json`);
      const configData = await fs.readFile(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      // Return default config if file doesn't exist
      return {
        enabled: true,
        settings: {}
      };
    }
  }
  
  async savePluginConfig(pluginName, config) {
    try {
      const configDir = './plugins/configs';
      await fs.mkdir(configDir, { recursive: true });
      
      const configPath = path.join(configDir, `${pluginName}.json`);
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error(`Failed to save config for ${pluginName}:`, error);
    }
  }
  
  async unloadPlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} is not loaded`);
    }
    
    try {
      await plugin.onUnload();
      this.plugins.delete(pluginName);
      this.emit('pluginUnloaded', pluginName);
      
      console.log(`✅ Unloaded plugin: ${pluginName}`);
    } catch (error) {
      console.error(`❌ Error unloading plugin ${pluginName}:`, error);
      throw error;
    }
  }
  
  getPluginStats() {
    const stats = {
      total: this.plugins.size,
      enabled: 0,
      disabled: 0,
      errors: 0,
      memory: 0
    };
    
    for (const plugin of this.plugins.values()) {
      if (plugin.enabled) {
        stats.enabled++;
      } else {
        stats.disabled++;
      }
      
      if (plugin.error) {
        stats.errors++;
      }
      
      // Estimate memory usage (simplified)
      stats.memory += JSON.stringify(plugin).length;
    }
    
    return stats;
  }
}

// Usage
const bot = new Bot(process.env.DISCORD_TOKEN);
const pluginManager = new AdvancedPluginManager(bot);

bot.command('plugins', async (ctx) => {
  const stats = pluginManager.getPluginStats();
  const plugins = Array.from(pluginManager.plugins.values());
  
  const embed = ctx.embed()
    .title('🔌 Plugin Manager')
    .field('Total Plugins', stats.total.toString(), true)
    .field('Enabled', stats.enabled.toString(), true)
    .field('Disabled', stats.disabled.toString(), true)
    .field('Memory Usage', `${Math.round(stats.memory / 1024)}KB`, true)
    .color('blue');
  
  if (plugins.length > 0) {
    const pluginList = plugins.map(p => 
      `${p.enabled ? '✅' : '❌'} **${p.name}** v${p.version}`
    ).join('\n');
    
    embed.field('Loaded Plugins', pluginList, false);
  }
  
  await embed.send();
});

bot.command('plugin', async (ctx) => {
  const action = ctx.getOption('action');
  const pluginName = ctx.getOption('plugin');
  
  if (!ctx.isOwner()) {
    return ctx.error('❌ Only the bot owner can manage plugins!');
  }
  
  try {
    switch (action) {
      case 'install':
        await pluginManager.installPlugin(pluginName);
        await ctx.success(`✅ Installed plugin: ${pluginName}`);
        break;
        
      case 'unload':
        await pluginManager.unloadPlugin(pluginName);
        await ctx.success(`✅ Unloaded plugin: ${pluginName}`);
        break;
        
      case 'reload':
        await pluginManager.reloadPlugin(pluginName);
        await ctx.success(`✅ Reloaded plugin: ${pluginName}`);
        break;
        
      case 'info':
        const plugin = pluginManager.plugins.get(pluginName);
        if (!plugin) {
          return ctx.error('❌ Plugin not found!');
        }
        
        const embed = ctx.embed()
          .title(`🔌 ${plugin.name}`)
          .field('Version', plugin.version, true)
          .field('Author', plugin.author || 'Unknown', true)
          .field('Status', plugin.enabled ? 'Enabled' : 'Disabled', true)
          .field('Description', plugin.description || 'No description')
          .color('blue');
        
        if (plugin.dependencies && plugin.dependencies.length > 0) {
          embed.field('Dependencies', plugin.dependencies.join(', '), false);
        }
        
        await embed.send();
        break;
        
      default:
        await ctx.error('❌ Invalid action! Use: install, unload, reload, info');
    }
  } catch (error) {
    console.error('Plugin command error:', error);
    await ctx.error(`❌ Plugin operation failed: ${error.message}`);
  }
});

bot.start().then(() => {
  pluginManager.init();
});
```

## Advanced Event System

### Event-Driven Architecture with Custom Events

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');
const { EventEmitter } = require('events');

class AdvancedEventSystem extends EventEmitter {
  constructor(bot) {
    super();
    this.bot = bot;
    this.eventQueue = [];
    this.eventHistory = [];
    this.eventHandlers = new Map();
    this.eventMiddleware = [];
    this.eventStats = new Map();
  }
  
  // Register custom event handler
  registerHandler(eventName, handler, options = {}) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    
    this.eventHandlers.get(eventName).push({
      handler,
      priority: options.priority || 0,
      once: options.once || false,
      condition: options.condition || (() => true)
    });
    
    // Sort by priority (higher first)
    this.eventHandlers.get(eventName).sort((a, b) => b.priority - a.priority);
  }
  
  // Add event middleware
  use(middleware) {
    this.eventMiddleware.push(middleware);
  }
  
  // Emit custom event
  async emitCustom(eventName, data) {
    const event = {
      name: eventName,
      data,
      timestamp: Date.now(),
      id: this.generateEventId()
    };
    
    // Add to queue for processing
    this.eventQueue.push(event);
    
    // Process immediately if not busy
    if (this.eventQueue.length === 1) {
      await this.processEventQueue();
    }
  }
  
  async processEventQueue() {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      await this.processEvent(event);
    }
  }
  
  async processEvent(event) {
    try {
      // Update statistics
      this.updateEventStats(event.name);
      
      // Run middleware
      for (const middleware of this.eventMiddleware) {
        const result = await middleware(event);
        if (result === false) {
          return; // Stop processing
        }
      }
      
      // Get handlers for this event
      const handlers = this.eventHandlers.get(event.name) || [];
      
      // Execute handlers
      for (const handlerInfo of handlers) {
        try {
          // Check condition
          if (!handlerInfo.condition(event)) {
            continue;
          }
          
          await handlerInfo.handler(event);
          
          // Remove if it's a one-time handler
          if (handlerInfo.once) {
            const handlerArray = this.eventHandlers.get(event.name);
            const index = handlerArray.indexOf(handlerInfo);
            if (index > -1) {
              handlerArray.splice(index, 1);
            }
          }
        } catch (error) {
          console.error(`Event handler error for ${event.name}:`, error);
        }
      }
      
      // Add to history
      this.eventHistory.push(event);
      
      // Keep history limited
      if (this.eventHistory.length > 1000) {
        this.eventHistory.shift();
      }
      
      // Emit to Node.js EventEmitter
      this.emit(event.name, event);
      
    } catch (error) {
      console.error(`Event processing error for ${event.name}:`, error);
    }
  }
  
  updateEventStats(eventName) {
    if (!this.eventStats.has(eventName)) {
      this.eventStats.set(eventName, {
        count: 0,
        lastTriggered: null,
        averageProcessingTime: 0
      });
    }
    
    const stats = this.eventStats.get(eventName);
    stats.count++;
    stats.lastTriggered = Date.now();
  }
  
  generateEventId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  getEventStats() {
    return Object.fromEntries(this.eventStats);
  }
  
  getEventHistory(eventName = null, limit = 50) {
    let history = this.eventHistory;
    
    if (eventName) {
      history = history.filter(event => event.name === eventName);
    }
    
    return history.slice(-limit);
  }
}

// Usage in bot
const bot = new Bot(process.env.DISCORD_TOKEN);
const eventSystem = new AdvancedEventSystem(bot);

// Add event middleware for logging
eventSystem.use(async (event) => {
  console.log(`📡 Event: ${event.name} at ${new Date(event.timestamp).toISOString()}`);
  return true; // Continue processing
});

// Add event middleware for rate limiting
eventSystem.use(async (event) => {
  const rateLimitKey = `${event.name}:${event.data.userId || 'global'}`;
  // Implement rate limiting logic here
  return true;
});

// Register custom event handlers
eventSystem.registerHandler('userLevelUp', async (event) => {
  const { userId, guildId, newLevel, oldLevel } = event.data;
  
  const guild = bot.client.guilds.cache.get(guildId);
  const user = await bot.client.users.fetch(userId);
  
  if (guild && user) {
    const channel = guild.channels.cache.find(ch => ch.name === 'general');
    if (channel) {
      const embed = {
        title: '🎉 Level Up!',
        description: `${user} reached level **${newLevel}**!`,
        color: 0x00ff00,
        timestamp: new Date().toISOString()
      };
      
      await channel.send({ embeds: [embed] });
    }
  }
}, { priority: 10 });

eventSystem.registerHandler('userJoinedVoice', async (event) => {
  const { userId, channelId, guildId } = event.data;
  
  // Custom logic for voice channel events
  console.log(`User ${userId} joined voice channel ${channelId} in guild ${guildId}`);
}, { priority: 5 });

// Hook into Discord events to emit custom events
bot.on('voiceStateUpdate', async (ctx) => {
  const oldState = ctx.raw.oldState;
  const newState = ctx.raw.newState;
  
  if (!oldState.channelId && newState.channelId) {
    // User joined voice channel
    await eventSystem.emitCustom('userJoinedVoice', {
      userId: newState.id,
      channelId: newState.channelId,
      guildId: newState.guild.id
    });
  } else if (oldState.channelId && !newState.channelId) {
    // User left voice channel
    await eventSystem.emitCustom('userLeftVoice', {
      userId: oldState.id,
      channelId: oldState.channelId,
      guildId: oldState.guild.id
    });
  }
});

// XP system that emits level up events
bot.on('messageCreate', async (ctx) => {
  if (ctx.raw.author.bot || !ctx.guild) return;
  
  const userId = ctx.user.id;
  const guildId = ctx.guild.id;
  
  // Add XP (simplified)
  const userData = await bot.db?.getUserData(userId) || { xp: 0, level: 1 };
  userData.xp += Math.floor(Math.random() * 10) + 1;
  
  const newLevel = Math.floor(userData.xp / 100) + 1;
  const oldLevel = userData.level;
  
  if (newLevel > oldLevel) {
    userData.level = newLevel;
    await bot.db?.setUserData(userId, userData);
    
    // Emit level up event
    await eventSystem.emitCustom('userLevelUp', {
      userId,
      guildId,
      newLevel,
      oldLevel,
      totalXp: userData.xp
    });
  }
});

// Commands to interact with event system
bot.command('events', async (ctx) => {
  const stats = eventSystem.getEventStats();
  
  const embed = ctx.embed()
    .title('📡 Event Statistics')
    .color('blue');
  
  Object.entries(stats).forEach(([eventName, stat]) => {
    embed.field(
      eventName,
      `Count: ${stat.count}\nLast: ${stat.lastTriggered ? new Date(stat.lastTriggered).toLocaleString() : 'Never'}`,
      true
    );
  });
  
  await embed.send();
});

bot.command('eventhistory', async (ctx) => {
  const eventName = ctx.getOption('event');
  const history = eventSystem.getEventHistory(eventName, 10);
  
  if (history.length === 0) {
    return ctx.error('❌ No event history found!');
  }
  
  const embed = ctx.embed()
    .title(`📜 Event History${eventName ? ` - ${eventName}` : ''}`)
    .color('blue');
  
  history.forEach(event => {
    embed.field(
      `${event.name} - ${event.id}`,
      `Time: ${new Date(event.timestamp).toLocaleString()}\nData: ${JSON.stringify(event.data).slice(0, 100)}...`,
      false
    );
  });
  
  await embed.send();
});

// Trigger custom events manually
bot.command('triggerevent', async (ctx) => {
  const eventName = ctx.getOption('event');
  const data = ctx.getOption('data') || '{}';
  
  if (!ctx.isOwner()) {
    return ctx.error('❌ Only the bot owner can trigger events!');
  }
  
  try {
    const eventData = JSON.parse(data);
    await eventSystem.emitCustom(eventName, eventData);
    await ctx.success(`✅ Triggered event: ${eventName}`);
  } catch (error) {
    await ctx.error(`❌ Failed to trigger event: ${error.message}`);
  }
});

bot.start();
```

## Performance Monitoring and Analytics

### Comprehensive Bot Analytics

```javascript
const { Bot } = require('@axrxvm/betterdiscordjs');

class BotAnalytics {
  constructor(bot) {
    this.bot = bot;
    this.metrics = {
      commands: new Map(),
      events: new Map(),
      errors: new Map(),
      performance: new Map(),
      users: new Map(),
      guilds: new Map()
    };
    
    this.startTime = Date.now();
    this.setupMetricsCollection();
  }
  
  setupMetricsCollection() {
    // Command metrics
    this.bot.beforeCommand(async (cmd, ctx) => {
      ctx._startTime = process.hrtime.bigint();
      this.trackCommand(cmd.name, ctx);
    });
    
    this.bot.afterCommand(async (cmd, ctx) => {
      const endTime = process.hrtime.bigint();
      const executionTime = Number(endTime - ctx._startTime) / 1000000; // Convert to milliseconds
      
      this.trackCommandPerformance(cmd.name, executionTime);
    });
    
    this.bot.onCommandError(async (error, cmd, ctx) => {
      this.trackError(error, cmd.name, ctx);
    });
    
    // Event metrics
    this.bot.onAllEvents(async (eventName, ctx) => {
      this.trackEvent(eventName, ctx);
    });
    
    // Periodic metrics collection
    setInterval(() => {
      this.collectSystemMetrics();
    }, 60000); // Every minute
    
    // Daily reports
    setInterval(() => {
      this.generateDailyReport();
    }, 24 * 60 * 60 * 1000); // Every 24 hours
  }
  
  trackCommand(commandName, ctx) {
    if (!this.metrics.commands.has(commandName)) {
      this.metrics.commands.set(commandName, {
        count: 0,
        users: new Set(),
        guilds: new Set(),
        errors: 0,
        totalExecutionTime: 0,
        averageExecutionTime: 0
      });
    }
    
    const stats = this.metrics.commands.get(commandName);
    stats.count++;
    stats.users.add(ctx.user.id);
    if (ctx.guild) stats.guilds.add(ctx.guild.id);
  }
  
  trackCommandPerformance(commandName, executionTime) {
    const stats = this.metrics.commands.get(commandName);
    if (stats) {
      stats.totalExecutionTime += executionTime;
      stats.averageExecutionTime = stats.totalExecutionTime / stats.count;
    }
  }
  
  trackEvent(eventName, ctx) {
    if (!this.metrics.events.has(eventName)) {
      this.metrics.events.set(eventName, {
        count: 0,
        lastTriggered: null
      });
    }
    
    const stats = this.metrics.events.get(eventName);
    stats.count++;
    stats.lastTriggered = Date.now();
  }
  
  trackError(error, commandName, ctx) {
    const errorKey = `${error.name}:${error.message}`;
    
    if (!this.metrics.errors.has(errorKey)) {
      this.metrics.errors.set(errorKey, {
        count: 0,
        commands: new Set(),
        users: new Set(),
        firstSeen: Date.now(),
        lastSeen: null
      });
    }
    
    const stats = this.metrics.errors.get(errorKey);
    stats.count++;
    stats.commands.add(commandName);
    stats.users.add(ctx.user.id);
    stats.lastSeen = Date.now();
    
    // Track command-specific errors
    const cmdStats = this.metrics.commands.get(commandName);
    if (cmdStats) {
      cmdStats.errors++;
    }
  }
  
  collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.metrics.performance.set(Date.now(), {
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss
      },
      cpu: cpuUsage,
      uptime: process.uptime(),
      guilds: this.bot.client.guilds.cache.size,
      users: this.bot.client.users.cache.size,
      channels: this.bot.client.channels.cache.size
    });
    
    // Keep only last 24 hours of performance data
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    for (const [timestamp] of this.metrics.performance) {
      if (timestamp < oneDayAgo) {
        this.metrics.performance.delete(timestamp);
      }
    }
  }
  
  getTopCommands(limit = 10) {
    return Array.from(this.metrics.commands.entries())
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, limit)
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        uniqueUsers: stats.users.size,
        uniqueGuilds: stats.guilds.size,
        errorRate: (stats.errors / stats.count * 100).toFixed(2),
        avgExecutionTime: stats.averageExecutionTime.toFixed(2)
      }));
  }
  
  getErrorSummary() {
    return Array.from(this.metrics.errors.entries())
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10)
      .map(([error, stats]) => ({
        error,
        count: stats.count,
        affectedCommands: stats.commands.size,
        affectedUsers: stats.users.size,
        firstSeen: new Date(stats.firstSeen).toISOString(),
        lastSeen: new Date(stats.lastSeen).toISOString()
      }));
  }
  
  getPerformanceMetrics() {
    const recent = Array.from(this.metrics.performance.values()).slice(-60); // Last hour
    
    if (recent.length === 0) return null;
    
    const avgMemory = recent.reduce((sum, m) => sum + m.memory.heapUsed, 0) / recent.length;
    const maxMemory = Math.max(...recent.map(m => m.memory.heapUsed));
    const avgGuilds = recent.reduce((sum, m) => sum + m.guilds, 0) / recent.length;
    
    return {
      averageMemoryUsage: Math.round(avgMemory / 1024 / 1024), // MB
      peakMemoryUsage: Math.round(maxMemory / 1024 / 1024), // MB
      averageGuildCount: Math.round(avgGuilds),
      uptime: Math.round((Date.now() - this.startTime) / 1000 / 60), // minutes
      dataPoints: recent.length
    };
  }
  
  async generateDailyReport() {
    const report = {
      date: new Date().toISOString().split('T')[0],
      summary: {
        totalCommands: Array.from(this.metrics.commands.values()).reduce((sum, stats) => sum + stats.count, 0),
        uniqueUsers: new Set(Array.from(this.metrics.commands.values()).flatMap(stats => Array.from(stats.users))).size,
        totalErrors: Array.from(this.metrics.errors.values()).reduce((sum, stats) => sum + stats.count, 0),
        uptime: Math.round((Date.now() - this.startTime) / 1000 / 60 / 60) // hours
      },
      topCommands: this.getTopCommands(5),
      errors: this.getErrorSummary().slice(0, 5),
      performance: this.getPerformanceMetrics()
    };
    
    // Send report to admin channel
    const adminChannel = this.bot.client.channels.cache.get(process.env.ADMIN_CHANNEL_ID);
    if (adminChannel) {
      const embed = {
        title: '📊 Daily Bot Report',
        fields: [
          { name: 'Commands Executed', value: report.summary.totalCommands.toString(), inline: true },
          { name: 'Unique Users', value: report.summary.uniqueUsers.toString(), inline: true },
          { name: 'Errors', value: report.summary.totalErrors.toString(), inline: true },
          { name: 'Uptime', value: `${report.summary.uptime}h`, inline: true },
          { name: 'Memory Usage', value: `${report.performance?.averageMemoryUsage || 0}MB avg`, inline: true },
          { name: 'Guilds', value: this.bot.client.guilds.cache.size.toString(), inline: true }
        ],
        color: 0x00ff00,
        timestamp: new Date().toISOString()
      };
      
      if (report.topCommands.length > 0) {
        embed.fields.push({
          name: 'Top Commands',
          value: report.topCommands.map(cmd => `${cmd.name}: ${cmd.count}`).join('\n'),
          inline: false
        });
      }
      
      await adminChannel.send({ embeds: [embed] });
    }
    
    console.log('📊 Daily report generated:', report);
  }
  
  exportMetrics() {
    return {
      commands: Object.fromEntries(
        Array.from(this.metrics.commands.entries()).map(([name, stats]) => [
          name,
          {
            ...stats,
            users: Array.from(stats.users),
            guilds: Array.from(stats.guilds)
          }
        ])
      ),
      events: Object.fromEntries(this.metrics.events),
      errors: Object.fromEntries(
        Array.from(this.metrics.errors.entries()).map(([error, stats]) => [
          error,
          {
            ...stats,
            commands: Array.from(stats.commands),
            users: Array.from(stats.users)
          }
        ])
      ),
      performance: Object.fromEntries(this.metrics.performance),
      uptime: Date.now() - this.startTime
    };
  }
}

// Usage
const bot = new Bot(process.env.DISCORD_TOKEN);
const analytics = new BotAnalytics(bot);

bot.command('analytics', async (ctx) => {
  if (!ctx.isOwner()) {
    return ctx.error('❌ Only the bot owner can view analytics!');
  }
  
  const topCommands = analytics.getTopCommands(5);
  const performance = analytics.getPerformanceMetrics();
  const errors = analytics.getErrorSummary().slice(0, 3);
  
  const embed = ctx.embed()
    .title('📊 Bot Analytics')
    .color('blue');
  
  if (topCommands.length > 0) {
    embed.field('Top Commands', 
      topCommands.map(cmd => `**${cmd.name}**: ${cmd.count} uses (${cmd.errorRate}% errors)`).join('\n'),
      false
    );
  }
  
  if (performance) {
    embed.field('Performance',
      `Memory: ${performance.averageMemoryUsage}MB avg, ${performance.peakMemoryUsage}MB peak\nUptime: ${performance.uptime} minutes`,
      false
    );
  }
  
  if (errors.length > 0) {
    embed.field('Recent Errors',
      errors.map(err => `**${err.error.split(':')[0]}**: ${err.count} occurrences`).join('\n'),
      false
    );
  }
  
  await embed.send();
});

bot.start();
```

These advanced examples demonstrate sophisticated patterns for building production-ready Discord bots with @axrxvm/betterdiscordjs, including sharding, advanced database integration, plugin systems, event-driven architectures, and comprehensive analytics.

## Next Steps

Ready to implement these advanced patterns?

1. 🚀 [Deploy Your Bot](../deployment/deployment.md) - Take your advanced bot to production
2. 📋 [Best Practices](../deployment/best-practices.md) - Follow production-ready guidelines
3. 🔧 [Bot Class API](../api/bot.md) - Deep dive into all available methods
4. 🛠️ [Plugin API Reference](../api/plugin.md) - Build sophisticated plugin systems






