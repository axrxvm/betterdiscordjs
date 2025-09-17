const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");
const db = require("../utils/db");

/**
 * Plugin Manager - Handles loading, unloading, and managing plugins
 */
class PluginManager {
  constructor(bot) {
    this.bot = bot;
    this.plugins = new Map();
    this.pluginConfigs = new Map();
    this.pluginsDir = path.resolve(process.cwd(), "plugins");
    this.configFile = path.join(this.pluginsDir, "config.json");
    
    // Ensure plugins directory exists
    if (!fs.existsSync(this.pluginsDir)) {
      fs.mkdirSync(this.pluginsDir, { recursive: true });
    }
    
    this.loadConfig();
  }

  /**
   * Load plugin configuration from config.json
   */
  loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
        this.pluginConfigs = new Map(Object.entries(config));
      }
    } catch (error) {
      logger.error(`Failed to load plugin config: ${error.message}`);
    }
  }

  /**
   * Save plugin configuration to config.json
   */
  saveConfig() {
    try {
      const config = Object.fromEntries(this.pluginConfigs);
      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
    } catch (error) {
      logger.error(`Failed to save plugin config: ${error.message}`);
    }
  }

  /**
   * Load all enabled plugins
   */
  async loadAll() {
    const pluginDirs = fs.readdirSync(this.pluginsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const pluginName of pluginDirs) {
      const config = this.pluginConfigs.get(pluginName) || { enabled: true };
      if (config.enabled) {
        await this.load(pluginName);
      }
    }
  }

  /**
   * Load a specific plugin
   */
  async load(pluginName) {
    try {
      const pluginPath = path.join(this.pluginsDir, pluginName);
      const indexPath = path.join(pluginPath, "index.js");
      
      if (!fs.existsSync(indexPath)) {
        throw new Error(`Plugin ${pluginName} does not have an index.js file`);
      }

      // Clear require cache for hot reloading
      delete require.cache[require.resolve(indexPath)];
      
      const PluginClass = require(indexPath);
      const plugin = new PluginClass(this.bot, this);
      
      // Validate plugin
      if (!plugin.name || !plugin.version) {
        throw new Error(`Plugin ${pluginName} is missing required properties (name, version)`);
      }

      // Check dependencies
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          if (!this.plugins.has(dep)) {
            throw new Error(`Plugin ${pluginName} requires ${dep} which is not loaded`);
          }
        }
      }

      // Initialize plugin
      await plugin.onLoad();
      
      this.plugins.set(pluginName, plugin);
      
      // Update config
      const config = this.pluginConfigs.get(pluginName) || {};
      config.enabled = true;
      config.loadedAt = new Date().toISOString();
      this.pluginConfigs.set(pluginName, config);
      this.saveConfig();
      
      logger.info(`✅ Loaded plugin: ${plugin.name} v${plugin.version}`);
      
      return plugin;
    } catch (error) {
      logger.error(`❌ Failed to load plugin ${pluginName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Unload a specific plugin
   */
  async unload(pluginName) {
    try {
      const plugin = this.plugins.get(pluginName);
      if (!plugin) {
        throw new Error(`Plugin ${pluginName} is not loaded`);
      }

      // Check if other plugins depend on this one
      for (const [name, p] of this.plugins) {
        if (p.dependencies && p.dependencies.includes(pluginName)) {
          throw new Error(`Cannot unload ${pluginName}: ${name} depends on it`);
        }
      }

      // Cleanup plugin
      await plugin.onUnload();
      
      this.plugins.delete(pluginName);
      
      // Update config
      const config = this.pluginConfigs.get(pluginName) || {};
      config.enabled = false;
      config.unloadedAt = new Date().toISOString();
      this.pluginConfigs.set(pluginName, config);
      this.saveConfig();
      
      logger.info(`🔄 Unloaded plugin: ${pluginName}`);
      
      return true;
    } catch (error) {
      logger.error(`❌ Failed to unload plugin ${pluginName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reload a specific plugin
   */
  async reload(pluginName) {
    if (this.plugins.has(pluginName)) {
      await this.unload(pluginName);
    }
    return await this.load(pluginName);
  }

  /**
   * Get plugin information
   */
  getPlugin(pluginName) {
    return this.plugins.get(pluginName);
  }

  /**
   * List all plugins (loaded and available)
   */
  list() {
    const available = fs.readdirSync(this.pluginsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    return available.map(name => {
      const plugin = this.plugins.get(name);
      const config = this.pluginConfigs.get(name) || { enabled: false };
      
      return {
        name,
        loaded: !!plugin,
        enabled: config.enabled,
        version: plugin?.version || 'Unknown',
        description: plugin?.description || 'No description',
        loadedAt: config.loadedAt,
        unloadedAt: config.unloadedAt
      };
    });
  }

  /**
   * Enable a plugin
   */
  async enable(pluginName) {
    const config = this.pluginConfigs.get(pluginName) || {};
    config.enabled = true;
    this.pluginConfigs.set(pluginName, config);
    this.saveConfig();
    
    return await this.load(pluginName);
  }

  /**
   * Disable a plugin
   */
  async disable(pluginName) {
    const config = this.pluginConfigs.get(pluginName) || {};
    config.enabled = false;
    this.pluginConfigs.set(pluginName, config);
    this.saveConfig();
    
    if (this.plugins.has(pluginName)) {
      return await this.unload(pluginName);
    }
    
    return true;
  }

  /**
   * Install a plugin from a directory or package
   */
  async install(source, pluginName) {
    // This could be extended to support npm packages, git repos, etc.
    const targetPath = path.join(this.pluginsDir, pluginName);
    
    if (fs.existsSync(targetPath)) {
      throw new Error(`Plugin ${pluginName} already exists`);
    }
    
    // For now, just copy from source directory
    if (fs.existsSync(source)) {
      fs.cpSync(source, targetPath, { recursive: true });
      logger.info(`📦 Installed plugin: ${pluginName}`);
      return true;
    }
    
    throw new Error(`Source ${source} does not exist`);
  }

  /**
   * Uninstall a plugin
   */
  async uninstall(pluginName) {
    if (this.plugins.has(pluginName)) {
      await this.unload(pluginName);
    }
    
    const pluginPath = path.join(this.pluginsDir, pluginName);
    if (fs.existsSync(pluginPath)) {
      fs.rmSync(pluginPath, { recursive: true, force: true });
      this.pluginConfigs.delete(pluginName);
      this.saveConfig();
      logger.info(`🗑️ Uninstalled plugin: ${pluginName}`);
      return true;
    }
    
    throw new Error(`Plugin ${pluginName} is not installed`);
  }
}

module.exports = PluginManager;


