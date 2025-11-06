# CLI Examples

Practical examples of using the betterdiscordjs CLI tool.

## Basic Usage

### Interactive Setup
```bash
npx @axrxvm/betterdiscordjs create my-bot
```

This will prompt you for:
- Template choice (basic/advanced/minimal)
- Command prefix
- Whether to install dependencies

### Non-Interactive Setup
```bash
npx @axrxvm/betterdiscordjs create my-bot --yes
```

Uses all defaults:
- Template: basic
- Prefix: !
- Auto-install: yes

## Template Examples

### Create Basic Bot
```bash
npx @axrxvm/betterdiscordjs create my-bot --template basic
cd my-bot
```

**What you get:**
- Commands: ping, help, userinfo
- Events: ready, guildCreate
- Full documentation

### Create Advanced Bot
```bash
npx @axrxvm/betterdiscordjs create advanced-bot --template advanced
cd advanced-bot
```

**What you get:**
- Everything in basic plus:
- Commands: poll, remind
- Events: messageCreate with auto-moderation
- Plugin system setup
- Configuration file
- Database setup

### Create Minimal Bot
```bash
npx @axrxvm/betterdiscordjs create minimal-bot --template minimal
cd minimal-bot
```

**What you get:**
- Basic index.js only
- No example commands/events
- Perfect for experienced devs

## Custom Prefix Examples

### Using Interactive Mode
```bash
npx @axrxvm/betterdiscordjs create my-bot
# When prompted, enter your desired prefix: $
```

### Pre-configured Project
```bash
# Create project
npx @axrxvm/betterdiscordjs create my-bot --yes

# Update prefix in .env
cd my-bot
echo "PREFIX=$" >> .env
```

## Multiple Bots

### Create Multiple Bots at Once
```bash
# Production bot
npx @axrxvm/betterdiscordjs create prod-bot --template advanced -y

# Development bot
npx @axrxvm/betterdiscordjs create dev-bot --template basic -y

# Testing bot
npx @axrxvm/betterdiscordjs create test-bot --template minimal -y
```

### Different Configurations
```bash
# Moderation bot
npx @axrxvm/betterdiscordjs create mod-bot --template advanced
cd mod-bot
# Configure for moderation in config.json

# Music bot
npx @axrxvm/betterdiscordjs create music-bot --template basic
cd music-bot
# Add music commands

# Utility bot
npx @axrxvm/betterdiscordjs create util-bot --template basic
cd util-bot
# Add utility commands
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Create Bot

on:
  workflow_dispatch:
    inputs:
      bot_name:
        description: 'Bot name'
        required: true
        default: 'my-bot'

jobs:
  create:
    runs-on: ubuntu-latest
    steps:
      - name: Create bot project
        run: npx @axrxvm/betterdiscordjs create ${{ github.event.inputs.bot_name }} --yes --no-install
      
      - name: Install dependencies
        run: |
          cd ${{ github.event.inputs.bot_name }}
          npm install
      
      - name: Configure bot
        run: |
          cd ${{ github.event.inputs.bot_name }}
          echo "DISCORD_TOKEN=${{ secrets.DISCORD_TOKEN }}" > .env
          echo "CLIENT_ID=${{ secrets.CLIENT_ID }}" >> .env
          echo "PREFIX=!" >> .env
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: bot-project
          path: ${{ github.event.inputs.bot_name }}
```

### Docker Setup
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Create bot using CLI
RUN npx @axrxvm/betterdiscordjs create bot --yes --no-install

WORKDIR /app/bot

# Install dependencies
RUN npm install

# Copy environment configuration
COPY .env .env

# Start bot
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  bot:
    build: .
    environment:
      - DISCORD_TOKEN=${DISCORD_TOKEN}
      - CLIENT_ID=${CLIENT_ID}
      - PREFIX=!
    restart: unless-stopped
```

## Scripted Setup

### Bash Script
```bash
#!/bin/bash

# Create and configure bot
npx @axrxvm/betterdiscordjs create $1 --yes

cd $1

# Configure environment
cat > .env << EOF
DISCORD_TOKEN=$DISCORD_TOKEN
CLIENT_ID=$CLIENT_ID
DEV_GUILD=$DEV_GUILD
PREFIX=!
EOF

# Start bot
npm start
```

Usage:
```bash
export DISCORD_TOKEN="your_token"
export CLIENT_ID="your_client_id"
export DEV_GUILD="your_guild_id"
./create-bot.sh my-awesome-bot
```

### PowerShell Script
```powershell
param(
    [Parameter(Mandatory=$true)]
    [string]$BotName,
    
    [Parameter(Mandatory=$false)]
    [string]$Template = "basic"
)

# Create bot
npx @axrxvm/betterdiscordjs create $BotName --template $Template --yes

Set-Location $BotName

# Configure environment
@"
DISCORD_TOKEN=$env:DISCORD_TOKEN
CLIENT_ID=$env:CLIENT_ID
DEV_GUILD=$env:DEV_GUILD
PREFIX=!
"@ | Out-File -FilePath .env

# Start bot
npm start
```

Usage:
```powershell
$env:DISCORD_TOKEN = "your_token"
$env:CLIENT_ID = "your_client_id"
$env:DEV_GUILD = "your_guild_id"
.\create-bot.ps1 -BotName "my-bot" -Template "advanced"
```

## Package Manager Examples

### Using npm
```bash
npx @axrxvm/betterdiscordjs create my-bot
cd my-bot
npm start
```

### Using pnpm
```bash
npx @axrxvm/betterdiscordjs create my-bot --no-install
cd my-bot
pnpm install
pnpm start
```

### Using yarn
```bash
npx @axrxvm/betterdiscordjs create my-bot --no-install
cd my-bot
yarn install
yarn start
```

### Using bun
```bash
npx @axrxvm/betterdiscordjs create my-bot --no-install
cd my-bot
bun install
bun index.js
```

## Advanced Examples

### Custom Template Location
```bash
# Create bot
npx @axrxvm/betterdiscordjs create my-bot --yes

# Replace with custom template
cd my-bot
rm -rf commands events
cp -r ../my-custom-template/* .
npm start
```

### Automated Testing Setup
```bash
# Create bot
npx @axrxvm/betterdiscordjs create test-bot --template basic --yes

cd test-bot

# Add testing dependencies
npm install --save-dev jest @types/jest

# Create test directory
mkdir tests

# Add test script to package.json
npm pkg set scripts.test="jest"

# Create sample test
cat > tests/commands.test.js << 'EOF'
describe('Commands', () => {
  test('ping command exists', () => {
    const fs = require('fs');
    expect(fs.existsSync('./commands/ping.js')).toBe(true);
  });
});
EOF

# Run tests
npm test
```

### Multi-Environment Setup
```bash
# Development
npx @axrxvm/betterdiscordjs create my-bot --template basic --yes
cd my-bot
cp .env .env.development
cp .env .env.production

# Configure different tokens for each environment
echo "DISCORD_TOKEN=dev_token" > .env.development
echo "DISCORD_TOKEN=prod_token" > .env.production

# Start with specific env
NODE_ENV=development node index.js
# or
NODE_ENV=production node index.js
```

### Monorepo Setup
```bash
mkdir my-discord-bots
cd my-discord-bots

# Initialize monorepo
npm init -y

# Create multiple bots
npx @axrxvm/betterdiscordjs create bot1 --yes --no-install
npx @axrxvm/betterdiscordjs create bot2 --yes --no-install
npx @axrxvm/betterdiscordjs create bot3 --yes --no-install

# Install dependencies from root
npm install --workspaces

# Configure package.json
npm pkg set workspaces='["bot1","bot2","bot3"]'
```

## Troubleshooting Examples

### Permission Issues
```bash
# Linux/Mac: If you get permission errors
sudo npx @axrxvm/betterdiscordjs create my-bot

# Better: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
npx @axrxvm/betterdiscordjs create my-bot
```

### Network Issues
```bash
# Use different registry
npm config set registry https://registry.npmjs.org/
npx @axrxvm/betterdiscordjs create my-bot

# Or use yarn
yarn dlx @axrxvm/betterdiscordjs create my-bot
```

### Cleanup Failed Attempts
```bash
# Remove failed project
rm -rf my-bot

# Try again with verbose output
npx @axrxvm/betterdiscordjs create my-bot --verbose
```

## Production Deployment Examples

### Heroku
```bash
# Create bot
npx @axrxvm/betterdiscordjs create heroku-bot --yes

cd heroku-bot

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create Heroku app
heroku create my-discord-bot

# Set environment variables
heroku config:set DISCORD_TOKEN=your_token
heroku config:set CLIENT_ID=your_client_id

# Deploy
git push heroku main
```

### Railway
```bash
# Create bot
npx @axrxvm/betterdiscordjs create railway-bot --yes

cd railway-bot

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Deploy to Railway (using Railway CLI)
railway init
railway up
```

### DigitalOcean App Platform
```bash
# Create bot
npx @axrxvm/betterdiscordjs create do-bot --yes

cd do-bot

# Create app spec
cat > .do/app.yaml << EOF
name: discord-bot
services:
  - name: bot
    source_dir: /
    run_command: npm start
    envs:
      - key: DISCORD_TOKEN
        value: \${DISCORD_TOKEN}
EOF

# Deploy using doctl
doctl apps create --spec .do/app.yaml
```

## Quick Reference

```bash
# Basic usage
npx @axrxvm/betterdiscordjs create <name>

# With options
npx @axrxvm/betterdiscordjs create <name> [--template <type>] [--yes] [--no-install]

# Templates
--template basic      # Default, complete setup
--template advanced   # With plugins and config
--template minimal    # Bare minimum

# Flags
--yes, -y            # Skip prompts
--no-install         # Skip npm install
--help, -h           # Show help
```

---

**More examples?** Check the [full CLI documentation](./cli.md)
