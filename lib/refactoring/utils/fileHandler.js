/**
 * fileHandler.js
 * File operations utility for React to Flutter refactoring
 *
 * Provides safe file operations with error handling, validation,
 * and support for reading, writing, copying, and directory management.
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { createModuleLogger } = require('./logger');

const logger = createModuleLogger('FileHandler');

/**
 * File handler class with comprehensive file operations
 */
class FileHandler {
  /**
   * @param {Object} options
   * @param {string} [options.baseDir=process.cwd()] - Base directory
   * @param {string} [options.encoding='utf8'] - Default file encoding
   * @param {boolean} [options.createMissing=true] - Create missing directories
   * @param {boolean} [options.overwrite=false] - Overwrite existing files
   */
  constructor({
    baseDir = process.cwd(),
    encoding = 'utf8',
    createMissing = true,
    overwrite = false,
  } = {}) {
    this.baseDir = baseDir;
    this.encoding = encoding;
    this.createMissing = createMissing;
    this.overwrite = overwrite;
  }

  /**
   * Resolve path relative to base directory
   * @param {string} filePath
   * @returns {string}
   * @private
   */
  _resolvePath(filePath) {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.resolve(this.baseDir, filePath);
  }

  /**
   * Check if path exists
   * @param {string} filePath
   * @returns {Promise<boolean>}
   */
  async exists(filePath) {
    try {
      const resolvedPath = this._resolvePath(filePath);
      await fs.access(resolvedPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if path exists (synchronous)
   * @param {string} filePath
   * @returns {boolean}
   */
  existsSync(filePath) {
    try {
      const resolvedPath = this._resolvePath(filePath);
      fsSync.accessSync(resolvedPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if path is a file
   * @param {string} filePath
   * @returns {Promise<boolean>}
   */
  async isFile(filePath) {
    try {
      const resolvedPath = this._resolvePath(filePath);
      const stats = await fs.stat(resolvedPath);
      return stats.isFile();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if path is a directory
   * @param {string} filePath
   * @returns {Promise<boolean>}
   */
  async isDirectory(filePath) {
    try {
      const resolvedPath = this._resolvePath(filePath);
      const stats = await fs.stat(resolvedPath);
      return stats.isDirectory();
    } catch (error) {
      return false;
    }
  }

  /**
   * Ensure directory exists, create if missing
   * @param {string} dirPath
   * @returns {Promise<void>}
   */
  async ensureDir(dirPath) {
    const resolvedPath = this._resolvePath(dirPath);

    try {
      await fs.access(resolvedPath);
      logger.debug(`Directory already exists: ${resolvedPath}`);
    } catch (error) {
      if (this.createMissing) {
        logger.debug(`Creating directory: ${resolvedPath}`);
        await fs.mkdir(resolvedPath, { recursive: true });
        logger.success(`Created directory: ${resolvedPath}`);
      } else {
        throw new Error(`Directory does not exist: ${resolvedPath}`);
      }
    }
  }

  /**
   * Ensure directory exists (synchronous)
   * @param {string} dirPath
   */
  ensureDirSync(dirPath) {
    const resolvedPath = this._resolvePath(dirPath);

    try {
      fsSync.accessSync(resolvedPath);
      logger.debug(`Directory already exists: ${resolvedPath}`);
    } catch (error) {
      if (this.createMissing) {
        logger.debug(`Creating directory: ${resolvedPath}`);
        fsSync.mkdirSync(resolvedPath, { recursive: true });
        logger.success(`Created directory: ${resolvedPath}`);
      } else {
        throw new Error(`Directory does not exist: ${resolvedPath}`);
      }
    }
  }

  /**
   * Read file contents
   * @param {string} filePath
   * @param {string} [encoding] - Override default encoding
   * @returns {Promise<string>}
   */
  async readFile(filePath, encoding = null) {
    const resolvedPath = this._resolvePath(filePath);
    const enc = encoding || this.encoding;

    try {
      logger.debug(`Reading file: ${resolvedPath}`);
      const content = await fs.readFile(resolvedPath, enc);
      logger.debug(`Read ${content.length} characters from ${resolvedPath}`);
      return content;
    } catch (error) {
      logger.error(`Failed to read file: ${resolvedPath}`, { error: error.message });
      throw new Error(`Failed to read file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Read file contents (synchronous)
   * @param {string} filePath
   * @param {string} [encoding] - Override default encoding
   * @returns {string}
   */
  readFileSync(filePath, encoding = null) {
    const resolvedPath = this._resolvePath(filePath);
    const enc = encoding || this.encoding;

    try {
      logger.debug(`Reading file: ${resolvedPath}`);
      const content = fsSync.readFileSync(resolvedPath, enc);
      logger.debug(`Read ${content.length} characters from ${resolvedPath}`);
      return content;
    } catch (error) {
      logger.error(`Failed to read file: ${resolvedPath}`, { error: error.message });
      throw new Error(`Failed to read file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Write file contents
   * @param {string} filePath
   * @param {string} content
   * @param {string} [encoding] - Override default encoding
   * @returns {Promise<void>}
   */
  async writeFile(filePath, content, encoding = null) {
    const resolvedPath = this._resolvePath(filePath);
    const enc = encoding || this.encoding;

    // Check if file exists and overwrite is disabled
    if (!this.overwrite && await this.exists(filePath)) {
      throw new Error(`File already exists and overwrite is disabled: ${resolvedPath}`);
    }

    // Ensure parent directory exists
    const dirPath = path.dirname(resolvedPath);
    await this.ensureDir(dirPath);

    try {
      logger.debug(`Writing file: ${resolvedPath}`);
      await fs.writeFile(resolvedPath, content, enc);
      logger.success(`Wrote ${content.length} characters to ${resolvedPath}`);
    } catch (error) {
      logger.error(`Failed to write file: ${resolvedPath}`, { error: error.message });
      throw new Error(`Failed to write file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Write file contents (synchronous)
   * @param {string} filePath
   * @param {string} content
   * @param {string} [encoding] - Override default encoding
   */
  writeFileSync(filePath, content, encoding = null) {
    const resolvedPath = this._resolvePath(filePath);
    const enc = encoding || this.encoding;

    // Check if file exists and overwrite is disabled
    if (!this.overwrite && this.existsSync(filePath)) {
      throw new Error(`File already exists and overwrite is disabled: ${resolvedPath}`);
    }

    // Ensure parent directory exists
    const dirPath = path.dirname(resolvedPath);
    this.ensureDirSync(dirPath);

    try {
      logger.debug(`Writing file: ${resolvedPath}`);
      fsSync.writeFileSync(resolvedPath, content, enc);
      logger.success(`Wrote ${content.length} characters to ${resolvedPath}`);
    } catch (error) {
      logger.error(`Failed to write file: ${resolvedPath}`, { error: error.message });
      throw new Error(`Failed to write file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Append content to file
   * @param {string} filePath
   * @param {string} content
   * @param {string} [encoding] - Override default encoding
   * @returns {Promise<void>}
   */
  async appendFile(filePath, content, encoding = null) {
    const resolvedPath = this._resolvePath(filePath);
    const enc = encoding || this.encoding;

    // Ensure parent directory exists
    const dirPath = path.dirname(resolvedPath);
    await this.ensureDir(dirPath);

    try {
      logger.debug(`Appending to file: ${resolvedPath}`);
      await fs.appendFile(resolvedPath, content, enc);
      logger.success(`Appended ${content.length} characters to ${resolvedPath}`);
    } catch (error) {
      logger.error(`Failed to append to file: ${resolvedPath}`, { error: error.message });
      throw new Error(`Failed to append to file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Copy file
   * @param {string} sourcePath
   * @param {string} destPath
   * @returns {Promise<void>}
   */
  async copyFile(sourcePath, destPath) {
    const resolvedSource = this._resolvePath(sourcePath);
    const resolvedDest = this._resolvePath(destPath);

    // Check if destination exists and overwrite is disabled
    if (!this.overwrite && await this.exists(destPath)) {
      throw new Error(`Destination file already exists and overwrite is disabled: ${resolvedDest}`);
    }

    // Ensure destination directory exists
    const destDir = path.dirname(resolvedDest);
    await this.ensureDir(destDir);

    try {
      logger.debug(`Copying file: ${resolvedSource} -> ${resolvedDest}`);
      await fs.copyFile(resolvedSource, resolvedDest);
      logger.success(`Copied file: ${resolvedSource} -> ${resolvedDest}`);
    } catch (error) {
      logger.error(`Failed to copy file: ${resolvedSource}`, { error: error.message });
      throw new Error(`Failed to copy file ${sourcePath}: ${error.message}`);
    }
  }

  /**
   * Delete file
   * @param {string} filePath
   * @returns {Promise<void>}
   */
  async deleteFile(filePath) {
    const resolvedPath = this._resolvePath(filePath);

    try {
      logger.debug(`Deleting file: ${resolvedPath}`);
      await fs.unlink(resolvedPath);
      logger.success(`Deleted file: ${resolvedPath}`);
    } catch (error) {
      logger.error(`Failed to delete file: ${resolvedPath}`, { error: error.message });
      throw new Error(`Failed to delete file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Read directory contents
   * @param {string} dirPath
   * @param {boolean} [recursive=false] - Read subdirectories recursively
   * @returns {Promise<string[]>}
   */
  async readDir(dirPath, recursive = false) {
    const resolvedPath = this._resolvePath(dirPath);

    try {
      logger.debug(`Reading directory: ${resolvedPath}`);

      if (recursive) {
        return await this._readDirRecursive(resolvedPath);
      } else {
        const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
        return entries.map(entry => entry.name);
      }
    } catch (error) {
      logger.error(`Failed to read directory: ${resolvedPath}`, { error: error.message });
      throw new Error(`Failed to read directory ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Read directory recursively
   * @param {string} dirPath
   * @returns {Promise<string[]>}
   * @private
   */
  async _readDirRecursive(dirPath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(this.baseDir, fullPath);

      if (entry.isDirectory()) {
        const subFiles = await this._readDirRecursive(fullPath);
        files.push(...subFiles);
      } else {
        files.push(relativePath);
      }
    }

    return files;
  }

  /**
   * Get file stats
   * @param {string} filePath
   * @returns {Promise<Object>}
   */
  async getStats(filePath) {
    const resolvedPath = this._resolvePath(filePath);

    try {
      const stats = await fs.stat(resolvedPath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      logger.error(`Failed to get stats for: ${resolvedPath}`, { error: error.message });
      throw new Error(`Failed to get stats for ${filePath}: ${error.message}`);
    }
  }

  /**
   * Read JSON file
   * @param {string} filePath
   * @returns {Promise<Object>}
   */
  async readJSON(filePath) {
    const content = await this.readFile(filePath);
    try {
      return JSON.parse(content);
    } catch (error) {
      logger.error(`Failed to parse JSON from: ${filePath}`, { error: error.message });
      throw new Error(`Failed to parse JSON from ${filePath}: ${error.message}`);
    }
  }

  /**
   * Write JSON file
   * @param {string} filePath
   * @param {Object} data
   * @param {number} [indent=2] - JSON indentation
   * @returns {Promise<void>}
   */
  async writeJSON(filePath, data, indent = 2) {
    const content = JSON.stringify(data, null, indent);
    await this.writeFile(filePath, content);
  }

  /**
   * Find files matching pattern
   * @param {string} dirPath
   * @param {RegExp|string} pattern
   * @returns {Promise<string[]>}
   */
  async findFiles(dirPath, pattern) {
    const files = await this.readDir(dirPath, true);
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return files.filter(file => regex.test(file));
  }

  /**
   * Get file extension
   * @param {string} filePath
   * @returns {string}
   */
  getExtension(filePath) {
    return path.extname(filePath);
  }

  /**
   * Get file name without extension
   * @param {string} filePath
   * @returns {string}
   */
  getBaseName(filePath) {
    return path.basename(filePath, this.getExtension(filePath));
  }

  /**
   * Join path segments
   * @param {...string} segments
   * @returns {string}
   */
  join(...segments) {
    return path.join(...segments);
  }

  /**
   * Get relative path
   * @param {string} from
   * @param {string} to
   * @returns {string}
   */
  relative(from, to) {
    return path.relative(from, to);
  }
}

/**
 * Create a file handler instance
 * @param {Object} options
 * @returns {FileHandler}
 */
function createFileHandler(options) {
  return new FileHandler(options);
}

/**
 * Default file handler instance
 * @type {FileHandler}
 */
const defaultFileHandler = new FileHandler();

module.exports = {
  FileHandler,
  createFileHandler,
  default: defaultFileHandler,
};
