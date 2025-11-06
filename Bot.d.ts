import { Client, ClientOptions, Collection, Interaction, Message, PresenceData } from 'discord.js';
import { PluginManager } from './plugins/PluginManager';
import { Database } from './utils/db';

export interface BotConfig {
  token: string;
  prefix?: string;
  commandsPath?: string;
  eventsPath?: string;
  intents?: number[];
  partials?: number[];
  database?: {
    path?: string;
    enabled?: boolean;
  };
  plugins?: {
    enabled?: boolean;
    autoload?: boolean;
    loadOnStart?: string[];
  };
}

export interface CommandContext {
  bot: Bot;
  client: Client;
  message?: Message;
  interaction?: Interaction;
  args: string[];
  guild: any;
  channel: any;
  author: any;
  member: any;
  reply: (...args: any[]) => Promise<any>;
  send: (...args: any[]) => Promise<any>;
  react: (emoji: string) => Promise<any>;
  db: Database;
}

export interface Command {
  name: string;
  description?: string;
  aliases?: string[];
  category?: string;
  usage?: string;
  cooldown?: number;
  permissions?: string[];
  run: (ctx: CommandContext, ...args: any[]) => Promise<any> | any;
  type?: number;
  contextMenu?: boolean;
  overload?: boolean;
  patterns?: any[];
}

export interface EventHandler {
  name: string;
  once?: boolean;
  run: (bot: Bot, ...args: any[]) => Promise<any> | any;
}

export declare class Bot {
  client: Client;
  config: BotConfig;
  commands: Collection<string, Command>;
  aliases: Collection<string, string>;
  db: Database;
  pluginManager: PluginManager;

  private _onCommandRun?: (ctx: CommandContext, command: Command) => void;
  private _onCommandError?: (ctx: CommandContext, command: Command, error: Error) => void;
  private _beforeEvent?: (eventName: string, ...args: any[]) => void | Promise<void>;
  private _pendingPresence?: PresenceData;
  private _wildcardListeners?: Array<(...args: any[]) => void>;
  private _queues?: Record<string, any>;
  private _inhibitors?: Array<(ctx: CommandContext, command: Command) => boolean | Promise<boolean>>;
  private _cmdConfig?: Record<string, Record<string, boolean>>;
  private _allEventHandler?: (...args: any[]) => void;
  private _errorHandler?: (error: Error) => void;
  private _beforeCommand?: (ctx: CommandContext, command: Command) => void | Promise<void>;
  private _afterCommand?: (ctx: CommandContext, command: Command) => void | Promise<void>;

  constructor(config: BotConfig);

  /**
   * Sets the bot's presence (status/activity).
   */
  setPresence(presenceObj: PresenceData): void;

  /**
   * Global hooks for command run/error
   */
  onCommandRun(fn: (ctx: CommandContext, command: Command) => void): void;
  onCommandError(fn: (ctx: CommandContext, command: Command, error: Error) => void): void;

  /**
   * Event middleware
   */
  beforeEvent(fn: (eventName: string, ...args: any[]) => void | Promise<void>): void;

  /**
   * Hot reload for commands/events
   */
  reloadCommands(): Promise<void>;
  reloadEvents(): Promise<void>;

  /**
   * Wildcard event listeners
   */
  onAny(fn: (...args: any[]) => void): void;

  /**
   * Integrate scheduler and queue
   */
  every(interval: string, fn: () => void): any;
  cron(expr: string, fn: () => void): any;
  getQueue(name?: string): any;

  /**
   * Command inhibitors: pluggable conditions
   */
  addInhibitor(fn: (ctx: CommandContext, command: Command) => boolean | Promise<boolean>): void;

  /**
   * Enable/disable commands per guild
   */
  setCommandEnabled(guildId: string, cmdName: string, enabled: boolean): void;
  isCommandEnabled(guildId: string, cmdName: string): boolean;

  /**
   * Register context menu command
   */
  contextMenu(name: string, type: number, handler: (ctx: CommandContext) => any, description?: string): void;

  /**
   * Register command overloads
   */
  overload(name: string, patterns: any[], handler: (ctx: CommandContext) => any, description?: string): void;

  /**
   * Register global event hook
   */
  onAllEvents(handler: (...args: any[]) => void): void;

  /**
   * Register error hook
   */
  onError(handler: (error: Error) => void): void;

  /**
   * Register pre/post command hooks
   */
  beforeCommand(handler: (ctx: CommandContext, command: Command) => void | Promise<void>): void;
  afterCommand(handler: (ctx: CommandContext, command: Command) => void | Promise<void>): void;

  /**
   * Plugin management methods
   */
  loadPlugin(pluginName: string): Promise<any>;
  unloadPlugin(pluginName: string): Promise<boolean>;
  reloadPlugin(pluginName: string): Promise<any>;
  enablePlugin(pluginName: string): Promise<boolean>;
  disablePlugin(pluginName: string): Promise<boolean>;
  getPlugin(pluginName: string): any;
  listPlugins(): Array<{ name: string; enabled: boolean; version: string }>;
  loadPluginFromClass(PluginClass: any, pluginName?: string): Promise<void>;

  /**
   * Register slash command
   */
  slash(name: string, handler: (ctx: CommandContext) => any, options?: any): void;

  /**
   * Register text command
   */
  command(name: string, handler: (ctx: CommandContext, ...args: any[]) => any, options?: any): void;

  /**
   * Register event handler
   */
  on(event: string, handler: (...args: any[]) => void): void;
  once(event: string, handler: (...args: any[]) => void): void;

  /**
   * Start the bot
   */
  login(token?: string): Promise<string>;
}

export default Bot;
