import { Bot, BotConfig, Command, CommandContext, EventHandler, Event } from './Bot';
import { BasePlugin, PluginManager } from './plugins/BasePlugin';
import { Database } from './utils/db';
import { logger } from './utils/logger';
import { time } from './utils/time';
import { colors } from './utils/colors';
import Cache from './utils/cache';
import RateLimit from './utils/rateLimit';
import { scheduler } from './utils/scheduler';
import Queue from './utils/queue';
import { CommandManager } from './utils/managers/CommandManager';
import { EventManager } from './utils/managers/EventManager';
import { InteractionManager } from './utils/managers/InteractionManager';
import { ComponentBuilder, BetterButton, BetterSelectMenu, BetterRow } from './utils/components';
import { Context as Ctx } from './utils/ctx';

// Built-in plugins
export { default as WelcomePlugin } from './plugins/welcome';
export { default as ModerationPlugin } from './plugins/moderation';
export { default as AutoModPlugin } from './plugins/automod';

// Main exports
export {
  Bot,
  BotConfig,
  Command,
  CommandContext,
  EventHandler,
  Event,
  BasePlugin,
  PluginManager,
  Database,
  logger,
  time,
  colors,
  Cache,
  RateLimit,
  scheduler,
  Queue,
  CommandManager,
  EventManager,
  InteractionManager,
  ComponentBuilder,
  BetterButton,
  BetterSelectMenu,
  BetterRow,
  Ctx,
};

// Default export
declare const betterdiscordjs: {
  Bot: typeof Bot;
  time: typeof time;
  colors: typeof colors;
  logger: typeof logger;
  BasePlugin: typeof BasePlugin;
  PluginManager: typeof PluginManager;
  plugins: {
    WelcomePlugin: any;
    ModerationPlugin: any;
    AutoModPlugin: any;
  };
  managers: {
    CommandManager: typeof CommandManager;
    EventManager: typeof EventManager;
    InteractionManager: typeof InteractionManager;
  };
  components: {
    ComponentBuilder: typeof ComponentBuilder;
    BetterButton: typeof BetterButton;
    BetterSelectMenu: typeof BetterSelectMenu;
    BetterRow: typeof BetterRow;
  };
  Ctx: typeof Ctx;
};

export default betterdiscordjs;
