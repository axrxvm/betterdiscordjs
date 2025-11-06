# TypeScript Support for BetterDiscord.js

BetterDiscord.js now includes full TypeScript support with type definitions for all modules.

## Installation

```bash
npm install @axrxvm/betterdiscordjs
```

## TypeScript Usage

### CommonJS (Traditional Node.js)

```typescript
import { Bot } from '@axrxvm/betterdiscordjs';
// or
const { Bot } = require('@axrxvm/betterdiscordjs');

const bot = new Bot({
  token: process.env.DISCORD_TOKEN!,
  prefix: '!',
  commandsPath: './commands',
  eventsPath: './events'
});

bot.login();
```

### ESM (Modern JavaScript Modules)

```typescript
import { Bot, logger, time } from '@axrxvm/betterdiscordjs';

const bot = new Bot({
  token: process.env.DISCORD_TOKEN!,
  prefix: '!',
  intents: [/* your intents */]
});

await bot.login();
```

## Type-Safe Command Example

```typescript
import { CommandContext } from '@axrxvm/betterdiscordjs';

export const name = 'ping';
export const description = 'Replies with pong!';

export async function run(ctx: CommandContext) {
  const startTime = Date.now();
  await ctx.reply('Pong!');
  const ping = Date.now() - startTime;
  
  logger.info(`Ping command executed in ${ping}ms`);
}
```

## Available Type Imports

```typescript
// Core
import { Bot, BotConfig, Command, CommandContext, EventHandler } from '@axrxvm/betterdiscordjs';

// Plugins
import { BasePlugin, PluginManager } from '@axrxvm/betterdiscordjs/plugins';
import { WelcomePlugin, ModerationPlugin, AutoModPlugin } from '@axrxvm/betterdiscordjs';

// Utils
import { Database } from '@axrxvm/betterdiscordjs/utils/db';
import { logger } from '@axrxvm/betterdiscordjs/utils/logger';
import { time } from '@axrxvm/betterdiscordjs/utils/time';
import Cache from '@axrxvm/betterdiscordjs/utils/cache';
import RateLimit from '@axrxvm/betterdiscordjs/utils/rateLimit';
```

## Type-Safe Plugin Development

```typescript
import { BasePlugin } from '@axrxvm/betterdiscordjs/plugins';
import type { Bot } from '@axrxvm/betterdiscordjs';

export default class MyPlugin extends BasePlugin {
  name = 'my-plugin';
  version = '1.0.0';
  description = 'My awesome plugin';

  async onLoad(): Promise<void> {
    this.log('Plugin loaded!');
    
    this.registerCommand({
      name: 'hello',
      description: 'Says hello',
      run: async (ctx) => {
        await ctx.reply('Hello from my plugin!');
      }
    });
  }
}
```

## Configuration with Types

```typescript
import { BotConfig } from '@axrxvm/betterdiscordjs';

const config: BotConfig = {
  token: process.env.DISCORD_TOKEN!,
  prefix: '!',
  commandsPath: './commands',
  eventsPath: './events',
  database: {
    path: './data/db.json',
    enabled: true
  },
  plugins: {
    enabled: true,
    autoload: true,
    loadOnStart: ['welcome', 'moderation']
  }
};
```

## Building

The package automatically generates TypeScript definitions when building:

```bash
npm run build        # Build everything
npm run build:types  # Generate .d.ts files only
npm run build:esm    # Generate ESM wrappers only
npm run typecheck    # Type-check without emitting
```

## IDE Support

All major IDEs with TypeScript support will provide:
- IntelliSense/autocomplete
- Type checking
- Parameter hints
- Documentation on hover
- Go to definition
- Find all references

## Dual Package (CJS + ESM)

This package supports both CommonJS and ESM:

```json
// package.json
{
  "main": "index.js",           // CommonJS entry
  "types": "index.d.ts",        // TypeScript definitions
  "exports": {
    ".": {
      "types": "./index.d.ts",
      "require": "./index.js",   // CommonJS
      "import": "./esm/index.mjs" // ESM
    }
  }
}
```

## TypeScript Configuration

For best results, use these settings in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "strict": true
  }
}
```

## Migration from JavaScript

1. Rename your files from `.js` to `.ts`
2. Add type imports where needed
3. Let TypeScript infer most types
4. Add explicit types for public APIs

## Known Limitations

- Some Discord.js types may need explicit imports
- Plugin hot-reloading may require type cache clearing
- Dynamic command loading uses `any` types

## Support

For TypeScript-related issues, please open an issue on GitHub with the `typescript` label.
