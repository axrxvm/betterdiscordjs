# betterdiscordjs CLI

Command-line tool for scaffolding betterdiscordjs projects with JavaScript or TypeScript support.

## Usage

```bash
npx @axrxvm/betterdiscordjs create <project-name> [options]
# or
betterdjs create <project-name> [options]
```

## Features

- 🚀 **Quick Project Setup** - Create a new bot project in seconds
- 📦 **Multiple Templates** - Choose from basic, advanced, or minimal templates
- 🎨 **Interactive CLI** - Beautiful colored output with interactive prompts
- 💙 **TypeScript Support** - Full TypeScript project scaffolding with proper configuration
- 🔧 **Auto Configuration** - Generates .env, .gitignore, tsconfig.json, and all necessary files
- 📚 **Example Code** - Includes example commands and events in your chosen language
- ⚡ **Auto Install** - Optionally installs dependencies automatically
- ✅ **Input Validation** - Validates project names, prefixes, and configuration

## Commands

### Create

Create a new Discord bot project:

```bash
npx @axrxvm/betterdiscordjs create <project-name> [options]
```

## Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--template <type>` | `-t` | Template to use (basic\|advanced\|minimal) |
| `--typescript` | `--ts` | Create a TypeScript project |
| `--javascript` | `--js` | Create a JavaScript project (default) |
| `--yes` | `-y` | Skip prompts and use defaults |
| `--no-install` | | Don't install dependencies automatically |
| `--help` | `-h` | Show help message |

## Templates

### Basic (Default)
Complete setup with example commands and events. Perfect for beginners.

**Includes:**
- Example commands (ping, help, userinfo)
- Example events (ready, guildCreate)
- Organized file structure
- Environment configuration
- Comprehensive README with instructions

**JavaScript Structure:**
```
my-bot/
├── commands/
│   ├── ping.js
│   ├── help.js
│   └── userinfo.js
├── events/
│   ├── ready.js
│   └── guildCreate.js
├── data/
├── index.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

**TypeScript Structure:**
```
my-bot/
├── src/
│   ├── commands/
│   │   ├── ping.ts
│   │   ├── help.ts
│   │   └── userinfo.ts
│   ├── events/
│   │   ├── ready.ts
│   │   └── guildCreate.ts
│   └── index.ts
├── dist/            (compiled output)
├── data/
├── tsconfig.json
├── .env
├── .gitignore
├── package.json
└── README.md
```

### Advanced
Full-featured setup with plugins, advanced commands, and configuration.

**Includes everything in Basic plus:**
- Plugin system integration
- Configuration file (config.json)
- Advanced commands (poll, remind)
- Advanced event handlers (messageCreate)
- Database setup
- Scheduled tasks
- Enhanced error handling

### Minimal
Bare minimum for experienced developers who want to start from scratch.

**Includes:**
- Basic entry point file
- Environment setup
- Package configuration
- Minimal dependencies

## Examples

### Interactive Setup
```bash
npx @axrxvm/betterdiscordjs create my-bot
```
Prompts you for:
- Language (JavaScript/TypeScript)
- Template (basic/advanced/minimal)
- Command prefix
- Project description
- Dependency installation

### Quick JavaScript Setup
```bash
npx @axrxvm/betterdiscordjs create my-bot --yes
```
Creates a JavaScript project with default settings (basic template, `!` prefix).

### TypeScript Project
```bash
npx @axrxvm/betterdiscordjs create my-bot --typescript
```
Creates a TypeScript project with:
- Full TypeScript configuration
- Type definitions
- Build scripts
- Proper `src/` and `dist/` structure

### Advanced TypeScript Template
```bash
npx @axrxvm/betterdiscordjs create my-bot --typescript -t advanced
```
Creates an advanced TypeScript project with all features.

### Custom Template and Prefix
```bash
npx @axrxvm/betterdiscordjs create my-bot --template minimal --yes
```
Creates a minimal JavaScript project without prompts.

### Skip Dependency Installation
```bash
npx @axrxvm/betterdiscordjs create my-bot --no-install
```
Creates the project but skips `npm install` (you'll need to run it manually).

## TypeScript Support

The CLI fully supports TypeScript projects with:

### Features
- ✅ Proper `tsconfig.json` with strict type checking
- ✅ Organized `src/` directory structure
- ✅ Type-safe command and event handlers
- ✅ Build scripts configured in `package.json`
- ✅ TypeScript dependencies automatically installed
- ✅ Source maps and declarations
- ✅ Import/export syntax with ES modules

### Scripts (TypeScript Projects)
```bash
npm start        # Run compiled code from dist/
npm run build    # Compile TypeScript to JavaScript
npm run dev      # Build and run
npm run typecheck # Check types without emitting
npm run build:watch # Watch mode compilation
```

### Type Safety
All TypeScript templates include proper type definitions:

```typescript
import type { Command } from '@axrxvm/betterdiscordjs';

const command: Command = {
  name: 'example',
  description: 'An example command',
  slash: true,
  run: async (ctx) => {
    // Full type checking and autocomplete
    await ctx.reply('Hello!');
  }
};

export default command;
```

## After Creation

Once your project is created:

### JavaScript Project
1. Configure your bot token in `.env`
2. Run `npm start` to start your bot
3. Add commands in `commands/` directory
4. Add events in `events/` directory

### TypeScript Project
1. Configure your bot token in `.env`
2. Run `npm run build` to compile
3. Run `npm start` to start your bot
4. Or use `npm run dev` to build and start in one command

## Project Structure Details

### Environment Variables (.env)
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
DEV_GUILD=your_dev_guild_id_here
PREFIX=!
BOT_OWNER_ID=your_user_id_here
```

### TypeScript Configuration (tsconfig.json)
The CLI generates an optimized TypeScript configuration with:
- ES2022 target
- CommonJS modules
- Strict type checking
- Source maps
- Declaration files
- JSON module resolution

## Validation

The CLI validates:
- ✅ Project names (alphanumeric, hyphens, underscores only)
- ✅ Reserved names (prevents using `node_modules`, `npm`, etc.)
- ✅ Directory conflicts (checks if directory exists)
- ✅ Template names (ensures valid template selection)
- ✅ Command prefixes (length and format validation)

## Architecture

The CLI is built with a modular architecture:

```
cli/
├── index.js           # Main CLI entry point
├── lib/
│   ├── colors.js      # ANSI color definitions
│   ├── logger.js      # Logging utilities
│   ├── prompts.js     # Interactive prompts
│   ├── validator.js   # Input validation
│   ├── generator.js   # Project generation logic
│   └── templates.js   # Template management
└── templates/
    ├── javascript/
    │   ├── basic/
    │   ├── advanced/
    │   └── minimal/
    └── typescript/
        ├── basic/
        ├── advanced/
        └── minimal/
```

## Error Handling

The CLI includes comprehensive error handling:
- Input validation errors
- File system errors
- Installation failures
- Graceful interruption (CTRL+C)
- Clear error messages with suggestions

## Documentation

For full documentation:
- [Getting Started Guide](../docs/getting-started/cli.md)
- [betterdiscordjs Documentation](../docs/)
- [TypeScript Guide](../TYPESCRIPT.md)
- [Examples](../examples/)

## Support

- **Issues**: [GitHub Issues](https://github.com/axrxvm/betterdiscordjs/issues)
- **Discussions**: [GitHub Discussions](https://github.com/axrxvm/betterdiscordjs/discussions)
- **Documentation**: [Full Docs](https://github.com/axrxvm/betterdiscordjs/tree/main/docs)

## License

MIT
