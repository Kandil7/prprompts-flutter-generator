/**
 * IRStorage - Intermediate Representation Storage System
 *
 * Handles serialization, deserialization, and management of IR (Intermediate Representation)
 * for React-to-Flutter conversion pipeline.
 *
 * Features:
 * - Serialize ComponentModel to JSON files
 * - Organize by feature/component hierarchy
 * - Support incremental conversion
 * - Generate feature manifests
 * - Cache management
 * - Versioning support
 */

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { ComponentModel } = require('../models/ComponentModel');

class IRStorage {
  constructor(config = {}) {
    this.config = {
      basePath: config.basePath || 'tmp/ir',
      prettyPrint: config.prettyPrint !== false,
      compress: config.compress || false,
      version: config.version || '1.0.0',
      enableCache: config.enableCache !== false,
      cacheExpiry: config.cacheExpiry || 3600000, // 1 hour in milliseconds
      generateManifest: config.generateManifest !== false,
      verbose: config.verbose || false,
    };

    this.cache = new Map();
    this.manifest = {
      version: this.config.version,
      features: {},
      components: {},
      metadata: {},
    };
  }

  /**
   * Initialize storage directories
   * @returns {Promise<void>}
   */
  async initialize() {
    await fs.ensureDir(this.config.basePath);
    await fs.ensureDir(path.join(this.config.basePath, '.cache'));
    await fs.ensureDir(path.join(this.config.basePath, 'features'));
    await fs.ensureDir(path.join(this.config.basePath, 'components'));

    // Load existing manifest if available
    const manifestPath = path.join(this.config.basePath, 'manifest.json');
    if (await fs.pathExists(manifestPath)) {
      this.manifest = await fs.readJson(manifestPath);
    }
  }

  /**
   * Save ComponentModel to IR storage
   * @param {ComponentModel} component - Component model to save
   * @param {Object} options - Save options
   * @returns {Promise<Object>} Save result
   */
  async saveComponent(component, options = {}) {
    const feature = options.feature || this.detectFeature(component);
    const componentName = component.name || 'UnnamedComponent';
    const componentPath = this.getComponentPath(feature, componentName);

    // Create IR representation
    const ir = await this.createIR(component);

    // Add metadata
    ir.metadata = {
      ...ir.metadata,
      savedAt: new Date().toISOString(),
      version: this.config.version,
      hash: this.generateHash(ir),
      feature,
      path: componentPath,
    };

    // Ensure directory exists
    await fs.ensureDir(path.dirname(componentPath));

    // Save to file
    const jsonContent = this.config.prettyPrint
      ? JSON.stringify(ir, null, 2)
      : JSON.stringify(ir);

    if (this.config.compress) {
      const zlib = require('zlib');
      const compressed = zlib.gzipSync(Buffer.from(jsonContent));
      await fs.writeFile(componentPath + '.gz', compressed);
    } else {
      await fs.writeFile(componentPath, jsonContent, 'utf8');
    }

    // Update manifest
    await this.updateManifest(feature, componentName, ir);

    // Update cache
    if (this.config.enableCache) {
      this.cache.set(componentPath, {
        ir,
        timestamp: Date.now(),
      });
    }

    if (this.config.verbose) {
      console.log(`Saved IR: ${componentPath}`);
    }

    return {
      success: true,
      path: componentPath,
      feature,
      component: componentName,
      hash: ir.metadata.hash,
      size: jsonContent.length,
    };
  }

  /**
   * Load ComponentModel from IR storage
   * @param {string} feature - Feature name
   * @param {string} componentName - Component name
   * @returns {Promise<Object>} Loaded IR
   */
  async loadComponent(feature, componentName) {
    const componentPath = this.getComponentPath(feature, componentName);

    // Check cache first
    if (this.config.enableCache && this.cache.has(componentPath)) {
      const cached = this.cache.get(componentPath);
      if (Date.now() - cached.timestamp < this.config.cacheExpiry) {
        if (this.config.verbose) {
          console.log(`Loaded from cache: ${componentPath}`);
        }
        return cached.ir;
      }
    }

    // Check if file exists
    let filePath = componentPath;
    if (this.config.compress) {
      filePath = componentPath + '.gz';
    }

    if (!await fs.pathExists(filePath)) {
      throw new Error(`IR file not found: ${filePath}`);
    }

    // Read from file
    let jsonContent;
    if (this.config.compress) {
      const zlib = require('zlib');
      const compressed = await fs.readFile(filePath);
      jsonContent = zlib.gunzipSync(compressed).toString('utf8');
    } else {
      jsonContent = await fs.readFile(filePath, 'utf8');
    }

    const ir = JSON.parse(jsonContent);

    // Update cache
    if (this.config.enableCache) {
      this.cache.set(componentPath, {
        ir,
        timestamp: Date.now(),
      });
    }

    if (this.config.verbose) {
      console.log(`Loaded IR: ${componentPath}`);
    }

    return ir;
  }

  /**
   * Save multiple components in batch
   * @param {Array<ComponentModel>} components - Components to save
   * @param {Object} options - Save options
   * @returns {Promise<Array>} Save results
   */
  async saveComponents(components, options = {}) {
    const results = [];

    for (const component of components) {
      try {
        const result = await this.saveComponent(component, options);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          component: component.name,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Load all components for a feature
   * @param {string} feature - Feature name
   * @returns {Promise<Array>} Loaded components
   */
  async loadFeatureComponents(feature) {
    const featurePath = path.join(this.config.basePath, 'features', feature);

    if (!await fs.pathExists(featurePath)) {
      return [];
    }

    const files = await fs.readdir(featurePath);
    const components = [];

    for (const file of files) {
      if (file.endsWith('.json') || file.endsWith('.json.gz')) {
        const componentName = path.basename(file, path.extname(file));
        try {
          const ir = await this.loadComponent(feature, componentName.replace('.json', ''));
          components.push(ir);
        } catch (error) {
          console.warn(`Failed to load component ${componentName}: ${error.message}`);
        }
      }
    }

    return components;
  }

  /**
   * Create IR representation from ComponentModel
   * @param {ComponentModel} component - Component model
   * @returns {Object} IR representation
   */
  async createIR(component) {
    return {
      name: component.name,
      type: component.type,
      path: component.path,
      props: this.serializeProps(component.props),
      state: this.serializeState(component.state),
      hooks: this.serializeHooks(component.hooks),
      methods: this.serializeMethods(component.methods),
      jsx: this.serializeJSX(component.jsx),
      styles: component.styles,
      imports: component.imports,
      exports: component.exports,
      dependencies: this.extractDependencies(component),
      metadata: {
        lines: component.lines,
        complexity: this.calculateComplexity(component),
        hasTests: component.hasTests,
        isAsync: this.hasAsyncOperations(component),
        stateManagement: component.stateManagement,
      },
    };
  }

  /**
   * Serialize props for IR
   * @param {Array} props - Component props
   * @returns {Array} Serialized props
   */
  serializeProps(props) {
    if (!props) return [];

    return props.map(prop => ({
      name: prop.name,
      type: prop.type || 'any',
      required: prop.required || false,
      defaultValue: prop.defaultValue,
      description: prop.description,
    }));
  }

  /**
   * Serialize state for IR
   * @param {Array} state - Component state
   * @returns {Array} Serialized state
   */
  serializeState(state) {
    if (!state) return [];

    return state.map(s => ({
      name: s.name,
      type: s.type || 'dynamic',
      initialValue: s.initialValue,
      setter: s.setter,
      usage: s.usage || [],
    }));
  }

  /**
   * Serialize hooks for IR
   * @param {Array} hooks - Component hooks
   * @returns {Array} Serialized hooks
   */
  serializeHooks(hooks) {
    if (!hooks) return [];

    return hooks.map(hook => ({
      type: hook.type,
      dependencies: hook.dependencies || [],
      body: hook.body,
      async: hook.async || false,
    }));
  }

  /**
   * Serialize methods for IR
   * @param {Array} methods - Component methods
   * @returns {Array} Serialized methods
   */
  serializeMethods(methods) {
    if (!methods) return [];

    return methods.map(method => ({
      name: method.name,
      params: method.params || [],
      body: method.body,
      async: method.async || false,
      isEventHandler: method.isEventHandler || false,
    }));
  }

  /**
   * Serialize JSX for IR
   * @param {Object} jsx - JSX tree
   * @returns {Object} Serialized JSX
   */
  serializeJSX(jsx) {
    if (!jsx) return null;

    return this.traverseJSXTree(jsx);
  }

  /**
   * Traverse and serialize JSX tree
   * @param {Object} node - JSX node
   * @returns {Object} Serialized node
   */
  traverseJSXTree(node) {
    if (!node) return null;

    const serialized = {
      type: node.type,
      tag: node.tag,
      props: node.props || {},
      children: [],
    };

    if (node.children && Array.isArray(node.children)) {
      serialized.children = node.children.map(child => {
        if (typeof child === 'string') {
          return { type: 'text', value: child };
        }
        return this.traverseJSXTree(child);
      });
    }

    return serialized;
  }

  /**
   * Extract dependencies from component
   * @param {ComponentModel} component - Component model
   * @returns {Object} Dependencies
   */
  extractDependencies(component) {
    const deps = {
      internal: [],
      external: [],
      assets: [],
    };

    // Extract from imports
    if (component.imports) {
      for (const imp of component.imports) {
        if (imp.startsWith('.') || imp.startsWith('/')) {
          deps.internal.push(imp);
        } else {
          deps.external.push(imp);
        }

        // Check for asset imports
        if (imp.match(/\.(png|jpg|svg|gif|json)$/)) {
          deps.assets.push(imp);
        }
      }
    }

    return deps;
  }

  /**
   * Calculate component complexity
   * @param {ComponentModel} component - Component model
   * @returns {number} Complexity score
   */
  calculateComplexity(component) {
    let complexity = 1;

    // Add complexity for state
    complexity += (component.state?.length || 0) * 2;

    // Add complexity for hooks
    complexity += (component.hooks?.length || 0) * 3;

    // Add complexity for methods
    complexity += (component.methods?.length || 0);

    // Add complexity for conditional rendering
    if (component.jsx) {
      complexity += this.countConditionals(component.jsx);
    }

    return complexity;
  }

  /**
   * Count conditional expressions in JSX
   * @param {Object} jsx - JSX tree
   * @returns {number} Conditional count
   */
  countConditionals(jsx) {
    let count = 0;

    const traverse = (node) => {
      if (!node) return;

      if (node.type === 'conditional' || node.type === 'ternary') {
        count++;
      }

      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(traverse);
      }
    };

    traverse(jsx);
    return count;
  }

  /**
   * Check if component has async operations
   * @param {ComponentModel} component - Component model
   * @returns {boolean} Has async
   */
  hasAsyncOperations(component) {
    // Check hooks for async
    if (component.hooks?.some(h => h.async)) {
      return true;
    }

    // Check methods for async
    if (component.methods?.some(m => m.async)) {
      return true;
    }

    return false;
  }

  /**
   * Detect feature from component
   * @param {ComponentModel} component - Component model
   * @returns {string} Feature name
   */
  detectFeature(component) {
    // Try to detect from path
    if (component.path) {
      const parts = component.path.split(/[/\\]/);

      // Look for common feature indicators
      const featureIndicators = ['features', 'modules', 'pages', 'screens', 'views'];

      for (let i = 0; i < parts.length; i++) {
        if (featureIndicators.includes(parts[i].toLowerCase()) && i + 1 < parts.length) {
          return parts[i + 1];
        }
      }

      // Use parent directory as feature
      if (parts.length >= 2) {
        return parts[parts.length - 2];
      }
    }

    return 'common';
  }

  /**
   * Get component path in storage
   * @param {string} feature - Feature name
   * @param {string} componentName - Component name
   * @returns {string} Component path
   */
  getComponentPath(feature, componentName) {
    const safeName = componentName.replace(/[^a-zA-Z0-9-_]/g, '_');
    return path.join(this.config.basePath, 'features', feature, `${safeName}.json`);
  }

  /**
   * Update manifest with component info
   * @param {string} feature - Feature name
   * @param {string} componentName - Component name
   * @param {Object} ir - IR representation
   * @returns {Promise<void>}
   */
  async updateManifest(feature, componentName, ir) {
    // Update feature entry
    if (!this.manifest.features[feature]) {
      this.manifest.features[feature] = {
        components: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      this.manifest.features[feature].updatedAt = new Date().toISOString();
    }

    // Add component if not exists
    if (!this.manifest.features[feature].components.includes(componentName)) {
      this.manifest.features[feature].components.push(componentName);
    }

    // Update component entry
    this.manifest.components[`${feature}/${componentName}`] = {
      feature,
      name: componentName,
      type: ir.type,
      hash: ir.metadata.hash,
      complexity: ir.metadata.complexity,
      dependencies: ir.dependencies,
      savedAt: ir.metadata.savedAt,
    };

    // Update metadata
    this.manifest.metadata = {
      totalFeatures: Object.keys(this.manifest.features).length,
      totalComponents: Object.keys(this.manifest.components).length,
      lastUpdated: new Date().toISOString(),
    };

    // Save manifest
    if (this.config.generateManifest) {
      const manifestPath = path.join(this.config.basePath, 'manifest.json');
      await fs.writeJson(manifestPath, this.manifest, { spaces: 2 });
    }
  }

  /**
   * Generate hash for IR content
   * @param {Object} ir - IR representation
   * @returns {string} Hash
   */
  generateHash(ir) {
    const content = JSON.stringify({
      name: ir.name,
      type: ir.type,
      props: ir.props,
      state: ir.state,
      jsx: ir.jsx,
    });

    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Get manifest
   * @returns {Promise<Object>} Manifest
   */
  async getManifest() {
    const manifestPath = path.join(this.config.basePath, 'manifest.json');

    if (await fs.pathExists(manifestPath)) {
      return await fs.readJson(manifestPath);
    }

    return this.manifest;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    if (this.config.verbose) {
      console.log('IR cache cleared');
    }
  }

  /**
   * Clear all IR storage
   * @returns {Promise<void>}
   */
  async clearStorage() {
    await fs.emptyDir(this.config.basePath);
    this.cache.clear();
    this.manifest = {
      version: this.config.version,
      features: {},
      components: {},
      metadata: {},
    };

    if (this.config.verbose) {
      console.log('IR storage cleared');
    }
  }

  /**
   * Generate conversion report
   * @returns {Promise<Object>} Conversion report
   */
  async generateReport() {
    const manifest = await this.getManifest();
    const report = {
      summary: {
        features: manifest.metadata?.totalFeatures || 0,
        components: manifest.metadata?.totalComponents || 0,
        lastUpdated: manifest.metadata?.lastUpdated,
      },
      features: {},
      complexity: {
        simple: 0,    // complexity < 5
        moderate: 0,  // complexity 5-15
        complex: 0,   // complexity > 15
      },
    };

    // Analyze features
    for (const [featureName, feature] of Object.entries(manifest.features || {})) {
      report.features[featureName] = {
        componentCount: feature.components.length,
        components: [],
      };

      // Analyze components
      for (const componentName of feature.components) {
        const key = `${featureName}/${componentName}`;
        const component = manifest.components[key];

        if (component) {
          report.features[featureName].components.push({
            name: componentName,
            type: component.type,
            complexity: component.complexity,
          });

          // Update complexity distribution
          if (component.complexity < 5) {
            report.complexity.simple++;
          } else if (component.complexity <= 15) {
            report.complexity.moderate++;
          } else {
            report.complexity.complex++;
          }
        }
      }
    }

    return report;
  }

  /**
   * Check if component needs update
   * @param {string} feature - Feature name
   * @param {string} componentName - Component name
   * @param {string} hash - Current hash
   * @returns {Promise<boolean>} Needs update
   */
  async needsUpdate(feature, componentName, hash) {
    try {
      const ir = await this.loadComponent(feature, componentName);
      return ir.metadata.hash !== hash;
    } catch (error) {
      // Component doesn't exist, needs creation
      return true;
    }
  }

  /**
   * Get storage statistics
   * @returns {Promise<Object>} Storage statistics
   */
  async getStatistics() {
    const stats = {
      totalSize: 0,
      fileCount: 0,
      features: {},
      cacheSize: this.cache.size,
    };

    const basePath = this.config.basePath;

    if (await fs.pathExists(basePath)) {
      const walkDir = async (dir) => {
        const items = await fs.readdir(dir, { withFileTypes: true });

        for (const item of items) {
          const fullPath = path.join(dir, item.name);

          if (item.isDirectory()) {
            await walkDir(fullPath);
          } else if (item.isFile()) {
            const stat = await fs.stat(fullPath);
            stats.totalSize += stat.size;
            stats.fileCount++;
          }
        }
      };

      await walkDir(basePath);
    }

    return stats;
  }
}

module.exports = IRStorage;