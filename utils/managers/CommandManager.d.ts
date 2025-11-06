import { Bot } from '../../Bot';
import { Collection } from 'discord.js';

export interface Command {
  name: string;
  run: Function;
  description?: string;
  category?: string;
  aliases?: string[];
  cooldown?: number;
  permissions?: string[];
  [key: string]: any;
}

export declare class CommandManager {
  bot: Bot;
  commands: Collection<string, Command>;
  aliases: Collection<string, string>;
  cooldowns: Collection<string, Collection<string, number>>;
  inhibitors: Array<Function>;
  commandConfig: Record<string, Record<string, boolean>>;
  
  beforeCommand: Function | null;
  afterCommand: Function | null;
  onCommandRun: Function | null;
  onCommandError: Function | null;

  constructor(bot: Bot);

  register(name: string, handler: Function | object, options?: object): Command;
  unregister(name: string): boolean;
  get(name: string): Command | null;
  has(name: string): boolean;
  addInhibitor(fn: Function): void;
  checkInhibitors(ctx: any, command: Command): Promise<boolean>;
  checkCooldown(userId: string, commandName: string, cooldownTime: number): number | null;
  setEnabled(guildId: string, commandName: string, enabled: boolean): void;
  isEnabled(guildId: string, commandName: string): boolean;
  all(): Collection<string, Command>;
  getByCategory(category: string): Collection<string, Command>;
  getCategories(): string[];
  clear(): void;
  reload(): Promise<void>;
  execute(ctx: any, commandName: string, args: any[]): Promise<any>;
}

export default CommandManager;
