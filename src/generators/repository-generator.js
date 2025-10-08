const BaseGenerator = require('./base-generator');
const FileUtils = require('../utils/file-utils');
const StringUtils = require('../utils/string-utils');
const chalk = require('chalk');

class RepositoryGenerator extends BaseGenerator {
  constructor(templateEngine, outputPath) {
    super(templateEngine, outputPath);
  }

  async generateRepositoryInterface(entityModel, projectName) {
    try {
      this.logInfo(`Generating RepositoryInterface: ${entityModel.getRepositoryInterfaceName()}`);

      // Ensure directory exists
      await this.ensureSubDirectory(projectName, 'Domain', 'Interfaces/Repositories');

      // Generate RepositoryInterface file
      const repositoryData = this.generateEntityData(entityModel, projectName);
      const repositoryInterfacePath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Domain`,
        'Interfaces',
        'Repositories',
        `${entityModel.getRepositoryInterfaceName()}.cs`
      );

      const success = await this.generateFile(
        'templates/repository-interface.hbs',
        repositoryData,
        repositoryInterfacePath
      );

      if (success) {
        this.logSuccess(`Generated RepositoryInterface: ${entityModel.getRepositoryInterfaceName()}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to generate RepositoryInterface ${entityModel.getRepositoryInterfaceName()}: ${error.message}`);
      return false;
    }
  }

  async generateRepository(entityModel, projectName) {
    try {
      this.logInfo(`Generating Repository: ${entityModel.getRepositoryName()}`);

      // Ensure directory exists
      await this.ensureSubDirectory(projectName, 'Infrastructure', 'Repositories');

      // Generate Repository file
      const repositoryData = this.generateEntityData(entityModel, projectName);
      const repositoryPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Infrastructure`,
        'Repositories',
        `${entityModel.getRepositoryName()}.cs`
      );

      const success = await this.generateFile(
        'templates/repository.hbs',
        repositoryData,
        repositoryPath
      );

      if (success) {
        this.logSuccess(`Generated Repository: ${entityModel.getRepositoryName()}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to generate Repository ${entityModel.getRepositoryName()}: ${error.message}`);
      return false;
    }
  }

  async generateEntityConfiguration(entityModel, projectName) {
    try {
      this.logInfo(`Generating EF Configuration: ${entityModel.name}Configuration`);

      // Ensure directory exists
      await this.ensureSubDirectory(projectName, 'Infrastructure', 'Persistence/Configurations');

      // Generate Configuration file
      const configData = this.generateEntityData(entityModel, projectName);
      const configPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Infrastructure`,
        'Persistence',
        'Configurations',
        `${entityModel.name}Configuration.cs`
      );

      const success = await this.generateFile(
        'templates/entity-configuration.hbs',
        configData,
        configPath
      );

      if (success) {
        this.logSuccess(`Generated EF Configuration: ${entityModel.name}Configuration`);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to generate EF Configuration ${entityModel.name}Configuration: ${error.message}`);
      return false;
    }
  }

  async generateAll(entityModel, projectName) {
    const results = {
      repositoryInterface: await this.generateRepositoryInterface(entityModel, projectName),
      repository: await this.generateRepository(entityModel, projectName),
      configuration: await this.generateEntityConfiguration(entityModel, projectName)
    };

    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;

    if (successCount === totalCount) {
      this.logSuccess(`Successfully generated all repository files for ${entityModel.name}`);
    } else {
      this.logWarning(`Generated ${successCount}/${totalCount} repository files for ${entityModel.name}`);
    }

    return results;
  }
}

module.exports = RepositoryGenerator;
