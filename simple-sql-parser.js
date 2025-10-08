#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * Simple SQL to JSON Parser
 * Manually parse the b05.sql file
 */

async function parseB05Sql() {
  try {
    console.log(chalk.blue('🔄 Parsing b05.sql file...'));

    // Read the SQL file
    const sqlContent = await fs.readFile('examples/b05.sql', 'utf8');
    
    // Define entities based on the SQL file structure
    const entities = [
      {
        name: 'AiAgent',
        properties: [
          { name: 'AgentId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'AgentName', type: 'string', isRequired: false, maxLength: 200 },
          { name: 'PromptTemplate', type: 'string', isRequired: false },
          { name: 'Model', type: 'string', isRequired: false, maxLength: 100 },
          { name: 'Parameters', type: 'string', isRequired: false },
          { name: 'CreatedAt', type: 'DateTime', isRequired: false }
        ],
        relationships: []
      },
      {
        name: 'AuditTrail',
        properties: [
          { name: 'AuditId', type: 'long', isRequired: true, isPrimaryKey: true },
          { name: 'EntityName', type: 'string', isRequired: false, maxLength: 100 },
          { name: 'EntityId', type: 'int', isRequired: false },
          { name: 'ActionType', type: 'string', isRequired: false, maxLength: 50 },
          { name: 'OldValue', type: 'string', isRequired: false },
          { name: 'NewValue', type: 'string', isRequired: false },
          { name: 'ModifiedBy', type: 'int', isRequired: false, isForeignKey: true, relatedEntity: 'User' },
          { name: 'ModifiedAt', type: 'DateTime', isRequired: false }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'User', isCollection: false }
        ]
      },
      {
        name: 'Backup',
        properties: [
          { name: 'BackupId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'BackupFile', type: 'string', isRequired: false, maxLength: 500 },
          { name: 'CreatedAt', type: 'DateTime', isRequired: false },
          { name: 'CreatedBy', type: 'int', isRequired: false, isForeignKey: true, relatedEntity: 'User' }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'User', isCollection: false }
        ]
      },
      {
        name: 'CollectSchedule',
        properties: [
          { name: 'ScheduleId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'SourceId', type: 'int', isRequired: false, isForeignKey: true, relatedEntity: 'DataSource' },
          { name: 'CronExpression', type: 'string', isRequired: false, maxLength: 100 },
          { name: 'LastRun', type: 'DateTime', isRequired: false },
          { name: 'NextRun', type: 'DateTime', isRequired: false }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'DataSource', isCollection: false }
        ]
      },
      {
        name: 'Dashboard',
        properties: [
          { name: 'DashboardId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'UserId', type: 'int', isRequired: false, isForeignKey: true, relatedEntity: 'User' },
          { name: 'Title', type: 'string', isRequired: false, maxLength: 200 },
          { name: 'LayoutConfig', type: 'string', isRequired: false },
          { name: 'IsTemplate', type: 'bool', isRequired: false },
          { name: 'CreatedAt', type: 'DateTime', isRequired: false }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'User', isCollection: false },
          { type: 'navigation', relatedEntity: 'DashboardWidget', isCollection: true }
        ]
      },
      {
        name: 'DashboardWidget',
        properties: [
          { name: 'WidgetId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'DashboardId', type: 'int', isRequired: false, isForeignKey: true, relatedEntity: 'Dashboard' },
          { name: 'WidgetType', type: 'string', isRequired: false, maxLength: 100 },
          { name: 'DataSource', type: 'string', isRequired: false, maxLength: 500 },
          { name: 'Position', type: 'string', isRequired: false, maxLength: 50 },
          { name: 'ConfigJson', type: 'string', isRequired: false }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'Dashboard', isCollection: false }
        ]
      },
      {
        name: 'DataSource',
        properties: [
          { name: 'SourceId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'SourceName', type: 'string', isRequired: false, maxLength: 200 },
          { name: 'Endpoint', type: 'string', isRequired: false, maxLength: 500 },
          { name: 'IsActive', type: 'bool', isRequired: false }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'CollectSchedule', isCollection: true }
        ]
      },
      {
        name: 'Favorite',
        properties: [
          { name: 'FavoriteId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'UserId', type: 'int', isRequired: false, isForeignKey: true, relatedEntity: 'User' },
          { name: 'ItemType', type: 'string', isRequired: false, maxLength: 50 },
          { name: 'ItemRefId', type: 'int', isRequired: false },
          { name: 'CreatedAt', type: 'DateTime', isRequired: false }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'User', isCollection: false }
        ]
      },
      {
        name: 'Field',
        properties: [
          { name: 'FieldId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'FieldName', type: 'string', isRequired: true, maxLength: 200 },
          { name: 'Description', type: 'string', isRequired: false },
          { name: 'CreatedBy', type: 'int', isRequired: false, isForeignKey: true, relatedEntity: 'User' },
          { name: 'CreatedAt', type: 'DateTime', isRequired: false },
          { name: 'IsShared', type: 'bool', isRequired: false }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'User', isCollection: false },
          { type: 'navigation', relatedEntity: 'SubField', isCollection: true },
          { type: 'navigation', relatedEntity: 'TechnologyAlert', isCollection: true },
          { type: 'navigation', relatedEntity: 'Trending', isCollection: true }
        ]
      },
      {
        name: 'Group',
        properties: [
          { name: 'GroupId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'GroupName', type: 'string', isRequired: true, maxLength: 150 },
          { name: 'Description', type: 'string', isRequired: false, maxLength: 255 },
          { name: 'CreatedBy', type: 'int', isRequired: false, isForeignKey: true, relatedEntity: 'User' },
          { name: 'CreatedAt', type: 'DateTime', isRequired: false }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'User', isCollection: false },
          { type: 'navigation', relatedEntity: 'UserGroup', isCollection: true }
        ]
      },
      {
        name: 'Project',
        properties: [
          { name: 'ProjectId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'UserId', type: 'int', isRequired: false, isForeignKey: true, relatedEntity: 'User' },
          { name: 'ProjectName', type: 'string', isRequired: false, maxLength: 200 },
          { name: 'Status', type: 'string', isRequired: false, maxLength: 50 },
          { name: 'ProgressPercent', type: 'float', isRequired: false },
          { name: 'StartedAt', type: 'DateTime', isRequired: false },
          { name: 'FinishedAt', type: 'DateTime', isRequired: false }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'User', isCollection: false }
        ]
      },
      {
        name: 'Report',
        properties: [
          { name: 'ReportId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'UserId', type: 'int', isRequired: false, isForeignKey: true, relatedEntity: 'User' },
          { name: 'Title', type: 'string', isRequired: false, maxLength: 200 },
          { name: 'Content', type: 'string', isRequired: false },
          { name: 'TemplateConfig', type: 'string', isRequired: false },
          { name: 'CreatedAt', type: 'DateTime', isRequired: false }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'User', isCollection: false }
        ]
      },
      {
        name: 'Role',
        properties: [
          { name: 'RoleId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'RoleName', type: 'string', isRequired: true, maxLength: 100 },
          { name: 'Description', type: 'string', isRequired: false, maxLength: 255 }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'UserRole', isCollection: true }
        ]
      },
      {
        name: 'SubField',
        properties: [
          { name: 'SubFieldId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'FieldId', type: 'int', isRequired: false, isForeignKey: true, relatedEntity: 'Field' },
          { name: 'SubFieldName', type: 'string', isRequired: false, maxLength: 200 },
          { name: 'Keywords', type: 'string', isRequired: false, maxLength: 1000 },
          { name: 'IsActive', type: 'bool', isRequired: false }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'Field', isCollection: false },
          { type: 'navigation', relatedEntity: 'Technology', isCollection: true }
        ]
      },
      {
        name: 'SystemLog',
        properties: [
          { name: 'LogId', type: 'long', isRequired: true, isPrimaryKey: true },
          { name: 'UserId', type: 'int', isRequired: false, isForeignKey: true, relatedEntity: 'User' },
          { name: 'Action', type: 'string', isRequired: false, maxLength: 200 },
          { name: 'Detail', type: 'string', isRequired: false },
          { name: 'CreatedAt', type: 'DateTime', isRequired: false }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'User', isCollection: false }
        ]
      },
      {
        name: 'Technology',
        properties: [
          { name: 'TechId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'SubFieldId', type: 'int', isRequired: false, isForeignKey: true, relatedEntity: 'SubField' },
          { name: 'TechName', type: 'string', isRequired: false, maxLength: 200 },
          { name: 'Description', type: 'string', isRequired: false },
          { name: 'CreatedAt', type: 'DateTime', isRequired: false }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'SubField', isCollection: false }
        ]
      },
      {
        name: 'TechnologyAlert',
        properties: [
          { name: 'AlertId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'FieldId', type: 'int', isRequired: false, isForeignKey: true, relatedEntity: 'Field' },
          { name: 'AlertType', type: 'string', isRequired: false, maxLength: 100 },
          { name: 'Description', type: 'string', isRequired: false },
          { name: 'IsResolved', type: 'bool', isRequired: false },
          { name: 'CreatedAt', type: 'DateTime', isRequired: false }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'Field', isCollection: false }
        ]
      },
      {
        name: 'Trending',
        properties: [
          { name: 'TrendingId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'FieldId', type: 'int', isRequired: false, isForeignKey: true, relatedEntity: 'Field' },
          { name: 'Country', type: 'string', isRequired: false, maxLength: 100 },
          { name: 'Period', type: 'string', isRequired: false, maxLength: 20 },
          { name: 'MetricType', type: 'string', isRequired: false, maxLength: 50 },
          { name: 'Value', type: 'float', isRequired: false },
          { name: 'CreatedAt', type: 'DateTime', isRequired: false }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'Field', isCollection: false }
        ]
      },
      {
        name: 'UserGroup',
        properties: [
          { name: 'UserGroupId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'UserId', type: 'int', isRequired: false, isForeignKey: true, relatedEntity: 'User' },
          { name: 'GroupId', type: 'int', isRequired: false, isForeignKey: true, relatedEntity: 'Group' },
          { name: 'IsAdmin', type: 'bool', isRequired: false }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'User', isCollection: false },
          { type: 'navigation', relatedEntity: 'Group', isCollection: false }
        ]
      },
      {
        name: 'UserRole',
        properties: [
          { name: 'UserRoleId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'UserId', type: 'int', isRequired: true, isForeignKey: true, relatedEntity: 'User' },
          { name: 'RoleId', type: 'int', isRequired: true, isForeignKey: true, relatedEntity: 'Role' }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'User', isCollection: false },
          { type: 'navigation', relatedEntity: 'Role', isCollection: false }
        ]
      },
      {
        name: 'User',
        properties: [
          { name: 'UserId', type: 'int', isRequired: true, isPrimaryKey: true },
          { name: 'Username', type: 'string', isRequired: true, maxLength: 100 },
          { name: 'PasswordHash', type: 'string', isRequired: true, maxLength: 255 },
          { name: 'FullName', type: 'string', isRequired: false, maxLength: 200 },
          { name: 'Email', type: 'string', isRequired: false, maxLength: 200 },
          { name: 'Phone', type: 'string', isRequired: false, maxLength: 20 },
          { name: 'AvatarUrl', type: 'string', isRequired: false, maxLength: 500 },
          { name: 'IsActive', type: 'bool', isRequired: false },
          { name: 'CreatedAt', type: 'DateTime', isRequired: false },
          { name: 'LastLogin', type: 'DateTime', isRequired: false }
        ],
        relationships: [
          { type: 'navigation', relatedEntity: 'AuditTrail', isCollection: true },
          { type: 'navigation', relatedEntity: 'Backup', isCollection: true },
          { type: 'navigation', relatedEntity: 'Dashboard', isCollection: true },
          { type: 'navigation', relatedEntity: 'Favorite', isCollection: true },
          { type: 'navigation', relatedEntity: 'Field', isCollection: true },
          { type: 'navigation', relatedEntity: 'Group', isCollection: true },
          { type: 'navigation', relatedEntity: 'Project', isCollection: true },
          { type: 'navigation', relatedEntity: 'Report', isCollection: true },
          { type: 'navigation', relatedEntity: 'SystemLog', isCollection: true },
          { type: 'navigation', relatedEntity: 'UserGroup', isCollection: true },
          { type: 'navigation', relatedEntity: 'UserRole', isCollection: true }
        ]
      }
    ];

    // Generate JSON config
    const config = {
      projectName: 'DionB05',
      entities: entities
    };

    // Write JSON file
    await fs.writeJson('b05-entities.json', config, { spaces: 2 });
    
    console.log(chalk.green('✅ JSON config generated successfully!'));
    console.log(chalk.blue(`📁 Output: ${path.resolve('b05-entities.json')}`));
    console.log(chalk.blue(`📊 Generated ${entities.length} entities`));
    
    // Show entities summary
    entities.forEach(entity => {
      console.log(chalk.cyan(`  - ${entity.name} (${entity.properties.length} properties)`));
    });

    return config;
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    throw error;
  }
}

// Run the parser
parseB05Sql();
