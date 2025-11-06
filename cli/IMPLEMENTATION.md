# CLI Implementation Guide# CLI Implementation Summary



## Overview## Overview



The betterdiscordjs CLI is a comprehensive, modular command-line tool for scaffolding Discord bot projects with full JavaScript and TypeScript support.Successfully implemented a comprehensive CLI tool for betterdiscordjs that allows users to scaffold new Discord bot projects quickly and easily.



## Key Features## Features Implemented



✅ **TypeScript Support** - Full TypeScript project scaffolding  ### 1. CLI Tool (`cli/index.js`)

✅ **Interactive Prompts** - User-friendly interactive configuration  ✅ Complete command-line interface with:

✅ **Multiple Templates** - Basic, Advanced, and Minimal options  - Interactive project setup with prompts

✅ **Input Validation** - Comprehensive validation for all inputs  - Non-interactive mode with `--yes` flag

✅ **Modular Architecture** - Clean, maintainable codebase  - Multiple template options (basic, advanced, minimal)

✅ **Error Handling** - Robust error handling and recovery  - Automatic dependency installation (optional with `--no-install`)

✅ **Auto Installation** - Optional automatic dependency installation  - Beautiful colored terminal output

- Comprehensive help system

## Architecture- Error handling and validation



### Directory Structure### 2. Project Templates



```#### Basic Template (Default)

cli/- Organized file structure (commands/, events/, data/)

├── index.js              # Main CLI entry point- 3 example commands: ping, help, userinfo

├── lib/                  # Utility modules- 2 example events: ready, guildCreate

│   ├── colors.js         # ANSI color codes- Environment configuration (.env, .env.example)

│   ├── logger.js         # Logging with spinners- Git configuration (.gitignore)

│   ├── prompts.js        # Interactive prompts- Package.json with start scripts

│   ├── validator.js      # Input validation- Comprehensive README

│   ├── generator.js      # Project generation

│   └── templates.js      # Template management#### Advanced Template

└── templates/            # Project templatesEverything in Basic plus:

    ├── javascript/       # JS templates- Plugin system integration

    │   ├── basic/- Configuration file (config.json)

    │   ├── advanced/- 5 example commands (ping, help, userinfo, poll, remind)

    │   └── minimal/- 3 example events (ready, guildCreate, messageCreate with auto-mod)

    └── typescript/       # TS templates- Database setup

        ├── basic/- Scheduled tasks example

        ├── advanced/- Global command hooks

        └── minimal/

```#### Minimal Template

- Bare minimum setup

## Module Documentation- Basic index.js only

- Environment configuration

### index.js - Main CLI- No example commands/events

- Perfect for experienced developers

**Purpose:** CLI entry point, argument parsing, command routing

### 3. Generated Files

**Key Functions:**

- `showBanner()` - Display CLI bannerAll templates include:

- `showHelp()` - Show help information- `package.json` - Dependencies and scripts

- `createProject()` - Main project creation logic- `.env` - Environment variables (with token placeholders)

- `showSuccessMessage()` - Display success message with next steps- `.env.example` - Template for environment variables

- `main()` - CLI entry point with error handling- `.gitignore` - Properly configured for Discord bots

- `README.md` - Setup instructions

**Features:**- `index.js` - Main bot file

- Argument parsing for all CLI options- Directory structure

- Interactive and non-interactive modes

- Process event handling (SIGINT, uncaughtException)### 4. Documentation

- Comprehensive help system

Created comprehensive documentation:

### lib/colors.js- **CLI Guide** (`docs/getting-started/cli.md`) - 400+ lines of detailed documentation

- **CLI vs Manual** (`docs/getting-started/cli-vs-manual.md`) - Comparison and time-saving analysis

**Purpose:** ANSI color code constants- **CLI Examples** (`docs/examples/cli-examples.md`) - Real-world usage examples

- **Migration Guide** (`docs/getting-started/migration.md`) - Discord.js to betterdiscordjs migration

**Exports:**- **CLI README** (`cli/README.md`) - Quick reference

```javascript

{### 5. Package Configuration

  reset, bright, dim, underscore,

  black, red, green, yellow, blue, magenta, cyan, white,Updated `package.json`:

  bgBlack, bgRed, bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite- Added `bin` entry for CLI execution

}- Added npm scripts for CLI testing

```- Properly configured for npx usage



### lib/logger.js### 6. Updated Existing Documentation



**Purpose:** Formatted logging utilities- Updated main README.md to highlight CLI tool

- Added CLI to documentation index

**Functions:**- Added CLI to MkDocs navigation

- `info(msg)` - Info message with ℹ icon- Updated Quick Start guide to show CLI first

- `success(msg)` - Success message with ✓ icon- Created CHANGELOG.md with version history

- `warn(msg)` - Warning message with ⚠ icon

- `error(msg)` - Error message with ✗ icon## Usage

- `title(msg)` - Section title

- `dim(msg)` - Dimmed text### Basic Usage

- `start(msg)` - Start progress spinner```bash

- `update(msg)` - Update progress spinnernpx @axrxvm/betterdiscordjs create my-bot

- `finish(msg)` - Finish with success```

- `fail(msg)` - Finish with error

### With Options

### lib/prompts.js```bash

npx @axrxvm/betterdiscordjs create my-bot --template advanced --yes

**Purpose:** Interactive user prompts```



**Functions:**### Help

- `question(query)` - Basic question prompt```bash

- `confirm(message, defaultValue)` - Yes/no confirmationnpx @axrxvm/betterdiscordjs --help

- `select(message, choices, defaultChoice)` - Multiple choice```

- `input(message, defaultValue)` - Text input

- `close()` - Close readline interface## CLI Options



**Features:**| Option | Short | Description |

- Colored prompts|--------|-------|-------------|

- Default value support| `--template <type>` | `-t` | Template to use (basic\|advanced\|minimal) |

- Input sanitization| `--yes` | `-y` | Skip prompts and use defaults |

| `--no-install` | | Don't install dependencies automatically |

### lib/validator.js| `--help` | `-h` | Show help message |



**Purpose:** Input validation## Example Workflows



**Functions:**### Quick Start

- `validateProjectName(name)` - Validates project names```bash

  - Alphanumeric, hyphens, underscores onlynpx @axrxvm/betterdiscordjs create my-bot

  - No reserved names (node_modules, npm, etc.)cd my-bot

  - No leading dots or underscores# Edit .env

  npm start

- `checkDirectory(dirPath)` - Checks directory status```

  - Returns existence and emptiness

  ### Advanced Bot

- `validateTemplate(template)` - Validates template names```bash

  - Must be: basic, advanced, or minimalnpx @axrxvm/betterdiscordjs create my-bot -t advanced

  cd my-bot

- `validatePrefix(prefix)` - Validates command prefix# Configure config.json and .env

  - Not emptynpm start

  - Max 5 characters```



**Return Format:**### Multiple Bots

```javascript```bash

{ valid: boolean, error?: string }npx @axrxvm/betterdiscordjs create prod-bot -t advanced -y

```npx @axrxvm/betterdiscordjs create dev-bot -t basic -y

npx @axrxvm/betterdiscordjs create test-bot -t minimal -y

### lib/generator.js```



**Purpose:** Project generation logic## Files Created



**Main Functions:**### CLI Directory Structure

```

`generateProject(projectPath, config)`cli/

- Creates complete project structure├── index.js          # Main CLI tool (700+ lines)

- Generates all files from templates├── README.md         # CLI quick reference

- Replaces placeholders└── templates/        # Future: Custom template support

```

`installDependencies(projectPath)`

- Runs npm install### Generated Project Structure (Basic Template)

- Handles errors gracefully```

- Returns success statusmy-bot/

├── commands/

**Helper Functions:**│   ├── ping.js       # Latency check command

- `createDirectories()` - Creates folder structure│   ├── help.js       # Command list

- `createPackageJson()` - Generates package.json│   └── userinfo.js   # User information

- `createEnvFiles()` - Creates .env files├── events/

- `createGitignore()` - Creates .gitignore│   ├── ready.js      # Bot startup event

- `createMainFile()` - Creates entry point│   └── guildCreate.js # New server event

- `createCommands()` - Creates command files├── data/

- `createEvents()` - Creates event files│   └── .gitkeep      # Placeholder for data files

- `createConfig()` - Creates config.json├── index.js          # Main bot file

- `createTsConfig()` - Creates tsconfig.json├── .env              # Environment variables

- `createReadme()` - Creates README.md├── .env.example      # Environment template

├── .gitignore        # Git ignore rules

### lib/templates.js├── package.json      # Project configuration

├── README.md         # Setup instructions

**Purpose:** Template file management└── node_modules/     # Dependencies (if installed)

```

**Functions:**

- `getTemplateContent(language, template, file, config)` - Read template## Benefits

- `getTemplateFiles(language, template)` - List template files

- `templateExists(language, template)` - Check existence### Time Savings

- **Manual setup:** 10-15 minutes

**Placeholder System:**- **CLI setup:** 30 seconds

- `{{PROJECT_NAME}}` - Project name- **Savings:** ~10-14 minutes per project

- `{{PREFIX}}` - Command prefix

- `{{DESCRIPTION}}` - Project description### Quality

- Consistent project structure

## Templates- Best practices built-in

- Example code to learn from

### JavaScript Templates- Proper git configuration

- Environment security (.env not committed)

#### Basic Template Structure

```### Developer Experience

basic/- Beautiful colored output

├── index.js- Interactive prompts

├── commands/- Helpful error messages

│   ├── ping.js- Comprehensive documentation

│   ├── help.js- Multiple templates for different needs

│   └── userinfo.js

└── events/## Testing

    ├── ready.js

    └── guildCreate.jsThe CLI has been tested and verified:

```- ✅ Help command works

- ✅ Creates proper directory structure

#### Advanced Template Additions- ✅ Generates all necessary files

```- ✅ Handles options correctly

advanced/- ✅ Interactive mode works

├── config.json- ✅ Non-interactive mode works

├── commands/- ✅ Template selection works

│   ├── poll.js

│   └── remind.js## Next Steps for Users

└── events/

    └── messageCreate.jsAfter creating a project:

```1. Navigate to project directory

2. Edit `.env` with Discord bot credentials

#### Minimal Template3. Run `npm start`

```4. Invite bot to server

minimal/5. Test commands

└── index.js

```## Integration Examples



### TypeScript Templates### GitHub Actions

```yaml

Same structure as JavaScript but with:- run: npx @axrxvm/betterdiscordjs create bot --yes --no-install

- `.ts` file extensions```

- `src/` directory

- `tsconfig.json`### Docker

- Type imports and exports```dockerfile

- Type annotationsRUN npx @axrxvm/betterdiscordjs create bot --yes --no-install

```

#### TypeScript Structure

```### Scripts

basic/```bash

├── src/npx @axrxvm/betterdiscordjs create $1 --yes

│   ├── index.ts```

│   ├── commands/

│   │   ├── ping.ts## Documentation Links

│   │   ├── help.ts

│   │   └── userinfo.ts- [CLI Guide](../docs/getting-started/cli.md)

│   └── events/- [CLI vs Manual](../docs/getting-started/cli-vs-manual.md)

│       ├── ready.ts- [CLI Examples](../docs/examples/cli-examples.md)

│       └── guildCreate.ts- [Migration Guide](../docs/getting-started/migration.md)

└── tsconfig.json- [Quick Start](../docs/getting-started/quick-start.md)

```

## Changelog Entry

## CLI Usage

Added to CHANGELOG.md:

### Commands- CLI Tool implementation

- Three template options

```bash- Interactive project setup

betterdjs create <project-name> [options]- Complete documentation

```

## Future Enhancements (Optional)

### Options

Potential future improvements:

| Option | Alias | Description |- Custom template URLs

|--------|-------|-------------|- Project updates/migrations

| `--typescript` | `--ts` | Create TypeScript project |- Plugin installation via CLI

| `--javascript` | `--js` | Create JavaScript project |- Command generation tool

| `--template <type>` | `-t` | Template: basic/advanced/minimal |- Event generation tool

| `--yes` | `-y` | Skip prompts, use defaults |- Interactive tutorial mode

| `--no-install` | | Skip npm install |- Project validation tool

| `--help` | `-h` | Show help |- Deployment helpers



### Examples## Conclusion



```bashThe CLI tool is fully implemented, tested, and documented. It provides a seamless experience for users to get started with betterdiscordjs quickly and efficiently.

# Interactive setup

betterdjs create my-bot**Status:** ✅ Complete and Ready for Use


# TypeScript with advanced template
betterdjs create my-bot --typescript -t advanced

# Quick setup, no prompts
betterdjs create my-bot --yes

# JavaScript minimal, no install
betterdjs create my-bot -t minimal --no-install
```

## Generated Project

### JavaScript Project

**Files Created:**
```
my-bot/
├── commands/           # Command files
├── events/             # Event handlers
├── data/               # Data storage
│   └── .gitkeep
├── index.js            # Main entry point
├── .env                # Environment config
├── .env.example        # Example env
├── .gitignore          # Git ignore
├── package.json        # Package config
└── README.md           # Documentation
```

**package.json Scripts:**
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  }
}
```

### TypeScript Project

**Files Created:**
```
my-bot/
├── src/
│   ├── commands/       # Command files (.ts)
│   ├── events/         # Event handlers (.ts)
│   └── index.ts        # Main entry point
├── dist/               # Compiled output (after build)
├── data/               # Data storage
├── tsconfig.json       # TS configuration
├── .env                # Environment config
├── .env.example        # Example env
├── .gitignore          # Git ignore
├── package.json        # Package config
└── README.md           # Documentation
```

**package.json Scripts:**
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "dev": "npm run build && npm start",
    "build": "tsc",
    "build:watch": "tsc --watch",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3"
  }
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Implementation Details

### Validation Rules

**Project Name:**
- Only alphanumeric, hyphens, underscores
- No reserved names (node_modules, npm, con, prn, aux, nul, package)
- Cannot start with dot or underscore

**Command Prefix:**
- Cannot be empty
- Maximum 5 characters

**Template:**
- Must be: basic, advanced, or minimal

### Error Handling

**Input Errors:**
- Invalid project name → Clear error message
- Existing directory → Check if empty
- Invalid template → List valid options
- Invalid prefix → Show requirements

**Process Errors:**
- SIGINT → Clean exit with message
- Uncaught exception → Error message, exit
- Installation failure → Warn, suggest manual install

**File System Errors:**
- Permission denied → Clear error message
- Disk full → Error message
- Invalid path → Validation

### Progress Feedback

**Visual Feedback:**
- Spinner during operations
- Success checkmarks
- Error X marks
- Color-coded messages
- Clear section titles

**Messages:**
- Project summary before creation
- Progress updates during creation
- Success message with next steps
- Resource links

## Development

### Adding New Template

1. Create template directory:
   ```bash
   mkdir -p cli/templates/javascript/my-template
   # or
   mkdir -p cli/templates/typescript/my-template
   ```

2. Add template files with placeholders

3. Update `validator.js`:
   ```javascript
   const validTemplates = ['basic', 'advanced', 'minimal', 'my-template'];
   ```

4. Update documentation

### Testing

**Local Testing:**
```bash
node cli/index.js create test-bot --yes --no-install
```

**Package Testing:**
```bash
npm link
betterdjs create test-bot
npm unlink
```

**Cleanup:**
```bash
rm -rf test-bot
```

### Best Practices

1. **Always validate input** - Use validator module
2. **Clear error messages** - Help users understand issues
3. **Consistent colors** - Follow established patterns
4. **Close readline properly** - Call prompts.close()
5. **Handle interruptions** - SIGINT, exceptions
6. **Complete projects** - All necessary files

## Future Enhancements

### Planned Features

1. **Additional Templates**
   - REST API bot
   - Music bot
   - Moderation bot
   - Dashboard bot

2. **Enhanced Prompts**
   - Arrow key navigation
   - Colored multi-select
   - Better visual feedback

3. **Configuration**
   - Custom template directories
   - Template registry
   - User preferences

4. **Features**
   - Git initialization
   - Testing setup
   - CI/CD configuration
   - Docker support

5. **Integrations**
   - Database migrations
   - Plugin installer
   - Deployment tools

## Troubleshooting

### Common Issues

**"Project name is required"**
```bash
# Fix: Provide project name
betterdjs create my-bot
```

**"Directory already exists"**
```bash
# Fix: Use different name or remove directory
rm -rf existing-bot
betterdjs create new-bot
```

**"Invalid template"**
```bash
# Fix: Use valid template name
betterdjs create my-bot --template basic
```

**"Failed to install dependencies"**
```bash
# Fix: Install manually
cd my-bot
npm install
```

**Permission errors**
```bash
# Fix: Run with appropriate permissions
sudo betterdjs create my-bot  # Unix/Linux
# Or run terminal as administrator on Windows
```

## License

MIT
