const pluralize = require('pluralize');
const _ = require('lodash');

class StringUtils {
  static toPascalCase(str) {
    return str.replace(/(?:^|[-_])(\w)/g, (_, c) => c.toUpperCase());
  }

  static toCamelCase(str) {
    return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
  }

  static toKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  static toSnakeCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  }

  static pluralize(str) {
    return pluralize(str);
  }

  static singularize(str) {
    return pluralize.singular(str);
  }

  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static uncapitalize(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  static getNamespaceFromPath(path) {
    return path.replace(/\//g, '.').replace(/\\/g, '.');
  }

  static getFileNameFromPath(path) {
    return path.split('/').pop().split('\\').pop();
  }

  static getDirectoryFromPath(path) {
    const parts = path.split('/');
    parts.pop();
    return parts.join('/');
  }

  static generatePropertyName(property) {
    if (property.isForeignKey) {
      return `${property.relatedEntity}Id`;
    }
    return property.name;
  }

  static generateCSharpType(property) {
    const typeMap = {
      'string': 'string',
      'int': 'int',
      'long': 'long',
      'decimal': 'decimal',
      'double': 'double',
      'float': 'float',
      'bool': 'bool',
      'DateTime': 'DateTime',
      'Guid': 'Guid',
      'byte[]': 'byte[]',
      'FileUpload': 'FileUpload'
    };

    let csharpType = typeMap[property.type] || property.type;
    
    if (property.isNullable && !property.isPrimaryKey) {
      csharpType += '?';
    }

    return csharpType;
  }

  static generateDefaultValue(property) {
    if (property.defaultValue !== undefined) {
      return property.defaultValue;
    }

    const defaultValues = {
      'string': 'null!',
      'int': '0',
      'long': '0',
      'decimal': '0',
      'double': '0.0',
      'float': '0.0f',
      'bool': 'false',
      'DateTime': 'DateTime.Now',
      'Guid': 'Guid.NewGuid()',
      'byte[]': 'null!',
      'FileUpload': 'null!'
    };

    return defaultValues[property.type] || 'null!';
  }

  static generateUsingStatements(imports) {
    return imports.map(imp => `using ${imp};`).join('\n');
  }

  static generatePropertyDeclaration(property) {
    const type = this.generateCSharpType(property);
    const defaultValue = this.generateDefaultValue(property);
    
    let declaration = `        public ${type} ${property.name}`;
    
    if (property.defaultValue !== undefined) {
      declaration += ` { get; set; } = ${defaultValue};`;
    } else {
      declaration += ` { get; set; } = ${defaultValue};`;
    }

    return declaration;
  }

  static generateConstructorParameter(property) {
    const type = this.generateCSharpType(property);
    return `${type} ${this.uncapitalize(property.name)}`;
  }

  static generateConstructorAssignment(property) {
    return `            ${property.name} = ${this.uncapitalize(property.name)};`;
  }

  static generateValidationRule(property) {
    if (!property.isRequired) return '';

    const rules = [];
    
    if (property.type === 'string') {
      rules.push(`RuleFor(x => x.${property.name}).NotEmpty().WithMessage("{PropertyName} is required.")`);
      if (property.maxLength) {
        rules.push(`RuleFor(x => x.${property.name}).MaximumLength(${property.maxLength}).WithMessage("{PropertyName} must not exceed {MaxLength} characters.")`);
      }
    } else if (property.type === 'int' || property.type === 'long') {
      rules.push(`RuleFor(x => x.${property.name}).GreaterThan(0).WithMessage("{PropertyName} must be greater than 0.")`);
    } else if (property.type === 'decimal' || property.type === 'double' || property.type === 'float') {
      rules.push(`RuleFor(x => x.${property.name}).GreaterThan(0).WithMessage("{PropertyName} must be greater than 0.")`);
    }

    return rules.join('\n                ');
  }

  static generateRouteName(entityName) {
    return this.toKebabCase(this.pluralize(entityName));
  }

  static generateMenuEnum(entityName) {
    return entityName.toUpperCase();
  }

  static generateActionEnum(action) {
    return action.toUpperCase();
  }

  // Generate namespace for DTOs
  static generateDtoNamespace(entityName) {
    return this.pluralize(entityName);
  }

  // Generate namespace for project
  static generateProjectNamespace(projectName, layer) {
    return `${projectName}.${layer}`;
  }

  // Generate file path for entity
  static generateEntityPath(projectName, entityName) {
    return `${projectName}.Domain/Entities/${entityName}.cs`;
  }

  // Generate file path for DTO
  static generateDtoPath(projectName, entityName, dtoType) {
    const dtoNamespace = this.generateDtoNamespace(entityName);
    return `${projectName}.Application/DTOs/${dtoNamespace}/${dtoType}${entityName}Dto.cs`;
  }

  // Generate file path for service
  static generateServicePath(projectName, entityName) {
    return `${projectName}.Application/Implements/${entityName}Service.cs`;
  }

  // Generate file path for service interface
  static generateServiceInterfacePath(projectName, entityName) {
    return `${projectName}.Application/Interfaces/I${entityName}Service.cs`;
  }

  // Generate file path for repository
  static generateRepositoryPath(projectName, entityName) {
    return `${projectName}.Infrastructure/Repositories/${entityName}Repository.cs`;
  }

  // Generate file path for repository interface
  static generateRepositoryInterfacePath(projectName, entityName) {
    return `${projectName}.Domain/Interfaces/Repositories/I${entityName}Repository.cs`;
  }

  // Generate file path for controller
  static generateControllerPath(projectName, entityName) {
    return `${projectName}.API/Controllers/${entityName}Controller.cs`;
  }

  // Generate file path for mapping
  static generateMappingPath(projectName, entityName) {
    return `${projectName}.Application/Mappings/${entityName}Mapping.cs`;
  }

  // Generate file path for validator
  static generateValidatorPath(projectName, entityName) {
    return `${projectName}.Application/Validators/${entityName}Validator.cs`;
  }

  // Generate file path for aggregate
  static generateAggregatePath(projectName, entityName) {
    return `${projectName}.Domain/Aggregates/${entityName}Aggregate.cs`;
  }

  // Generate file path for DTParameters
  static generateDTParametersPath(projectName, entityName) {
    return `${projectName}.Domain/DTParamters/${entityName}DTParameters.cs`;
  }

  // Generate file path for project file
  static generateProjectFilePath(projectName, layer) {
    return `${projectName}.${layer}/${projectName}.${layer}.csproj`;
  }

  // Generate file path for solution file
  static generateSolutionFilePath(projectName) {
    return `${projectName}.sln`;
  }

  // Sanitize string for use in file names
  static sanitizeFileName(str) {
    return str.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  // Generate GUID for project files
  static generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }).toUpperCase();
  }

  // Convert property type to SQL type
  static getSqlType(property) {
    const sqlTypeMap = {
      'string': 'nvarchar',
      'int': 'int',
      'long': 'bigint',
      'decimal': 'decimal(18,2)',
      'double': 'float',
      'float': 'real',
      'bool': 'bit',
      'DateTime': 'datetime2',
      'Guid': 'uniqueidentifier',
      'byte[]': 'varbinary(max)'
    };

    return sqlTypeMap[property.type] || 'nvarchar';
  }

  // Generate SQL column definition
  static generateSqlColumn(property) {
    const sqlType = this.getSqlType(property);
    let column = `${property.name} ${sqlType}`;
    
    if (property.isRequired && !property.isPrimaryKey) {
      column += ' NOT NULL';
    }
    
    if (property.maxLength && property.type === 'string') {
      column = column.replace('nvarchar', `nvarchar(${property.maxLength})`);
    }
    
    return column;
  }
}

module.exports = StringUtils;
