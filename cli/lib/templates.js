const fs = require('fs');
const path = require('path');

/**
 * Get template file content
 * @param {string} language - 'javascript' or 'typescript'
 * @param {string} template - Template name ('basic', 'advanced', 'minimal')
 * @param {string} file - File name
 * @param {object} config - Project configuration
 * @returns {string}
 */
function getTemplateContent(language, template, file, config = {}) {
  const templatesDir = path.join(__dirname, '..', 'templates', language, template);
  const filePath = path.join(templatesDir, file);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace placeholders
  content = content
    .replace(/\{\{PROJECT_NAME\}\}/g, config.projectName || 'my-bot')
    .replace(/\{\{PREFIX\}\}/g, config.prefix || '!')
    .replace(/\{\{DESCRIPTION\}\}/g, config.description || 'A Discord bot built with betterdiscordjs');
  
  return content;
}

/**
 * Get list of files in a template
 * @param {string} language - 'javascript' or 'typescript'
 * @param {string} template - Template name
 * @returns {string[]}
 */
function getTemplateFiles(language, template) {
  const templatesDir = path.join(__dirname, '..', 'templates', language, template);
  
  if (!fs.existsSync(templatesDir)) {
    return [];
  }
  
  const files = [];
  
  function readDir(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(prefix, entry.name);
      
      if (entry.isDirectory()) {
        readDir(fullPath, relativePath);
      } else {
        files.push(relativePath);
      }
    }
  }
  
  readDir(templatesDir);
  return files;
}

/**
 * Check if template exists
 * @param {string} language - 'javascript' or 'typescript'
 * @param {string} template - Template name
 * @returns {boolean}
 */
function templateExists(language, template) {
  const templatesDir = path.join(__dirname, '..', 'templates', language, template);
  return fs.existsSync(templatesDir);
}

module.exports = {
  getTemplateContent,
  getTemplateFiles,
  templateExists
};
