/**
 * importResolver.js
 * Resolves import paths and tracks dependencies
 *
 * Handles relative imports, node_modules, aliases, and asset imports
 */

const path = require('path');
const { createModuleLogger } = require('../../utils/logger');

const logger = createModuleLogger('ImportResolver');

/**
 * Import types
 */
const ImportType = {
  REACT: 'react',
  REACT_NATIVE: 'react_native',
  NODE_MODULE: 'node_module',
  RELATIVE: 'relative',
  ABSOLUTE: 'absolute',
  ALIAS: 'alias',
  ASSET: 'asset',
  STYLE: 'style',
};

/**
 * Import resolver class
 */
class ImportResolver {
  /**
   * @param {Object} options
   * @param {string} options.basePath - Base path of the project
   * @param {Object} options.aliases - Path aliases (e.g., { '@': './src' })
   * @param {string[]} options.extensions - File extensions to resolve
   */
  constructor(options = {}) {
    this.basePath = options.basePath || process.cwd();
    this.aliases = options.aliases || {};
    this.extensions = options.extensions || ['.js', '.jsx', '.ts', '.tsx'];
    this.resolvedImports = new Map();
  }

  /**
   * Resolve an import path
   * @param {string} importPath - Import path from source
   * @param {string} currentFile - Current file path
   * @returns {Object} - Resolved import information
   */
  resolve(importPath, currentFile) {
    const importType = this._determineImportType(importPath);

    let resolvedPath = importPath;
    let isExternal = false;
    let packageName = null;

    switch (importType) {
      case ImportType.REACT:
      case ImportType.REACT_NATIVE:
      case ImportType.NODE_MODULE:
        isExternal = true;
        packageName = this._extractPackageName(importPath);
        break;

      case ImportType.RELATIVE:
        resolvedPath = this._resolveRelativePath(importPath, currentFile);
        break;

      case ImportType.ABSOLUTE:
        resolvedPath = path.join(this.basePath, importPath);
        break;

      case ImportType.ALIAS:
        resolvedPath = this._resolveAliasPath(importPath);
        break;

      case ImportType.ASSET:
      case ImportType.STYLE:
        resolvedPath = this._resolveAssetPath(importPath, currentFile);
        break;
    }

    const importInfo = {
      original: importPath,
      resolved: resolvedPath,
      type: importType,
      isExternal,
      packageName,
      needsFlutterEquivalent: this._needsFlutterEquivalent(importType, packageName),
      flutterEquivalent: this._getFlutterEquivalent(importType, packageName),
    };

    // Cache resolution
    this.resolvedImports.set(importPath, importInfo);

    return importInfo;
  }

  /**
   * Determine the type of import
   * @private
   */
  _determineImportType(importPath) {
    // React imports
    if (importPath === 'react' || importPath.startsWith('react/')) {
      return ImportType.REACT;
    }

    // React Native imports
    if (importPath === 'react-native' || importPath.startsWith('react-native/')) {
      return ImportType.REACT_NATIVE;
    }

    // Asset imports (images, fonts, etc.)
    if (this._isAssetPath(importPath)) {
      return ImportType.ASSET;
    }

    // Style imports (CSS, SCSS, etc.)
    if (this._isStylePath(importPath)) {
      return ImportType.STYLE;
    }

    // Alias imports (e.g., @/components/Button)
    if (this._isAliasPath(importPath)) {
      return ImportType.ALIAS;
    }

    // Relative imports
    if (importPath.startsWith('.')) {
      return ImportType.RELATIVE;
    }

    // Absolute imports from src
    if (importPath.startsWith('/')) {
      return ImportType.ABSOLUTE;
    }

    // Node modules
    return ImportType.NODE_MODULE;
  }

  /**
   * Check if path is an asset
   * @private
   */
  _isAssetPath(importPath) {
    const assetExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
                             '.woff', '.woff2', '.ttf', '.otf', '.eot',
                             '.mp4', '.webm', '.ogg', '.mp3', '.wav',
                             '.pdf', '.json', '.xml'];

    return assetExtensions.some(ext => importPath.endsWith(ext));
  }

  /**
   * Check if path is a style file
   * @private
   */
  _isStylePath(importPath) {
    const styleExtensions = ['.css', '.scss', '.sass', '.less', '.styl'];
    return styleExtensions.some(ext => importPath.endsWith(ext));
  }

  /**
   * Check if path uses alias
   * @private
   */
  _isAliasPath(importPath) {
    return Object.keys(this.aliases).some(alias => importPath.startsWith(alias));
  }

  /**
   * Resolve relative import path
   * @private
   */
  _resolveRelativePath(importPath, currentFile) {
    const currentDir = path.dirname(currentFile);
    const resolved = path.resolve(currentDir, importPath);

    // Try to find file with extensions
    return this._tryExtensions(resolved);
  }

  /**
   * Resolve aliased import path
   * @private
   */
  _resolveAliasPath(importPath) {
    for (const [alias, aliasPath] of Object.entries(this.aliases)) {
      if (importPath.startsWith(alias)) {
        const relativePath = importPath.substring(alias.length);
        const resolved = path.join(this.basePath, aliasPath, relativePath);
        return this._tryExtensions(resolved);
      }
    }
    return importPath;
  }

  /**
   * Resolve asset path
   * @private
   */
  _resolveAssetPath(importPath, currentFile) {
    if (importPath.startsWith('.')) {
      return this._resolveRelativePath(importPath, currentFile);
    }
    return path.join(this.basePath, importPath);
  }

  /**
   * Try to find file with different extensions
   * @private
   */
  _tryExtensions(basePath) {
    // If path already has extension, return it
    if (path.extname(basePath)) {
      return basePath;
    }

    // Try each extension
    for (const ext of this.extensions) {
      const withExt = basePath + ext;
      // In real implementation, would check if file exists
      // For now, just return first extension
      return withExt;
    }

    return basePath;
  }

  /**
   * Extract package name from import path
   * @private
   */
  _extractPackageName(importPath) {
    // Handle scoped packages (@org/package)
    if (importPath.startsWith('@')) {
      const parts = importPath.split('/');
      return parts.slice(0, 2).join('/');
    }

    // Regular packages
    return importPath.split('/')[0];
  }

  /**
   * Check if import needs Flutter equivalent
   * @private
   */
  _needsFlutterEquivalent(importType, packageName) {
    if (importType === ImportType.REACT || importType === ImportType.REACT_NATIVE) {
      return true;
    }

    if (importType === ImportType.NODE_MODULE) {
      // Common packages that need Flutter equivalents
      const needsEquivalent = [
        'axios', 'lodash', 'moment', 'date-fns', 'uuid',
        'redux', 'zustand', 'mobx', 'recoil',
        'react-router', 'react-navigation',
        'formik', 'react-hook-form',
        'styled-components', 'emotion',
      ];
      return needsEquivalent.some(pkg => packageName && packageName.includes(pkg));
    }

    return false;
  }

  /**
   * Get Flutter package equivalent
   * @private
   */
  _getFlutterEquivalent(importType, packageName) {
    const equivalents = {
      // React core
      'react': 'flutter (built-in)',
      'react-native': 'flutter (built-in)',

      // HTTP clients
      'axios': 'dio',
      'fetch': 'http or dio',

      // State management
      'redux': 'flutter_bloc or redux',
      'zustand': 'flutter_bloc or provider',
      'mobx': 'mobx or flutter_bloc',
      'recoil': 'flutter_bloc or riverpod',

      // Navigation
      'react-router': 'go_router or flutter_navigation',
      'react-navigation': 'go_router',
      '@react-navigation/native': 'go_router',

      // Forms
      'formik': 'flutter_form_builder or reactive_forms',
      'react-hook-form': 'flutter_form_builder',

      // Utilities
      'lodash': 'dart built-in or collection package',
      'moment': 'intl or jiffy',
      'date-fns': 'intl or jiffy',
      'uuid': 'uuid',

      // Styling
      'styled-components': 'flutter theming',
      'emotion': 'flutter theming',

      // Storage
      'async-storage': 'shared_preferences or hive',
      'localStorage': 'shared_preferences',

      // Animations
      'react-spring': 'flutter animations',
      'framer-motion': 'flutter animations',

      // Icons
      'react-icons': 'flutter_icons or material_icons',
      '@fortawesome/react-fontawesome': 'font_awesome_flutter',
    };

    if (packageName && equivalents[packageName]) {
      return equivalents[packageName];
    }

    if (importType === ImportType.REACT || importType === ImportType.REACT_NATIVE) {
      return 'flutter (built-in)';
    }

    return null;
  }

  /**
   * Get all resolved imports
   * @returns {Map}
   */
  getResolvedImports() {
    return new Map(this.resolvedImports);
  }

  /**
   * Get external dependencies
   * @returns {Object[]}
   */
  getExternalDependencies() {
    const deps = [];

    for (const [importPath, info] of this.resolvedImports) {
      if (info.isExternal && info.packageName) {
        deps.push({
          package: info.packageName,
          importPath,
          flutterEquivalent: info.flutterEquivalent,
        });
      }
    }

    return deps;
  }

  /**
   * Get Flutter package suggestions
   * @returns {Object}
   */
  getFlutterPackageSuggestions() {
    const suggestions = {};

    for (const [importPath, info] of this.resolvedImports) {
      if (info.needsFlutterEquivalent && info.flutterEquivalent) {
        suggestions[info.packageName] = info.flutterEquivalent;
      }
    }

    return suggestions;
  }

  /**
   * Get asset imports
   * @returns {Object[]}
   */
  getAssetImports() {
    const assets = [];

    for (const [importPath, info] of this.resolvedImports) {
      if (info.type === ImportType.ASSET) {
        assets.push({
          original: importPath,
          resolved: info.resolved,
          type: this._getAssetType(importPath),
        });
      }
    }

    return assets;
  }

  /**
   * Get asset type (image, font, video, etc.)
   * @private
   */
  _getAssetType(importPath) {
    const ext = path.extname(importPath).toLowerCase();

    const typeMap = {
      '.png': 'image',
      '.jpg': 'image',
      '.jpeg': 'image',
      '.gif': 'image',
      '.svg': 'image',
      '.webp': 'image',
      '.ico': 'image',
      '.woff': 'font',
      '.woff2': 'font',
      '.ttf': 'font',
      '.otf': 'font',
      '.mp4': 'video',
      '.webm': 'video',
      '.ogg': 'audio',
      '.mp3': 'audio',
      '.wav': 'audio',
    };

    return typeMap[ext] || 'unknown';
  }

  /**
   * Add path alias
   * @param {string} alias - Alias prefix
   * @param {string} aliasPath - Path to resolve to
   */
  addAlias(alias, aliasPath) {
    this.aliases[alias] = aliasPath;
  }

  /**
   * Clear resolved imports cache
   */
  clearCache() {
    this.resolvedImports.clear();
  }
}

module.exports = {
  ImportResolver,
  ImportType,
};
