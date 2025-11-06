import { Bot } from '../../Bot';
import { Collection } from 'discord.js';

export interface SlashCommand {
  name: string;
  description: string;
  options?: any[];
  execute: Function;
  defaultMemberPermissions?: string | null;
  dmPermission?: boolean;
  [key: string]: any;
}

export interface ContextMenu {
  name: string;
  type: number;
  execute: Function;
  defaultMemberPermissions?: string | null;
  dmPermission?: boolean;
  [key: string]: any;
}

export interface InteractionStats {
  slashCommands: number;
  contextMenus: number;
  buttonHandlers: number;
  selectMenuHandlers: number;
  modalHandlers: number;
  autocompleteHandlers: number;
}

export declare class InteractionManager {
  bot: Bot;
  slashCommands: Collection<string, SlashCommand>;
  contextMenus: Collection<string, ContextMenu>;
  buttonHandlers: Collection<string | RegExp, Function>;
  selectMenuHandlers: Collection<string | RegExp, Function>;
  modalHandlers: Collection<string | RegExp, Function>;
  autocompleteHandlers: Collection<string, Function>;
  
  autoRegister: boolean;
  guildId: string | null;
  clientId: string | null;

  constructor(bot: Bot);

  registerSlashCommand(command: SlashCommand): void;
  registerContextMenu(menu: ContextMenu): void;
  registerButton(customId: string | RegExp, handler: Function): void;
  registerSelectMenu(customId: string | RegExp, handler: Function): void;
  registerModal(customId: string | RegExp, handler: Function): void;
  registerAutocomplete(commandName: string, handler: Function): void;
  
  deployCommands(token: string, clientId: string, guildId?: string): Promise<void>;
  clear(): void;
  getStats(): InteractionStats;
}

export default InteractionManager;
