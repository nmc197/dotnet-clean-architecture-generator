const BaseGenerator = require('./base-generator');
const FileUtils = require('../utils/file-utils');
const StringUtils = require('../utils/string-utils');
const chalk = require('chalk');

class ServiceGenerator extends BaseGenerator {
  constructor(templateEngine, outputPath) {
    super(templateEngine, outputPath);
  }

  async generateServiceInterface(entityModel, projectName) {
    try {
      this.logInfo(`Generating ServiceInterface: ${entityModel.getServiceInterfaceName()}`);

      // Ensure directory exists
      await this.ensureSubDirectory(projectName, 'Application', 'Interfaces');

      // Generate ServiceInterface file
      const serviceData = this.generateEntityData(entityModel, projectName);
      const serviceInterfacePath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Application`,
        'Interfaces',
        `${entityModel.getServiceInterfaceName()}.cs`
      );

      const success = await this.generateFile(
        'templates/service-interface.hbs',
        serviceData,
        serviceInterfacePath
      );

      if (success) {
        this.logSuccess(`Generated ServiceInterface: ${entityModel.getServiceInterfaceName()}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to generate ServiceInterface ${entityModel.getServiceInterfaceName()}: ${error.message}`);
      return false;
    }
  }

  async generateService(entityModel, projectName) {
    try {
      this.logInfo(`Generating Service: ${entityModel.getServiceName()}`);

      // Ensure directory exists
      await this.ensureSubDirectory(projectName, 'Application', 'Implements');

      // Generate Service file
      const serviceData = this.generateEntityData(entityModel, projectName);
      const servicePath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Application`,
        'Implements',
        `${entityModel.getServiceName()}.cs`
      );

      const success = await this.generateFile(
        'templates/service.hbs',
        serviceData,
        servicePath
      );

      if (success) {
        this.logSuccess(`Generated Service: ${entityModel.getServiceName()}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to generate Service ${entityModel.getServiceName()}: ${error.message}`);
      return false;
    }
  }

  async generateMapping(entityModel, projectName) {
    try {
      this.logInfo(`Generating Mapping: ${entityModel.getMappingName()}`);

      // Ensure directory exists
      await this.ensureSubDirectory(projectName, 'Application', 'Mappings');

      // Generate Mapping file
      const mappingData = this.generateEntityData(entityModel, projectName);
      const mappingPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Application`,
        'Mappings',
        `${entityModel.getMappingName()}.cs`
      );

      const success = await this.generateFile(
        'templates/mapping.hbs',
        mappingData,
        mappingPath
      );

      if (success) {
        this.logSuccess(`Generated Mapping: ${entityModel.getMappingName()}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to generate Mapping ${entityModel.getMappingName()}: ${error.message}`);
      return false;
    }
  }

  async generateValidator(entityModel, projectName) {
    try {
      this.logInfo(`Generating Validator: ${entityModel.getValidatorName()}`);

      // Ensure directory exists
      await this.ensureSubDirectory(projectName, 'Application', 'Validators');

      // Generate Validator file
      const validatorData = this.generateEntityData(entityModel, projectName);
      const validatorPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Application`,
        'Validators',
        `${entityModel.getValidatorName()}.cs`
      );

      const success = await this.generateFile(
        'templates/validator.hbs',
        validatorData,
        validatorPath
      );

      if (success) {
        this.logSuccess(`Generated Validator: ${entityModel.getValidatorName()}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to generate Validator ${entityModel.getValidatorName()}: ${error.message}`);
      return false;
    }
  }

  async generateAll(entityModel, projectName) {
    const results = {
      serviceInterface: await this.generateServiceInterface(entityModel, projectName),
      service: await this.generateService(entityModel, projectName),
      mapping: await this.generateMapping(entityModel, projectName),
      validator: await this.generateValidator(entityModel, projectName)
    };

    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;

    if (successCount === totalCount) {
      this.logSuccess(`Successfully generated all application files for ${entityModel.name}`);
    } else {
      this.logWarning(`Generated ${successCount}/${totalCount} application files for ${entityModel.name}`);
    }

    return results;
  }
}

module.exports = ServiceGenerator;
