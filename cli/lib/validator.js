const fs = require('fs');
const path = require('path');

/**
 * Validate project name
 * @param {string} name - Project name to validate
 * @returns {{valid: boolean, error?: string}}
 */
function validateProjectName(name) {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Project name cannot be empty' };
  }
  
  // Check for invalid characters
  if (!/^[a-z0-9-_]+$/i.test(name)) {
    return { valid: false, error: 'Project name can only contain letters, numbers, hyphens, and underscores' };
  }
  
  // Check for reserved names
  const reserved = ['node_modules', 'package', 'npm', 'con', 'prn', 'aux', 'nul'];
  if (reserved.includes(name.toLowerCase())) {
    return { valid: false, error: `"${name}" is a reserved name` };
  }
  
  // Check if starts with . or _
  if (name.startsWith('.') || name.startsWith('_')) {
    return { valid: false, error: 'Project name cannot start with . or _' };
  }
  
  return { valid: true };
}

/**
 * Check if directory exists and is empty
 * @param {string} dirPath - Directory path to check
 * @returns {{exists: boolean, isEmpty?: boolean}}
 */
function checkDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return { exists: false };
  }
  
  const files = fs.readdirSync(dirPath);
  return { exists: true, isEmpty: files.length === 0 };
}

/**
 * Validate template choice
 * @param {string} template - Template name
 * @returns {{valid: boolean, error?: string}}
 */
function validateTemplate(template) {
  const validTemplates = ['basic', 'advanced', 'minimal'];
  
  if (!validTemplates.includes(template.toLowerCase())) {
    return { 
      valid: false, 
      error: `Invalid template. Choose from: ${validTemplates.join(', ')}` 
    };
  }
  
  return { valid: true };
}

/**
 * Validate prefix
 * @param {string} prefix - Command prefix
 * @returns {{valid: boolean, error?: string}}
 */
function validatePrefix(prefix) {
  if (!prefix || prefix.trim().length === 0) {
    return { valid: false, error: 'Prefix cannot be empty' };
  }
  
  if (prefix.length > 5) {
    return { valid: false, error: 'Prefix should be 5 characters or less' };
  }
  
  return { valid: true };
}

module.exports = {
  validateProjectName,
  checkDirectory,
  validateTemplate,
  validatePrefix
};
