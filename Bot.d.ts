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
  options?: any[];
  raw?: any;
  user?: any;
  guild: any;
  channel: any;
  author: any;
  member: any;
  isInteraction?: boolean;
  isDM?: boolean;
  isGuild?: boolean;
  reply: (...args: any[]) => Promise<any>;
  send: (...args: any[]) => Promise<any>;
  react: (emoji: string) => Promise<any>;
  db: Database;
  hasPerms?: (perms: any) => boolean;
  fetchUser?: (id: string) => Promise<any>;
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

// Alias for convenience
export type Event = EventHandler;

export declare class Bot {
  client: Client;
  token: string;
  presence?: PresenceData | null;
  slashMode?: string;
  autoRegisterSlash?: boolean;
  commands: Collection<string, Command>;
  aliases: Collection<string, string>;
  cooldowns: Collection<any, any>;
  db: Database;
  pluginManager: PluginManager;

  // runtime options
  commandsDir?: string | null;
  eventsDir?: string | null;
  devGuild?: string | null;
  clientId?: string | null;
  prefix: string;

  private _onCommandRun?: ((command: Command, ctx: CommandContext) => void | Promise<void>) | ((ctx: CommandContext, command: Command) => void | Promise<void>);
  private _onCommandError?: ((error: Error, command: Command, ctx: CommandContext) => void | Promise<void>) | ((ctx: CommandContext, command: Command, error: Error) => void | Promise<void>);
  private _beforeEvent?: (eventName: string, ctx: any, ...args: any[]) => void | Promise<void>;
  private _pendingPresence?: PresenceData | null;
  private _wildcardListeners?: Array<(eventName: string, ctx: any, ...args: any[]) => void>;
  private _queues?: Record<string, any>;
  private _inhibitors?: Array<(command: Command, ctx: CommandContext) => boolean | Promise<boolean>>;
  private _cmdConfig?: Record<string, Record<string, boolean>>;
  private _allEventHandler?: (ctx: any, ...args: any[]) => void;
  private _errorHandler?: (error: Error, command?: Command, ctx?: CommandContext) => void;
  private _beforeCommand?: (command: Command, ctx: CommandContext) => void | Promise<void>;
  private _afterCommand?: (command: Command, ctx: CommandContext) => void | Promise<void>;

  /**
   * Create a Bot instance.
   * @param token Bot token (or provide via env var). If omitted, will read process.env.DISCORD_TOKEN
   * @param options Additional runtime options (commandsDir, eventsDir, devGuild, clientId, prefix, slashMode, autoRegisterSlash, presence)
   */
  constructor(token?: string, options?: any);

  /**
   * Sets the bot's presence (status/activity).
   */
  setPresence(presenceObj: PresenceData): void;

  /** Global hooks for command run/error */
  // Accept both (command, ctx) and (ctx, command) callback signatures used across the codebase
  onCommandRun(fn: (command: Command, ctx: CommandContext) => void | Promise<void>): void;
  onCommandRun(fn: (ctx: CommandContext, command: Command) => void | Promise<void>): void;
  onCommandError(fn: (error: Error, command: Command, ctx: CommandContext) => void | Promise<void>): void;
  onCommandError(fn: (ctx: CommandContext, command: Command, error: Error) => void | Promise<void>): void;

  /** Event middleware */
  beforeEvent(fn: (eventName: string, ctx: any, ...args: any[]) => void | Promise<void>): void;

  /** Hot reload for commands/events */
  reloadCommands(): Promise<void>;
  reloadEvents(): Promise<void>;

  /** Wildcard event listeners */
  onAny(fn: (eventName: string, ctx: any, ...args: any[]) => void): void;

  /** Integrate scheduler and queue */
  every(interval: string, fn: () => void): any;
  cron(expr: string, fn: () => void): any;
  getQueue(name?: string): any;

  /** Command inhibitors: pluggable conditions */
  addInhibitor(fn: (command: Command, ctx: CommandContext) => boolean | Promise<boolean>): void;

  /** Enable/disable commands per guild */
  setCommandEnabled(guildId: string, cmdName: string, enabled: boolean): void;
  isCommandEnabled(guildId: string, cmdName: string): boolean;

  /** Register context menu command */
  contextMenu(name: string, type: number, handler: (ctx: CommandContext) => any, description?: string): void;

  /** Register command overloads */
  overload(name: string, patterns: any[], handler: (ctx: CommandContext) => any, description?: string): void;

  /** Register global event hook */
  onAllEvents(handler: (ctx: any, ...args: any[]) => void): void;

  /** Register error hook */
  onError(handler: (error: Error, command?: Command, ctx?: CommandContext) => void): void;

  /** Register pre/post command hooks */
  beforeCommand(handler: (command: Command, ctx: CommandContext) => void | Promise<void>): void;
  afterCommand(handler: (command: Command, ctx: CommandContext) => void | Promise<void>): void;

  /** Change and persist a guild prefix at runtime */
  setPrefix(guildId: string, newPrefix: string): Promise<void>;

  /** Plugin management methods */
  loadPlugin(pluginName: string): Promise<any>;
  unloadPlugin(pluginName: string): Promise<boolean>;
  reloadPlugin(pluginName: string): Promise<any>;
  enablePlugin(pluginName: string): Promise<boolean>;
  disablePlugin(pluginName: string): Promise<boolean>;
  getPlugin(pluginName: string): any;
  listPlugins(): Array<{ name: string; enabled: boolean; version: string }>;
  loadPluginFromClass(PluginClass: any, pluginName?: string): Promise<any>;

  /** Load plugin from class directly (chainable) */
  use(PluginClass: any, pluginName?: string): this;

  /** Register slash command */
  slash(name: string, handler: (ctx: CommandContext) => any, options?: any): void;

  /** Register text command */
  command(name: string, handler: (ctx: CommandContext, ...args: any[]) => any, options?: any): void;

  /** Register event handler (wrapper that supplies a Ctx) */
  on(event: string, handler: (...args: any[]) => void, once?: boolean): void;
  once(event: string, handler: (...args: any[]) => void): void;

  /** Start and stop the bot */
  start(): Promise<void>;
  stop(): Promise<void>;

  // internal command runner
  _runCommand(cmd: Command, ctx: CommandContext): Promise<void>;
}

export default Bot;
