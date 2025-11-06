# betterdiscordjs CLI

Command-line tool for scaffolding betterdiscordjs projects.

## Usage

```bash
npx @axrxvm/betterdiscordjs create <project-name> [options]
```

## Features

- 🚀 **Quick Project Setup** - Create a new bot project in seconds
- 📦 **Multiple Templates** - Choose from basic, advanced, or minimal templates
- 🎨 **Interactive CLI** - Beautiful colored output with prompts
- 🔧 **Auto Configuration** - Generates .env, .gitignore, and all necessary files
- 📚 **Example Code** - Includes example commands and events
- ⚡ **Auto Install** - Optionally installs dependencies automatically

## Templates

### Basic (Default)
Complete setup with example commands and events. Perfect for beginners.

**Includes:**
- Example commands (ping, help, userinfo)
- Example events (ready, guildCreate)
- Organized file structure
- Environment configuration
- README with instructions

### Advanced
Full-featured setup with plugins, advanced commands, and configuration.

**Includes everything in Basic plus:**
- Plugin system integration
- Configuration file (config.json)
- Advanced commands (poll, remind)
- Advanced event handlers
- Database setup
- Scheduled tasks

### Minimal
Bare minimum for experienced developers who want to start from scratch.

**Includes:**
- Basic index.js
- Environment setup
- Package configuration

## Options

- `--template, -t <type>` - Template to use (basic|advanced|minimal)
- `--yes, -y` - Skip prompts and use defaults
- `--no-install` - Don't install dependencies automatically
- `--help, -h` - Show help message

## Examples

```bash
# Interactive setup
npx @axrxvm/betterdiscordjs create my-bot

# Quick setup with defaults
npx @axrxvm/betterdiscordjs create my-bot --yes

# Advanced template
npx @axrxvm/betterdiscordjs create my-bot --template advanced

# Minimal template without auto-install
npx @axrxvm/betterdiscordjs create my-bot -t minimal --no-install
```

## Documentation

For full documentation, see [docs/getting-started/cli.md](../docs/getting-started/cli.md)

## License

MIT
