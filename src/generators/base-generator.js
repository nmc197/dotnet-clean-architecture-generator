const TemplateEngine = require('../utils/template-engine');
const FileUtils = require('../utils/file-utils');
const StringUtils = require('../utils/string-utils');
const chalk = require('chalk');

class BaseGenerator {
  constructor(templateEngine, outputPath) {
    this.templateEngine = templateEngine;
    this.outputPath = outputPath;
  }

  async generateFile(templatePath, data, outputPath) {
    try {
      const content = await this.templateEngine.renderTemplate(templatePath, data);
      if (content) {
        return await FileUtils.writeFile(outputPath, content);
      }
      return false;
    } catch (error) {
      console.error(chalk.red(`Error generating file ${outputPath}:`), error.message);
      return false;
    }
  }

  async ensureOutputDirectory(entityName, layer) {
    const dirPath = FileUtils.joinPath(this.outputPath, `${entityName}.${layer}`);
    return await FileUtils.ensureDirectoryExists(dirPath);
  }

  async ensureSubDirectory(entityName, layer, subDir) {
    const dirPath = FileUtils.joinPath(this.outputPath, `${entityName}.${layer}`, subDir);
    return await FileUtils.ensureDirectoryExists(dirPath);
  }

  generateEntityData(entityModel, projectName) {
    return {
      name: entityModel.name,
      pluralName: entityModel.pluralName,
      camelCaseName: entityModel.getCamelCaseName(),
      dtoNamespace: entityModel.getDtoNamespace(),
      routeName: entityModel.getRouteName(),
      menuEnum: entityModel.getMenuEnumName(),
      properties: entityModel.properties,
      relationships: entityModel.relationships,
      customProperties: entityModel.getCustomProperties(),
      filterProperties: entityModel.getFilterProperties(),
      usingStatements: entityModel.getUsingStatements(projectName),
      dtoUsingStatements: entityModel.getDtoUsingStatements(projectName),
      serviceUsingStatements: entityModel.getServiceUsingStatements(projectName),
      controllerUsingStatements: entityModel.getControllerUsingStatements(projectName),
      projectName: projectName,
      namespace: entityModel.generateNamespace(projectName)
    };
  }

  logSuccess(message) {
    console.log(chalk.green(`✓ ${message}`));
  }

  logError(message) {
    console.error(chalk.red(`✗ ${message}`));
  }

  logInfo(message) {
    console.log(chalk.blue(`ℹ ${message}`));
  }

  logWarning(message) {
    console.log(chalk.yellow(`⚠ ${message}`));
  }
}

module.exports = BaseGenerator;
