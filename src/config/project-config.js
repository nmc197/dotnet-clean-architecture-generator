const { v4: uuidv4 } = require('uuid');

const projectConfig = {
  // Default project structure
  defaultProjectName: 'BraceletWorkshop',
  defaultSolutionName: 'BraceletWorkshop',
  
  // Layer configurations
  layers: {
    domain: {
      name: 'Domain',
      path: 'BraceletWorkshop.Domain',
      dependencies: ['BraceletWorkshop.Shared'],
      isWebProject: false
    },
    application: {
      name: 'Application', 
      path: 'BraceletWorkshop.Application',
      dependencies: ['BraceletWorkshop.Domain', 'BraceletWorkshop.Shared'],
      isWebProject: false
    },
    infrastructure: {
      name: 'Infrastructure',
      path: 'BraceletWorkshop.Infrastructure', 
      dependencies: ['BraceletWorkshop.Domain', 'BraceletWorkshop.Shared'],
      isWebProject: false
    },
    api: {
      name: 'API',
      path: 'BraceletWorkshop.API',
      dependencies: ['BraceletWorkshop.Application', 'BraceletWorkshop.Infrastructure'],
      isWebProject: true
    },
    storage: {
      name: 'Storage',
      path: 'BraceletWorkshop.Storage',
      dependencies: ['BraceletWorkshop.Application', 'BraceletWorkshop.Infrastructure'],
      isWebProject: true
    },
    webadmin: {
      name: 'WebAdmin',
      path: 'BraceletWorkshop.WebAdmin',
      dependencies: ['BraceletWorkshop.Application', 'BraceletWorkshop.Infrastructure'],
      isWebProject: true
    },
    shared: {
      name: 'Shared',
      path: 'BraceletWorkshop.Shared',
      dependencies: [],
      isWebProject: false
    }
  },

  // Common properties for entities
  commonEntityProperties: [
    { name: 'Id', type: 'int', isPrimaryKey: true, isSystemProperty: true },
    { name: 'Name', type: 'string', isRequired: true },
    { name: 'Description', type: 'string', isRequired: false },
    { name: 'CreatedDate', type: 'DateTime', isRequired: true, isSystemProperty: true },
    { name: 'CreatedBy', type: 'int?', isRequired: false, isSystemProperty: true },
    { name: 'LastModifiedDate', type: 'DateTime?', isRequired: false, isSystemProperty: true },
    { name: 'UpdatedBy', type: 'int?', isRequired: false, isSystemProperty: true },
    { name: 'IsDeleted', type: 'bool', isRequired: true, defaultValue: 'false', isSystemProperty: true }
  ],

  // Common packages for each layer
  packages: {
    domain: [
      { name: 'Microsoft.EntityFrameworkCore', version: '9.0.5' }
    ],
    application: [
      { name: 'FluentValidation.AspNetCore', version: '11.3.0' },
      { name: 'Handlebars.Net', version: '2.1.6' },
      { name: 'Microsoft.Extensions.Configuration.Abstractions', version: '9.0.5' },
      { name: 'System.IdentityModel.Tokens.Jwt', version: '8.10.0' }
    ],
    infrastructure: [
      { name: 'Microsoft.EntityFrameworkCore', version: '9.0.5' },
      { name: 'Microsoft.EntityFrameworkCore.Design', version: '9.0.5' }
    ],
    api: [
      { name: 'Asp.Versioning.Mvc', version: '8.1.0' },
      { name: 'Asp.Versioning.Mvc.ApiExplorer', version: '8.1.0' },
      { name: 'Microsoft.AspNetCore.Authentication.JwtBearer', version: '8.0.16' },
      { name: 'Microsoft.AspNetCore.Mvc.NewtonsoftJson', version: '8.0.16' },
      { name: 'Serilog.AspNetCore', version: '9.0.0' },
      { name: 'Swashbuckle.AspNetCore', version: '6.6.2' }
    ],
    storage: [
      { name: 'Microsoft.AspNetCore.StaticFiles', version: '8.0.16' },
      { name: 'Serilog.AspNetCore', version: '9.0.0' }
    ],
    webadmin: [
      { name: 'Microsoft.AspNetCore.Mvc.Razor.RuntimeCompilation', version: '8.0.16' },
      { name: 'Serilog.AspNetCore', version: '9.0.0' }
    ],
    shared: [
      { name: 'Microsoft.Extensions.DependencyInjection.Abstractions', version: '9.0.5' }
    ]
  },

  // Template paths
  templates: {
    entity: 'templates/entity.hbs',
    createDto: 'templates/create-dto.hbs',
    updateDto: 'templates/update-dto.hbs',
    listDto: 'templates/list-dto.hbs',
    detailDto: 'templates/detail-dto.hbs',
    service: 'templates/service.hbs',
    serviceInterface: 'templates/service-interface.hbs',
    repository: 'templates/repository.hbs',
    repositoryInterface: 'templates/repository-interface.hbs',
    controller: 'templates/controller.hbs',
    mapping: 'templates/mapping.hbs',
    validator: 'templates/validator.hbs',
    aggregate: 'templates/aggregate.hbs',
    dtParameters: 'templates/dt-parameters.hbs',
    projectFile: 'templates/project-file.hbs',
    solutionFile: 'templates/solution-file.hbs',
    programApi: 'templates/program-api.hbs',
    programStorage: 'templates/program-storage.hbs',
    programWebadmin: 'templates/program-webadmin.hbs',
    appsettings: 'templates/appsettings.hbs',
    appsettingsDevelopment: 'templates/appsettings-development.hbs',
    launchSettings: 'templates/launch-settings.hbs',
    serviceExtensions: 'templates/service-extensions.hbs',
    exceptionHandlingMiddleware: 'templates/exception-handling-middleware.hbs',
    tokenRevocationMiddleware: 'templates/token-revocation-middleware.hbs',
    baseController: 'templates/base-controller.hbs',
    dbcontext: 'templates/dbcontext.hbs',
    unitOfWork: 'templates/unit-of-work.hbs',
    repositoryBase: 'templates/repository-base.hbs',
    // New templates for abstractions
    entityBase: 'templates/entity-base.hbs',
    entityAuditBase: 'templates/entity-audit-base.hbs',
    entityCommonBase: 'templates/entity-common-base.hbs',
    entityFullTextSearch: 'templates/entity-full-text-search.hbs',
    iUnitOfWork: 'templates/i-unit-of-work.hbs',
    iUnitOfWorkContext: 'templates/i-unit-of-work-context.hbs',
    abstractionsEntitiesIAuditable: 'templates/abstractions-entities-iauditable.hbs',
    abstractionsEntitiesIDateTracking: 'templates/abstractions-entities-idatetracking.hbs',
    abstractionsEntitiesIEntityBase: 'templates/abstractions-entities-ientitybase.hbs',
    abstractionsEntitiesIEntityCommonBase: 'templates/abstractions-entities-ientitycommonbase.hbs',
    abstractionsEntitiesIFullTextSearch: 'templates/abstractions-entities-ifulltextsearch.hbs',
    abstractionsEntitiesIUserTracking: 'templates/abstractions-entities-iusertracking.hbs',
    abstractionsRepositoriesIRepositoryBase: 'templates/abstractions-repositories-irepositorybase.hbs',
    abstractionsRepositoriesIRepositoryBaseDbContext: 'templates/abstractions-repositories-irepositorybase-dbcontext.hbs',
    // New templates for shared
    apiResponse: 'templates/api-response.hbs',
    dataTableModel: 'templates/data-table-model.hbs',
    stringHelper: 'templates/string-helper.hbs',
    stringExtensions: 'templates/string-extensions.hbs',
    claimNames: 'templates/claim-names.hbs'
  },

  // Output paths
  output: {
    basePath: './generated',
    solutionFile: 'BraceletWorkshop.sln'
  },

  // Generate GUIDs for solution file
  generateGuids() {
    const guids = {};
    Object.keys(this.layers).forEach(layer => {
      guids[layer] = uuidv4().toUpperCase();
    });
    return guids;
  },

  // Update project names in config
  updateProjectNames(projectName) {
    const updatedConfig = JSON.parse(JSON.stringify(this));
    
    // Update layer paths
    Object.keys(updatedConfig.layers).forEach(layer => {
      updatedConfig.layers[layer].path = updatedConfig.layers[layer].path.replace('BraceletWorkshop', projectName);
    });

    // Update output paths
    updatedConfig.output.solutionFile = `${projectName}.sln`;
    updatedConfig.defaultProjectName = projectName;
    updatedConfig.defaultSolutionName = projectName;

    return updatedConfig;
  },

  // Get layer path for project name
  getLayerPath(layer, projectName) {
    return this.layers[layer].path.replace('BraceletWorkshop', projectName);
  }
};

module.exports = projectConfig;
