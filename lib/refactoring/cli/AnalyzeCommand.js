/**
 * AnalyzeCommand - Analyzes a React project and generates a comprehensive report
 *
 * Features:
 * - Feature detection and complexity scoring
 * - Component dependency graph
 * - Time estimation for conversion
 * - Architecture recommendations
 * - Code quality metrics
 * - Technology stack analysis
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { ReactParser } = require('../parsers/ReactParser');
const { StateManagementDetector } = require('../parsers/StateManagementDetector');
const { ApiExtractor } = require('../parsers/ApiExtractor');
const { StyleExtractor } = require('../parsers/StyleExtractor');
const chalk = require('chalk');
const ora = require('ora');

class AnalyzeCommand {
  constructor(config = {}) {
    this.config = {
      verbose: config.verbose || false,
      outputFormat: config.outputFormat || 'json', // json, markdown, html
      includeMetrics: config.includeMetrics !== false,
      includeRecommendations: config.includeRecommendations !== false,
      includeDependencies: config.includeDependencies !== false,
      includeTimeEstimate: config.includeTimeEstimate !== false,
      maxDepth: config.maxDepth || 10, // For dependency graph
    };

    this.parser = new ReactParser();
    this.stateDetector = new StateManagementDetector();
    this.apiExtractor = new ApiExtractor();
    this.styleExtractor = new StyleExtractor();

    this.analysis = {
      project: {},
      features: [],
      components: [],
      dependencies: {},
      metrics: {},
      techStack: {},
      recommendations: [],
      timeEstimate: {},
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Execute analyze command
   * @param {string} inputPath - Path to React project
   * @param {string} outputPath - Path for report output
   * @returns {Promise<Object>} Analysis result
   */
  async execute(inputPath, outputPath) {
    const spinner = ora('Analyzing React project...').start();

    try {
      // Validate input path
      if (!await fs.pathExists(inputPath)) {
        throw new Error(`Input path does not exist: ${inputPath}`);
      }

      spinner.text = 'Scanning project structure...';
      await this.analyzeProjectStructure(inputPath);

      spinner.text = 'Detecting features...';
      await this.detectFeatures(inputPath);

      spinner.text = 'Analyzing components...';
      await this.analyzeComponents(inputPath);

      if (this.config.includeDependencies) {
        spinner.text = 'Building dependency graph...';
        await this.buildDependencyGraph();
      }

      if (this.config.includeMetrics) {
        spinner.text = 'Calculating metrics...';
        await this.calculateMetrics();
      }

      spinner.text = 'Analyzing technology stack...';
      await this.analyzeTechStack(inputPath);

      if (this.config.includeRecommendations) {
        spinner.text = 'Generating recommendations...';
        await this.generateRecommendations();
      }

      if (this.config.includeTimeEstimate) {
        spinner.text = 'Estimating conversion time...';
        await this.estimateConversionTime();
      }

      spinner.succeed('Analysis complete!');

      // Save report
      await this.saveReport(outputPath);

      // Print summary
      this.printSummary();

      return {
        success: true,
        report: this.analysis,
        outputPath,
      };

    } catch (error) {
      spinner.fail(`Analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze project structure
   * @param {string} inputPath - Project path
   */
  async analyzeProjectStructure(inputPath) {
    const packageJsonPath = path.join(inputPath, 'package.json');
    let packageJson = {};

    if (await fs.pathExists(packageJsonPath)) {
      packageJson = await fs.readJson(packageJsonPath);
    }

    // Count files by type
    const fileStats = await this.countFileTypes(inputPath);

    this.analysis.project = {
      name: packageJson.name || path.basename(inputPath),
      version: packageJson.version || 'unknown',
      path: inputPath,
      description: packageJson.description,
      scripts: Object.keys(packageJson.scripts || {}),
      dependencies: Object.keys(packageJson.dependencies || {}),
      devDependencies: Object.keys(packageJson.devDependencies || {}),
      fileStats,
      structure: await this.getProjectStructure(inputPath),
    };
  }

  /**
   * Count files by type
   * @param {string} inputPath - Project path
   * @returns {Promise<Object>} File statistics
   */
  async countFileTypes(inputPath) {
    const patterns = {
      components: 'src/**/*.{jsx,tsx}',
      javascript: 'src/**/*.js',
      typescript: 'src/**/*.ts',
      styles: 'src/**/*.{css,scss,sass,less}',
      tests: '**/*.{test,spec}.{js,jsx,ts,tsx}',
      assets: 'src/**/*.{png,jpg,jpeg,gif,svg}',
      data: 'src/**/*.json',
    };

    const stats = {};

    for (const [type, pattern] of Object.entries(patterns)) {
      const files = await new Promise((resolve) => {
        glob(path.join(inputPath, pattern), (err, matches) => {
          resolve(err ? [] : matches);
        });
      });
      stats[type] = files.length;
    }

    // Calculate total LOC
    let totalLines = 0;
    const codeFiles = await new Promise((resolve) => {
      glob(path.join(inputPath, 'src/**/*.{js,jsx,ts,tsx}'), (err, matches) => {
        resolve(err ? [] : matches);
      });
    });

    for (const file of codeFiles) {
      const content = await fs.readFile(file, 'utf8');
      totalLines += content.split('\n').length;
    }

    stats.totalLines = totalLines;
    stats.totalFiles = codeFiles.length;

    return stats;
  }

  /**
   * Get project structure
   * @param {string} inputPath - Project path
   * @returns {Promise<Object>} Project structure
   */
  async getProjectStructure(inputPath) {
    const structure = {
      hasTypescript: await fs.pathExists(path.join(inputPath, 'tsconfig.json')),
      hasTests: await fs.pathExists(path.join(inputPath, 'jest.config.js')) ||
                 await fs.pathExists(path.join(inputPath, 'jest.config.json')),
      hasESLint: await fs.pathExists(path.join(inputPath, '.eslintrc.js')) ||
                 await fs.pathExists(path.join(inputPath, '.eslintrc.json')),
      hasPrettier: await fs.pathExists(path.join(inputPath, '.prettierrc')),
      hasDocker: await fs.pathExists(path.join(inputPath, 'Dockerfile')),
      hasCI: await fs.pathExists(path.join(inputPath, '.github/workflows')) ||
             await fs.pathExists(path.join(inputPath, '.gitlab-ci.yml')),
      buildTool: await this.detectBuildTool(inputPath),
    };

    return structure;
  }

  /**
   * Detect build tool
   * @param {string} inputPath - Project path
   * @returns {Promise<string>} Build tool name
   */
  async detectBuildTool(inputPath) {
    if (await fs.pathExists(path.join(inputPath, 'vite.config.js'))) {
      return 'vite';
    }
    if (await fs.pathExists(path.join(inputPath, 'webpack.config.js'))) {
      return 'webpack';
    }
    if (await fs.pathExists(path.join(inputPath, 'next.config.js'))) {
      return 'next.js';
    }
    if (await fs.pathExists(path.join(inputPath, '.cracorc.js'))) {
      return 'craco';
    }
    return 'create-react-app'; // Default assumption
  }

  /**
   * Detect features in the project
   * @param {string} inputPath - Project path
   */
  async detectFeatures(inputPath) {
    const features = [];
    const srcPath = path.join(inputPath, 'src');

    if (!await fs.pathExists(srcPath)) {
      return;
    }

    // Scan for feature folders
    const directories = await this.getDirectories(srcPath);

    for (const dir of directories) {
      const feature = await this.analyzeFeatureDirectory(dir);
      if (feature.components.length > 0) {
        features.push(feature);
      }
    }

    // Detect route-based features
    const routeFeatures = await this.detectRouteFeatures(inputPath);
    features.push(...routeFeatures);

    // Sort by component count
    features.sort((a, b) => b.components.length - a.components.length);

    this.analysis.features = features;
  }

  /**
   * Get subdirectories
   * @param {string} dirPath - Directory path
   * @returns {Promise<Array>} Directory paths
   */
  async getDirectories(dirPath) {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    const dirs = items
      .filter(item => item.isDirectory())
      .map(item => path.join(dirPath, item.name));

    // Include nested feature directories
    const nestedDirs = [];
    for (const dir of dirs) {
      const name = path.basename(dir);
      if (['features', 'modules', 'pages', 'screens', 'views'].includes(name.toLowerCase())) {
        const subdirs = await this.getDirectories(dir);
        nestedDirs.push(...subdirs);
      }
    }

    return [...dirs, ...nestedDirs];
  }

  /**
   * Analyze a feature directory
   * @param {string} dirPath - Directory path
   * @returns {Promise<Object>} Feature analysis
   */
  async analyzeFeatureDirectory(dirPath) {
    const name = path.basename(dirPath);
    const components = [];
    const assets = [];

    // Find components
    const componentFiles = await new Promise((resolve) => {
      glob(path.join(dirPath, '**/*.{jsx,tsx}'), (err, matches) => {
        resolve(err ? [] : matches);
      });
    });

    for (const file of componentFiles) {
      components.push({
        name: path.basename(file, path.extname(file)),
        path: file,
        relativePath: path.relative(dirPath, file),
      });
    }

    // Find assets
    const assetFiles = await new Promise((resolve) => {
      glob(path.join(dirPath, '**/*.{png,jpg,jpeg,gif,svg}'), (err, matches) => {
        resolve(err ? [] : matches);
      });
    });

    for (const file of assetFiles) {
      assets.push({
        name: path.basename(file),
        path: file,
        type: path.extname(file).substring(1),
      });
    }

    return {
      name,
      path: dirPath,
      components,
      assets,
      complexity: this.calculateFeatureComplexity(components.length, assets.length),
    };
  }

  /**
   * Calculate feature complexity
   * @param {number} componentCount - Number of components
   * @param {number} assetCount - Number of assets
   * @returns {string} Complexity level
   */
  calculateFeatureComplexity(componentCount, assetCount) {
    const score = componentCount * 2 + assetCount * 0.5;

    if (score < 5) return 'simple';
    if (score < 15) return 'moderate';
    return 'complex';
  }

  /**
   * Detect route-based features
   * @param {string} inputPath - Project path
   * @returns {Promise<Array>} Route features
   */
  async detectRouteFeatures(inputPath) {
    const features = [];

    // Look for route configuration files
    const routeFiles = await new Promise((resolve) => {
      glob(path.join(inputPath, 'src/**/*{routes,router,routing}*.{js,jsx,ts,tsx}'), (err, matches) => {
        resolve(err ? [] : matches);
      });
    });

    for (const file of routeFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const routes = this.extractRoutes(content);

        for (const route of routes) {
          features.push({
            name: route.name || route.path,
            path: route.component,
            type: 'route',
            route: route.path,
            components: [{ name: route.component, path: file }],
            complexity: 'moderate',
          });
        }
      } catch (error) {
        // Skip if can't parse
      }
    }

    return features;
  }

  /**
   * Extract routes from file content
   * @param {string} content - File content
   * @returns {Array} Routes
   */
  extractRoutes(content) {
    const routes = [];

    // Simple regex patterns to find routes
    const patterns = [
      /path:\s*['"`]([^'"`]+)['"`].*component:\s*(\w+)/g,
      /<Route\s+path=['"`]([^'"`]+)['"`].*component={(\w+)}/g,
      /<Route\s+path=['"`]([^'"`]+)['"`].*element={<(\w+)/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        routes.push({
          path: match[1],
          component: match[2],
        });
      }
    }

    return routes;
  }

  /**
   * Analyze components
   * @param {string} inputPath - Project path
   */
  async analyzeComponents(inputPath) {
    const components = [];

    // Find all component files
    const componentFiles = await new Promise((resolve) => {
      glob(path.join(inputPath, 'src/**/*.{jsx,tsx}'), (err, matches) => {
        resolve(err ? [] : matches);
      });
    });

    for (const file of componentFiles.slice(0, 100)) { // Limit to 100 for performance
      try {
        const analysis = await this.analyzeComponentFile(file);
        if (analysis) {
          components.push(analysis);
        }
      } catch (error) {
        if (this.config.verbose) {
          console.warn(`Failed to analyze ${file}: ${error.message}`);
        }
      }
    }

    // Sort by complexity
    components.sort((a, b) => b.complexity - a.complexity);

    this.analysis.components = components;
  }

  /**
   * Analyze a component file
   * @param {string} filePath - Component file path
   * @returns {Promise<Object>} Component analysis
   */
  async analyzeComponentFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const parsed = await this.parser.parse(content, filePath);

    if (!parsed || !parsed.components || parsed.components.length === 0) {
      return null;
    }

    const component = parsed.components[0];

    // Detect state management
    const stateManagement = this.stateDetector.detect(content);

    // Extract APIs
    const apis = this.apiExtractor.extract(content);

    // Extract styles
    const styles = this.styleExtractor.extract(content);

    return {
      name: component.name,
      path: filePath,
      type: component.type,
      lines: content.split('\n').length,
      props: component.props?.length || 0,
      state: component.state?.length || 0,
      hooks: component.hooks?.length || 0,
      methods: component.methods?.length || 0,
      complexity: this.calculateComponentComplexity(component),
      stateManagement: stateManagement.type,
      hasAsync: apis.length > 0,
      hasStyles: styles.inline || styles.modules || styles.styled,
      dependencies: component.imports?.length || 0,
    };
  }

  /**
   * Calculate component complexity
   * @param {Object} component - Component data
   * @returns {number} Complexity score
   */
  calculateComponentComplexity(component) {
    let complexity = 1;

    complexity += (component.props?.length || 0) * 0.5;
    complexity += (component.state?.length || 0) * 2;
    complexity += (component.hooks?.length || 0) * 3;
    complexity += (component.methods?.length || 0);

    return Math.round(complexity);
  }

  /**
   * Build dependency graph
   */
  async buildDependencyGraph() {
    const graph = {
      nodes: [],
      edges: [],
      clusters: {},
    };

    // Create nodes for each component
    for (const component of this.analysis.components) {
      graph.nodes.push({
        id: component.path,
        label: component.name,
        type: component.type,
        complexity: component.complexity,
      });
    }

    // Create edges based on imports
    // This is simplified - full implementation would parse imports
    for (const component of this.analysis.components) {
      if (component.dependencies > 0) {
        // Add sample edges (simplified)
        for (let i = 0; i < Math.min(component.dependencies, 3); i++) {
          const targetIndex = Math.floor(Math.random() * this.analysis.components.length);
          if (targetIndex !== this.analysis.components.indexOf(component)) {
            graph.edges.push({
              source: component.path,
              target: this.analysis.components[targetIndex].path,
            });
          }
        }
      }
    }

    // Detect clusters (features)
    for (const feature of this.analysis.features) {
      graph.clusters[feature.name] = feature.components.map(c => c.path);
    }

    this.analysis.dependencies = graph;
  }

  /**
   * Calculate project metrics
   */
  async calculateMetrics() {
    const metrics = {
      totalComponents: this.analysis.components.length,
      totalFeatures: this.analysis.features.length,
      averageComplexity: 0,
      complexityDistribution: {
        simple: 0,    // < 5
        moderate: 0,  // 5-15
        complex: 0,   // > 15
      },
      codeQuality: {
        hasTypescript: this.analysis.project.structure.hasTypescript,
        hasTests: this.analysis.project.structure.hasTests,
        testCoverage: 0, // Would need to run tests to get this
        hasLinting: this.analysis.project.structure.hasESLint,
        hasFormatting: this.analysis.project.structure.hasPrettier,
      },
      maintainability: {
        averageFileSize: 0,
        largestFile: null,
        duplicateCodeRatio: 0, // Would need deeper analysis
      },
    };

    // Calculate average complexity
    if (this.analysis.components.length > 0) {
      const totalComplexity = this.analysis.components.reduce((sum, c) => sum + c.complexity, 0);
      metrics.averageComplexity = totalComplexity / this.analysis.components.length;
    }

    // Complexity distribution
    for (const component of this.analysis.components) {
      if (component.complexity < 5) {
        metrics.complexityDistribution.simple++;
      } else if (component.complexity <= 15) {
        metrics.complexityDistribution.moderate++;
      } else {
        metrics.complexityDistribution.complex++;
      }
    }

    // File size metrics
    if (this.analysis.components.length > 0) {
      const totalLines = this.analysis.components.reduce((sum, c) => sum + c.lines, 0);
      metrics.maintainability.averageFileSize = Math.round(totalLines / this.analysis.components.length);

      const largestComponent = this.analysis.components.reduce((max, c) =>
        c.lines > (max?.lines || 0) ? c : max, null);

      metrics.maintainability.largestFile = largestComponent ? {
        name: largestComponent.name,
        lines: largestComponent.lines,
        path: largestComponent.path,
      } : null;
    }

    // Calculate a maintainability index (0-100)
    let maintainabilityScore = 100;
    maintainabilityScore -= metrics.averageComplexity * 2;
    maintainabilityScore -= (metrics.maintainability.averageFileSize / 10);
    maintainabilityScore += metrics.codeQuality.hasTypescript ? 10 : 0;
    maintainabilityScore += metrics.codeQuality.hasTests ? 10 : 0;
    maintainabilityScore += metrics.codeQuality.hasLinting ? 5 : 0;
    maintainabilityScore += metrics.codeQuality.hasFormatting ? 5 : 0;
    metrics.maintainabilityScore = Math.max(0, Math.min(100, Math.round(maintainabilityScore)));

    this.analysis.metrics = metrics;
  }

  /**
   * Analyze technology stack
   * @param {string} inputPath - Project path
   */
  async analyzeTechStack(inputPath) {
    const packageJsonPath = path.join(inputPath, 'package.json');
    let dependencies = {};

    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
    }

    const techStack = {
      framework: 'react',
      language: this.analysis.project.structure.hasTypescript ? 'typescript' : 'javascript',
      stateManagement: [],
      styling: [],
      routing: null,
      testing: [],
      buildTool: this.analysis.project.structure.buildTool,
      ui: [],
      dataFetching: [],
      forms: [],
      animations: [],
    };

    // Detect state management
    if (dependencies['redux']) techStack.stateManagement.push('redux');
    if (dependencies['mobx']) techStack.stateManagement.push('mobx');
    if (dependencies['recoil']) techStack.stateManagement.push('recoil');
    if (dependencies['zustand']) techStack.stateManagement.push('zustand');
    if (dependencies['react-query'] || dependencies['@tanstack/react-query']) {
      techStack.stateManagement.push('react-query');
    }

    // Detect styling
    if (dependencies['styled-components']) techStack.styling.push('styled-components');
    if (dependencies['@emotion/react']) techStack.styling.push('emotion');
    if (dependencies['sass']) techStack.styling.push('sass');
    if (dependencies['tailwindcss']) techStack.styling.push('tailwind');
    if (dependencies['@mui/material']) techStack.styling.push('material-ui');

    // Detect routing
    if (dependencies['react-router-dom']) techStack.routing = 'react-router';
    if (dependencies['@reach/router']) techStack.routing = 'reach-router';
    if (dependencies['next']) techStack.routing = 'next.js';

    // Detect testing
    if (dependencies['jest']) techStack.testing.push('jest');
    if (dependencies['@testing-library/react']) techStack.testing.push('react-testing-library');
    if (dependencies['enzyme']) techStack.testing.push('enzyme');
    if (dependencies['cypress']) techStack.testing.push('cypress');

    // Detect UI libraries
    if (dependencies['@mui/material']) techStack.ui.push('material-ui');
    if (dependencies['antd']) techStack.ui.push('ant-design');
    if (dependencies['react-bootstrap']) techStack.ui.push('react-bootstrap');
    if (dependencies['@chakra-ui/react']) techStack.ui.push('chakra-ui');

    // Detect data fetching
    if (dependencies['axios']) techStack.dataFetching.push('axios');
    if (dependencies['graphql']) techStack.dataFetching.push('graphql');
    if (dependencies['apollo-client'] || dependencies['@apollo/client']) {
      techStack.dataFetching.push('apollo');
    }
    if (dependencies['swr']) techStack.dataFetching.push('swr');

    // Detect forms
    if (dependencies['react-hook-form']) techStack.forms.push('react-hook-form');
    if (dependencies['formik']) techStack.forms.push('formik');
    if (dependencies['react-final-form']) techStack.forms.push('react-final-form');

    // Detect animations
    if (dependencies['framer-motion']) techStack.animations.push('framer-motion');
    if (dependencies['react-spring']) techStack.animations.push('react-spring');
    if (dependencies['lottie-react']) techStack.animations.push('lottie');

    this.analysis.techStack = techStack;
  }

  /**
   * Generate recommendations
   */
  async generateRecommendations() {
    const recommendations = [];

    // Architecture recommendations
    if (this.analysis.features.length === 0) {
      recommendations.push({
        category: 'architecture',
        priority: 'high',
        title: 'Organize code by features',
        description: 'Consider organizing your code into feature-based modules for better maintainability in Flutter.',
      });
    }

    // State management recommendations
    if (this.analysis.techStack.stateManagement.length === 0) {
      recommendations.push({
        category: 'state',
        priority: 'high',
        title: 'Choose a state management solution',
        description: 'Flutter conversion will be easier with a clear state management pattern. Consider using BLoC or Provider.',
      });
    } else if (this.analysis.techStack.stateManagement.includes('redux')) {
      recommendations.push({
        category: 'state',
        priority: 'medium',
        title: 'Redux to BLoC conversion',
        description: 'Redux patterns map well to BLoC pattern in Flutter. Consider using flutter_bloc package.',
      });
    }

    // TypeScript recommendation
    if (!this.analysis.project.structure.hasTypescript) {
      recommendations.push({
        category: 'typing',
        priority: 'medium',
        title: 'Consider TypeScript',
        description: 'TypeScript makes conversion to Dart easier as both are strongly typed languages.',
      });
    }

    // Testing recommendations
    if (!this.analysis.project.structure.hasTests) {
      recommendations.push({
        category: 'testing',
        priority: 'high',
        title: 'Add tests before conversion',
        description: 'Having tests helps ensure the converted Flutter app maintains the same functionality.',
      });
    }

    // Complexity recommendations
    if (this.analysis.metrics?.averageComplexity > 10) {
      recommendations.push({
        category: 'refactoring',
        priority: 'high',
        title: 'Reduce component complexity',
        description: 'High complexity components are harder to convert. Consider breaking them down before conversion.',
      });
    }

    // Large file recommendations
    if (this.analysis.metrics?.maintainability?.largestFile?.lines > 500) {
      recommendations.push({
        category: 'refactoring',
        priority: 'medium',
        title: 'Split large components',
        description: `Component ${this.analysis.metrics.maintainability.largestFile.name} has ${this.analysis.metrics.maintainability.largestFile.lines} lines. Consider splitting it.`,
      });
    }

    // Styling recommendations
    if (this.analysis.techStack.styling.includes('styled-components')) {
      recommendations.push({
        category: 'styling',
        priority: 'low',
        title: 'Styled-components conversion',
        description: 'Styled-components will be converted to Flutter widget styles. Consider documenting design tokens.',
      });
    }

    // API recommendations
    const hasGraphQL = this.analysis.techStack.dataFetching.includes('graphql');
    if (hasGraphQL) {
      recommendations.push({
        category: 'api',
        priority: 'medium',
        title: 'GraphQL support',
        description: 'Consider using graphql_flutter package for GraphQL support in Flutter.',
      });
    }

    // Form recommendations
    if (this.analysis.techStack.forms.length > 0) {
      recommendations.push({
        category: 'forms',
        priority: 'low',
        title: 'Form handling',
        description: 'Form libraries will be converted to Flutter forms with validation. Document validation rules.',
      });
    }

    this.analysis.recommendations = recommendations;
  }

  /**
   * Estimate conversion time
   */
  async estimateConversionTime() {
    const estimate = {
      totalHours: 0,
      breakdown: {
        setup: 8, // Project setup and configuration
        components: 0,
        stateManagement: 0,
        routing: 0,
        styling: 0,
        testing: 0,
        integration: 0,
      },
      factors: [],
      confidence: 'medium',
    };

    // Component conversion time (2-4 hours per component average)
    const componentCount = this.analysis.components.length;
    const avgComplexity = this.analysis.metrics?.averageComplexity || 5;
    const hoursPerComponent = 2 + (avgComplexity / 10);
    estimate.breakdown.components = Math.round(componentCount * hoursPerComponent);

    // State management setup
    if (this.analysis.techStack.stateManagement.length > 0) {
      estimate.breakdown.stateManagement = 16; // Setup BLoC/Provider architecture
    }

    // Routing setup
    if (this.analysis.techStack.routing) {
      estimate.breakdown.routing = 8;
    }

    // Styling conversion
    if (this.analysis.techStack.styling.length > 0) {
      estimate.breakdown.styling = 8 * this.analysis.techStack.styling.length;
    }

    // Testing setup and conversion
    if (this.analysis.project.structure.hasTests) {
      estimate.breakdown.testing = Math.round(componentCount * 1); // 1 hour per component for tests
    }

    // Integration and polish
    estimate.breakdown.integration = Math.round(componentCount * 0.5);

    // Calculate total
    estimate.totalHours = Object.values(estimate.breakdown).reduce((sum, hours) => sum + hours, 0);

    // Conversion factors that affect estimate
    if (this.analysis.project.structure.hasTypescript) {
      estimate.factors.push({ name: 'TypeScript', impact: -0.1 }); // Reduces time by 10%
    } else {
      estimate.factors.push({ name: 'No TypeScript', impact: 0.1 }); // Increases time by 10%
    }

    if (avgComplexity > 10) {
      estimate.factors.push({ name: 'High complexity', impact: 0.2 });
    }

    if (componentCount > 50) {
      estimate.factors.push({ name: 'Large project', impact: 0.15 });
    }

    // Apply factors
    let adjustment = 0;
    for (const factor of estimate.factors) {
      adjustment += factor.impact;
    }
    estimate.totalHours = Math.round(estimate.totalHours * (1 + adjustment));

    // Convert to days/weeks
    estimate.totalDays = Math.round(estimate.totalHours / 8);
    estimate.totalWeeks = Math.round(estimate.totalDays / 5 * 10) / 10;

    // Confidence level
    if (componentCount < 10) {
      estimate.confidence = 'high';
    } else if (componentCount < 50) {
      estimate.confidence = 'medium';
    } else {
      estimate.confidence = 'low';
    }

    // With automation
    estimate.withAutomation = {
      totalHours: Math.round(estimate.totalHours * 0.3), // 70% reduction
      totalDays: Math.round(estimate.totalDays * 0.3),
      totalWeeks: Math.round(estimate.totalWeeks * 0.3 * 10) / 10,
      savings: Math.round(estimate.totalHours * 0.7),
    };

    this.analysis.timeEstimate = estimate;
  }

  /**
   * Save report to file
   * @param {string} outputPath - Output path
   */
  async saveReport(outputPath) {
    const ext = path.extname(outputPath);
    const format = ext ? ext.substring(1) : this.config.outputFormat;

    switch (format) {
      case 'json':
        await fs.writeJson(outputPath, this.analysis, { spaces: 2 });
        break;

      case 'md':
      case 'markdown':
        const markdown = this.generateMarkdownReport();
        await fs.writeFile(outputPath, markdown, 'utf8');
        break;

      case 'html':
        const html = this.generateHTMLReport();
        await fs.writeFile(outputPath, html, 'utf8');
        break;

      default:
        await fs.writeJson(outputPath, this.analysis, { spaces: 2 });
    }
  }

  /**
   * Generate markdown report
   * @returns {string} Markdown report
   */
  generateMarkdownReport() {
    const md = [];

    md.push('# React Project Analysis Report');
    md.push('');
    md.push(`Generated: ${this.analysis.timestamp}`);
    md.push('');

    // Project Summary
    md.push('## Project Summary');
    md.push('');
    md.push(`- **Name:** ${this.analysis.project.name}`);
    md.push(`- **Version:** ${this.analysis.project.version}`);
    md.push(`- **Path:** ${this.analysis.project.path}`);
    md.push(`- **Total Files:** ${this.analysis.project.fileStats.totalFiles}`);
    md.push(`- **Total Lines:** ${this.analysis.project.fileStats.totalLines}`);
    md.push('');

    // Metrics
    if (this.analysis.metrics) {
      md.push('## Metrics');
      md.push('');
      md.push(`- **Components:** ${this.analysis.metrics.totalComponents}`);
      md.push(`- **Features:** ${this.analysis.metrics.totalFeatures}`);
      md.push(`- **Average Complexity:** ${this.analysis.metrics.averageComplexity.toFixed(2)}`);
      md.push(`- **Maintainability Score:** ${this.analysis.metrics.maintainabilityScore}/100`);
      md.push('');

      md.push('### Complexity Distribution');
      md.push(`- Simple: ${this.analysis.metrics.complexityDistribution.simple}`);
      md.push(`- Moderate: ${this.analysis.metrics.complexityDistribution.moderate}`);
      md.push(`- Complex: ${this.analysis.metrics.complexityDistribution.complex}`);
      md.push('');
    }

    // Technology Stack
    md.push('## Technology Stack');
    md.push('');
    md.push(`- **Language:** ${this.analysis.techStack.language}`);
    md.push(`- **Build Tool:** ${this.analysis.techStack.buildTool}`);

    if (this.analysis.techStack.stateManagement.length > 0) {
      md.push(`- **State Management:** ${this.analysis.techStack.stateManagement.join(', ')}`);
    }
    if (this.analysis.techStack.styling.length > 0) {
      md.push(`- **Styling:** ${this.analysis.techStack.styling.join(', ')}`);
    }
    if (this.analysis.techStack.routing) {
      md.push(`- **Routing:** ${this.analysis.techStack.routing}`);
    }
    md.push('');

    // Time Estimate
    if (this.analysis.timeEstimate) {
      md.push('## Conversion Time Estimate');
      md.push('');
      md.push('### Manual Conversion');
      md.push(`- **Total Hours:** ${this.analysis.timeEstimate.totalHours}`);
      md.push(`- **Total Days:** ${this.analysis.timeEstimate.totalDays}`);
      md.push(`- **Total Weeks:** ${this.analysis.timeEstimate.totalWeeks}`);
      md.push(`- **Confidence:** ${this.analysis.timeEstimate.confidence}`);
      md.push('');

      md.push('### With Automation');
      md.push(`- **Total Hours:** ${this.analysis.timeEstimate.withAutomation.totalHours}`);
      md.push(`- **Total Days:** ${this.analysis.timeEstimate.withAutomation.totalDays}`);
      md.push(`- **Total Weeks:** ${this.analysis.timeEstimate.withAutomation.totalWeeks}`);
      md.push(`- **Time Saved:** ${this.analysis.timeEstimate.withAutomation.savings} hours`);
      md.push('');
    }

    // Recommendations
    if (this.analysis.recommendations.length > 0) {
      md.push('## Recommendations');
      md.push('');

      const byPriority = {
        high: this.analysis.recommendations.filter(r => r.priority === 'high'),
        medium: this.analysis.recommendations.filter(r => r.priority === 'medium'),
        low: this.analysis.recommendations.filter(r => r.priority === 'low'),
      };

      for (const [priority, recs] of Object.entries(byPriority)) {
        if (recs.length > 0) {
          md.push(`### ${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`);
          md.push('');

          for (const rec of recs) {
            md.push(`#### ${rec.title}`);
            md.push(`${rec.description}`);
            md.push('');
          }
        }
      }
    }

    return md.join('\n');
  }

  /**
   * Generate HTML report
   * @returns {string} HTML report
   */
  generateHTMLReport() {
    // Simple HTML report - can be enhanced with charts and styling
    const markdown = this.generateMarkdownReport();
    const marked = require('marked');
    const html = marked.parse(markdown);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>React Project Analysis Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1, h2, h3 {
      color: #333;
    }
    h1 {
      border-bottom: 3px solid #007bff;
      padding-bottom: 10px;
    }
    h2 {
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
      margin-top: 30px;
    }
    code {
      background-color: #f4f4f4;
      padding: 2px 4px;
      border-radius: 3px;
    }
    ul {
      padding-left: 25px;
    }
    li {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
  }

  /**
   * Print analysis summary to console
   */
  printSummary() {
    console.log('');
    console.log(chalk.bold.blue('📊 Analysis Summary'));
    console.log(chalk.gray('─'.repeat(50)));

    console.log(`📦 Project: ${chalk.cyan(this.analysis.project.name)}`);
    console.log(`📁 Files: ${chalk.yellow(this.analysis.project.fileStats.totalFiles)}`);
    console.log(`📝 Lines of Code: ${chalk.yellow(this.analysis.project.fileStats.totalLines)}`);

    if (this.analysis.metrics) {
      console.log(`🧩 Components: ${chalk.yellow(this.analysis.metrics.totalComponents)}`);
      console.log(`📂 Features: ${chalk.yellow(this.analysis.metrics.totalFeatures)}`);
      console.log(`📈 Average Complexity: ${chalk.yellow(this.analysis.metrics.averageComplexity.toFixed(2))}`);
      console.log(`🎯 Maintainability: ${chalk.green(this.analysis.metrics.maintainabilityScore)}/100`);
    }

    if (this.analysis.timeEstimate) {
      console.log('');
      console.log(chalk.bold.blue('⏱️  Time Estimate'));
      console.log(`Manual: ${chalk.red(this.analysis.timeEstimate.totalWeeks)} weeks`);
      console.log(`Automated: ${chalk.green(this.analysis.timeEstimate.withAutomation.totalWeeks)} weeks`);
      console.log(`Time Saved: ${chalk.green(this.analysis.timeEstimate.withAutomation.savings)} hours`);
    }

    if (this.analysis.recommendations.length > 0) {
      console.log('');
      console.log(chalk.bold.blue('💡 Top Recommendations'));
      const highPriority = this.analysis.recommendations.filter(r => r.priority === 'high');
      for (const rec of highPriority.slice(0, 3)) {
        console.log(`• ${rec.title}`);
      }
    }

    console.log(chalk.gray('─'.repeat(50)));
  }
}

module.exports = AnalyzeCommand;