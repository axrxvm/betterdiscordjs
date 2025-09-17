# Contributing to betterdiscordjs

Thank you for your interest in contributing to betterdiscordjs! We welcome contributions from developers of all skill levels. This guide will help you get started.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork locally
3. **Install** dependencies: `npm install`
4. **Create** a feature branch: `git checkout -b feature/your-feature`
5. **Make** your changes
6. **Test** your changes
7. **Submit** a pull request

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Style Guidelines](#style-guidelines)
- [Project Structure](#project-structure)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

**Our Standards:**
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a welcoming environment

## 🛠️ Getting Started

### Prerequisites

- Node.js 16.9.0 or higher
- npm or yarn package manager
- Git
- A Discord bot token for testing

### Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/axrxvm/betterdiscordjs.git
   cd betterdiscordjs
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp testbot/.env.example testbot/.env
   # Edit testbot/.env and add your Discord bot token
   ```

4. **Test the setup:**
   ```bash
   npm run test
   ```

## 🔧 Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/command-cooldowns` - New features
- `fix/memory-leak` - Bug fixes
- `docs/api-reference` - Documentation updates
- `refactor/plugin-system` - Code refactoring

### Commit Messages

Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(commands): add cooldown system
fix(ctx): resolve memory leak in context object
docs(readme): update installation instructions
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --grep "Bot class"

# Run tests with coverage
npm run test:coverage
```

### Test Bot

Use the test bot to verify your changes:

```bash
cd testbot
node index.js
```

### Writing Tests

- Write tests for new features
- Update existing tests when modifying functionality
- Ensure tests are descriptive and cover edge cases
- Use the existing test structure as a guide

## 📤 Submitting Changes

### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update CHANGELOG.md** if applicable
5. **Create a pull request** with a clear title and description

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Tests pass locally
- [ ] New tests added (if applicable)
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

## 🎨 Style Guidelines

### JavaScript Style

- Use **ES6+** features where appropriate
- Follow **camelCase** for variables and functions
- Use **PascalCase** for classes
- Use **UPPER_SNAKE_CASE** for constants
- Prefer **async/await** over promises
- Use **destructuring** when beneficial

### Code Formatting

```javascript
// Good
const { Client, GatewayIntentBits } = require('discord.js');

class Bot {
  constructor(token, options = {}) {
    this.token = token;
    this.options = options;
  }

  async start() {
    // Implementation
  }
}

// Avoid
var client = require('discord.js').Client;
```

### Documentation

- Use **JSDoc** for function documentation
- Include **parameter types** and **return types**
- Provide **examples** for complex functions
- Keep comments **concise** and **relevant**

```javascript
/**
 * Creates a new command with the specified options.
 * @param {string} name - The command name
 * @param {Function} handler - The command handler function
 * @param {object} [options={}] - Additional command options
 * @param {string} [options.description] - Command description
 * @param {boolean} [options.slash] - Enable slash command
 * @returns {object} The created command object
 * @example
 * bot.command('ping', async (ctx) => {
 *   await ctx.reply('Pong!');
 * }, { description: 'Check bot latency' });
 */
command(name, handler, options = {}) {
  // Implementation
}
```

## 🏗️ Project Structure

Understanding the project structure helps you know where to make changes:

```
betterdiscordjs/
├── Bot.js                 # Main bot class
├── index.js              # Framework entry point
├── loaders/              # Command and event loaders
│   ├── commands.js
│   └── events.js
├── plugins/              # Plugin system
│   ├── BasePlugin.js
│   ├── PluginManager.js
│   └── built-in/         # Built-in plugins
├── utils/                # Utility modules
│   ├── cache.js
│   ├── ctx.js           # Context object
│   ├── logger.js
│   └── ...
├── testbot/             # Example implementation
├── docs/                # Documentation
└── tests/               # Test files
```

### Where to Make Changes

- **Core functionality** → `Bot.js`, `utils/`
- **Plugin system** → `plugins/`
- **Command/Event loading** → `loaders/`
- **Documentation** → `docs/`
- **Examples** → `testbot/`, `docs/examples/`

## 📚 Documentation

### Updating Documentation

- Update relevant `.md` files in `docs/`
- Include code examples
- Update API references
- Test documentation examples

### Documentation Structure

```
docs/
├── README.md            # Main documentation index
├── getting-started/     # Beginner guides
├── api/                 # API reference
├── plugins/             # Plugin documentation
├── examples/            # Code examples
└── deployment/          # Deployment guides
```

## 🐛 Reporting Issues

### Bug Reports

Include:
- **Clear description** of the issue
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Environment details** (Node.js version, OS, etc.)
- **Code samples** if applicable

### Feature Requests

Include:
- **Clear description** of the feature
- **Use case** and **motivation**
- **Proposed implementation** (if you have ideas)
- **Examples** of similar features

## 🏷️ Release Process

Releases follow semantic versioning (SemVer):
- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

## 🤝 Community

- **Be respectful** and constructive
- **Help others** learn and contribute
- **Share knowledge** and best practices
- **Celebrate contributions** from all skill levels

## 📞 Getting Help

- **Documentation** - Check the docs first
- **Issues** - Search existing issues
- **Discussions** - Ask questions in GitHub Discussions
- **Discord** - Join our community server (if available)

## 🙏 Recognition

Contributors are recognized in:
- **CHANGELOG.md** - For significant contributions
- **README.md** - In the acknowledgments section
- **Release notes** - For major features

---

Thank you for contributing to betterdiscordjs! Your efforts help make Discord bot development better for everyone. 🚀
