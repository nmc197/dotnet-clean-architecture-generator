const BaseGenerator = require('./base-generator');
const FileUtils = require('../utils/file-utils');
const StringUtils = require('../utils/string-utils');
const chalk = require('chalk');

class ControllerGenerator extends BaseGenerator {
  constructor(templateEngine, outputPath) {
    super(templateEngine, outputPath);
  }

  async generateController(entityModel, projectName) {
    try {
      this.logInfo(`Generating Controller: ${entityModel.getControllerName()}`);

      // Ensure directory exists
      await this.ensureSubDirectory(projectName, 'API', 'Controllers');

      // Generate Controller file
      const controllerData = this.generateEntityData(entityModel, projectName);
      const controllerPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.API`,
        'Controllers',
        `${entityModel.getControllerName()}.cs`
      );

      const success = await this.generateFile(
        'templates/controller.hbs',
        controllerData,
        controllerPath
      );

      if (success) {
        this.logSuccess(`Generated Controller: ${entityModel.getControllerName()}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to generate Controller ${entityModel.getControllerName()}: ${error.message}`);
      return false;
    }
  }

  async generateAll(entityModel, projectName) {
    const results = {
      controller: await this.generateController(entityModel, projectName)
    };

    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;

    if (successCount === totalCount) {
      this.logSuccess(`Successfully generated all controller files for ${entityModel.name}`);
    } else {
      this.logWarning(`Generated ${successCount}/${totalCount} controller files for ${entityModel.name}`);
    }

    return results;
  }

  async generateStaticControllers(projectName, controllers) {
    const results = {};
    for (const ctrl of controllers) {
      const outPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.API`,
        'Controllers',
        `${ctrl.name}.cs`
      );
      results[ctrl.name] = await this.generateFile(ctrl.template, { projectName }, outPath);
    }
    return results;
  }
}

module.exports = ControllerGenerator;
