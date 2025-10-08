#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * SQL to JSON Generator
 * Converts SQL CREATE TABLE statements to JSON config for .NET Clean Architecture Generator
 */

class SqlToJsonGenerator {
  constructor() {
    this.sqlTypeMapping = {
      // String types
      'varchar': 'string',
      'nvarchar': 'string', 
      'char': 'string',
      'nchar': 'string',
      'text': 'string',
      'ntext': 'string',
      
      // Numeric types
      'int': 'int',
      'bigint': 'long',
      'smallint': 'short',
      'tinyint': 'byte',
      'decimal': 'decimal',
      'numeric': 'decimal',
      'float': 'double',
      'real': 'float',
      'money': 'decimal',
      'smallmoney': 'decimal',
      
      // Date types
      'datetime': 'DateTime',
      'datetime2': 'DateTime',
      'date': 'DateTime',
      'time': 'TimeSpan',
      'smalldatetime': 'DateTime',
      
      // Boolean
      'bit': 'bool',
      
      // Binary
      'varbinary': 'byte[]',
      'binary': 'byte[]',
      'image': 'byte[]',
      
      // GUID
      'uniqueidentifier': 'Guid'
    };
  }

  /**
   * Parse SQL CREATE TABLE statement
   */
  parseCreateTable(sql) {
    // Handle both [dbo].[TableName] and [TableName] formats
    const tableMatch = sql.match(/CREATE\s+TABLE\s+\[?dbo\]?\.\[?(\w+)\]?|CREATE\s+TABLE\s+\[?(\w+)\]?/i);
    if (!tableMatch) {
      throw new Error('Invalid CREATE TABLE statement');
    }

    const tableName = tableMatch[1] || tableMatch[2];
    const columns = this.parseColumns(sql);
    const relationships = this.parseRelationships(sql, columns);

    return {
      name: this.toPascalCase(tableName),
      properties: columns,
      relationships: relationships
    };
  }

  /**
   * Parse column definitions
   */
  parseColumns(sql) {
    const columns = [];
    
    // Extract column definitions between parentheses
    const columnSection = sql.match(/\(([\s\S]*?)\)\s*ON\s+\[PRIMARY\]/);
    if (!columnSection) {
      // Fallback for simpler format
      const simpleMatch = sql.match(/\(([\s\S]*?)\)\s*ON\s+\[PRIMARY\]|\(([\s\S]*)\)/);
      if (!simpleMatch) return columns;
      var columnText = simpleMatch[1] || simpleMatch[2];
    } else {
      var columnText = columnSection[1];
    }

    // Split by lines and process each column
    const lines = columnText.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('PRIMARY KEY'));
    
    for (const line of lines) {
      if (line.includes('PRIMARY KEY') || line.includes('FOREIGN KEY') || line.includes('CONSTRAINT') || line.includes('WITH (') || line.includes(')WITH')) {
        continue; // Skip constraint definitions
      }

      const column = this.parseColumn(line);
      if (column) {
        columns.push(column);
      }
    }

    return columns;
  }

  /**
   * Parse individual column
   */
  parseColumn(line) {
    // Match column definition: [Name] Type [CONSTRAINTS]
    const match = line.match(/\[?(\w+)\]?\s+\[?(\w+)\]?(?:\([^)]*\))?\s*(.*)/i);
    if (!match) return null;

    const [, name, type, constraints] = match;
    
    const property = {
      name: this.toPascalCase(name),
      type: this.mapSqlType(type),
      isRequired: !constraints.toLowerCase().includes('null') && !constraints.toLowerCase().includes('null'),
      isPrimaryKey: constraints.toLowerCase().includes('primary key') || constraints.toLowerCase().includes('identity'),
      isForeignKey: false,
      maxLength: this.extractMaxLength(type)
    };

    // Handle special cases
    if (type.toLowerCase().includes('varchar') || type.toLowerCase().includes('nvarchar')) {
      const lengthMatch = type.match(/\((\d+)\)/);
      if (lengthMatch) {
        property.maxLength = parseInt(lengthMatch[1]);
      }
    }

    // Handle nvarchar(max) case
    if (type.toLowerCase().includes('max')) {
      property.maxLength = null; // No limit for max
    }

    return property;
  }

  /**
   * Parse relationships from foreign key constraints
   */
  parseRelationships(sql, columns) {
    const relationships = [];
    
    // Find foreign key constraints
    const fkMatches = sql.match(/FOREIGN\s+KEY\s*\([^)]+\)\s*REFERENCES\s+(\w+)\s*\([^)]+\)/gi);
    if (!fkMatches) return relationships;

    for (const fkMatch of fkMatches) {
      const refMatch = fkMatch.match(/REFERENCES\s+(\w+)/i);
      if (refMatch) {
        const relatedEntity = this.toPascalCase(refMatch[1]);
        
        // Check if it's a one-to-many or many-to-one relationship
        const isCollection = this.determineRelationshipType(sql, relatedEntity);
        
        relationships.push({
          type: 'navigation',
          relatedEntity: relatedEntity,
          isCollection: isCollection
        });
      }
    }

    return relationships;
  }

  /**
   * Determine relationship type (one-to-many vs many-to-one)
   */
  determineRelationshipType(sql, relatedEntity) {
    // Simple heuristic: if the foreign key is in the current table, it's many-to-one
    // This is a simplified approach - in real scenarios, you'd need more complex logic
    return false; // Default to many-to-one for now
  }

  /**
   * Map SQL data type to C# type
   */
  mapSqlType(sqlType) {
    const baseType = sqlType.toLowerCase().replace(/\([^)]*\)/, '');
    return this.sqlTypeMapping[baseType] || 'string';
  }

  /**
   * Extract max length from SQL type
   */
  extractMaxLength(sqlType) {
    const match = sqlType.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Convert snake_case or PascalCase to PascalCase
   */
  toPascalCase(str) {
    return str
      .split(/[_\s-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Parse multiple CREATE TABLE statements
   */
  parseMultipleTables(sqlScript) {
    const tables = [];
    
    // Clean up the SQL script - remove GO statements and other SQL Server specific syntax
    let cleanScript = sqlScript
      .replace(/GO\s*/gi, '\n')
      .replace(/SET\s+ANSI_NULLS\s+ON\s*/gi, '')
      .replace(/SET\s+QUOTED_IDENTIFIER\s+ON\s*/gi, '')
      .replace(/USE\s+\[.*?\]\s*/gi, '')
      .replace(/\/\*.*?\*\//gs, '') // Remove comments
      .replace(/ALTER\s+TABLE.*?GO/gs, '') // Remove ALTER TABLE statements
      .replace(/ALTER\s+TABLE.*?$/gs, ''); // Remove remaining ALTER TABLE statements
    
    console.log(chalk.blue('Debug: Cleaned script preview:'));
    console.log(cleanScript.substring(0, 500) + '...');
    
    // Split by CREATE TABLE statements
    const tableStatements = cleanScript.split(/CREATE\s+TABLE/gi);
    console.log(chalk.blue(`Debug: Found ${tableStatements.length - 1} CREATE TABLE statements`));
    
    for (let i = 1; i < tableStatements.length; i++) {
      const statement = 'CREATE TABLE' + tableStatements[i];
      console.log(chalk.blue(`Debug: Parsing table ${i}:`));
      console.log(statement.substring(0, 200) + '...');
      
      try {
        const table = this.parseCreateTable(statement);
        if (table && table.name) {
          tables.push(table);
          console.log(chalk.green(`✅ Successfully parsed table: ${table.name}`));
        }
      } catch (error) {
        console.warn(chalk.yellow(`Warning: Could not parse table ${i}: ${error.message}`));
      }
    }

    return tables;
  }

  /**
   * Generate JSON config from SQL script
   */
  async generateFromSql(sqlFilePath, outputPath, projectName = 'MyProject') {
    try {
      console.log(chalk.blue('🔄 Parsing SQL script...'));
      
      // Read SQL file
      const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
      
      // Parse tables
      const entities = this.parseMultipleTables(sqlContent);
      
      if (entities.length === 0) {
        throw new Error('No valid CREATE TABLE statements found');
      }

      // Generate JSON config
      const config = {
        projectName: projectName,
        entities: entities
      };

      // Write JSON file
      await fs.writeJson(outputPath, config, { spaces: 2 });
      
      console.log(chalk.green('✅ JSON config generated successfully!'));
      console.log(chalk.blue(`📁 Output: ${path.resolve(outputPath)}`));
      console.log(chalk.blue(`📊 Found ${entities.length} entities`));
      
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
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(chalk.yellow('Usage: node sql-to-json-generator.js <sql-file> <output-json> [project-name]'));
    console.log(chalk.yellow('Example: node sql-to-json-generator.js schema.sql entities.json MyProject'));
    process.exit(1);
  }

  const [sqlFile, outputFile, projectName] = args;
  
  try {
    const generator = new SqlToJsonGenerator();
    await generator.generateFromSql(sqlFile, outputFile, projectName || 'MyProject');
  } catch (error) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = SqlToJsonGenerator;
