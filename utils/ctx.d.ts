import { Bot } from '../Bot';
import { Message, Interaction, User, GuildMember, Channel, Role, EmbedBuilder, AttachmentBuilder, Collection, ThreadChannel, Webhook, Invite, Emoji, MessageReaction, ButtonInteraction, SelectMenuInteraction, ModalSubmitInteraction } from 'discord.js';
import { ComponentBuilder, BetterButton, BetterSelectMenu, BetterRow } from './components';
import { Database } from './db';

export interface ContextOptions {
  bot: Bot;
  message?: Message;
  interaction?: Interaction;
}

export declare class Context {
  bot: Bot;
  client: any;
  message?: Message;
  interaction?: Interaction;
  raw: Message | Interaction;
  args: string[];
  options: any[];
  guild: any;
  channel: any;
  author: any;
  user: User;
  member: GuildMember | null;
  db: Database;
  isInteraction: boolean;
  isDM: boolean;
  isGuild: boolean;
  components: typeof ComponentBuilder;

  constructor(options: ContextOptions);

  // Basic messaging
  reply(content: string | object, options?: object): Promise<Message>;
  send(content: string | object, options?: object): Promise<Message>;
  embed(content?: string): any;
  react(emoji: string): Promise<any>;
  defer(ephemeral?: boolean): Promise<void>;
  followUp(content: string | object): Promise<Message>;
  ephemeral(content: string | object): Promise<Message>;
  update(content: string | object): Promise<Message>;
  fetchReply(): Promise<Message>;
  delete(): Promise<void>;

  // File handling
  file(filePath: string): Promise<Message>;
  sendFiles(attachments: Array<string | Buffer | AttachmentBuilder>, content?: string | object): Promise<Message>;

  // Status messages
  success(msg: string): Promise<Message>;
  error(msg: string): Promise<Message>;
  info(msg: string): Promise<Message>;
  warn(msg: string): Promise<Message>;

  // Slash command helpers
  getOption(name: string): any;
  getUser(name: string): User | null;
  getMember(name: string): GuildMember | null;
  getChannel(name: string): Channel | null;
  getRole(name: string): Role | null;

  // Permission checks
  hasPerms(perms: Array<string>): boolean;
  hasRole(role: string | Role): boolean;

  // Component builders
  newButton(): BetterButton;
  newMenu(type?: string): BetterSelectMenu;
  newRow(): BetterRow;
  button(label: string, options?: object, handler?: Function): any;
  menu(options: Array<string>, handler?: Function): any;
  buttonRow(buttons: Array<object>): any;

  // Collectors and waiters
  awaitMessage(filter: Function, options?: object): Promise<Message | null>;
  awaitReaction(emojis?: Array<string>, options?: object): Promise<MessageReaction | null>;
  awaitComponent(type: number, filter: Function, timeout?: number): Promise<any>;
  awaitButton(msg: Message, handlers: object, options?: object): Promise<any>;
  waitFor(type: string, filter: Function, timeout?: number): Promise<any>;

  // Pagination
  paginate(pages: Array<EmbedBuilder>, options?: object): Promise<Message>;
  paginator(pages: Array<EmbedBuilder>, options?: object): Promise<Message>;

  // Threads
  createThread(name: string, options?: object): Promise<ThreadChannel>;

  // Message operations
  pin(): Promise<void>;
  unpin(): Promise<void>;
  typing(): Promise<void>;
  getMessage(messageId: string): Promise<Message>;
  editMessage(messageId: string, content: string | object): Promise<Message>;
  deleteMessage(messageId: string): Promise<Message>;
  getReference(): Promise<Message | null>;
  crosspost(): Promise<Message>;

  // Collectors
  createReactionCollector(options?: object): any;
  createMessageCollector(options?: object): any;

  // User operations
  dm(user: User | string, content: string | object): Promise<Message>;
  fetchUser(id: string): Promise<User>;
  fetchMember(id: string): Promise<GuildMember>;

  // Moderation
  addRole(role: string | Role, reason?: string): Promise<GuildMember>;
  removeRole(role: string | Role, reason?: string): Promise<GuildMember>;
  timeout(duration: number, reason?: string): Promise<GuildMember>;
  kick(member: GuildMember | string, reason?: string): Promise<GuildMember>;
  ban(member: GuildMember | string, options?: object): Promise<any>;
  unban(userId: string, reason?: string): Promise<User>;
  bulkDelete(amount: number, filterBots?: boolean): Promise<Collection<any, any>>;

  // Webhooks
  createWebhook(name: string, options?: object): Promise<Webhook>;
  webhookSend(webhook: Webhook, content: string | object): Promise<Message>;

  // Invites
  createInvite(options?: object): Promise<Invite>;
  getInvites(): Promise<Collection<any, any>>;

  // Permissions
  setPermissions(target: Role | GuildMember, permissions: object, reason?: string): Promise<void>;

  // Roles
  getMembersWithRole(role: string | Role): Collection<string, GuildMember>;
  createRole(options?: object): Promise<Role>;
  deleteRole(role: string | Role, reason?: string): Promise<Role>;

  // Channels
  modifyChannel(options: object, reason?: string): Promise<Channel>;
  cloneChannel(options?: object): Promise<Channel>;
  deleteChannel(reason?: string): Promise<Channel>;

  // Audit logs
  getAuditLogs(options?: object): Promise<any>;
  getBans(): Promise<Collection<any, any>>;

  // Members
  searchMembers(query: string, limit?: number): Promise<Collection<any, any>>;

  // Emojis
  getEmojis(): Collection<any, any>;
  createEmoji(attachment: string | Buffer, name: string, options?: object): Promise<Emoji>;
  deleteEmoji(emoji: string | Emoji, reason?: string): Promise<void>;

  // Stickers
  getStickers(): Collection<any, any>;

  // Mentions
  mentionsBot(): boolean;
  getMentions(): Collection<string, User>;
  getMentionedRoles(): Collection<string, Role>;
  getMentionedChannels(): Collection<string, Channel>;

  // Text formatting
  bold(str: string): string;
  italic(str: string): string;
  code(str: string): string;

  // Dialog
  modal(fields: Array<object>, options?: object): Promise<object | null>;
  dialog(steps: Array<string>, options?: object): Promise<Array<string>>;

  // Utilities
  randomChoice(arr: Array<any>): any;
}

export default Context;
