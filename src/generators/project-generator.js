const BaseGenerator = require('./base-generator');
const FileUtils = require('../utils/file-utils');
const StringUtils = require('../utils/string-utils');
const projectConfig = require('../config/project-config');
const chalk = require('chalk');

class ProjectGenerator extends BaseGenerator {
  constructor(templateEngine, outputPath = null) {
    super(templateEngine, outputPath);
  }

  async generateProjectFile(layer, projectName) {
    try {
      this.logInfo(`Generating project file: ${projectName}.${layer}`);

      const layerConfig = projectConfig.layers[layer];
      if (!layerConfig) {
        throw new Error(`Unknown layer: ${layer}`);
      }

      // Generate project file data
      const projectData = {
        name: `${projectName}.${layer}`,
        isWebProject: layerConfig.isWebProject,
        packages: projectConfig.packages[layer] || [],
        dependencies: layerConfig.dependencies.map(dep => 
          dep.replace('BraceletWorkshop', projectName)
        )
      };

      const projectPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.${layer}`,
        `${projectName}.${layer}.csproj`
      );

      const success = await this.generateFile(
        'templates/project-file.hbs',
        projectData,
        projectPath
      );

      if (success) {
        this.logSuccess(`Generated project file: ${projectName}.${layer}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to generate project file ${projectName}.${layer}: ${error.message}`);
      return false;
    }
  }

  async generateSolutionFile(projectName) {
    try {
      this.logInfo(`Generating solution file: ${projectName}.sln`);

      // Generate GUIDs for projects
      const guids = projectConfig.generateGuids();

      // Generate solution file data
      const solutionData = {
        projects: Object.keys(projectConfig.layers).map(layer => ({
          name: `${projectName}.${projectConfig.layers[layer].name}`,
          guid: guids[layer]
        }))
      };

      const solutionPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.sln`
      );

      const success = await this.generateFile(
        'templates/solution-file.hbs',
        solutionData,
        solutionPath
      );

      if (success) {
        this.logSuccess(`Generated solution file: ${projectName}.sln`);
        return true;
      }

      return false;
    } catch (error) {
      this.logError(`Failed to generate solution file ${projectName}.sln: ${error.message}`);
      return false;
    }
  }

  async generateAllProjectFiles(projectName) {
    const results = {};

    // Generate project files for each layer
    for (const layer of Object.keys(projectConfig.layers)) {
      results[`${layer}Project`] = await this.generateProjectFile(layer, projectName);
    }

    // Generate solution file
    results.solution = await this.generateSolutionFile(projectName);

    const successCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;

    if (successCount === totalCount) {
      this.logSuccess(`Successfully generated all project files for ${projectName}`);
    } else {
      this.logWarning(`Generated ${successCount}/${totalCount} project files for ${projectName}`);
    }

    return results;
  }

  async generateLayerStructure(projectName) {
    try {
      this.logInfo(`Creating layer structure for ${projectName}`);

      const layers = Object.keys(projectConfig.layers);
      const results = {};

      for (const layer of layers) {
        const layerPath = FileUtils.joinPath(this.outputPath, `${projectName}.${projectConfig.layers[layer].name}`);
        results[layer] = await FileUtils.ensureDirectoryExists(layerPath);
      }

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully created layer structure for ${projectName}`);
      } else {
        this.logWarning(`Created ${successCount}/${totalCount} layers for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to create layer structure for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateSharedStructure(projectName) {
    try {
      this.logInfo(`Creating shared structure for ${projectName}`);

      const sharedPath = FileUtils.joinPath(this.outputPath, `${projectName}.Shared`);
      const subDirs = [
        'Entities',
        'Enums',
        'Extensions',
        'Helpers',
        'Services',
        'Constants',
        'Attributes'
      ];

      const results = {};
      
      // Create main shared directory
      results.shared = await FileUtils.ensureDirectoryExists(sharedPath);

      // Create subdirectories
      for (const subDir of subDirs) {
        const subDirPath = FileUtils.joinPath(sharedPath, subDir);
        results[subDir] = await FileUtils.ensureDirectoryExists(subDirPath);
      }

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully created shared structure for ${projectName}`);
      } else {
        this.logWarning(`Created ${successCount}/${totalCount} shared directories for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to create shared structure for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateInfrastructureStructure(projectName) {
    try {
      this.logInfo(`Creating infrastructure structure for ${projectName}`);

      const infrastructurePath = FileUtils.joinPath(this.outputPath, `${projectName}.Infrastructure`);
      const subDirs = [
        'Repositories',
        'Persistence',
        'Services',
        'Constants',
        'DependencyInjection'
      ];

      const results = {};
      
      // Create main infrastructure directory
      results.infrastructure = await FileUtils.ensureDirectoryExists(infrastructurePath);

      // Create subdirectories
      for (const subDir of subDirs) {
        const subDirPath = FileUtils.joinPath(infrastructurePath, subDir);
        results[subDir] = await FileUtils.ensureDirectoryExists(subDirPath);
      }

      // Create nested subdirectories for DependencyInjection
      const dependencyInjectionSubDirs = ['Extentions', 'Options'];
      for (const subDir of dependencyInjectionSubDirs) {
        const nestedPath = FileUtils.joinPath(infrastructurePath, 'DependencyInjection', subDir);
        results[`DependencyInjection_${subDir}`] = await FileUtils.ensureDirectoryExists(nestedPath);
      }

      // Create nested subdirectories for Persistence
      const persistenceSubDirs = ['Configurations', 'Migrations', 'SeedData'];
      for (const subDir of persistenceSubDirs) {
        const nestedPath = FileUtils.joinPath(infrastructurePath, 'Persistence', subDir);
        results[`Persistence_${subDir}`] = await FileUtils.ensureDirectoryExists(nestedPath);
      }

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully created infrastructure structure for ${projectName}`);
      } else {
        this.logWarning(`Created ${successCount}/${totalCount} infrastructure directories for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to create infrastructure structure for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateApplicationStructure(projectName) {
    try {
      this.logInfo(`Creating application structure for ${projectName}`);

      const applicationPath = FileUtils.joinPath(this.outputPath, `${projectName}.Application`);
      const subDirs = [
        'DTOs',
        'Interfaces',
        'Implements',
        'Mappings',
        'Validators',
        'Constants',
        'EmailTemplates',
        'StaticFiles',
        'DependencyInjection'
      ];

      const results = {};
      
      // Create main application directory
      results.application = await FileUtils.ensureDirectoryExists(applicationPath);

      // Create subdirectories
      for (const subDir of subDirs) {
        const subDirPath = FileUtils.joinPath(applicationPath, subDir);
        results[subDir] = await FileUtils.ensureDirectoryExists(subDirPath);
      }

      // Create nested subdirectories for DependencyInjection
      const dependencyInjectionSubDirs = ['Extentions'];
      for (const subDir of dependencyInjectionSubDirs) {
        const nestedPath = FileUtils.joinPath(applicationPath, 'DependencyInjection', subDir);
        results[`DependencyInjection_${subDir}`] = await FileUtils.ensureDirectoryExists(nestedPath);
      }

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully created application structure for ${projectName}`);
      } else {
        this.logWarning(`Created ${successCount}/${totalCount} application directories for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to create application structure for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateApplicationConstants(projectName) {
    try {
      this.logInfo(`Generating application constants for ${projectName}`);

      const results = {};

      const commonConstPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Application`,
        'Constants',
        'CommonConstants.cs'
      );
      results.commonConstants = await this.generateFile(
        'templates/application-constants-common.hbs',
        { projectName },
        commonConstPath
      );

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully generated application constants for ${projectName}`);
      } else {
        this.logWarning(`Generated ${successCount}/${totalCount} application constants for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to generate application constants for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateDomainStructure(projectName) {
    try {
      this.logInfo(`Creating domain structure for ${projectName}`);

      const domainPath = FileUtils.joinPath(this.outputPath, `${projectName}.Domain`);
      const subDirs = [
        'Entities',
        'Interfaces',
        'Aggregates',
        'DTParamters',
        'Enums',
        'Abstractions',
        'Settings'
      ];

      const results = {};
      
      // Create main domain directory
      results.domain = await FileUtils.ensureDirectoryExists(domainPath);

      // Create subdirectories
      for (const subDir of subDirs) {
        const subDirPath = FileUtils.joinPath(domainPath, subDir);
        results[subDir] = await FileUtils.ensureDirectoryExists(subDirPath);
      }

      // Create nested subdirectories for Abstractions
      const abstractionsSubDirs = ['Entities', 'Repositories'];
      for (const subDir of abstractionsSubDirs) {
        const nestedPath = FileUtils.joinPath(domainPath, 'Abstractions', subDir);
        results[`Abstractions_${subDir}`] = await FileUtils.ensureDirectoryExists(nestedPath);
      }

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully created domain structure for ${projectName}`);
      } else {
        this.logWarning(`Created ${successCount}/${totalCount} domain directories for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to create domain structure for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateDomainSupportingFiles(projectName) {
    try {
      this.logInfo(`Generating domain supporting files for ${projectName}`);

      const results = {};

      const enumsPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Domain`,
        'Enums',
        'Enums.cs'
      );
      results.domainEnums = await this.generateFile(
        'templates/domain-enums.hbs',
        { projectName },
        enumsPath
      );

      const hostSettingsPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Domain`,
        'Settings',
        'HostSettings.cs'
      );
      results.hostSettings = await this.generateFile(
        'templates/host-settings.hbs',
        { projectName },
        hostSettingsPath
      );

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully generated domain supporting files for ${projectName}`);
      } else {
        this.logWarning(`Generated ${successCount}/${totalCount} domain supporting files for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to generate domain supporting files for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateAPIStructure(projectName) {
    try {
      this.logInfo(`Creating API structure for ${projectName}`);

      const apiPath = FileUtils.joinPath(this.outputPath, `${projectName}.API`);
      const subDirs = [
        'Controllers',
        'Middlewares',
        'Utilities',
        'Properties',
        'Logs'
      ];

      const results = {};
      
      // Create main API directory
      results.api = await FileUtils.ensureDirectoryExists(apiPath);

      // Create subdirectories
      for (const subDir of subDirs) {
        const subDirPath = FileUtils.joinPath(apiPath, subDir);
        results[subDir] = await FileUtils.ensureDirectoryExists(subDirPath);
      }

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully created API structure for ${projectName}`);
      } else {
        this.logWarning(`Created ${successCount}/${totalCount} API directories for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to create API structure for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateStorageStructure(projectName) {
    try {
      this.logInfo(`Creating storage structure for ${projectName}`);

      const storagePath = FileUtils.joinPath(this.outputPath, `${projectName}.Storage`);
      const subDirs = [
        'Controllers',
        'Services',
        'Interfaces',
        'Models',
        'Enums',
        'Constants',
        'Helpers',
        'Utilities',
        'Logs',
        'wwwroot'
      ];

      const results = {};
      
      // Create main storage directory
      results.storage = await FileUtils.ensureDirectoryExists(storagePath);

      // Create subdirectories
      for (const subDir of subDirs) {
        const subDirPath = FileUtils.joinPath(storagePath, subDir);
        results[subDir] = await FileUtils.ensureDirectoryExists(subDirPath);
      }

      // Create nested subdirectories for Properties
      const propertiesSubDirs = ['PublishProfiles'];
      for (const subDir of propertiesSubDirs) {
        const nestedPath = FileUtils.joinPath(storagePath, 'Properties', subDir);
        results[`Properties_${subDir}`] = await FileUtils.ensureDirectoryExists(nestedPath);
      }

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully created storage structure for ${projectName}`);
      } else {
        this.logWarning(`Created ${successCount}/${totalCount} storage directories for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to create storage structure for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateStorageFiles(projectName) {
    try {
      this.logInfo(`Generating storage files for ${projectName}`);

      const results = {};

      // Controller
      const storageControllerPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Storage`,
        'Controllers',
        'FileController.cs'
      );
      results.storageController = await this.generateFile(
        'templates/storage-controller.hbs',
        { projectName },
        storageControllerPath
      );

      // Interfaces
      const storageInterfacePath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Storage`,
        'Interfaces',
        'IStorageService.cs'
      );
      results.storageInterface = await this.generateFile(
        'templates/storage-service-interface.hbs',
        { projectName },
        storageInterfacePath
      );

      // Services
      const storageServicePath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Storage`,
        'Services',
        'StorageService.cs'
      );
      results.storageService = await this.generateFile(
        'templates/storage-service.hbs',
        { projectName },
        storageServicePath
      );

      // Helpers
      const storageHelperPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Storage`,
        'Helpers',
        'PathHelper.cs'
      );
      results.storageHelper = await this.generateFile(
        'templates/storage-helpers.hbs',
        { projectName },
        storageHelperPath
      );

      // Utilities
      const storageUtilPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Storage`,
        'Utilities',
        'StaticFileUtils.cs'
      );
      results.storageUtilities = await this.generateFile(
        'templates/storage-utilities.hbs',
        { projectName },
        storageUtilPath
      );

      // Models
      const fileUploadResultPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Storage`,
        'Models',
        'FileUploadResult.cs'
      );
      results.storageModelFileUpload = await this.generateFile(
        'templates/storage-model-fileuploadresult.hbs',
        { projectName },
        fileUploadResultPath
      );

      const createFolderRequestPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Storage`,
        'Models',
        'CreateFolderRequest.cs'
      );
      results.storageModelCreateFolder = await this.generateFile(
        'templates/storage-model-createfolderrequest.hbs',
        { projectName },
        createFolderRequestPath
      );

      // Enums
      const storageEnumPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Storage`,
        'Enums',
        'StorageEnums.cs'
      );
      results.storageEnums = await this.generateFile(
        'templates/storage-enum.hbs',
        { projectName },
        storageEnumPath
      );

      // Constants
      const storageConstantsPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Storage`,
        'Constants',
        'StorageConstants.cs'
      );
      results.storageConstants = await this.generateFile(
        'templates/storage-constants.hbs',
        { projectName },
        storageConstantsPath
      );

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully generated storage files for ${projectName}`);
      } else {
        this.logWarning(`Generated ${successCount}/${totalCount} storage files for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to generate storage files for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateWebAdminStructure(projectName) {
    try {
      this.logInfo(`Creating webadmin structure for ${projectName}`);

      const webadminPath = FileUtils.joinPath(this.outputPath, `${projectName}.WebAdmin`);
      const subDirs = [
        'Controllers',
        'Models',
        'Views',
        'Logs',
        'wwwroot',
        'Properties'
      ];

      const results = {};
      
      // Create main webadmin directory
      results.webadmin = await FileUtils.ensureDirectoryExists(webadminPath);

      // Create subdirectories
      for (const subDir of subDirs) {
        const subDirPath = FileUtils.joinPath(webadminPath, subDir);
        results[subDir] = await FileUtils.ensureDirectoryExists(subDirPath);
      }

      // Create nested subdirectories for Properties
      const propertiesSubDirs = ['PublishProfiles'];
      for (const subDir of propertiesSubDirs) {
        const nestedPath = FileUtils.joinPath(webadminPath, 'Properties', subDir);
        results[`Properties_${subDir}`] = await FileUtils.ensureDirectoryExists(nestedPath);
      }

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully created webadmin structure for ${projectName}`);
      } else {
        this.logWarning(`Created ${successCount}/${totalCount} webadmin directories for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to create webadmin structure for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateWebAdminFiles(projectName, entities) {
    try {
      this.logInfo(`Generating WebAdmin files for ${projectName}`);

      const results = {};

      // wwwroot basic assets
      const cssPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.WebAdmin`,
        'wwwroot',
        'css',
        'site.css'
      );
      results.webadminCss = await this.generateFile(
        'templates/webadmin-site-css.hbs',
        { projectName },
        cssPath
      );

      const jsPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.WebAdmin`,
        'wwwroot',
        'js',
        'site.js'
      );
      results.webadminJs = await this.generateFile(
        'templates/webadmin-site-js.hbs',
        { projectName },
        jsPath
      );

      // wwwroot/admin shared assets
      const adminConfigJsPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.WebAdmin`,
        'wwwroot',
        'admin',
        'assets',
        'js',
        'shared',
        'config.js'
      );
      results.webadminAdminConfig = await this.generateFile(
        'templates/webadmin-admin-config-js.hbs',
        { projectName },
        adminConfigJsPath
      );

      const adminFileManagerJsPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.WebAdmin`,
        'wwwroot',
        'admin',
        'assets',
        'js',
        'shared',
        'file-manager.js'
      );
      results.webadminAdminFileManager = await this.generateFile(
        'templates/webadmin-admin-file-manager-js.hbs',
        { projectName },
        adminFileManagerJsPath
      );

      // _Layout.cshtml
      const layoutPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.WebAdmin`,
        'Views',
        'Shared',
        '_Layout.cshtml'
      );
      results.webadminLayout = await this.generateFile(
        'templates/webadmin-layout.hbs',
        { projectName },
        layoutPath
      );

      // HomeController
      const homeCtrlPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.WebAdmin`,
        'Controllers',
        'HomeController.cs'
      );
      results.webadminHomeController = await this.generateFile(
        'templates/webadmin-home-controller.hbs',
        { projectName },
        homeCtrlPath
      );

      // Views/Home/Index.cshtml
      const homeIndexPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.WebAdmin`,
        'Views',
        'Home',
        'Index.cshtml'
      );
      results.webadminHomeIndex = await this.generateFile(
        'templates/webadmin-home-index.hbs',
        { projectName },
        homeIndexPath
      );

      // Per-entity MVC Controller + Views (List, Detail, Form)
      for (const e of entities) {
        const data = { 
          projectName, 
          entity: e.name, 
          entityName: e.name.toLowerCase(),
          displayName: e.name,
          plural: e.name + 's', 
          properties: e.properties || [],
          lastColumnIndex: (e.properties || []).length
        };

        const entityCtrlPath = FileUtils.joinPath(
          this.outputPath,
          `${projectName}.WebAdmin`,
          'Controllers',
          `${e.name}Controller.cs`
        );
        results[`${e.name}Controller`] = await this.generateFile(
          'templates/webadmin-entity-controller.hbs',
          data,
          entityCtrlPath
        );

        const listViewPath = FileUtils.joinPath(
          this.outputPath,
          `${projectName}.WebAdmin`,
          'Views',
          e.name,
          'List.cshtml'
        );
        results[`${e.name}ListView`] = await this.generateFile(
          'templates/webadmin-views-list.hbs',
          data,
          listViewPath
        );

        const detailViewPath = FileUtils.joinPath(
          this.outputPath,
          `${projectName}.WebAdmin`,
          'Views',
          e.name,
          'Detail.cshtml'
        );
        results[`${e.name}DetailView`] = await this.generateFile(
          'templates/webadmin-views-detail.hbs',
          data,
          detailViewPath
        );

        const formViewPath = FileUtils.joinPath(
          this.outputPath,
          `${projectName}.WebAdmin`,
          'Views',
          e.name,
          'Form.cshtml'
        );
        results[`${e.name}FormView`] = await this.generateFile(
          'templates/webadmin-views-form.hbs',
          data,
          formViewPath
        );

        // Per-entity JS pages under admin/assets/js/pages/<entity>
        const baseJsDir = FileUtils.joinPath(
          this.outputPath,
          `${projectName}.WebAdmin`,
          'wwwroot',
          'admin',
          'assets',
          'js',
          'pages',
          e.name.toLowerCase()
        );
        
        // Generate general.js (replaces list.js, detail.js, form.js)
        results[`${e.name}JsGeneral`] = await this.generateFile(
          'templates/webadmin-js-entity-general.hbs',
          data,
          FileUtils.joinPath(baseJsDir, 'general.js')
        );
        
        // Generate i18n.js for translations
        results[`${e.name}JsI18n`] = await this.generateFile(
          'templates/webadmin-js-entity-i18n.hbs',
          data,
          FileUtils.joinPath(baseJsDir, 'i18n.js')
        );
      }

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully generated WebAdmin files for ${projectName}`);
      } else {
        this.logWarning(`Generated ${successCount}/${totalCount} WebAdmin files for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to generate WebAdmin files for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateConfigurationFiles(projectName) {
    try {
      this.logInfo(`Generating configuration files for ${projectName}`);

      const results = {};

      // Generate Program.cs for API
      const apiProgramData = { projectName };
      const apiProgramPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.API`,
        'Program.cs'
      );
      results.apiProgram = await this.generateFile(
        'templates/program-api.hbs',
        apiProgramData,
        apiProgramPath
      );

      // Generate Program.cs for Storage
      const storageProgramData = { projectName };
      const storageProgramPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Storage`,
        'Program.cs'
      );
      results.storageProgram = await this.generateFile(
        'templates/program-storage.hbs',
        storageProgramData,
        storageProgramPath
      );

      // Generate Program.cs for WebAdmin
      const webadminProgramData = { projectName };
      const webadminProgramPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.WebAdmin`,
        'Program.cs'
      );
      results.webadminProgram = await this.generateFile(
        'templates/program-webadmin.hbs',
        webadminProgramData,
        webadminProgramPath
      );

      // Generate appsettings.json for each web project
      const appsettingsData = { projectName };
      const webProjects = ['API', 'Storage', 'WebAdmin'];
      
      for (const project of webProjects) {
        const appsettingsPath = FileUtils.joinPath(
          this.outputPath,
          `${projectName}.${project}`,
          'appsettings.json'
        );
        results[`${project.toLowerCase()}Appsettings`] = await this.generateFile(
          'templates/appsettings.hbs',
          appsettingsData,
          appsettingsPath
        );

        // Generate appsettings.Development.json
        const devAppsettingsPath = FileUtils.joinPath(
          this.outputPath,
          `${projectName}.${project}`,
          'appsettings.Development.json'
        );
        results[`${project.toLowerCase()}DevAppsettings`] = await this.generateFile(
          'templates/appsettings-development.hbs',
          appsettingsData,
          devAppsettingsPath
        );
      }

      // Generate launchSettings.json for each web project
      const launchSettingsData = {
        projectName,
        port: 5000,
        sslPort: 5001,
        launchUrl: 'swagger'
      };

      for (const project of webProjects) {
        const launchSettingsPath = FileUtils.joinPath(
          this.outputPath,
          `${projectName}.${project}`,
          'Properties',
          'launchSettings.json'
        );
        results[`${project.toLowerCase()}LaunchSettings`] = await this.generateFile(
          'templates/launch-settings.hbs',
          launchSettingsData,
          launchSettingsPath
        );
      }

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully generated configuration files for ${projectName}`);
      } else {
        this.logWarning(`Generated ${successCount}/${totalCount} configuration files for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to generate configuration files for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateAPIFiles(projectName) {
    try {
      this.logInfo(`Generating API files for ${projectName}`);

      const results = {};

      // Generate ServiceExtensions.cs
      const serviceExtensionsData = { projectName };
      const serviceExtensionsPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.API`,
        'Utilities',
        'ServiceExtensions.cs'
      );
      results.serviceExtensions = await this.generateFile(
        'templates/service-extensions.hbs',
        serviceExtensionsData,
        serviceExtensionsPath
      );

      // Generate ExceptionHandlingMiddleware.cs
      const exceptionMiddlewareData = { projectName };
      const exceptionMiddlewarePath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.API`,
        'Middlewares',
        'ExceptionHandlingMiddleware.cs'
      );
      results.exceptionMiddleware = await this.generateFile(
        'templates/exception-handling-middleware.hbs',
        exceptionMiddlewareData,
        exceptionMiddlewarePath
      );

      // Generate TokenRevocationMiddleware.cs
      const tokenRevocationData = { projectName };
      const tokenRevocationPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.API`,
        'Middlewares',
        'TokenRevocationMiddleware.cs'
      );
      results.tokenRevocationMiddleware = await this.generateFile(
        'templates/token-revocation-middleware.hbs',
        tokenRevocationData,
        tokenRevocationPath
      );

      // Generate BaseController.cs
      const baseControllerData = { projectName };
      const baseControllerPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.API`,
        'Controllers',
        'BaseController.cs'
      );
      results.baseController = await this.generateFile(
        'templates/base-controller.hbs',
        baseControllerData,
        baseControllerPath
      );

      // Generate common non-entity controllers (Auth minimal scaffold)
      const staticControllers = [
        { template: 'templates/auth-controller.hbs', name: 'AuthController' },
        { template: 'templates/filemanager-controller.hbs', name: 'FileManagerController' },
        { template: 'templates/systemconfig-controller.hbs', name: 'SystemConfigController' },
        { template: 'templates/role-controller.hbs', name: 'RoleController' },
        { template: 'templates/permission-controller.hbs', name: 'PermissonController' }
      ];
      for (const ctrl of staticControllers) {
        const outPath = FileUtils.joinPath(
          this.outputPath,
          `${projectName}.API`,
          'Controllers',
          `${ctrl.name}.cs`
        );
        results[ctrl.name] = await this.generateFile(ctrl.template, { projectName }, outPath);
      }

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully generated API files for ${projectName}`);
      } else {
        this.logWarning(`Generated ${successCount}/${totalCount} API files for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to generate API files for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateInfrastructureFiles(projectName, entities) {
    try {
      this.logInfo(`Generating infrastructure files for ${projectName}`);

      const results = {};

      // Generate DbContext
      const dbContextData = { projectName, entities };
      const dbContextPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Infrastructure`,
        'Persistence',
        `${projectName}Context.cs`
      );
      results.dbContext = await this.generateFile(
        'templates/dbcontext.hbs',
        dbContextData,
        dbContextPath
      );

      // Generate UnitOfWork
      const unitOfWorkData = { projectName, entities };
      const unitOfWorkPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Infrastructure`,
        'Repositories',
        'UnitOfWork.cs'
      );
      results.unitOfWork = await this.generateFile(
        'templates/unit-of-work.hbs',
        unitOfWorkData,
        unitOfWorkPath
      );

      // Generate RepositoryBase
      const repositoryBaseData = { projectName };
      const repositoryBasePath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Infrastructure`,
        'Repositories',
        'RepositoryBase.cs'
      );
      results.repositoryBase = await this.generateFile(
        'templates/repository-base.hbs',
        repositoryBaseData,
        repositoryBasePath
      );

      // Generate TableNames constants
      const tableNamesPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Infrastructure`,
        'Constants',
        'TableNames.cs'
      );
      results.tableNames = await this.generateFile(
        'templates/infrastructure-tablenames.hbs',
        { projectName, entities },
        tableNamesPath
      );

      // Generate DI Options stub
      const diOptionsPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Infrastructure`,
        'DependencyInjection',
        'Options',
        'InfrastructureOptions.cs'
      );
      results.infrastructureOptions = await this.generateFile(
        'templates/infrastructure-di-options.hbs',
        { projectName },
        diOptionsPath
      );

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully generated infrastructure files for ${projectName}`);
      } else {
        this.logWarning(`Generated ${successCount}/${totalCount} infrastructure files for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to generate infrastructure files for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateApplicationDependencyInjection(projectName) {
    try {
      this.logInfo(`Generating application DI and extensions for ${projectName}`);

      const results = {};

      // Application DI ConfigureServices
      const appDiConfigurePath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Application`,
        'DependencyInjection',
        'Extentions',
        'ConfigureServices.cs'
      );
      results.applicationConfigureServices = await this.generateFile(
        'templates/application-di-configure-services.hbs',
        { projectName },
        appDiConfigurePath
      );

      // Application HttpContext Extensions
      const appHttpCtxExtPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Application`,
        'DependencyInjection',
        'Extentions',
        'HttpContextExtensions.cs'
      );
      results.applicationHttpContextExtensions = await this.generateFile(
        'templates/application-di-httpcontext-extensions.hbs',
        { projectName },
        appHttpCtxExtPath
      );

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully generated application DI files for ${projectName}`);
      } else {
        this.logWarning(`Generated ${successCount}/${totalCount} application DI files for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to generate application DI files for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateInfrastructureDependencyInjection(projectName) {
    try {
      this.logInfo(`Generating infrastructure DI and extensions for ${projectName}`);

      const results = {};

      // Infrastructure DI ConfigureServices
      const infraDiConfigurePath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Infrastructure`,
        'DependencyInjection',
        'Extentions',
        'ConfigureServices.cs'
      );
      results.infrastructureConfigureServices = await this.generateFile(
        'templates/infrastructure-di-configure-services.hbs',
        { projectName },
        infraDiConfigurePath
      );

      // Infrastructure DI MigrationExtensions
      const infraMigrationExtPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Infrastructure`,
        'DependencyInjection',
        'Extentions',
        'MigrationExtensions.cs'
      );
      results.infrastructureMigrationExtensions = await this.generateFile(
        'templates/infrastructure-di-migration-extensions.hbs',
        { projectName },
        infraMigrationExtPath
      );

      // Infrastructure DI SystemCacheWarmup
      const infraSystemCacheWarmupPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Infrastructure`,
        'DependencyInjection',
        'Extentions',
        'SystemCacheWarmup.cs'
      );
      results.infrastructureSystemCacheWarmup = await this.generateFile(
        'templates/infrastructure-di-system-cache-warmup.hbs',
        { projectName },
        infraSystemCacheWarmupPath
      );

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully generated infrastructure DI files for ${projectName}`);
      } else {
        this.logWarning(`Generated ${successCount}/${totalCount} infrastructure DI files for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to generate infrastructure DI files for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateDomainAbstractionsFiles(projectName) {
    try {
      this.logInfo(`Generating domain abstractions files for ${projectName}`);

      const results = {};

      // Generate EntityBase
      const entityBaseData = { projectName };
      const entityBasePath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Domain`,
        'Abstractions',
        'EntityBase.cs'
      );
      results.entityBase = await this.generateFile(
        'templates/entity-base.hbs',
        entityBaseData,
        entityBasePath
      );

      // Generate EntityAuditBase
      const entityAuditBaseData = { projectName };
      const entityAuditBasePath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Domain`,
        'Abstractions',
        'EntityAuditBase.cs'
      );
      results.entityAuditBase = await this.generateFile(
        'templates/entity-audit-base.hbs',
        entityAuditBaseData,
        entityAuditBasePath
      );

      // Generate EntityCommonBase
      const entityCommonBaseData = { projectName };
      const entityCommonBasePath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Domain`,
        'Abstractions',
        'EntityCommonBase.cs'
      );
      results.entityCommonBase = await this.generateFile(
        'templates/entity-common-base.hbs',
        entityCommonBaseData,
        entityCommonBasePath
      );

      // Generate EntityFullTextSearch
      const entityFullTextSearchData = { projectName };
      const entityFullTextSearchPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Domain`,
        'Abstractions',
        'EntityFullTextSearch.cs'
      );
      results.entityFullTextSearch = await this.generateFile(
        'templates/entity-full-text-search.hbs',
        entityFullTextSearchData,
        entityFullTextSearchPath
      );

      // Generate IUnitOfWork
      const iUnitOfWorkData = { projectName };
      const iUnitOfWorkPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Domain`,
        'Abstractions',
        'IUnitOfWork.cs'
      );
      results.iUnitOfWork = await this.generateFile(
        'templates/i-unit-of-work.hbs',
        iUnitOfWorkData,
        iUnitOfWorkPath
      );

      // Generate IUnitOfWorkContext
      const iUnitOfWorkContextData = { projectName };
      const iUnitOfWorkContextPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Domain`,
        'Abstractions',
        'IUnitOfWorkContext.cs'
      );
      results.iUnitOfWorkContext = await this.generateFile(
        'templates/i-unit-of-work-context.hbs',
        iUnitOfWorkContextData,
        iUnitOfWorkContextPath
      );

      // Generate Abstractions/Entities interfaces
      const abstractionsEntities = [
        { tpl: 'templates/abstractions-entities-iauditable.hbs', name: 'IAuditable.cs' },
        { tpl: 'templates/abstractions-entities-idatetracking.hbs', name: 'IDateTracking.cs' },
        { tpl: 'templates/abstractions-entities-ientitybase.hbs', name: 'IEntityBase.cs' },
        { tpl: 'templates/abstractions-entities-ientitycommonbase.hbs', name: 'IEntityCommonBase.cs' },
        { tpl: 'templates/abstractions-entities-ifulltextsearch.hbs', name: 'IFullTextSearch.cs' },
        { tpl: 'templates/abstractions-entities-iusertracking.hbs', name: 'IUserTracking.cs' }
      ];
      for (const item of abstractionsEntities) {
        const outPath = FileUtils.joinPath(
          this.outputPath,
          `${projectName}.Domain`,
          'Abstractions',
          'Entities',
          item.name
        );
        results[item.name] = await this.generateFile(item.tpl, { projectName }, outPath);
      }

      // Generate Abstractions/Repositories interfaces
      const abstractionsRepositories = [
        { tpl: 'templates/abstractions-repositories-irepositorybase.hbs', name: 'IRepositoryBase.cs' },
        { tpl: 'templates/abstractions-repositories-irepositorybase-dbcontext.hbs', name: 'IRepositoryBaseDbContext.cs' }
      ];
      for (const item of abstractionsRepositories) {
        const outPath = FileUtils.joinPath(
          this.outputPath,
          `${projectName}.Domain`,
          'Abstractions',
          'Repositories',
          item.name
        );
        results[item.name] = await this.generateFile(item.tpl, { projectName }, outPath);
      }

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully generated domain abstractions files for ${projectName}`);
      } else {
        this.logWarning(`Generated ${successCount}/${totalCount} domain abstractions files for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to generate domain abstractions files for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateSharedFiles(projectName) {
    try {
      this.logInfo(`Generating shared files for ${projectName}`);

      const results = {};

      // Generate ApiResponse
      const apiResponseData = { projectName };
      const apiResponsePath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Shared`,
        'Entities',
        'ApiResponse.cs'
      );
      results.apiResponse = await this.generateFile(
        'templates/api-response.hbs',
        apiResponseData,
        apiResponsePath
      );

      // Generate DataTableModel
      const dataTableModelData = { projectName };
      const dataTableModelPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Shared`,
        'Entities',
        'DataTableModel.cs'
      );
      results.dataTableModel = await this.generateFile(
        'templates/data-table-model.hbs',
        dataTableModelData,
        dataTableModelPath
      );

      // Generate StringHelper
      const stringHelperData = { projectName };
      const stringHelperPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Shared`,
        'Helpers',
        'StringHelper.cs'
      );
      results.stringHelper = await this.generateFile(
        'templates/string-helper.hbs',
        stringHelperData,
        stringHelperPath
      );

      // Generate StringExtensions
      const stringExtensionsData = { projectName };
      const stringExtensionsPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Shared`,
        'Extensions',
        'StringExtensions.cs'
      );
      results.stringExtensions = await this.generateFile(
        'templates/string-extensions.hbs',
        stringExtensionsData,
        stringExtensionsPath
      );

      // Generate ClaimNames
      const claimNamesData = { projectName };
      const claimNamesPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Shared`,
        'Constants',
        'ClaimNames.cs'
      );
      results.claimNames = await this.generateFile(
        'templates/claim-names.hbs',
        claimNamesData,
        claimNamesPath
      );

      // Generate Shared Services interfaces and implementations
      const sharedServicesInterfacesPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Shared`,
        'Services',
        'Interfaces.cs'
      );
      results.sharedServicesInterfaces = await this.generateFile(
        'templates/shared-services-interfaces.hbs',
        { projectName },
        sharedServicesInterfacesPath
      );

      const sharedServicesImplementationsPath = FileUtils.joinPath(
        this.outputPath,
        `${projectName}.Shared`,
        'Services',
        'Implementations.cs'
      );
      results.sharedServicesImplementations = await this.generateFile(
        'templates/shared-services-implementations.hbs',
        { projectName },
        sharedServicesImplementationsPath
      );

      // Additional Shared helpers/extensions/services
      const extraShared = [
        { tpl: 'templates/email-helper.hbs', out: ['Shared','Helpers','EmailHelper.cs'] },
        { tpl: 'templates/password-helper.hbs', out: ['Shared','Helpers','PasswordHelper.cs'] },
        { tpl: 'templates/serialize-service.hbs', out: ['Shared','Services','SerializeService.cs'] },
        { tpl: 'templates/httpclient-extensions.hbs', out: ['Shared','Extensions','HttpClientExtensions.cs'] },
        { tpl: 'templates/shared-constants-sqlparams.hbs', out: ['Shared','Constants','SQLParams.cs'] },
        { tpl: 'templates/shared-entities-select2.hbs', out: ['Shared','Entities','Select2Option.cs'] },
        { tpl: 'templates/shared-entities-select2-params.hbs', out: ['Shared','Entities','Select2Parameters.cs'] },
        { tpl: 'templates/shared-entities-apexchart.hbs', out: ['Shared','Entities','ApexChartData.cs'] },
        { tpl: 'templates/shared-entities-apexpie.hbs', out: ['Shared','Entities','ApexPieChartData.cs'] },
        { tpl: 'templates/shared-entities-apexcolumn.hbs', out: ['Shared','Entities','ApexColumnChartData.cs'] },
        { tpl: 'templates/shared-extensions-linq.hbs', out: ['Shared','Extensions','LinqExtensions.cs'] },
        { tpl: 'templates/shared-extensions-datetime.hbs', out: ['Shared','Extensions','DateTimeExtensions.cs'] }
      ];
      for (const item of extraShared) {
        const outPath = FileUtils.joinPath(
          this.outputPath,
          `${projectName}.${item.out[0]}`,
          item.out[1],
          item.out[2]
        );
        results[item.out[2]] = await this.generateFile(item.tpl, { projectName }, outPath);
      }

      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      if (successCount === totalCount) {
        this.logSuccess(`Successfully generated shared files for ${projectName}`);
      } else {
        this.logWarning(`Generated ${successCount}/${totalCount} shared files for ${projectName}`);
      }

      return results;
    } catch (error) {
      this.logError(`Failed to generate shared files for ${projectName}: ${error.message}`);
      return false;
    }
  }

  async generateCompleteStructure(projectName, entities = []) {
    const results = {
      layers: await this.generateLayerStructure(projectName),
      shared: await this.generateSharedStructure(projectName),
      infrastructure: await this.generateInfrastructureStructure(projectName),
      application: await this.generateApplicationStructure(projectName),
      domain: await this.generateDomainStructure(projectName),
      api: await this.generateAPIStructure(projectName),
      storage: await this.generateStorageStructure(projectName),
      webadmin: await this.generateWebAdminStructure(projectName),
      projects: await this.generateAllProjectFiles(projectName),
      configFiles: await this.generateConfigurationFiles(projectName),
      apiFiles: await this.generateAPIFiles(projectName),
      infrastructureFiles: await this.generateInfrastructureFiles(projectName, entities),
      applicationDI: await this.generateApplicationDependencyInjection(projectName),
      applicationConstants: await this.generateApplicationConstants(projectName),
      infrastructureDI: await this.generateInfrastructureDependencyInjection(projectName),
      storageFiles: await this.generateStorageFiles(projectName),
      domainSupportingFiles: await this.generateDomainSupportingFiles(projectName),
      webadminFiles: await this.generateWebAdminFiles(projectName, entities),
      domainAbstractionsFiles: await this.generateDomainAbstractionsFiles(projectName),
      sharedFiles: await this.generateSharedFiles(projectName)
    };

    return results;
  }
}

module.exports = ProjectGenerator;
