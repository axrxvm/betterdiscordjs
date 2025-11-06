import { Bot } from '../Bot';

export interface PluginConfig {
  [key: string]: any;
}

export declare class BasePlugin {
  bot: Bot;
  manager: PluginManager;
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
  config?: PluginConfig;

  constructor(bot: Bot, manager: PluginManager);

  /**
   * Called when the plugin is loaded
   */
  onLoad(): Promise<void> | void;

  /**
   * Called when the plugin is unloaded
   */
  onUnload(): Promise<void> | void;

  /**
   * Called when the plugin is enabled
   */
  onEnable(): Promise<void> | void;

  /**
   * Called when the plugin is disabled
   */
  onDisable(): Promise<void> | void;

  /**
   * Get plugin configuration
   */
  getConfig(key?: string, defaultValue?: any): any;

  /**
   * Set plugin configuration
   */
  setConfig(key: string, value: any): void;

  /**
   * Register a command from the plugin
   */
  registerCommand(command: any): void;

  /**
   * Register an event from the plugin
   */
  registerEvent(event: string, handler: (...args: any[]) => void): void;

  /**
   * Log a message from the plugin
   */
  log(message: string, level?: 'info' | 'warn' | 'error' | 'debug'): void;
}

export declare class PluginManager {
  bot: Bot;
  plugins: Map<string, BasePlugin>;
  pluginStates: Map<string, boolean>;
  configPath: string;

  constructor(bot: Bot);

  /**
   * Load a plugin by name
   */
  load(pluginName: string): Promise<BasePlugin>;

  /**
   * Unload a plugin
   */
  unload(pluginName: string): Promise<boolean>;

  /**
   * Reload a plugin
   */
  reload(pluginName: string): Promise<BasePlugin>;

  /**
   * Enable a plugin
   */
  enable(pluginName: string): Promise<boolean>;

  /**
   * Disable a plugin
   */
  disable(pluginName: string): Promise<boolean>;

  /**
   * Get a plugin instance
   */
  getPlugin(pluginName: string): BasePlugin | undefined;

  /**
   * List all plugins
   */
  list(): Array<{ name: string; enabled: boolean; version: string; description?: string }>;

  /**
   * Check if a plugin is loaded
   */
  isLoaded(pluginName: string): boolean;

  /**
   * Check if a plugin is enabled
   */
  isEnabled(pluginName: string): boolean;

  /**
   * Load all plugins from config
   */
  loadAll(): Promise<void>;

  /**
   * Save plugin states to config
   */
  saveConfig(): Promise<void>;
}

export default BasePlugin;
