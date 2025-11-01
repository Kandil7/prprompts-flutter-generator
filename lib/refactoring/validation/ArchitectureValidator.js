/**
 * ArchitectureValidator - Validates Clean Architecture compliance
 *
 * Checks:
 * - Folder structure (domain/data/presentation)
 * - Layer dependencies (domain should not import data/presentation)
 * - Repository pattern (abstract in domain, implementation in data)
 * - Use case pattern (single responsibility)
 * - BLoC/Cubit structure (events, states, bloc)
 */

const { ValidationResult } = require('../models/ValidationResult');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

class ArchitectureValidator {
  constructor(config = {}) {
    this.config = {
      enforceCleanArchitecture: true,
      requireUseCases: true,
      requireRepositoryInterfaces: true,
      ...config
    };
  }

  /**
   * Validate project architecture
   * @param {string} projectPath - Root path of the Flutter project
   * @returns {ValidationResult}
   */
  validate(projectPath) {
    const errors = [];
    const warnings = [];
    const info = [];

    try {
      const featuresPath = path.join(projectPath, 'lib', 'features');

      if (!fs.existsSync(featuresPath)) {
        errors.push({
          message: 'Missing features directory',
          path: featuresPath,
          severity: 'error',
          suggestion: 'Create lib/features directory for feature modules'
        });
        return this._createResult(projectPath, false, 0, errors, warnings, info);
      }

      // 1. Validate folder structure
      this._validateFolderStructure(featuresPath, errors, warnings, info);

      // 2. Validate layer dependencies
      this._validateLayerDependencies(featuresPath, errors, warnings);

      // 3. Validate repository pattern
      this._validateRepositoryPattern(featuresPath, errors, warnings, info);

      // 4. Validate use case pattern
      this._validateUseCasePattern(featuresPath, errors, warnings, info);

      // 5. Validate BLoC/Cubit structure
      this._validateBlocStructure(featuresPath, errors, warnings, info);

      // 6. Validate entity/model separation
      this._validateEntityModelSeparation(featuresPath, warnings, info);

      const score = this._calculateScore(errors, warnings);

      return this._createResult(projectPath, errors.length === 0, score, errors, warnings, info);

    } catch (error) {
      logger.error(`ArchitectureValidator failed for ${projectPath}:`, error);
      return this._createResult(projectPath, false, 0,
        [{ message: `Validation failed: ${error.message}`, severity: 'error' }],
        [], []
      );
    }
  }

  /**
   * Validate folder structure adheres to Clean Architecture
   */
  _validateFolderStructure(featuresPath, errors, warnings, info) {
    const features = fs.readdirSync(featuresPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    if (features.length === 0) {
      warnings.push({
        message: 'No feature modules found',
        path: featuresPath,
        severity: 'warning',
        suggestion: 'Create feature modules in lib/features directory'
      });
      return;
    }

    for (const feature of features) {
      const featurePath = path.join(featuresPath, feature);

      // Check for domain layer
      const domainPath = path.join(featurePath, 'domain');
      if (!fs.existsSync(domainPath)) {
        errors.push({
          message: `Missing domain layer for feature: ${feature}`,
          path: featurePath,
          severity: 'error',
          suggestion: `Create ${feature}/domain directory with entities, repositories, usecases`
        });
      } else {
        // Check domain structure
        this._validateDomainStructure(domainPath, feature, errors, warnings);
      }

      // Check for data layer
      const dataPath = path.join(featurePath, 'data');
      if (!fs.existsSync(dataPath)) {
        errors.push({
          message: `Missing data layer for feature: ${feature}`,
          path: featurePath,
          severity: 'error',
          suggestion: `Create ${feature}/data directory with models, datasources, repositories`
        });
      } else {
        // Check data structure
        this._validateDataStructure(dataPath, feature, errors, warnings);
      }

      // Check for presentation layer
      const presentationPath = path.join(featurePath, 'presentation');
      if (!fs.existsSync(presentationPath)) {
        errors.push({
          message: `Missing presentation layer for feature: ${feature}`,
          path: featurePath,
          severity: 'error',
          suggestion: `Create ${feature}/presentation directory with bloc/cubit, pages, widgets`
        });
      } else {
        // Check presentation structure
        this._validatePresentationStructure(presentationPath, feature, warnings, info);
      }

      info.push({
        message: `Feature validated: ${feature}`,
        path: featurePath,
        severity: 'info'
      });
    }
  }

  /**
   * Validate domain layer structure
   */
  _validateDomainStructure(domainPath, feature, errors, warnings) {
    const requiredDirs = ['entities', 'repositories', 'usecases'];

    for (const dir of requiredDirs) {
      const dirPath = path.join(domainPath, dir);
      if (!fs.existsSync(dirPath)) {
        if (dir === 'usecases' && !this.config.requireUseCases) {
          warnings.push({
            message: `Missing ${dir} directory in ${feature}/domain`,
            path: domainPath,
            severity: 'warning',
            suggestion: `Create ${feature}/domain/${dir} directory`
          });
        } else {
          errors.push({
            message: `Missing required ${dir} directory in ${feature}/domain`,
            path: domainPath,
            severity: 'error',
            suggestion: `Create ${feature}/domain/${dir} directory`
          });
        }
      } else {
        // Check if directory has files
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.dart'));
        if (files.length === 0) {
          warnings.push({
            message: `Empty ${dir} directory in ${feature}/domain`,
            path: dirPath,
            severity: 'warning',
            suggestion: `Add Dart files to ${feature}/domain/${dir}`
          });
        }
      }
    }
  }

  /**
   * Validate data layer structure
   */
  _validateDataStructure(dataPath, feature, errors, warnings) {
    const requiredDirs = ['models', 'datasources', 'repositories'];

    for (const dir of requiredDirs) {
      const dirPath = path.join(dataPath, dir);
      if (!fs.existsSync(dirPath)) {
        errors.push({
          message: `Missing required ${dir} directory in ${feature}/data`,
          path: dataPath,
          severity: 'error',
          suggestion: `Create ${feature}/data/${dir} directory`
        });
      } else {
        // Check if directory has files
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.dart'));
        if (files.length === 0) {
          warnings.push({
            message: `Empty ${dir} directory in ${feature}/data`,
            path: dirPath,
            severity: 'warning',
            suggestion: `Add Dart files to ${feature}/data/${dir}`
          });
        }
      }
    }
  }

  /**
   * Validate presentation layer structure
   */
  _validatePresentationStructure(presentationPath, feature, warnings, info) {
    const hasBlocDir = fs.existsSync(path.join(presentationPath, 'bloc'));
    const hasCubitDir = fs.existsSync(path.join(presentationPath, 'cubit'));

    if (!hasBlocDir && !hasCubitDir) {
      warnings.push({
        message: `Missing state management (bloc/cubit) in ${feature}/presentation`,
        path: presentationPath,
        severity: 'warning',
        suggestion: `Create ${feature}/presentation/bloc or ${feature}/presentation/cubit directory`
      });
    }

    if (hasBlocDir && hasCubitDir) {
      info.push({
        message: `Both bloc and cubit directories found in ${feature}/presentation`,
        path: presentationPath,
        severity: 'info',
        suggestion: 'Consider standardizing on either BLoC or Cubit for consistency'
      });
    }

    // Check for pages directory
    const pagesPath = path.join(presentationPath, 'pages');
    if (!fs.existsSync(pagesPath)) {
      warnings.push({
        message: `Missing pages directory in ${feature}/presentation`,
        path: presentationPath,
        severity: 'warning',
        suggestion: `Create ${feature}/presentation/pages directory`
      });
    }

    // Check for widgets directory
    const widgetsPath = path.join(presentationPath, 'widgets');
    if (!fs.existsSync(widgetsPath)) {
      info.push({
        message: `No widgets directory in ${feature}/presentation`,
        path: presentationPath,
        severity: 'info',
        suggestion: `Create ${feature}/presentation/widgets if you have reusable widgets`
      });
    }
  }

  /**
   * Validate layer dependencies (domain should not import data/presentation)
   */
  _validateLayerDependencies(featuresPath, errors, warnings) {
    const features = fs.readdirSync(featuresPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const feature of features) {
      const domainPath = path.join(featuresPath, feature, 'domain');

      if (!fs.existsSync(domainPath)) continue;

      // Check all Dart files in domain
      this._checkDomainImports(domainPath, feature, errors, warnings);
    }
  }

  /**
   * Recursively check imports in domain layer
   */
  _checkDomainImports(dirPath, feature, errors, warnings) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        this._checkDomainImports(fullPath, feature, errors, warnings);
      } else if (entry.name.endsWith('.dart')) {
        const content = fs.readFileSync(fullPath, 'utf-8');

        // Check for data layer imports
        const dataImports = content.match(/import\s+['"][^'"]*\/data\//g);
        if (dataImports) {
          errors.push({
            message: `Domain layer importing data layer in ${entry.name}`,
            path: fullPath,
            severity: 'error',
            suggestion: 'Domain layer should not depend on data layer. Use abstractions.'
          });
        }

        // Check for presentation layer imports
        const presentationImports = content.match(/import\s+['"][^'"]*\/presentation\//g);
        if (presentationImports) {
          errors.push({
            message: `Domain layer importing presentation layer in ${entry.name}`,
            path: fullPath,
            severity: 'error',
            suggestion: 'Domain layer should not depend on presentation layer'
          });
        }

        // Check for Flutter imports (domain should be framework-independent)
        const flutterImports = content.match(/import\s+['"]package:flutter\//g);
        if (flutterImports) {
          warnings.push({
            message: `Domain layer importing Flutter in ${entry.name}`,
            path: fullPath,
            severity: 'warning',
            suggestion: 'Domain layer should be framework-independent. Avoid Flutter imports.'
          });
        }
      }
    }
  }

  /**
   * Validate repository pattern
   */
  _validateRepositoryPattern(featuresPath, errors, warnings, info) {
    const features = fs.readdirSync(featuresPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const feature of features) {
      const domainReposPath = path.join(featuresPath, feature, 'domain', 'repositories');
      const dataReposPath = path.join(featuresPath, feature, 'data', 'repositories');

      if (!fs.existsSync(domainReposPath)) continue;

      const domainRepos = fs.readdirSync(domainReposPath)
        .filter(f => f.endsWith('.dart'))
        .map(f => f.replace('.dart', ''));

      for (const repoName of domainRepos) {
        const domainRepoPath = path.join(domainReposPath, `${repoName}.dart`);
        const content = fs.readFileSync(domainRepoPath, 'utf-8');

        // Check if it's an abstract class
        if (!content.includes('abstract class') && !content.includes('abstract interface class')) {
          errors.push({
            message: `Repository in domain should be abstract: ${repoName}`,
            path: domainRepoPath,
            severity: 'error',
            suggestion: 'Domain repositories should be abstract interfaces'
          });
        }

        // Check for implementation in data layer
        const implName = `${repoName}_impl`;
        const dataRepoPath = path.join(dataReposPath, `${implName}.dart`);

        if (!fs.existsSync(dataRepoPath)) {
          warnings.push({
            message: `Missing implementation for repository: ${repoName}`,
            path: dataReposPath,
            severity: 'warning',
            suggestion: `Create ${implName}.dart in data/repositories`
          });
        } else {
          // Check if implementation implements the interface
          const implContent = fs.readFileSync(dataRepoPath, 'utf-8');
          const className = repoName.split('_').map(w =>
            w.charAt(0).toUpperCase() + w.slice(1)
          ).join('');

          if (!implContent.includes(`implements ${className}`)) {
            errors.push({
              message: `Repository implementation doesn't implement interface: ${implName}`,
              path: dataRepoPath,
              severity: 'error',
              suggestion: `Add 'implements ${className}' to class declaration`
            });
          }

          info.push({
            message: `Repository pattern validated: ${repoName}`,
            path: domainRepoPath,
            severity: 'info'
          });
        }
      }
    }
  }

  /**
   * Validate use case pattern (single responsibility)
   */
  _validateUseCasePattern(featuresPath, errors, warnings, info) {
    const features = fs.readdirSync(featuresPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const feature of features) {
      const usecasesPath = path.join(featuresPath, feature, 'domain', 'usecases');

      if (!fs.existsSync(usecasesPath)) continue;

      const usecaseFiles = fs.readdirSync(usecasesPath).filter(f => f.endsWith('.dart'));

      for (const file of usecaseFiles) {
        const filePath = path.join(usecasesPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Check for UseCase interface implementation
        if (!content.includes('implements UseCase') && !content.includes('extends UseCase')) {
          warnings.push({
            message: `Use case should implement UseCase interface: ${file}`,
            path: filePath,
            severity: 'warning',
            suggestion: 'Implement UseCase<Type, Params> interface'
          });
        }

        // Check for call() method
        if (!content.includes('Future<Either<Failure,')) {
          warnings.push({
            message: `Use case should return Future<Either<Failure, T>>: ${file}`,
            path: filePath,
            severity: 'warning',
            suggestion: 'Use Either from dartz package for error handling'
          });
        }

        // Check for dependency injection
        if (!content.includes('@injectable') && !content.includes('@Injectable')) {
          info.push({
            message: `Use case missing DI annotation: ${file}`,
            path: filePath,
            severity: 'info',
            suggestion: 'Add @injectable annotation for dependency injection'
          });
        }

        // Check for single responsibility (max 1 repository dependency)
        const repoMatches = content.match(/final\s+\w+Repository/g) || [];
        if (repoMatches.length > 1) {
          warnings.push({
            message: `Use case has multiple repository dependencies: ${file}`,
            path: filePath,
            severity: 'warning',
            suggestion: 'Use cases should typically depend on a single repository'
          });
        }

        info.push({
          message: `Use case validated: ${file}`,
          path: filePath,
          severity: 'info'
        });
      }
    }
  }

  /**
   * Validate BLoC/Cubit structure
   */
  _validateBlocStructure(featuresPath, errors, warnings, info) {
    const features = fs.readdirSync(featuresPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const feature of features) {
      const presentationPath = path.join(featuresPath, feature, 'presentation');

      // Check BLoC pattern
      const blocPath = path.join(presentationPath, 'bloc');
      if (fs.existsSync(blocPath)) {
        this._validateBlocFiles(blocPath, feature, errors, warnings, info);
      }

      // Check Cubit pattern
      const cubitPath = path.join(presentationPath, 'cubit');
      if (fs.existsSync(cubitPath)) {
        this._validateCubitFiles(cubitPath, feature, warnings, info);
      }
    }
  }

  /**
   * Validate BLoC files (events, states, bloc)
   */
  _validateBlocFiles(blocPath, feature, errors, warnings, info) {
    const blocFiles = fs.readdirSync(blocPath).filter(f => f.endsWith('.dart'));

    const hasEvent = blocFiles.some(f => f.includes('_event.dart'));
    const hasState = blocFiles.some(f => f.includes('_state.dart'));
    const hasBloc = blocFiles.some(f => f.includes('_bloc.dart') && !f.includes('_event') && !f.includes('_state'));

    if (!hasEvent) {
      warnings.push({
        message: `Missing event file in ${feature}/presentation/bloc`,
        path: blocPath,
        severity: 'warning',
        suggestion: 'Create *_event.dart file for BLoC events'
      });
    }

    if (!hasState) {
      warnings.push({
        message: `Missing state file in ${feature}/presentation/bloc`,
        path: blocPath,
        severity: 'warning',
        suggestion: 'Create *_state.dart file for BLoC states'
      });
    }

    if (!hasBloc) {
      warnings.push({
        message: `Missing bloc file in ${feature}/presentation/bloc`,
        path: blocPath,
        severity: 'warning',
        suggestion: 'Create *_bloc.dart file for BLoC implementation'
      });
    }

    if (hasEvent && hasState && hasBloc) {
      // Check if states use freezed
      const stateFile = blocFiles.find(f => f.includes('_state.dart'));
      if (stateFile) {
        const content = fs.readFileSync(path.join(blocPath, stateFile), 'utf-8');
        if (!content.includes('@freezed')) {
          info.push({
            message: `Consider using freezed for immutable states: ${stateFile}`,
            path: path.join(blocPath, stateFile),
            severity: 'info',
            suggestion: 'Use @freezed annotation for immutable state classes'
          });
        }
      }

      info.push({
        message: `BLoC structure validated: ${feature}`,
        path: blocPath,
        severity: 'info'
      });
    }
  }

  /**
   * Validate Cubit files
   */
  _validateCubitFiles(cubitPath, feature, warnings, info) {
    const cubitFiles = fs.readdirSync(cubitPath).filter(f => f.endsWith('.dart'));

    const hasState = cubitFiles.some(f => f.includes('_state.dart'));
    const hasCubit = cubitFiles.some(f => f.includes('_cubit.dart') && !f.includes('_state'));

    if (!hasState) {
      warnings.push({
        message: `Missing state file in ${feature}/presentation/cubit`,
        path: cubitPath,
        severity: 'warning',
        suggestion: 'Create *_state.dart file for Cubit states'
      });
    }

    if (!hasCubit) {
      warnings.push({
        message: `Missing cubit file in ${feature}/presentation/cubit`,
        path: cubitPath,
        severity: 'warning',
        suggestion: 'Create *_cubit.dart file for Cubit implementation'
      });
    }

    if (hasState && hasCubit) {
      info.push({
        message: `Cubit structure validated: ${feature}`,
        path: cubitPath,
        severity: 'info'
      });
    }
  }

  /**
   * Validate entity/model separation
   */
  _validateEntityModelSeparation(featuresPath, warnings, info) {
    const features = fs.readdirSync(featuresPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const feature of features) {
      const entitiesPath = path.join(featuresPath, feature, 'domain', 'entities');
      const modelsPath = path.join(featuresPath, feature, 'data', 'models');

      if (!fs.existsSync(entitiesPath) || !fs.existsSync(modelsPath)) continue;

      const entities = fs.readdirSync(entitiesPath)
        .filter(f => f.endsWith('.dart'))
        .map(f => f.replace('.dart', ''));

      for (const entityName of entities) {
        const modelName = `${entityName}_model`;
        const modelPath = path.join(modelsPath, `${modelName}.dart`);

        if (!fs.existsSync(modelPath)) {
          info.push({
            message: `No corresponding model for entity: ${entityName}`,
            path: modelsPath,
            severity: 'info',
            suggestion: `Create ${modelName}.dart in data/models if API mapping is needed`
          });
        } else {
          // Check if model has toEntity() method
          const content = fs.readFileSync(modelPath, 'utf-8');
          if (!content.includes('toEntity(')) {
            warnings.push({
              message: `Model missing toEntity() method: ${modelName}`,
              path: modelPath,
              severity: 'warning',
              suggestion: 'Add toEntity() method to convert model to entity'
            });
          }
        }
      }
    }
  }

  /**
   * Calculate validation score
   */
  _calculateScore(errors, warnings) {
    const errorPenalty = errors.length * 15;
    const warningPenalty = warnings.length * 5;
    const totalPenalty = errorPenalty + warningPenalty;

    return Math.max(0, Math.min(100, 100 - totalPenalty));
  }

  /**
   * Create validation result
   */
  _createResult(projectPath, isValid, score, errors, warnings, info) {
    return new ValidationResult({
      isValid,
      score,
      errors,
      warnings,
      info,
      target: projectPath,
      validator: 'ArchitectureValidator',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ArchitectureValidator;
