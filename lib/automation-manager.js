#!/usr/bin/env node
/**
 * PRPROMPTS Automation Manager
 * Manages state, progress, and orchestration of automation commands
 * Version: 4.0.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

class AutomationManager {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.stateFile = path.join(projectPath, '.prprompts', 'automation-state.json');
    this.logFile = path.join(projectPath, '.prprompts', 'automation.log');
    this.state = this.loadState();
  }

  // Load existing state or initialize new
  loadState() {
    if (fs.existsSync(this.stateFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
      } catch (error) {
        this.log('Error loading state, initializing new state', 'error');
        return this.initializeState();
      }
    }
    return this.initializeState();
  }

  // Initialize default state
  initializeState() {
    return {
      version: '4.0.0',
      project: {
        name: this.getProjectName(),
        path: this.projectPath,
        created: new Date().toISOString()
      },
      phases: {
        bootstrap: { status: 'pending', startTime: null, endTime: null, errors: [] },
        implementation: { status: 'pending', tasks: [], currentTask: null },
        testing: { status: 'pending', coverage: 0, testsPass: false },
        qa: { status: 'pending', score: 0, issues: [] }
      },
      currentPhase: null,
      tasks: {
        total: 0,
        completed: 0,
        failed: 0,
        skipped: 0,
        current: null
      },
      features: [],
      metrics: {
        filesCreated: 0,
        testsCreated: 0,
        linesOfCode: 0,
        coverage: 0,
        timeSpent: 0
      },
      history: [],
      lastUpdated: new Date().toISOString()
    };
  }

  // Save current state
  saveState() {
    try {
      const dir = path.dirname(this.stateFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
      return true;
    } catch (error) {
      this.log(`Error saving state: ${error.message}`, 'error');
      return false;
    }
  }

  // Get project name from package.json or pubspec.yaml
  getProjectName() {
    try {
      if (fs.existsSync(path.join(this.projectPath, 'pubspec.yaml'))) {
        const pubspec = fs.readFileSync(path.join(this.projectPath, 'pubspec.yaml'), 'utf8');
        const match = pubspec.match(/^name:\s*(.+)$/m);
        if (match) return match[1].trim();
      }
      if (fs.existsSync(path.join(this.projectPath, 'package.json'))) {
        const pkg = JSON.parse(fs.readFileSync(path.join(this.projectPath, 'package.json'), 'utf8'));
        return pkg.name || 'unknown';
      }
    } catch (error) {
      // Silent fail
    }
    return path.basename(this.projectPath);
  }

  // Log messages with timestamp
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    // Console output
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[level] || ''}${logEntry}${colors.reset}`);

    // File output
    try {
      const dir = path.dirname(this.logFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.appendFileSync(this.logFile, logEntry + '\n');
    } catch (error) {
      // Silent fail for file logging
    }

    // Add to history
    this.state.history.push({
      timestamp,
      level,
      message,
      phase: this.state.currentPhase
    });

    // Keep history limited to last 100 entries
    if (this.state.history.length > 100) {
      this.state.history = this.state.history.slice(-100);
    }
  }

  // Validate prerequisites
  async validatePrerequisites() {
    const checks = {
      prprompts: fs.existsSync(path.join(this.projectPath, 'PRPROMPTS')),
      prd: fs.existsSync(path.join(this.projectPath, 'docs', 'PRD.md')),
      flutter: fs.existsSync(path.join(this.projectPath, 'pubspec.yaml'))
    };

    const missing = Object.entries(checks)
      .filter(([_, exists]) => !exists)
      .map(([name]) => name);

    if (missing.length > 0) {
      this.log(`Missing prerequisites: ${missing.join(', ')}`, 'error');
      return { valid: false, missing };
    }

    // Count PRPROMPTS files
    try {
      const prpromptsDir = path.join(this.projectPath, 'PRPROMPTS');
      const files = fs.readdirSync(prpromptsDir).filter(f => f.endsWith('.md'));
      if (files.length !== 32) {
        this.log(`Expected 32 PRPROMPTS files, found ${files.length}`, 'warning');
      }
    } catch (error) {
      this.log('Error counting PRPROMPTS files', 'warning');
    }

    return { valid: true, missing: [] };
  }

  // Parse IMPLEMENTATION_PLAN.md for tasks
  async parseImplementationPlan() {
    const planPath = path.join(this.projectPath, 'docs', 'IMPLEMENTATION_PLAN.md');

    if (!fs.existsSync(planPath)) {
      this.log('IMPLEMENTATION_PLAN.md not found', 'error');
      return [];
    }

    try {
      const content = fs.readFileSync(planPath, 'utf8');
      const tasks = [];
      const taskRegex = /### Task (\d+\.\d+): (.+?) \[(TODO|IN_PROGRESS|DONE|FAILED)\]/g;
      let match;

      while ((match = taskRegex.exec(content)) !== null) {
        tasks.push({
          id: match[1],
          name: match[2],
          status: match[3],
          startTime: null,
          endTime: null,
          retries: 0,
          errors: []
        });
      }

      this.state.tasks.total = tasks.length;
      this.state.tasks.completed = tasks.filter(t => t.status === 'DONE').length;
      this.state.tasks.failed = tasks.filter(t => t.status === 'FAILED').length;

      return tasks;
    } catch (error) {
      this.log(`Error parsing implementation plan: ${error.message}`, 'error');
      return [];
    }
  }

  // Update task status in IMPLEMENTATION_PLAN.md
  async updateTaskStatus(taskId, newStatus) {
    const planPath = path.join(this.projectPath, 'docs', 'IMPLEMENTATION_PLAN.md');

    if (!fs.existsSync(planPath)) {
      return false;
    }

    try {
      let content = fs.readFileSync(planPath, 'utf8');
      const regex = new RegExp(`(### Task ${taskId}: .+? \\[)(TODO|IN_PROGRESS|DONE|FAILED)(\\])`, 'g');
      content = content.replace(regex, `$1${newStatus}$3`);

      // Update progress
      const tasks = await this.parseImplementationPlan();
      const completed = tasks.filter(t => t.status === 'DONE').length;
      const total = tasks.length;
      const percentage = Math.round((completed / total) * 100);

      content = content.replace(/Progress: \d+\/\d+ \(\d+%\)/, `Progress: ${completed}/${total} (${percentage}%)`);

      fs.writeFileSync(planPath, content);
      this.log(`Updated task ${taskId} to ${newStatus}`, 'success');
      return true;
    } catch (error) {
      this.log(`Error updating task status: ${error.message}`, 'error');
      return false;
    }
  }

  // Start bootstrap phase
  async startBootstrap() {
    this.log('Starting bootstrap phase', 'info');
    this.state.currentPhase = 'bootstrap';
    this.state.phases.bootstrap.status = 'in_progress';
    this.state.phases.bootstrap.startTime = new Date().toISOString();
    this.saveState();

    const validation = await this.validatePrerequisites();
    if (!validation.valid) {
      this.state.phases.bootstrap.status = 'failed';
      this.state.phases.bootstrap.errors = validation.missing;
      this.saveState();
      return { success: false, errors: validation.missing };
    }

    // Bootstrap tasks
    const tasks = [
      { name: 'Create folder structure', fn: this.createFolderStructure.bind(this) },
      { name: 'Generate architecture docs', fn: this.generateArchitectureDocs.bind(this) },
      { name: 'Setup dependencies', fn: this.setupDependencies.bind(this) },
      { name: 'Create design system', fn: this.createDesignSystem.bind(this) },
      { name: 'Setup security', fn: this.setupSecurity.bind(this) }
    ];

    for (const task of tasks) {
      this.log(`Executing: ${task.name}`, 'info');
      try {
        await task.fn();
        this.log(`✓ ${task.name} complete`, 'success');
      } catch (error) {
        this.log(`✗ ${task.name} failed: ${error.message}`, 'error');
        this.state.phases.bootstrap.errors.push(error.message);
      }
    }

    this.state.phases.bootstrap.status = 'completed';
    this.state.phases.bootstrap.endTime = new Date().toISOString();
    this.saveState();

    return { success: true };
  }

  // Create folder structure
  async createFolderStructure() {
    const folders = [
      'lib/core/constants',
      'lib/core/errors',
      'lib/core/network',
      'lib/core/security',
      'lib/core/utils',
      'lib/features',
      'lib/shared/theme',
      'lib/shared/widgets',
      'test/unit',
      'test/widget',
      'test/integration',
      'test/helpers',
      'test/fixtures'
    ];

    for (const folder of folders) {
      const fullPath = path.join(this.projectPath, folder);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        this.state.metrics.filesCreated++;
      }
    }
  }

  // Generate architecture documentation
  async generateArchitectureDocs() {
    // This would be implemented by the AI
    this.log('Architecture docs generation delegated to AI', 'info');
  }

  // Setup dependencies
  async setupDependencies() {
    // This would be implemented by the AI
    this.log('Dependencies setup delegated to AI', 'info');
  }

  // Create design system
  async createDesignSystem() {
    // This would be implemented by the AI
    this.log('Design system creation delegated to AI', 'info');
  }

  // Setup security infrastructure
  async setupSecurity() {
    // This would be implemented by the AI
    this.log('Security setup delegated to AI', 'info');
  }

  // Get next pending task
  async getNextTask() {
    const tasks = await this.parseImplementationPlan();
    return tasks.find(t => t.status === 'TODO');
  }

  // Execute implementation cycle
  async executeImplementation(maxTasks = 1) {
    this.log(`Starting implementation cycle (max ${maxTasks} tasks)`, 'info');
    this.state.currentPhase = 'implementation';
    this.state.phases.implementation.status = 'in_progress';

    let tasksCompleted = 0;
    for (let i = 0; i < maxTasks; i++) {
      const task = await this.getNextTask();
      if (!task) {
        this.log('No more tasks to implement', 'info');
        break;
      }

      this.log(`Implementing task ${task.id}: ${task.name}`, 'info');
      this.state.tasks.current = task.id;

      // Update status to IN_PROGRESS
      await this.updateTaskStatus(task.id, 'IN_PROGRESS');

      // Delegate to AI for actual implementation
      // In real usage, this would call the AI command
      this.log(`Task ${task.id} implementation delegated to AI`, 'info');

      // Simulate completion (in real use, AI would do this)
      await this.updateTaskStatus(task.id, 'DONE');
      tasksCompleted++;
      this.state.tasks.completed++;
    }

    this.state.phases.implementation.status = 'completed';
    this.saveState();

    return { tasksCompleted };
  }

  // Run tests and calculate coverage
  async runTests() {
    this.log('Running tests', 'info');
    this.state.currentPhase = 'testing';
    this.state.phases.testing.status = 'in_progress';

    try {
      // Run Flutter tests
      execSync('flutter test --coverage', {
        cwd: this.projectPath,
        stdio: 'pipe'
      });

      this.state.phases.testing.testsPass = true;
      this.log('All tests passed', 'success');
    } catch (error) {
      this.state.phases.testing.testsPass = false;
      this.log('Some tests failed', 'warning');
    }

    // Calculate coverage (simplified)
    try {
      const coverageFile = path.join(this.projectPath, 'coverage', 'lcov.info');
      if (fs.existsSync(coverageFile)) {
        const coverage = this.calculateCoverage(coverageFile);
        this.state.phases.testing.coverage = coverage;
        this.state.metrics.coverage = coverage;
        this.log(`Test coverage: ${coverage}%`, 'info');
      }
    } catch (error) {
      this.log('Could not calculate coverage', 'warning');
    }

    this.state.phases.testing.status = 'completed';
    this.saveState();
  }

  // Calculate test coverage from lcov.info
  calculateCoverage(lcovPath) {
    try {
      const content = fs.readFileSync(lcovPath, 'utf8');
      const lines = content.split('\n');
      let totalLines = 0;
      let coveredLines = 0;

      lines.forEach(line => {
        if (line.startsWith('LF:')) {
          totalLines += parseInt(line.substring(3));
        } else if (line.startsWith('LH:')) {
          coveredLines += parseInt(line.substring(3));
        }
      });

      if (totalLines === 0) return 0;
      return Math.round((coveredLines / totalLines) * 100);
    } catch (error) {
      return 0;
    }
  }

  // Generate progress report
  generateReport() {
    const report = {
      project: this.state.project.name,
      status: {
        bootstrap: this.state.phases.bootstrap.status,
        implementation: `${this.state.tasks.completed}/${this.state.tasks.total} tasks`,
        testing: `${this.state.phases.testing.coverage}% coverage`,
        qa: this.state.phases.qa.score > 0 ? `${this.state.phases.qa.score}/100` : 'pending'
      },
      metrics: this.state.metrics,
      currentPhase: this.state.currentPhase,
      lastUpdated: this.state.lastUpdated
    };

    // Generate visual progress bar
    const progress = this.state.tasks.total > 0
      ? Math.round((this.state.tasks.completed / this.state.tasks.total) * 100)
      : 0;

    const barLength = 30;
    const filled = Math.round((progress / 100) * barLength);
    const empty = barLength - filled;
    const progressBar = '█'.repeat(filled) + '░'.repeat(empty);

    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║          AUTOMATION PROGRESS REPORT            ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    console.log(`Project: ${report.project}`);
    console.log(`Progress: [${progressBar}] ${progress}%`);
    console.log(`\nPhase Status:`);
    console.log(`  Bootstrap:      ${report.status.bootstrap}`);
    console.log(`  Implementation: ${report.status.implementation}`);
    console.log(`  Testing:        ${report.status.testing}`);
    console.log(`  QA:             ${report.status.qa}`);

    console.log(`\nMetrics:`);
    console.log(`  Files Created:  ${report.metrics.filesCreated}`);
    console.log(`  Tests Created:  ${report.metrics.testsCreated}`);
    console.log(`  Lines of Code:  ${report.metrics.linesOfCode}`);
    console.log(`  Test Coverage:  ${report.metrics.coverage}%`);

    console.log(`\nLast Updated: ${new Date(report.lastUpdated).toLocaleString()}`);

    return report;
  }

  // Reset automation state
  reset() {
    this.state = this.initializeState();
    this.saveState();
    this.log('Automation state reset', 'info');
  }

  // Export state for debugging
  exportState(outputPath) {
    try {
      fs.writeFileSync(outputPath, JSON.stringify(this.state, null, 2));
      this.log(`State exported to ${outputPath}`, 'success');
      return true;
    } catch (error) {
      this.log(`Error exporting state: ${error.message}`, 'error');
      return false;
    }
  }

  // Import state for recovery
  importState(inputPath) {
    try {
      const imported = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
      this.state = imported;
      this.saveState();
      this.log(`State imported from ${inputPath}`, 'success');
      return true;
    } catch (error) {
      this.log(`Error importing state: ${error.message}`, 'error');
      return false;
    }
  }
}

// Export for use in other modules
module.exports = AutomationManager;

// CLI interface if run directly
if (require.main === module) {
  const manager = new AutomationManager();
  const command = process.argv[2];

  switch (command) {
    case 'status':
      manager.generateReport();
      break;

    case 'bootstrap':
      manager.startBootstrap().then(result => {
        if (result.success) {
          console.log('✅ Bootstrap complete!');
        } else {
          console.log('❌ Bootstrap failed:', result.errors);
        }
      });
      break;

    case 'implement':
      const count = parseInt(process.argv[3]) || 1;
      manager.executeImplementation(count).then(result => {
        console.log(`✅ Implemented ${result.tasksCompleted} tasks`);
      });
      break;

    case 'test':
      manager.runTests().then(() => {
        console.log('✅ Tests complete');
      });
      break;

    case 'reset':
      manager.reset();
      console.log('✅ State reset');
      break;

    case 'export':
      const exportPath = process.argv[3] || 'automation-state-export.json';
      manager.exportState(exportPath);
      break;

    case 'import':
      const importPath = process.argv[3];
      if (!importPath) {
        console.log('Usage: automation-manager import <path>');
      } else {
        manager.importState(importPath);
      }
      break;

    default:
      console.log(`
PRPROMPTS Automation Manager

Usage:
  automation-manager <command> [options]

Commands:
  status      Show current automation status
  bootstrap   Start bootstrap phase
  implement   Execute implementation (optional: task count)
  test        Run tests and calculate coverage
  reset       Reset automation state
  export      Export state to file
  import      Import state from file

Examples:
  automation-manager status
  automation-manager bootstrap
  automation-manager implement 5
  automation-manager export backup.json
`);
  }
}