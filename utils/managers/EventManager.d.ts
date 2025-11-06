import { Bot } from '../../Bot';
import { Collection } from 'discord.js';

export interface Event {
  name: string;
  run: Function;
  once?: boolean;
  group?: string | null;
  [key: string]: any;
}

export declare class EventManager {
  bot: Bot;
  events: Collection<string, Event[]>;
  wildcardListeners: Array<Function>;
  eventGroups: Record<string, any>;
  
  beforeEvent: Function | null;
  allEventHandler: Function | null;

  constructor(bot: Bot);

  register(eventName: string, handler: Function, options?: object): Event;
  unregister(eventName: string, handler?: Function): boolean;
  addWildcardListener(fn: Function): void;
  removeWildcardListener(fn: Function): void;
  all(): Collection<string, Event[]>;
  getByGroup(group: string): Event[];
  clear(): void;
  reload(): Promise<void>;
  emit(eventName: string, ...args: any[]): void;
  waitFor(eventName: string, filter: Function, timeout?: number): Promise<any>;
}

export default EventManager;
