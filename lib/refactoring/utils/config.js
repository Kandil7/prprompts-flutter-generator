/**
 * config.js
 * Configuration management for React to Flutter conversion
 *
 * Provides default configurations, validation, and persistence
 */

const path = require('path');
const { createFileHandler } = require('./fileHandler');
const { createModuleLogger } = require('./logger');

const logger = createModuleLogger('Config');

/**
 * Default conversion configuration
 */
const DEFAULT_CONFIG = {
  // Project settings
  project: {
    name: 'Flutter App',
    version: '1.0.0',
    description: 'Converted from React',
  },

  // Paths
  paths: {
    react: {
      root: './react-app',
      src: './react-app/src',
      components: './react-app/src/components',
      pages: './react-app/src/pages',
    },
    flutter: {
      root: './flutter-app',
      lib: './flutter-app/lib',
      test: './flutter-app/test',
    },
  },

  // Conversion options
  conversion: {
    // State management
    stateManagement: {
      default: 'bloc',
      options: ['bloc', 'cubit', 'provider', 'riverpod', 'getx'],
      useComplexityHeuristic: true,
    },

    // Type mappings
    typeMappings: {
      string: 'String',
      number: 'num',
      boolean: 'bool',
      any: 'dynamic',
      void: 'void',
      null: 'Null',
      undefined: 'Null',
      Date: 'DateTime',
      Array: 'List',
      Map: 'Map',
      Set: 'Set',
      Promise: 'Future',
    },

    // Widget mappings
    widgetMappings: {
      View: 'Container',
      Text: 'Text',
      Image: 'Image',
      TouchableOpacity: 'InkWell',
      ScrollView: 'SingleChildScrollView',
      FlatList: 'ListView',
      TextInput: 'TextField',
      Button: 'ElevatedButton',
      Modal: 'Dialog',
      SafeAreaView: 'SafeArea',
    },

    // Naming conventions
    naming: {
      widgets: 'PascalCase',
      files: 'snake_case',
      variables: 'camelCase',
      constants: 'UPPER_SNAKE_CASE',
    },

    // Code generation
    generation: {
      nullSafety: true,
      freezed: true,
      jsonSerializable: true,
      equatable: true,
      generateTests: true,
      generateDocs: true,
      preserveComments: true,
    },

    // Architecture
    architecture: {
      pattern: 'clean',
      layers: ['domain', 'data', 'presentation'],
      featureFirst: true,
      useDependencyInjection: true,
      injectionFramework: 'get_it',
    },
  },

  // Parsing options
  parsing: {
    // File patterns to include
    include: [
      '**/*.jsx',
      '**/*.tsx',
      '**/*.js',
      '**/*.ts',
    ],

    // File patterns to exclude
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.test.js',
      '**/*.test.tsx',
      '**/*.spec.js',
      '**/*.spec.tsx',
    ],

    // Parser options
    parser: {
      ecmaVersion: 2022,
      sourceType: 'module',
      jsx: true,
      typescript: true,
    },
  },

  // Validation options
  validation: {
    strict: false,
    failOnError: false,
    warnOnMissing: true,
    checkNaming: true,
    checkTypes: true,
    checkStructure: true,
  },

  // Output options
  output: {
    format: 'dart',
    lineLength: 80,
    indent: 2,
    useTabs: false,
    trailingComma: true,
    singleQuotes: true,
    organizeImports: true,
    formatOnWrite: true,
  },

  // Logging options
  logging: {
    level: 'info', // debug, info, warn, error, silent
    colorize: true,
    timestamp: true,
    logFile: null,
  },

  // Performance options
  performance: {
    parallel: true,
    maxConcurrency: 4,
    cacheEnabled: true,
    cachePath: '.cache/refactoring',
  },
};

/**
 * Configuration manager class
 */
class Config {
  /**
   * @param {Object} [customConfig={}] - Custom configuration overrides
   */
  constructor(customConfig = {}) {
    this.config = this._mergeConfig(DEFAULT_CONFIG, customConfig);
    this._validate();
  }

  /**
   * Deep merge configurations
   * @param {Object} target
   * @param {Object} source
   * @returns {Object}
   * @private
   */
  _mergeConfig(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this._mergeConfig(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Validate configuration
   * @private
   */
  _validate() {
    // Validate state management
    const { stateManagement } = this.config.conversion;
    if (!stateManagement.options.includes(stateManagement.default)) {
      logger.warn(`Invalid default state management: ${stateManagement.default}`);
      stateManagement.default = 'bloc';
    }

    // Validate architecture pattern
    const { architecture } = this.config.conversion;
    const validPatterns = ['clean', 'mvc', 'mvvm', 'layered'];
    if (!validPatterns.includes(architecture.pattern)) {
      logger.warn(`Invalid architecture pattern: ${architecture.pattern}`);
      architecture.pattern = 'clean';
    }

    // Validate paths
    const { paths } = this.config;
    if (!paths.react.root || !paths.flutter.root) {
      throw new Error('React and Flutter root paths are required');
    }

    logger.debug('Configuration validated successfully');
  }

  /**
   * Get configuration value by path
   * @param {string} keyPath - Dot-separated path (e.g., 'conversion.stateManagement.default')
   * @returns {*}
   */
  get(keyPath) {
    const keys = keyPath.split('.');
    let value = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Set configuration value by path
   * @param {string} keyPath - Dot-separated path
   * @param {*} value
   */
  set(keyPath, value) {
    const keys = keyPath.split('.');
    let current = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    logger.debug(`Config updated: ${keyPath} = ${JSON.stringify(value)}`);
  }

  /**
   * Get entire configuration
   * @returns {Object}
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Update configuration with partial config
   * @param {Object} partialConfig
   */
  update(partialConfig) {
    this.config = this._mergeConfig(this.config, partialConfig);
    this._validate();
    logger.debug('Configuration updated');
  }

  /**
   * Reset to default configuration
   */
  reset() {
    this.config = { ...DEFAULT_CONFIG };
    logger.debug('Configuration reset to defaults');
  }

  /**
   * Load configuration from file
   * @param {string} filePath
   * @returns {Promise<void>}
   */
  async loadFromFile(filePath) {
    try {
      const fileHandler = createFileHandler();
      logger.info(`Loading configuration from: ${filePath}`);

      const content = await fileHandler.readFile(filePath);
      const extension = fileHandler.getExtension(filePath);

      let loadedConfig;
      if (extension === '.json') {
        loadedConfig = JSON.parse(content);
      } else if (extension === '.js') {
        // For .js files, require them
        const absolutePath = path.resolve(filePath);
        delete require.cache[absolutePath];
        loadedConfig = require(absolutePath);
      } else {
        throw new Error(`Unsupported config file format: ${extension}`);
      }

      this.update(loadedConfig);
      logger.success(`Configuration loaded from: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to load configuration from file: ${filePath}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Save configuration to file
   * @param {string} filePath
   * @returns {Promise<void>}
   */
  async saveToFile(filePath) {
    try {
      const fileHandler = createFileHandler({ overwrite: true });
      logger.info(`Saving configuration to: ${filePath}`);

      const content = JSON.stringify(this.config, null, 2);
      await fileHandler.writeFile(filePath, content);

      logger.success(`Configuration saved to: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to save configuration to file: ${filePath}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get React source paths
   * @returns {Object}
   */
  getReactPaths() {
    return this.config.paths.react;
  }

  /**
   * Get Flutter target paths
   * @returns {Object}
   */
  getFlutterPaths() {
    return this.config.paths.flutter;
  }

  /**
   * Get state management configuration
   * @returns {Object}
   */
  getStateManagement() {
    return this.config.conversion.stateManagement;
  }

  /**
   * Get type mappings
   * @returns {Object}
   */
  getTypeMappings() {
    return this.config.conversion.typeMappings;
  }

  /**
   * Get widget mappings
   * @returns {Object}
   */
  getWidgetMappings() {
    return this.config.conversion.widgetMappings;
  }

  /**
   * Get architecture configuration
   * @returns {Object}
   */
  getArchitecture() {
    return this.config.conversion.architecture;
  }

  /**
   * Check if feature is enabled
   * @param {string} feature - Feature name (e.g., 'generation.nullSafety')
   * @returns {boolean}
   */
  isEnabled(feature) {
    const value = this.get(feature);
    return value === true;
  }

  /**
   * Export configuration as JSON string
   * @param {boolean} [pretty=true] - Pretty print
   * @returns {string}
   */
  toJSON(pretty = true) {
    return JSON.stringify(this.config, null, pretty ? 2 : 0);
  }

  /**
   * Clone configuration
   * @returns {Config}
   */
  clone() {
    return new Config(this.config);
  }
}

/**
 * Create a configuration instance
 * @param {Object} [customConfig] - Custom configuration
 * @returns {Config}
 */
function createConfig(customConfig) {
  return new Config(customConfig);
}

/**
 * Load configuration from file
 * @param {string} filePath
 * @returns {Promise<Config>}
 */
async function loadConfig(filePath) {
  const config = new Config();
  await config.loadFromFile(filePath);
  return config;
}

/**
 * Create default configuration file
 * @param {string} outputPath
 * @returns {Promise<void>}
 */
async function createDefaultConfigFile(outputPath) {
  const config = new Config();
  await config.saveToFile(outputPath);
  logger.success(`Default configuration file created: ${outputPath}`);
}

module.exports = {
  Config,
  DEFAULT_CONFIG,
  createConfig,
  loadConfig,
  createDefaultConfigFile,
};
