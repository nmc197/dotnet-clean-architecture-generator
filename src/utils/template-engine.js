const Handlebars = require('handlebars');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { pluralize, capitalize, camelCase, pascalCase, kebabCase, snakeCase } = require('./string-helpers');

class TemplateEngine {
  constructor() {
    this.templates = new Map();
    this.helpers = new Map();
    this.registerDefaultHelpers();
  }

  registerDefaultHelpers() {
    // Helper for conditional rendering
    Handlebars.registerHelper('if_eq', function(a, b, options) {
      if (a === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Helper for equality check
    Handlebars.registerHelper('isEqual', function(a, b) {
      return a === b;
    });

    // Helper for not equal
    Handlebars.registerHelper('if_ne', function(a, b, options) {
      if (a !== b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Helper for greater than
    Handlebars.registerHelper('if_gt', function(a, b, options) {
      if (a > b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Helper for less than
    Handlebars.registerHelper('if_lt', function(a, b, options) {
      if (a < b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Helper for array length
    Handlebars.registerHelper('length', function(array) {
      return array ? array.length : 0;
    });

    // String manipulation helpers
    Handlebars.registerHelper('pluralize', function(str) {
      return pluralize(str);
    });

    Handlebars.registerHelper('capitalize', function(str) {
      return capitalize(str);
    });

    Handlebars.registerHelper('camelCase', function(str) {
      return camelCase(str);
    });

    Handlebars.registerHelper('pascalCase', function(str) {
      return pascalCase(str);
    });

    Handlebars.registerHelper('kebabCase', function(str) {
      return kebabCase(str);
    });

    Handlebars.registerHelper('snakeCase', function(str) {
      return snakeCase(str);
    });

    // Helper for array contains
    Handlebars.registerHelper('contains', function(array, value) {
      return array && array.includes(value);
    });

    // Helper for string concatenation
    Handlebars.registerHelper('concat', function(...args) {
      args.pop(); // Remove the options object
      return args.join('');
    });

    // Helper for string replacement
    Handlebars.registerHelper('replace', function(str, search, replace) {
      return str ? str.replace(new RegExp(search, 'g'), replace) : '';
    });

    // Helper for string to lowercase
    Handlebars.registerHelper('lowercase', function(str) {
      return str ? str.toLowerCase() : '';
    });

    // Helper for string to uppercase
    Handlebars.registerHelper('uppercase', function(str) {
      return str ? str.toUpperCase() : '';
    });

    // Helper for string to camelCase
    Handlebars.registerHelper('camelCase', function(str) {
      if (!str) return '';
      return str.charAt(0).toLowerCase() + str.slice(1);
    });

    // Helper for string to PascalCase
    Handlebars.registerHelper('pascalCase', function(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    // Helper for string to kebab-case
    Handlebars.registerHelper('kebabCase', function(str) {
      if (!str) return '';
      return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    });

    // Helper for string to snake_case
    Handlebars.registerHelper('snakeCase', function(str) {
      if (!str) return '';
      return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    });

    // Helper for pluralization
    Handlebars.registerHelper('pluralize', function(str) {
      if (!str) return '';
      const pluralize = require('pluralize');
      return pluralize(str);
    });

    // Helper for singularization
    Handlebars.registerHelper('singularize', function(str) {
      if (!str) return '';
      const pluralize = require('pluralize');
      return pluralize.singular(str);
    });

    // Helper for array join
    Handlebars.registerHelper('join', function(array, separator) {
      return array ? array.join(separator || ', ') : '';
    });

    // Helper for array map
    Handlebars.registerHelper('map', function(array, property) {
      if (!array) return [];
      return array.map(item => item[property]);
    });

    // Helper for array filter
    Handlebars.registerHelper('filter', function(array, property, value) {
      if (!array) return [];
      return array.filter(item => item[property] === value);
    });

    // Helper for array find
    Handlebars.registerHelper('find', function(array, property, value) {
      if (!array) return null;
      return array.find(item => item[property] === value);
    });

    // Helper for array sort
    Handlebars.registerHelper('sort', function(array, property) {
      if (!array) return [];
      return array.sort((a, b) => {
        if (a[property] < b[property]) return -1;
        if (a[property] > b[property]) return 1;
        return 0;
      });
    });

    // Helper for array reverse
    Handlebars.registerHelper('reverse', function(array) {
      if (!array) return [];
      return array.slice().reverse();
    });

    // Helper for array slice
    Handlebars.registerHelper('slice', function(array, start, end) {
      if (!array) return [];
      return array.slice(start, end);
    });

    // Helper for array first
    Handlebars.registerHelper('first', function(array) {
      if (!array || array.length === 0) return null;
      return array[0];
    });

    // Helper for array last
    Handlebars.registerHelper('last', function(array) {
      if (!array || array.length === 0) return null;
      return array[array.length - 1];
    });

    // Helper for array unique
    Handlebars.registerHelper('unique', function(array) {
      if (!array) return [];
      return [...new Set(array)];
    });

    // Helper for object keys
    Handlebars.registerHelper('keys', function(obj) {
      if (!obj) return [];
      return Object.keys(obj);
    });

    // Helper for object values
    Handlebars.registerHelper('values', function(obj) {
      if (!obj) return [];
      return Object.values(obj);
    });

    // Helper for object entries
    Handlebars.registerHelper('entries', function(obj) {
      if (!obj) return [];
      return Object.entries(obj);
    });

    // Helper for has property
    Handlebars.registerHelper('has', function(obj, property) {
      return obj && obj.hasOwnProperty(property);
    });

    // Helper for get property
    Handlebars.registerHelper('get', function(obj, property) {
      return obj ? obj[property] : undefined;
    });

    // Helper for set property
    Handlebars.registerHelper('set', function(obj, property, value) {
      if (obj) {
        obj[property] = value;
      }
      return obj;
    });

    // Helper for date formatting
    Handlebars.registerHelper('formatDate', function(date, format) {
      if (!date) return '';
      const d = new Date(date);
      if (format === 'ISO') {
        return d.toISOString();
      }
      return d.toLocaleDateString();
    });

    // Helper for number formatting
    Handlebars.registerHelper('formatNumber', function(number, decimals) {
      if (number === null || number === undefined) return '';
      return Number(number).toFixed(decimals || 2);
    });

    // Helper for currency formatting
    Handlebars.registerHelper('formatCurrency', function(amount, currency) {
      if (amount === null || amount === undefined) return '';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD'
      }).format(amount);
    });

    // Helper for conditional class
    Handlebars.registerHelper('class', function(condition, className) {
      return condition ? className : '';
    });

    // Helper for conditional attribute
    Handlebars.registerHelper('attr', function(condition, attr, value) {
      return condition ? `${attr}="${value}"` : '';
    });

    // Helper for loop with index
    Handlebars.registerHelper('eachWithIndex', function(array, options) {
      if (!array) return '';
      let result = '';
      for (let i = 0; i < array.length; i++) {
        result += options.fn({ ...array[i], index: i, first: i === 0, last: i === array.length - 1 });
      }
      return result;
    });

    // Helper for loop with key-value
    Handlebars.registerHelper('eachKeyValue', function(obj, options) {
      if (!obj) return '';
      let result = '';
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = obj[key];
        result += options.fn({ key, value, index: i, first: i === 0, last: i === keys.length - 1 });
      }
      return result;
    });
  }

  async loadTemplate(templatePath) {
    try {
      if (this.templates.has(templatePath)) {
        return this.templates.get(templatePath);
      }

      const templateContent = await fs.readFile(templatePath, 'utf8');
      const template = Handlebars.compile(templateContent);
      this.templates.set(templatePath, template);
      
      console.log(chalk.blue(`✓ Loaded template: ${templatePath}`));
      return template;
    } catch (error) {
      console.error(chalk.red(`Error loading template ${templatePath}:`), error.message);
      return null;
    }
  }

  async loadTemplatesFromDirectory(templatesDir) {
    try {
      const templateFiles = await fs.readdir(templatesDir);
      const hbsFiles = templateFiles.filter(file => file.endsWith('.hbs'));
      
      for (const file of hbsFiles) {
        const templatePath = path.join(templatesDir, file);
        await this.loadTemplate(templatePath);
      }
      
      console.log(chalk.blue(`✓ Loaded ${hbsFiles.length} templates from ${templatesDir}`));
      return true;
    } catch (error) {
      console.error(chalk.red(`Error loading templates from ${templatesDir}:`), error.message);
      return false;
    }
  }

  async renderTemplate(templatePath, data) {
    try {
      const template = await this.loadTemplate(templatePath);
      if (!template) {
        throw new Error(`Template not found: ${templatePath}`);
      }

      return template(data);
    } catch (error) {
      console.error(chalk.red(`Error rendering template ${templatePath}:`), error.message);
      return null;
    }
  }

  async renderTemplateFromString(templateString, data) {
    try {
      const template = Handlebars.compile(templateString);
      return template(data);
    } catch (error) {
      console.error(chalk.red(`Error rendering template from string:`), error.message);
      return null;
    }
  }

  registerHelper(name, helper) {
    Handlebars.registerHelper(name, helper);
    this.helpers.set(name, helper);
  }

  unregisterHelper(name) {
    Handlebars.unregisterHelper(name);
    this.helpers.delete(name);
  }

  getRegisteredHelpers() {
    return Array.from(this.helpers.keys());
  }

  clearTemplates() {
    this.templates.clear();
  }

  clearHelpers() {
    this.helpers.clear();
  }

  // Utility method to render multiple templates
  async renderMultipleTemplates(templateDataPairs) {
    const results = [];
    
    for (const { templatePath, data } of templateDataPairs) {
      const result = await this.renderTemplate(templatePath, data);
      results.push({ templatePath, result, success: result !== null });
    }
    
    return results;
  }

  // Utility method to render template with error handling
  async renderTemplateSafe(templatePath, data, fallback = '') {
    try {
      const result = await this.renderTemplate(templatePath, data);
      return result || fallback;
    } catch (error) {
      console.error(chalk.red(`Error in safe template rendering for ${templatePath}:`), error.message);
      return fallback;
    }
  }
}

module.exports = TemplateEngine;
