const BaseGenerator = require('./base-generator');
const FileUtils = require('../utils/file-utils');
const StringUtils = require('../utils/string-utils');
const chalk = require('chalk');

class EntityGenerator extends BaseGenerator {
  constructor(templateEngine, outputPath) {
    super(templateEngine, outputPath);
  }

  async generateEntity(entityModel, projectName) {
    try {
      this.logInfo(`Generating entity: ${entityModel.name}`);

      // Ensure directory exists
      await this.ensureSubDirectory(projectName, 'Domain', 'Entities');

      // Generate entity file
      const entityData = this.generateEntityData(entityModel, projectName);
      const entityPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Domain`,
        'Entities',
        `${entityModel.name}.cs`
      );

      const success = await this.generateFile(
        'templates/entity.hbs',
        entityData,
        entityPath
      );

      if (success) {
        this.logSuccess(`Generated entity: ${entityModel.name}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to generate entity ${entityModel.name}: ${error.message}`);
      return false;
    }
  }

  async generateAggregate(entityModel, projectName) {
    try {
      this.logInfo(`Generating aggregate: ${entityModel.getAggregateName()}`);

      // Ensure directory exists
      await this.ensureSubDirectory(projectName, 'Domain', 'Aggregates');

      // Generate aggregate file
      const aggregateData = this.generateEntityData(entityModel, projectName);
      const aggregatePath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Domain`,
        'Aggregates',
        `${entityModel.getAggregateName()}.cs`
      );

      const success = await this.generateFile(
        'templates/aggregate.hbs',
        aggregateData,
        aggregatePath
      );

      if (success) {
        this.logSuccess(`Generated aggregate: ${entityModel.getAggregateName()}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to generate aggregate ${entityModel.getAggregateName()}: ${error.message}`);
      return false;
    }
  }

  async generateDTParameters(entityModel, projectName) {
    try {
      this.logInfo(`Generating DTParameters: ${entityModel.getDTParametersName()}`);

      // Ensure directory exists
      await this.ensureSubDirectory(projectName, 'Domain', 'DTParamters');

      // Generate DTParameters file
      const dtParametersData = this.generateEntityData(entityModel, projectName);
      const dtParametersPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Domain`,
        'DTParamters',
        `${entityModel.getDTParametersName()}.cs`
      );

      const success = await this.generateFile(
        'templates/dt-parameters.hbs',
        dtParametersData,
        dtParametersPath
      );

      if (success) {
        this.logSuccess(`Generated DTParameters: ${entityModel.getDTParametersName()}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to generate DTParameters ${entityModel.getDTParametersName()}: ${error.message}`);
      return false;
    }
  }

  async generateAll(entityModel, projectName) {
    const results = {
      entity: await this.generateEntity(entityModel, projectName),
      aggregate: await this.generateAggregate(entityModel, projectName),
      dtParameters: await this.generateDTParameters(entityModel, projectName)
    };

    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;

    if (successCount === totalCount) {
      this.logSuccess(`Successfully generated all domain files for ${entityModel.name}`);
    } else {
      this.logWarning(`Generated ${successCount}/${totalCount} domain files for ${entityModel.name}`);
    }

    return results;
  }
}

module.exports = EntityGenerator;
