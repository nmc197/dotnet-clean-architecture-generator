const pluralize = require('pluralize');
const StringUtils = require('../utils/string-utils');

class EntityModel {
  constructor(name, properties = [], relationships = []) {
    this.name = name;
    this.pluralName = pluralize(name);
    this.properties = this.processProperties(properties);
    this.relationships = relationships;
    this.namespace = this.generateNamespace();
    this.primaryKey = this.findPrimaryKey();
    this.foreignKeys = this.findForeignKeys();
    this.navigationProperties = this.findNavigationProperties();
  }

  processProperties(properties) {
    return properties.map(prop => ({
      ...prop,
      csharpType: StringUtils.generateCSharpType(prop),
      defaultValue: StringUtils.generateDefaultValue(prop),
      validationRules: StringUtils.generateValidationRule(prop)
    }));
  }

  generateNamespace(projectName = 'BraceletWorkshop') {
    return `${projectName}.Domain.Entities`;
  }

  findPrimaryKey() {
    const pk = this.properties.find(p => p.isPrimaryKey);
    return pk || { name: 'Id', type: 'int', csharpType: 'int' };
  }

  findForeignKeys() {
    return this.properties.filter(p => p.isForeignKey);
  }

  findNavigationProperties() {
    return this.relationships.filter(r => r.type === 'navigation');
  }

  getPropertiesForDto() {
    return this.properties.filter(p => !p.isSystemProperty);
  }

  getRequiredProperties() {
    return this.properties.filter(p => p.isRequired);
  }

  getOptionalProperties() {
    return this.properties.filter(p => !p.isRequired);
  }

  getCustomProperties() {
    return this.properties.filter(p => !p.isSystemProperty && !p.isPrimaryKey);
  }

  getFilterProperties() {
    // Properties that can be used for filtering in DTParameters
    return this.properties.filter(p => 
      !p.isSystemProperty && 
      (p.type === 'string' || p.type === 'int' || p.type === 'decimal' || p.type === 'DateTime')
    );
  }

  // Generate DTO names
  getCreateDtoName() {
    return `Create${this.name}Dto`;
  }

  getUpdateDtoName() {
    return `Update${this.name}Dto`;
  }

  getListDtoName() {
    return `${this.name}ListDto`;
  }

  getDetailDtoName() {
    return `${this.name}DetailDto`;
  }

  // Generate service names
  getServiceName() {
    return `${this.name}Service`;
  }

  getServiceInterfaceName() {
    return `I${this.name}Service`;
  }

  // Generate repository names
  getRepositoryName() {
    return `${this.name}Repository`;
  }

  getRepositoryInterfaceName() {
    return `I${this.name}Repository`;
  }

  // Generate controller name
  getControllerName() {
    return `${this.name}Controller`;
  }

  // Generate mapping name
  getMappingName() {
    return `${this.name}Mapping`;
  }

  // Generate validator name
  getValidatorName() {
    return `${this.name}Validator`;
  }

  // Generate aggregate name
  getAggregateName() {
    return `${this.name}Aggregate`;
  }

  // Generate DTParameters name
  getDTParametersName() {
    return `${this.name}DTParameters`;
  }

  // Generate route name for controller
  getRouteName() {
    return StringUtils.toKebabCase(this.pluralName);
  }

  // Generate menu enum name
  getMenuEnumName() {
    return this.name.toUpperCase();
  }

  // Generate camelCase name for variables
  getCamelCaseName() {
    return StringUtils.uncapitalize(this.name);
  }

  // Generate DTO namespace
  getDtoNamespace() {
    return this.pluralName;
  }

  // Get all related entities
  getRelatedEntities() {
    const related = new Set();
    this.relationships.forEach(rel => {
      related.add(rel.relatedEntity);
    });
    this.foreignKeys.forEach(fk => {
      if (fk.relatedEntity) {
        related.add(fk.relatedEntity);
      }
    });
    return Array.from(related);
  }

  // Check if entity has file upload properties
  hasFileUploadProperties() {
    return this.properties.some(p => p.type === 'FileUpload' || p.name.includes('Image') || p.name.includes('File'));
  }

  // Get file upload properties
  getFileUploadProperties() {
    return this.properties.filter(p => p.type === 'FileUpload' || p.name.includes('Image') || p.name.includes('File'));
  }

  // Check if entity has status properties
  hasStatusProperties() {
    return this.properties.some(p => p.name.includes('Status'));
  }

  // Get status properties
  getStatusProperties() {
    return this.properties.filter(p => p.name.includes('Status'));
  }

  // Check if entity has category properties
  hasCategoryProperties() {
    return this.properties.some(p => p.name.includes('Category'));
  }

  // Get category properties
  getCategoryProperties() {
    return this.properties.filter(p => p.name.includes('Category'));
  }

  // Generate using statements for entity
  getUsingStatements(projectName = 'BraceletWorkshop') {
    const usings = [
      `${projectName}.Domain.Abstractions`,
      'System',
      'System.Collections.Generic',
      'System.Linq',
      'System.Text',
      'System.Text.Json.Serialization',
      'System.Threading.Tasks'
    ];

    // Add specific usings based on properties
    if (this.hasFileUploadProperties()) {
      usings.push(`${projectName}.Shared.Entities`);
    }

    return usings;
  }

  // Generate using statements for DTOs
  getDtoUsingStatements(projectName = 'BraceletWorkshop') {
    const usings = [
      'System',
      'System.Collections.Generic',
      'System.Linq',
      'System.Text',
      'System.Threading.Tasks'
    ];

    if (this.hasFileUploadProperties()) {
      usings.push(`${projectName}.Shared.Entities`);
    }

    return usings;
  }

  // Generate using statements for service
  getServiceUsingStatements(projectName = 'BraceletWorkshop') {
    return [
      `${projectName}.Application.Constants`,
      `${projectName}.Application.DTOs.${this.getDtoNamespace()}`,
      `${projectName}.Application.Interfaces`,
      `${projectName}.Application.Mappings`,
      `${projectName}.Domain.DTParamters`,
      `${projectName}.Domain.Interfaces.Repositories`,
      `${projectName}.Shared.Entities`,
      `${projectName}.Shared.Extensions`,
      'Microsoft.EntityFrameworkCore'
    ];
  }

  // Generate using statements for controller
  getControllerUsingStatements(projectName = 'BraceletWorkshop') {
    return [
      'Asp.Versioning',
      `${projectName}.API.Utilities`,
      `${projectName}.Application.DTOs.${this.getDtoNamespace()}`,
      `${projectName}.Application.Interfaces`,
      `${projectName}.Domain.DTParamters`,
      `${projectName}.Domain.Enums`,
      `${projectName}.Shared.Entities`,
      'Microsoft.AspNetCore.Authorization',
      'Microsoft.AspNetCore.Mvc'
    ];
  }
}

module.exports = EntityModel;
