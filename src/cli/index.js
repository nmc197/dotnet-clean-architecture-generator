#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');

const CodeGenerator = require('../generator');
const FileUtils = require('../utils/file-utils');

const program = new Command();

program
  .name('dotnet-gen')
  .description('Generate .NET Clean Architecture projects')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate complete project from entity definitions')
  .option('-c, --config <path>', 'Path to entity configuration JSON file')
  .option('-o, --output <path>', 'Output directory path', './generated')
  .option('-p, --project-name <name>', 'Project name (overrides config)')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🚀 Starting .NET Clean Architecture Generator...\n'));

      // Validate config file
      if (!options.config) {
        console.error(chalk.red('❌ Error: Config file path is required'));
        console.log(chalk.yellow('Usage: dotnet-gen generate --config entities.json --output ./output'));
        process.exit(1);
      }

      if (!await FileUtils.fileExists(options.config)) {
        console.error(chalk.red(`❌ Error: Config file not found: ${options.config}`));
        process.exit(1);
      }

      // Load configuration
      const config = await FileUtils.readJsonFile(options.config);
      if (!config) {
        console.error(chalk.red('❌ Error: Failed to parse config file'));
        process.exit(1);
      }

      // Use project name from options or config
      const projectName = options.projectName || config.projectName;
      if (!projectName) {
        console.error(chalk.red('❌ Error: Project name is required'));
        process.exit(1);
      }

      // Create output directory
      await FileUtils.ensureDirectoryExists(options.output);

      // Initialize generator
      const generator = new CodeGenerator();
      
      // Generate project
      const result = await generator.generateProject(config, options.output, projectName);
      
      if (result.success) {
        console.log(chalk.green('\n✅ Project generated successfully!'));
        console.log(chalk.blue(`📁 Output directory: ${path.resolve(options.output)}`));
        console.log(chalk.blue(`🏗️  Project name: ${projectName}`));
        console.log(chalk.blue(`📊 Generated ${result.summary.totalFiles} files`));
        console.log(chalk.blue(`📈 Success rate: ${result.summary.successRate}%`));
      } else {
        console.error(chalk.red('\n❌ Project generation failed'));
        if (result.errors && result.errors.length > 0) {
          console.error(chalk.red('Errors:'));
          result.errors.forEach(error => console.error(chalk.red(`  - ${error}`)));
        }
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red(`❌ Unexpected error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('generate-entity')
  .description('Generate code for a specific entity')
  .option('-n, --name <name>', 'Entity name')
  .option('-c, --config <path>', 'Path to entity configuration JSON file')
  .option('-o, --output <path>', 'Output directory path', './generated')
  .option('-l, --layers <layers>', 'Comma-separated list of layers to generate', 'all')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🚀 Generating entity code...\n'));

      if (!options.name) {
        console.error(chalk.red('❌ Error: Entity name is required'));
        process.exit(1);
      }

      if (!options.config) {
        console.error(chalk.red('❌ Error: Config file path is required'));
        process.exit(1);
      }

      if (!await FileUtils.fileExists(options.config)) {
        console.error(chalk.red(`❌ Error: Config file not found: ${options.config}`));
        process.exit(1);
      }

      // Load configuration
      const config = await FileUtils.readJsonFile(options.config);
      if (!config) {
        console.error(chalk.red('❌ Error: Failed to parse config file'));
        process.exit(1);
      }

      // Find entity in config
      const entity = config.entities.find(e => e.name === options.name);
      if (!entity) {
        console.error(chalk.red(`❌ Error: Entity '${options.name}' not found in config`));
        process.exit(1);
      }

      // Create output directory
      await FileUtils.ensureDirectoryExists(options.output);

      // Initialize generator
      const generator = new CodeGenerator();
      
      // Generate entity
      const result = await generator.generateEntity(entity, config, options.output, options.layers);
      
      if (result.success) {
        console.log(chalk.green('\n✅ Entity generated successfully!'));
        console.log(chalk.blue(`📁 Output directory: ${path.resolve(options.output)}`));
        console.log(chalk.blue(`🏗️  Entity name: ${options.name}`));
        console.log(chalk.blue(`📊 Generated ${result.summary.totalFiles} files`));
      } else {
        console.error(chalk.red('\n❌ Entity generation failed'));
        if (result.errors && result.errors.length > 0) {
          console.error(chalk.red('Errors:'));
          result.errors.forEach(error => console.error(chalk.red(`  - ${error}`)));
        }
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red(`❌ Unexpected error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('generate-layer')
  .description('Generate code for a specific layer')
  .option('-l, --layer <layer>', 'Layer name (domain, application, infrastructure, api)')
  .option('-c, --config <path>', 'Path to entity configuration JSON file')
  .option('-o, --output <path>', 'Output directory path', './generated')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🚀 Generating layer code...\n'));

      if (!options.layer) {
        console.error(chalk.red('❌ Error: Layer name is required'));
        process.exit(1);
      }

      if (!options.config) {
        console.error(chalk.red('❌ Error: Config file path is required'));
        process.exit(1);
      }

      if (!await FileUtils.fileExists(options.config)) {
        console.error(chalk.red(`❌ Error: Config file not found: ${options.config}`));
        process.exit(1);
      }

      // Load configuration
      const config = await FileUtils.readJsonFile(options.config);
      if (!config) {
        console.error(chalk.red('❌ Error: Failed to parse config file'));
        process.exit(1);
      }

      // Create output directory
      await FileUtils.ensureDirectoryExists(options.output);

      // Initialize generator
      const generator = new CodeGenerator();
      
      // Generate layer
      const result = await generator.generateLayer(options.layer, config, options.output);
      
      if (result.success) {
        console.log(chalk.green('\n✅ Layer generated successfully!'));
        console.log(chalk.blue(`📁 Output directory: ${path.resolve(options.output)}`));
        console.log(chalk.blue(`🏗️  Layer: ${options.layer}`));
        console.log(chalk.blue(`📊 Generated ${result.summary.totalFiles} files`));
      } else {
        console.error(chalk.red('\n❌ Layer generation failed'));
        if (result.errors && result.errors.length > 0) {
          console.error(chalk.red('Errors:'));
          result.errors.forEach(error => console.error(chalk.red(`  - ${error}`)));
        }
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red(`❌ Unexpected error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('interactive')
  .description('Interactive mode for generating projects')
  .action(async () => {
    try {
      console.log(chalk.blue('🚀 Interactive .NET Clean Architecture Generator\n'));

      const { default: inquirer } = await import('inquirer');
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          default: 'MyProject',
          validate: (input) => {
            if (!input.trim()) {
              return 'Project name is required';
            }
            if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(input)) {
              return 'Project name must start with a letter and contain only letters and numbers';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'outputPath',
          message: 'Where should the project be generated?',
          default: './generated',
          validate: (input) => {
            if (!input.trim()) {
              return 'Output path is required';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'configPath',
          message: 'Path to entity configuration JSON file:',
          default: './entities.json',
          validate: async (input) => {
            if (!input.trim()) {
              return 'Config file path is required';
            }
            if (!await FileUtils.fileExists(input)) {
              return `Config file not found: ${input}`;
            }
            return true;
          }
        },
        {
          type: 'confirm',
          name: 'generateStructure',
          message: 'Generate complete project structure?',
          default: true
        },
        {
          type: 'checkbox',
          name: 'layers',
          message: 'Which layers to generate?',
          choices: [
            { name: 'Domain', value: 'domain', checked: true },
            { name: 'Application', value: 'application', checked: true },
            { name: 'Infrastructure', value: 'infrastructure', checked: true },
            { name: 'API', value: 'api', checked: true }
          ],
          when: (answers) => !answers.generateStructure
        }
      ]);

      console.log(chalk.blue('\n🔄 Generating project...\n'));

      // Load configuration
      const config = await FileUtils.readJsonFile(answers.configPath);
      if (!config) {
        console.error(chalk.red('❌ Error: Failed to parse config file'));
        process.exit(1);
      }

      // Create output directory
      await FileUtils.ensureDirectoryExists(answers.outputPath);

      // Initialize generator
      const generator = new CodeGenerator();
      
      // Generate project
      const result = await generator.generateProject(config, answers.outputPath, answers.projectName);
      
      if (result.success) {
        console.log(chalk.green('\n✅ Project generated successfully!'));
        console.log(chalk.blue(`📁 Output directory: ${path.resolve(answers.outputPath)}`));
        console.log(chalk.blue(`🏗️  Project name: ${answers.projectName}`));
        console.log(chalk.blue(`📊 Generated ${result.summary.totalFiles} files`));
        console.log(chalk.blue(`📈 Success rate: ${result.summary.successRate}%`));
      } else {
        console.error(chalk.red('\n❌ Project generation failed'));
        if (result.errors && result.errors.length > 0) {
          console.error(chalk.red('Errors:'));
          result.errors.forEach(error => console.error(chalk.red(`  - ${error}`)));
        }
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red(`❌ Unexpected error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize a new entity configuration file')
  .option('-o, --output <path>', 'Output file path', './entities.json')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🚀 Initializing entity configuration...\n'));

      const { default: inquirer } = await import('inquirer');
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          default: 'MyProject',
          validate: (input) => {
            if (!input.trim()) {
              return 'Project name is required';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'entityName',
          message: 'What is your first entity name?',
          default: 'Product',
          validate: (input) => {
            if (!input.trim()) {
              return 'Entity name is required';
            }
            return true;
          }
        }
      ]);

      // Create sample configuration
      const config = {
        projectName: answers.projectName,
        entities: [
          {
            name: answers.entityName,
            properties: [
              {
                name: 'Name',
                type: 'string',
                isRequired: true,
                maxLength: 100
              },
              {
                name: 'Description',
                type: 'string',
                isRequired: false,
                maxLength: 500
              },
              {
                name: 'Price',
                type: 'decimal',
                isRequired: true
              }
            ],
            relationships: []
          }
        ]
      };

      // Write configuration file
      await FileUtils.writeJsonFile(options.output, config);
      
      console.log(chalk.green('\n✅ Configuration file created successfully!'));
      console.log(chalk.blue(`📁 File: ${path.resolve(options.output)}`));
      console.log(chalk.yellow('\n📝 Next steps:'));
      console.log(chalk.yellow('1. Edit the configuration file to add more entities and properties'));
      console.log(chalk.yellow('2. Run: dotnet-gen generate --config entities.json --output ./generated'));
    } catch (error) {
      console.error(chalk.red(`❌ Unexpected error: ${error.message}`));
      process.exit(1);
    }
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red(`❌ Unknown command: ${program.args.join(' ')}`));
  console.log(chalk.yellow('Use --help to see available commands'));
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
