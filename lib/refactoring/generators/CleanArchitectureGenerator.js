/**
 * CleanArchitectureGenerator.js
 * Orchestrates generation of Clean Architecture folder structure
 *
 * Creates complete Flutter project structure with:
 * - Domain layer (entities, repositories, use cases)
 * - Data layer (models, data sources, repository implementations)
 * - Presentation layer (pages, widgets, BLoC/Cubit)
 * - Dependency injection
 */

const { createModuleLogger } = require('../utils/logger');
const { createFileHandler } = require('../utils/fileHandler');
const { createWidgetGenerator } = require('./WidgetGenerator');
const { createCodeGenerator } = require('./CodeGenerator');
const { createBlocGenerator } = require('./BlocGenerator');
const { createRepositoryGenerator } = require('./RepositoryGenerator');
const { toFeatureDirName, toFileName, toSnakeCase } = require('./utils/namingConventions');

const logger = createModuleLogger('CleanArchitectureGenerator');

/**
 * CleanArchitectureGenerator class
 */
class CleanArchitectureGenerator {
  /**
   * @param {Object} options
   * @param {string} options.outputPath - Root output directory
   * @param {Object} [options.config] - Configuration object
   */
  constructor(options) {
    if (!options.outputPath) {
      throw new Error('CleanArchitectureGenerator: outputPath is required');
    }

    this.outputPath = options.outputPath;
    this.config = options.config;
    this.fileHandler = createFileHandler({
      baseDir: options.outputPath,
      overwrite: true,
      createMissing: true,
    });

    this.widgetGenerator = createWidgetGenerator({ config: this.config });
    this.codeGenerator = createCodeGenerator();
    this.blocGenerator = createBlocGenerator();
    this.repositoryGenerator = createRepositoryGenerator();
  }

  /**
   * Generate complete Clean Architecture structure from ComponentModel
   * @param {ComponentModel} component
   * @returns {Promise<Object>} - {generatedFiles: Array, structure: Object}
   */
  async generate(component) {
    logger.info(`Generating Clean Architecture for: ${component.name}`);

    const featureName = component.feature || component.name;
    const featureDir = toFeatureDirName(featureName);

    const generatedFiles = [];

    try {
      // Create folder structure
      await this._createFolderStructure(featureDir);

      // Generate domain layer
      const domainFiles = await this._generateDomainLayer(component, featureDir);
      generatedFiles.push(...domainFiles);

      // Generate data layer
      const dataFiles = await this._generateDataLayer(component, featureDir);
      generatedFiles.push(...dataFiles);

      // Generate presentation layer
      const presentationFiles = await this._generatePresentationLayer(component, featureDir);
      generatedFiles.push(...presentationFiles);

      logger.success(`Generated ${generatedFiles.length} files for ${featureName}`);

      return {
        generatedFiles,
        structure: this._getStructureInfo(featureDir, generatedFiles),
      };

    } catch (error) {
      logger.error(`Failed to generate Clean Architecture for ${component.name}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Create folder structure for feature
   * @param {string} featureDir
   * @returns {Promise<void>}
   * @private
   */
  async _createFolderStructure(featureDir) {
    logger.info(`Creating folder structure for: ${featureDir}`);

    const directories = [
      // Domain layer
      `lib/features/${featureDir}/domain/entities`,
      `lib/features/${featureDir}/domain/repositories`,
      `lib/features/${featureDir}/domain/usecases`,

      // Data layer
      `lib/features/${featureDir}/data/models`,
      `lib/features/${featureDir}/data/datasources`,
      `lib/features/${featureDir}/data/repositories`,

      // Presentation layer
      `lib/features/${featureDir}/presentation/bloc`,
      `lib/features/${featureDir}/presentation/cubit`,
      `lib/features/${featureDir}/presentation/pages`,
      `lib/features/${featureDir}/presentation/widgets`,

      // Tests
      `test/features/${featureDir}/domain/usecases`,
      `test/features/${featureDir}/data/repositories`,
      `test/features/${featureDir}/presentation/bloc`,
      `test/features/${featureDir}/presentation/cubit`,
      `test/features/${featureDir}/presentation/pages`,
    ];

    for (const dir of directories) {
      await this.fileHandler.ensureDir(dir);
    }

    logger.success(`Created folder structure for: ${featureDir}`);
  }

  /**
   * Generate domain layer files
   * @param {ComponentModel} component
   * @param {string} featureDir
   * @returns {Promise<Array>}
   * @private
   */
  async _generateDomainLayer(component, featureDir) {
    logger.info(`Generating domain layer for: ${featureDir}`);

    const files = [];

    // Generate entities
    const entities = this._extractEntities(component);
    for (const entity of entities) {
      const code = this._generateEntity(entity);
      const filePath = `lib/features/${featureDir}/domain/entities/${toSnakeCase(entity.name)}.dart`;

      await this.fileHandler.writeFile(filePath, code);

      files.push({
        path: filePath,
        type: 'entity',
        name: entity.name,
      });
    }

    // Generate repository interface (if has API endpoints)
    if (component.apiEndpoints.length > 0) {
      const repositoryFiles = this.repositoryGenerator.generate(component);

      for (const file of repositoryFiles.files) {
        if (file.directory === 'domain/repositories') {
          const filePath = `lib/features/${featureDir}/${file.directory}/${file.fileName}`;

          await this.fileHandler.writeFile(filePath, file.code);

          files.push({
            path: filePath,
            type: 'repository_interface',
            name: file.fileName,
          });
        }
      }
    }

    // Generate use cases
    const useCases = this._extractUseCases(component);
    for (const useCase of useCases) {
      const code = this._generateUseCase(useCase, component);
      const filePath = `lib/features/${featureDir}/domain/usecases/${toSnakeCase(useCase.name)}.dart`;

      await this.fileHandler.writeFile(filePath, code);

      files.push({
        path: filePath,
        type: 'usecase',
        name: useCase.name,
      });
    }

    logger.success(`Generated ${files.length} domain layer files`);

    return files;
  }

  /**
   * Generate data layer files
   * @param {ComponentModel} component
   * @param {string} featureDir
   * @returns {Promise<Array>}
   * @private
   */
  async _generateDataLayer(component, featureDir) {
    logger.info(`Generating data layer for: ${featureDir}`);

    const files = [];

    if (component.apiEndpoints.length === 0) {
      logger.info('No API endpoints, skipping data layer generation');
      return files;
    }

    const repositoryFiles = this.repositoryGenerator.generate(component);

    for (const file of repositoryFiles.files) {
      const filePath = `lib/features/${featureDir}/${file.directory}/${file.fileName}`;

      await this.fileHandler.writeFile(filePath, file.code);

      files.push({
        path: filePath,
        type: file.directory.split('/').pop(),
        name: file.fileName,
      });
    }

    logger.success(`Generated ${files.length} data layer files`);

    return files;
  }

  /**
   * Generate presentation layer files
   * @param {ComponentModel} component
   * @param {string} featureDir
   * @returns {Promise<Array>}
   * @private
   */
  async _generatePresentationLayer(component, featureDir) {
    logger.info(`Generating presentation layer for: ${featureDir}`);

    const files = [];

    // Generate BLoC or Cubit
    const stateManagementFiles = this.blocGenerator.generate(component);

    for (const file of stateManagementFiles.files) {
      const subDir = stateManagementFiles.type === 'bloc' ? 'bloc' : 'cubit';
      const filePath = `lib/features/${featureDir}/presentation/${subDir}/${file.fileName}`;

      await this.fileHandler.writeFile(filePath, file.code);

      files.push({
        path: filePath,
        type: stateManagementFiles.type,
        name: file.fileName,
      });
    }

    // Generate page/widget
    const widget = this.widgetGenerator.generate(component);
    const widgetCode = this.codeGenerator.generate(widget, component);
    const widgetFilePath = `lib/features/${featureDir}/presentation/pages/${toFileName(widget.name)}`;

    await this.fileHandler.writeFile(widgetFilePath, widgetCode);

    files.push({
      path: widgetFilePath,
      type: 'page',
      name: widget.name,
    });

    logger.success(`Generated ${files.length} presentation layer files`);

    return files;
  }

  /**
   * Extract entities from component
   * @param {ComponentModel} component
   * @returns {Array}
   * @private
   */
  _extractEntities(component) {
    // This would analyze the component's data structures
    // For now, create a basic entity based on the feature

    const featureName = component.feature || component.name;

    return [
      {
        name: featureName,
        properties: [
          { name: 'id', type: 'String', isRequired: true },
          { name: 'name', type: 'String', isRequired: true },
          // Would extract actual properties from component types
        ],
      },
    ];
  }

  /**
   * Generate entity class
   * @param {Object} entity
   * @returns {string}
   * @private
   */
  _generateEntity(entity) {
    const imports = [
      "import 'package:equatable/equatable.dart';",
    ];

    let code = imports.join('\n') + '\n\n';

    code += `/// ${entity.name} entity\n`;
    code += `/// Domain model representing ${entity.name}\n`;
    code += `class ${entity.name} extends Equatable {\n`;

    // Properties
    entity.properties.forEach(prop => {
      const nullable = prop.isRequired ? '' : '?';
      code += `  final ${prop.type}${nullable} ${prop.name};\n`;
    });

    code += '\n';

    // Constructor
    code += `  const ${entity.name}({\n`;
    entity.properties.forEach(prop => {
      const required = prop.isRequired ? 'required ' : '';
      code += `    ${required}this.${prop.name},\n`;
    });
    code += '  });\n\n';

    // Equatable props
    code += '  @override\n';
    code += '  List<Object?> get props => [\n';
    entity.properties.forEach(prop => {
      code += `    ${prop.name},\n`;
    });
    code += '  ];\n';

    code += '}\n';

    return code;
  }

  /**
   * Extract use cases from component
   * @param {ComponentModel} component
   * @returns {Array}
   * @private
   */
  _extractUseCases(component) {
    const useCases = [];

    // Generate use cases from API endpoints
    component.apiEndpoints.forEach(endpoint => {
      const action = endpoint.method.toLowerCase();
      const resource = endpoint.path.split('/').filter(Boolean).pop() || 'Data';

      const actionMap = {
        get: 'Get',
        post: 'Create',
        put: 'Update',
        delete: 'Delete',
      };

      useCases.push({
        name: `${actionMap[action] || 'Get'}${resource}UseCase`,
        action: actionMap[action] || 'Get',
        entity: resource,
        params: endpoint.parameters,
      });
    });

    return useCases;
  }

  /**
   * Generate use case class
   * @param {Object} useCase
   * @param {ComponentModel} component
   * @returns {string}
   * @private
   */
  _generateUseCase(useCase, component) {
    const featureName = component.feature || component.name;

    const imports = [
      "import 'package:dartz/dartz.dart';",
      "import '../../../core/errors/failures.dart';",
      `import '../repositories/${toSnakeCase(featureName)}_repository.dart';`,
    ];

    let code = imports.join('\n') + '\n\n';

    code += `/// Use case for ${useCase.action} ${useCase.entity}\n`;
    code += `class ${useCase.name} {\n`;
    code += `  final ${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Repository repository;\n\n`;
    code += `  ${useCase.name}(this.repository);\n\n`;

    // Call method
    code += `  Future<Either<Failure, dynamic>> call(`;

    if (useCase.params.length > 0) {
      code += `{\n`;
      useCase.params.forEach(param => {
        code += `    required String ${param},\n`;
      });
      code += '  }';
    }

    code += ') async {\n';
    code += '    // TODO: Call repository method\n';
    code += '    throw UnimplementedError();\n';
    code += '  }\n';

    code += '}\n';

    return code;
  }

  /**
   * Get structure information
   * @param {string} featureDir
   * @param {Array} files
   * @returns {Object}
   * @private
   */
  _getStructureInfo(featureDir, files) {
    const structure = {
      feature: featureDir,
      totalFiles: files.length,
      byType: {},
      byLayer: {
        domain: 0,
        data: 0,
        presentation: 0,
      },
    };

    files.forEach(file => {
      // Count by type
      structure.byType[file.type] = (structure.byType[file.type] || 0) + 1;

      // Count by layer
      if (file.path.includes('/domain/')) {
        structure.byLayer.domain++;
      } else if (file.path.includes('/data/')) {
        structure.byLayer.data++;
      } else if (file.path.includes('/presentation/')) {
        structure.byLayer.presentation++;
      }
    });

    return structure;
  }

  /**
   * Generate multiple features
   * @param {ComponentModel[]} components
   * @returns {Promise<Object>}
   */
  async generateMultiple(components) {
    logger.info(`Generating Clean Architecture for ${components.length} features`);

    const results = [];

    for (const component of components) {
      try {
        const result = await this.generate(component);
        results.push(result);
      } catch (error) {
        logger.error(`Failed to generate feature ${component.name}: ${error.message}`);
      }
    }

    logger.success(`Generated ${results.length}/${components.length} features`);

    return {
      features: results,
      totalFiles: results.reduce((sum, r) => sum + r.generatedFiles.length, 0),
    };
  }
}

/**
 * Create a Clean Architecture generator instance
 * @param {Object} options
 * @returns {CleanArchitectureGenerator}
 */
function createCleanArchitectureGenerator(options) {
  return new CleanArchitectureGenerator(options);
}

module.exports = {
  CleanArchitectureGenerator,
  createCleanArchitectureGenerator,
};
