const TemplateEngine = require('./utils/template-engine');
const FileUtils = require('./utils/file-utils');
const EntityModel = require('./models/entity-model');
const projectConfig = require('./config/project-config');

const EntityGenerator = require('./generators/entity-generator');
const DtoGenerator = require('./generators/dto-generator');
const ServiceGenerator = require('./generators/service-generator');
const RepositoryGenerator = require('./generators/repository-generator');
const ControllerGenerator = require('./generators/controller-generator');
const ProjectGenerator = require('./generators/project-generator');

const chalk = require('chalk');
const path = require('path');

class CodeGenerator {
  constructor() {
    this.templateEngine = new TemplateEngine();
    this.generators = {
      entity: new EntityGenerator(this.templateEngine),
      dto: new DtoGenerator(this.templateEngine),
      service: new ServiceGenerator(this.templateEngine),
      repository: new RepositoryGenerator(this.templateEngine),
      controller: new ControllerGenerator(this.templateEngine),
      project: new ProjectGenerator(this.templateEngine, null)
    };
  }

  async initialize() {
    try {
      // Load all templates
      const templatesPath = path.join(__dirname, '../templates');
      await this.templateEngine.loadTemplatesFromDirectory(templatesPath);
      return true;
    } catch (error) {
      console.error(chalk.red('Failed to initialize generator:'), error.message);
      return false;
    }
  }

  async generateProject(config, outputPath, projectName) {
    try {
      console.log(chalk.blue(`🏗️  Generating project: ${projectName}`));
      console.log(chalk.blue(`📁 Output path: ${outputPath}`));
      console.log(chalk.blue(`📊 Entities: ${config.entities.length}\n`));

      // Initialize generator
      if (!await this.initialize()) {
        return { success: false, errors: ['Failed to initialize generator'] };
      }

      const results = {
        project: null,
        entities: [],
        summary: {
          totalFiles: 0,
          successfulFiles: 0,
          failedFiles: 0,
          successRate: 0
        }
      };

      // Generate project structure and files
      console.log(chalk.blue('📁 Creating project structure...'));
      this.generators.project.outputPath = outputPath;
      results.project = await this.generators.project.generateCompleteStructure(projectName, config.entities);

      // Generate code for each entity
      for (const entityConfig of config.entities) {
        console.log(chalk.blue(`\n🔄 Processing entity: ${entityConfig.name}`));
        
        const entityModel = new EntityModel(entityConfig.name, entityConfig.properties, entityConfig.relationships);
        const entityResult = await this.generateEntity(entityModel, projectName, outputPath);
        
        results.entities.push({
          name: entityConfig.name,
          result: entityResult
        });

        // Update summary
        results.summary.totalFiles += entityResult.summary.totalFiles;
        results.summary.successfulFiles += entityResult.summary.successfulFiles;
        results.summary.failedFiles += entityResult.summary.failedFiles;
      }

      // Calculate success rate
      results.summary.successRate = results.summary.totalFiles > 0 
        ? Math.round((results.summary.successfulFiles / results.summary.totalFiles) * 100)
        : 0;

      const success = results.summary.successRate >= 80; // Consider successful if 80%+ files generated

      return {
        success,
        results,
        summary: results.summary
      };
    } catch (error) {
      console.error(chalk.red('Project generation failed:'), error.message);
      return {
        success: false,
        errors: [error.message],
        summary: { totalFiles: 0, successfulFiles: 0, failedFiles: 0, successRate: 0 }
      };
    }
  }

  async generateEntity(entityModel, projectName, outputPath, layers = 'all') {
    try {
      console.log(chalk.blue(`🔄 Generating entity: ${entityModel.name}`));

      const results = {
        domain: null,
        application: null,
        infrastructure: null,
        api: null,
        summary: {
          totalFiles: 0,
          successfulFiles: 0,
          failedFiles: 0
        }
      };

      // Set output path for generators
      this.generators.entity.outputPath = outputPath;
      this.generators.dto.outputPath = outputPath;
      this.generators.service.outputPath = outputPath;
      this.generators.repository.outputPath = outputPath;
      this.generators.controller.outputPath = outputPath;

      // Generate domain layer
      if (layers === 'all' || layers.includes('domain')) {
        console.log(chalk.blue(`  📦 Domain layer...`));
        results.domain = await this.generators.entity.generateAll(entityModel, projectName);
        this.updateSummary(results.summary, results.domain);
      }

      // Generate application layer
      if (layers === 'all' || layers.includes('application')) {
        console.log(chalk.blue(`  📦 Application layer...`));
        results.application = await this.generators.dto.generateAll(entityModel, projectName);
        this.updateSummary(results.summary, results.application);
        
        const serviceResults = await this.generators.service.generateAll(entityModel, projectName);
        this.updateSummary(results.summary, serviceResults);
        results.application = { ...results.application, ...serviceResults };
      }

      // Generate infrastructure layer
      if (layers === 'all' || layers.includes('infrastructure')) {
        console.log(chalk.blue(`  📦 Infrastructure layer...`));
        results.infrastructure = await this.generators.repository.generateAll(entityModel, projectName);
        this.updateSummary(results.summary, results.infrastructure);
      }

      // Generate API layer
      if (layers === 'all' || layers.includes('api')) {
        console.log(chalk.blue(`  📦 API layer...`));
        results.api = await this.generators.controller.generateAll(entityModel, projectName);
        this.updateSummary(results.summary, results.api);
      }

      return {
        success: results.summary.failedFiles === 0,
        results,
        summary: results.summary
      };
    } catch (error) {
      console.error(chalk.red(`Entity generation failed for ${entityModel.name}:`), error.message);
      return {
        success: false,
        errors: [error.message],
        summary: { totalFiles: 0, successfulFiles: 0, failedFiles: 0 }
      };
    }
  }

  async generateLayer(layer, config, outputPath) {
    try {
      console.log(chalk.blue(`🔄 Generating layer: ${layer}`));

      if (!this.generators[layer]) {
        throw new Error(`Unknown layer: ${layer}`);
      }

      const results = {
        entities: [],
        summary: {
          totalFiles: 0,
          successfulFiles: 0,
          failedFiles: 0
        }
      };

      // Set output path for generators
      Object.values(this.generators).forEach(generator => {
        generator.outputPath = outputPath;
      });

      // Generate code for each entity in the specified layer
      for (const entityConfig of config.entities) {
        const entityModel = new EntityModel(entityConfig.name, entityConfig.properties, entityConfig.relationships);
        
        let entityResult = null;
        switch (layer) {
          case 'domain':
            entityResult = await this.generators.entity.generateAll(entityModel, config.projectName);
            break;
          case 'application':
            const dtoResult = await this.generators.dto.generateAll(entityModel, config.projectName);
            const serviceResult = await this.generators.service.generateAll(entityModel, config.projectName);
            entityResult = { ...dtoResult, ...serviceResult };
            break;
          case 'infrastructure':
            entityResult = await this.generators.repository.generateAll(entityModel, config.projectName);
            break;
          case 'api':
            entityResult = await this.generators.controller.generateAll(entityModel, config.projectName);
            break;
        }

        results.entities.push({
          name: entityConfig.name,
          result: entityResult
        });

        this.updateSummary(results.summary, entityResult);
      }

      return {
        success: results.summary.failedFiles === 0,
        results,
        summary: results.summary
      };
    } catch (error) {
      console.error(chalk.red(`Layer generation failed for ${layer}:`), error.message);
      return {
        success: false,
        errors: [error.message],
        summary: { totalFiles: 0, successfulFiles: 0, failedFiles: 0 }
      };
    }
  }

  updateSummary(summary, results) {
    if (!results || typeof results !== 'object') return;

    Object.values(results).forEach(result => {
      if (result === true) {
        summary.totalFiles++;
        summary.successfulFiles++;
      } else if (result === false) {
        summary.totalFiles++;
        summary.failedFiles++;
      }
    });
  }

  async validateConfig(config) {
    const errors = [];

    if (!config.projectName) {
      errors.push('Project name is required');
    }

    if (!config.entities || !Array.isArray(config.entities)) {
      errors.push('Entities array is required');
    }

    if (config.entities) {
      config.entities.forEach((entity, index) => {
        if (!entity.name) {
          errors.push(`Entity at index ${index} is missing name`);
        }

        if (!entity.properties || !Array.isArray(entity.properties)) {
          errors.push(`Entity '${entity.name}' is missing properties array`);
        }

        if (entity.properties) {
          entity.properties.forEach((property, propIndex) => {
            if (!property.name) {
              errors.push(`Entity '${entity.name}' property at index ${propIndex} is missing name`);
            }
            if (!property.type) {
              errors.push(`Entity '${entity.name}' property '${property.name}' is missing type`);
            }
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async generateFromTemplate(templateName, data, outputPath) {
    try {
      const templatePath = `templates/${templateName}.hbs`;
      const content = await this.templateEngine.renderTemplate(templatePath, data);
      
      if (content) {
        await FileUtils.writeFile(outputPath, content);
        return true;
      }
      return false;
    } catch (error) {
      console.error(chalk.red(`Template generation failed for ${templateName}:`), error.message);
      return false;
    }
  }

  async listTemplates() {
    try {
      const templatesPath = path.join(__dirname, '../templates');
      const files = await FileUtils.listFiles(templatesPath, '\\.hbs$');
      return files.map(file => file.replace('.hbs', ''));
    } catch (error) {
      console.error(chalk.red('Failed to list templates:'), error.message);
      return [];
    }
  }

  async getProjectStructure(projectName) {
    return {
      layers: Object.keys(projectConfig.layers),
      structure: {
        domain: ['Entities', 'Interfaces', 'Aggregates', 'DTParamters', 'Enums', 'Abstractions'],
        application: ['DTOs', 'Interfaces', 'Implements', 'Mappings', 'Validators', 'Constants'],
        infrastructure: ['Repositories', 'Persistence', 'Services', 'Constants'],
        api: ['Controllers', 'Middlewares', 'Utilities', 'Properties'],
        shared: ['Entities', 'Enums', 'Extensions', 'Helpers', 'Services', 'Constants']
      }
    };
  }
}

module.exports = CodeGenerator;
