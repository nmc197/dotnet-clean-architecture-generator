const BaseGenerator = require('./base-generator');
const FileUtils = require('../utils/file-utils');
const StringUtils = require('../utils/string-utils');
const chalk = require('chalk');

class DtoGenerator extends BaseGenerator {
  constructor(templateEngine, outputPath) {
    super(templateEngine, outputPath);
  }

  async generateCreateDto(entityModel, projectName) {
    try {
      this.logInfo(`Generating CreateDto: ${entityModel.getCreateDtoName()}`);

      // Ensure directory exists
      await this.ensureSubDirectory(projectName, 'Application', `DTOs/${entityModel.getDtoNamespace()}`);

      // Generate CreateDto file
      const dtoData = this.generateEntityData(entityModel, projectName);
      const createDtoPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Application`,
        'DTOs',
        entityModel.getDtoNamespace(),
        `${entityModel.getCreateDtoName()}.cs`
      );

      const success = await this.generateFile(
        'templates/create-dto.hbs',
        dtoData,
        createDtoPath
      );

      if (success) {
        this.logSuccess(`Generated CreateDto: ${entityModel.getCreateDtoName()}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to generate CreateDto ${entityModel.getCreateDtoName()}: ${error.message}`);
      return false;
    }
  }

  async generateUpdateDto(entityModel, projectName) {
    try {
      this.logInfo(`Generating UpdateDto: ${entityModel.getUpdateDtoName()}`);

      // Ensure directory exists
      await this.ensureSubDirectory(projectName, 'Application', `DTOs/${entityModel.getDtoNamespace()}`);

      // Generate UpdateDto file
      const dtoData = this.generateEntityData(entityModel, projectName);
      const updateDtoPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Application`,
        'DTOs',
        entityModel.getDtoNamespace(),
        `${entityModel.getUpdateDtoName()}.cs`
      );

      const success = await this.generateFile(
        'templates/update-dto.hbs',
        dtoData,
        updateDtoPath
      );

      if (success) {
        this.logSuccess(`Generated UpdateDto: ${entityModel.getUpdateDtoName()}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to generate UpdateDto ${entityModel.getUpdateDtoName()}: ${error.message}`);
      return false;
    }
  }

  async generateListDto(entityModel, projectName) {
    try {
      this.logInfo(`Generating ListDto: ${entityModel.getListDtoName()}`);

      // Ensure directory exists
      await this.ensureSubDirectory(projectName, 'Application', `DTOs/${entityModel.getDtoNamespace()}`);

      // Generate ListDto file
      const dtoData = this.generateEntityData(entityModel, projectName);
      const listDtoPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Application`,
        'DTOs',
        entityModel.getDtoNamespace(),
        `${entityModel.getListDtoName()}.cs`
      );

      const success = await this.generateFile(
        'templates/list-dto.hbs',
        dtoData,
        listDtoPath
      );

      if (success) {
        this.logSuccess(`Generated ListDto: ${entityModel.getListDtoName()}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to generate ListDto ${entityModel.getListDtoName()}: ${error.message}`);
      return false;
    }
  }

  async generateDetailDto(entityModel, projectName) {
    try {
      this.logInfo(`Generating DetailDto: ${entityModel.getDetailDtoName()}`);

      // Ensure directory exists
      await this.ensureSubDirectory(projectName, 'Application', `DTOs/${entityModel.getDtoNamespace()}`);

      // Generate DetailDto file
      const dtoData = this.generateEntityData(entityModel, projectName);
      const detailDtoPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Application`,
        'DTOs',
        entityModel.getDtoNamespace(),
        `${entityModel.getDetailDtoName()}.cs`
      );

      const success = await this.generateFile(
        'templates/detail-dto.hbs',
        dtoData,
        detailDtoPath
      );

      if (success) {
        this.logSuccess(`Generated DetailDto: ${entityModel.getDetailDtoName()}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to generate DetailDto ${entityModel.getDetailDtoName()}: ${error.message}`);
      return false;
    }
  }

  async generateAll(entityModel, projectName) {
    const results = {
      createDto: await this.generateCreateDto(entityModel, projectName),
      updateDto: await this.generateUpdateDto(entityModel, projectName),
      listDto: await this.generateListDto(entityModel, projectName),
      detailDto: await this.generateDetailDto(entityModel, projectName)
    };

    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;

    if (successCount === totalCount) {
      this.logSuccess(`Successfully generated all DTOs for ${entityModel.name}`);
    } else {
      this.logWarning(`Generated ${successCount}/${totalCount} DTOs for ${entityModel.name}`);
    }

    return results;
  }
}

module.exports = DtoGenerator;
