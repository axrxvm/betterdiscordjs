/**
 * Build script to generate ESM wrappers for CommonJS modules
 * This creates .mjs files that properly import and re-export CommonJS modules
 */

const fs = require('fs');
const path = require('path');

const esmDir = path.join(__dirname, '../esm');

// Create esm directory structure
function createDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Generate ESM wrapper for a CommonJS module
function generateEsmWrapper(cjsPath, esmPath, exportType = 'default') {
  const relativePath = path.relative(path.dirname(esmPath), cjsPath).replace(/\\/g, '/');
  
  let content;
  if (exportType === 'named') {
    content = `import mod from '${relativePath}';\nexport default mod;\nexport * from '${relativePath}';\n`;
  } else {
    content = `import mod from '${relativePath}';\nexport default mod;\n`;
  }
  
  fs.writeFileSync(esmPath, content);
  console.log(`Generated: ${esmPath}`);
}

// Main build function
function buildEsm() {
  console.log('Building ESM wrappers...\n');
  
  // Create directory structure
  createDir(esmDir);
  createDir(path.join(esmDir, 'utils'));
  createDir(path.join(esmDir, 'plugins'));
  createDir(path.join(esmDir, 'plugins/welcome'));
  createDir(path.join(esmDir, 'plugins/moderation'));
  createDir(path.join(esmDir, 'plugins/automod'));
  createDir(path.join(esmDir, 'loaders'));

  // Main entry point
  generateEsmWrapper(
    path.join(__dirname, '../index.js'),
    path.join(esmDir, 'index.mjs'),
    'named'
  );

  // Bot class
  generateEsmWrapper(
    path.join(__dirname, '../Bot.js'),
    path.join(esmDir, 'Bot.mjs')
  );

  // Utilities
  const utils = ['cache', 'colors', 'ctx', 'db', 'logger', 'queue', 'rateLimit', 'scheduler', 'session', 'stats', 'time'];
  utils.forEach(util => {
    generateEsmWrapper(
      path.join(__dirname, `../utils/${util}.js`),
      path.join(esmDir, `utils/${util}.mjs`)
    );
  });

  // Plugins
  generateEsmWrapper(
    path.join(__dirname, '../plugins/BasePlugin.js'),
    path.join(esmDir, 'plugins/BasePlugin.mjs')
  );
  
  generateEsmWrapper(
    path.join(__dirname, '../plugins/PluginManager.js'),
    path.join(esmDir, 'plugins/PluginManager.mjs')
  );

  generateEsmWrapper(
    path.join(__dirname, '../plugins/welcome/index.js'),
    path.join(esmDir, 'plugins/welcome/index.mjs')
  );

  generateEsmWrapper(
    path.join(__dirname, '../plugins/moderation/index.js'),
    path.join(esmDir, 'plugins/moderation/index.mjs')
  );

  generateEsmWrapper(
    path.join(__dirname, '../plugins/automod/index.js'),
    path.join(esmDir, 'plugins/automod/index.mjs')
  );

  // Loaders
  generateEsmWrapper(
    path.join(__dirname, '../loaders/commands.js'),
    path.join(esmDir, 'loaders/commands.mjs')
  );

  generateEsmWrapper(
    path.join(__dirname, '../loaders/events.js'),
    path.join(esmDir, 'loaders/events.mjs')
  );

  console.log('\n✓ ESM build complete!');
}

// Run the build
try {
  buildEsm();
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
