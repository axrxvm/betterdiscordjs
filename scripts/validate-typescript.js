#!/usr/bin/env node

/**
 * Comprehensive TypeScript validation script
 * Checks all TypeScript files including CLI templates
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.join(__dirname, '..');
const templateDirs = [
  'cli/templates/typescript/minimal',
  'cli/templates/typescript/basic',
  'cli/templates/typescript/advanced',
];

console.log('🔍 Running comprehensive TypeScript validation...\n');

let hasErrors = false;

// Check root project
console.log('📦 Checking root project...');
try {
  execSync('npx tsc --noEmit', { 
    cwd: rootDir, 
    stdio: 'inherit',
    encoding: 'utf8'
  });
  console.log('✅ Root project: OK\n');
} catch (error) {
  console.error('❌ Root project: FAILED\n');
  hasErrors = true;
}

// Check examples
console.log('📦 Checking examples...');
const examplesPath = path.join(rootDir, 'examples');
if (fs.existsSync(examplesPath) && fs.existsSync(path.join(examplesPath, 'tsconfig.json'))) {
  try {
    execSync('npx tsc --noEmit', { 
      cwd: examplesPath, 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    console.log('✅ Examples: OK\n');
  } catch (error) {
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    console.error('❌ Examples: FAILED\n');
    hasErrors = true;
  }
} else {
  console.log('⚠️  Examples: SKIPPED (no tsconfig.json found)\n');
}

// Check each CLI template
for (const templateDir of templateDirs) {
  const fullPath = path.join(rootDir, templateDir);
  const tsconfigPath = path.join(fullPath, 'tsconfig.json');
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Template ${templateDir}: SKIPPED (directory not found)\n`);
    continue;
  }
  
  if (!fs.existsSync(tsconfigPath)) {
    console.log(`⚠️  Template ${templateDir}: SKIPPED (no tsconfig.json)\n`);
    continue;
  }

  console.log(`📦 Checking template: ${templateDir}...`);
  try {
    execSync('npx tsc --noEmit', { 
      cwd: fullPath, 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    console.log(`✅ Template ${templateDir}: OK\n`);
  } catch (error) {
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    console.error(`❌ Template ${templateDir}: FAILED\n`);
    hasErrors = true;
  }
}

// Final summary
console.log('━'.repeat(50));
if (hasErrors) {
  console.error('❌ TypeScript validation FAILED');
  process.exit(1);
} else {
  console.log('✅ All TypeScript checks passed!');
  process.exit(0);
}
