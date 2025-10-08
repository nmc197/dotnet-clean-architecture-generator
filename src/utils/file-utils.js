const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class FileUtils {
  static async ensureDirectoryExists(dirPath) {
    try {
      await fs.ensureDir(dirPath);
      return true;
    } catch (error) {
      console.error(chalk.red(`Error creating directory ${dirPath}:`), error.message);
      return false;
    }
  }

  static async writeFile(filePath, content) {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content, 'utf8');
      console.log(chalk.green(`✓ Generated: ${filePath}`));
      return true;
    } catch (error) {
      console.error(chalk.red(`Error writing file ${filePath}:`), error.message);
      return false;
    }
  }

  static async readFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      console.error(chalk.red(`Error reading file ${filePath}:`), error.message);
      return null;
    }
  }

  static async readJsonFile(filePath) {
    try {
      const content = await this.readFile(filePath);
      if (content) {
        return JSON.parse(content);
      }
      return null;
    } catch (error) {
      console.error(chalk.red(`Error parsing JSON file ${filePath}:`), error.message);
      return null;
    }
  }

  static async writeJsonFile(filePath, data) {
    try {
      const content = JSON.stringify(data, null, 2);
      return await this.writeFile(filePath, content);
    } catch (error) {
      console.error(chalk.red(`Error writing JSON file ${filePath}:`), error.message);
      return false;
    }
  }

  static async copyFile(sourcePath, destPath) {
    try {
      await fs.ensureDir(path.dirname(destPath));
      await fs.copy(sourcePath, destPath);
      console.log(chalk.green(`✓ Copied: ${sourcePath} -> ${destPath}`));
      return true;
    } catch (error) {
      console.error(chalk.red(`Error copying file ${sourcePath} to ${destPath}:`), error.message);
      return false;
    }
  }

  static async copyDirectory(sourceDir, destDir) {
    try {
      await fs.ensureDir(destDir);
      await fs.copy(sourceDir, destDir);
      console.log(chalk.green(`✓ Copied directory: ${sourceDir} -> ${destDir}`));
      return true;
    } catch (error) {
      console.error(chalk.red(`Error copying directory ${sourceDir} to ${destDir}:`), error.message);
      return false;
    }
  }

  static async removeFile(filePath) {
    try {
      await fs.remove(filePath);
      console.log(chalk.yellow(`✓ Removed: ${filePath}`));
      return true;
    } catch (error) {
      console.error(chalk.red(`Error removing file ${filePath}:`), error.message);
      return false;
    }
  }

  static async removeDirectory(dirPath) {
    try {
      await fs.remove(dirPath);
      console.log(chalk.yellow(`✓ Removed directory: ${dirPath}`));
      return true;
    } catch (error) {
      console.error(chalk.red(`Error removing directory ${dirPath}:`), error.message);
      return false;
    }
  }

  static async fileExists(filePath) {
    try {
      return await fs.pathExists(filePath);
    } catch (error) {
      return false;
    }
  }

  static async directoryExists(dirPath) {
    try {
      const stat = await fs.stat(dirPath);
      return stat.isDirectory();
    } catch (error) {
      return false;
    }
  }

  static async listFiles(dirPath, pattern = null) {
    try {
      const files = await fs.readdir(dirPath);
      if (pattern) {
        const regex = new RegExp(pattern);
        return files.filter(file => regex.test(file));
      }
      return files;
    } catch (error) {
      console.error(chalk.red(`Error listing files in ${dirPath}:`), error.message);
      return [];
    }
  }

  static async listDirectories(dirPath) {
    try {
      const items = await fs.readdir(dirPath);
      const directories = [];
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = await fs.stat(itemPath);
        if (stat.isDirectory()) {
          directories.push(item);
        }
      }
      
      return directories;
    } catch (error) {
      console.error(chalk.red(`Error listing directories in ${dirPath}:`), error.message);
      return [];
    }
  }

  static getRelativePath(from, to) {
    return path.relative(from, to);
  }

  static getAbsolutePath(relativePath) {
    return path.resolve(relativePath);
  }

  static joinPath(...paths) {
    return path.join(...paths);
  }

  static getDirectoryName(filePath) {
    return path.dirname(filePath);
  }

  static getFileName(filePath) {
    return path.basename(filePath);
  }

  static getFileNameWithoutExtension(filePath) {
    return path.basename(filePath, path.extname(filePath));
  }

  static getFileExtension(filePath) {
    return path.extname(filePath);
  }

  static normalizePath(filePath) {
    return path.normalize(filePath);
  }

  static async createEmptyFile(filePath) {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, '', 'utf8');
      return true;
    } catch (error) {
      console.error(chalk.red(`Error creating empty file ${filePath}:`), error.message);
      return false;
    }
  }

  static async appendToFile(filePath, content) {
    try {
      await fs.appendFile(filePath, content, 'utf8');
      return true;
    } catch (error) {
      console.error(chalk.red(`Error appending to file ${filePath}:`), error.message);
      return false;
    }
  }

  static async prependToFile(filePath, content) {
    try {
      const existingContent = await this.readFile(filePath);
      if (existingContent !== null) {
        const newContent = content + existingContent;
        return await this.writeFile(filePath, newContent);
      }
      return false;
    } catch (error) {
      console.error(chalk.red(`Error prepending to file ${filePath}:`), error.message);
      return false;
    }
  }

  static async replaceInFile(filePath, searchValue, replaceValue) {
    try {
      const content = await this.readFile(filePath);
      if (content !== null) {
        const newContent = content.replace(searchValue, replaceValue);
        return await this.writeFile(filePath, newContent);
      }
      return false;
    } catch (error) {
      console.error(chalk.red(`Error replacing in file ${filePath}:`), error.message);
      return false;
    }
  }

  static async replaceAllInFile(filePath, searchValue, replaceValue) {
    try {
      const content = await this.readFile(filePath);
      if (content !== null) {
        const newContent = content.replace(new RegExp(searchValue, 'g'), replaceValue);
        return await this.writeFile(filePath, newContent);
      }
      return false;
    } catch (error) {
      console.error(chalk.red(`Error replacing all in file ${filePath}:`), error.message);
      return false;
    }
  }

  static async getFileSize(filePath) {
    try {
      const stat = await fs.stat(filePath);
      return stat.size;
    } catch (error) {
      return 0;
    }
  }

  static async getFileStats(filePath) {
    try {
      return await fs.stat(filePath);
    } catch (error) {
      return null;
    }
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = FileUtils;
