/**
 * PreviewCommand - Preview conversion changes for specific features
 *
 * Features:
 * - Feature-specific diff preview
 * - Unified diff format
 * - Color-coded changes
 * - Side-by-side comparison
 * - File tree view
 * - Change statistics
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const diff = require('diff');
const Table = require('cli-table3');
const inquirer = require('inquirer');

class PreviewCommand {
  constructor(config = {}) {
    this.config = {
      outputPath: config.outputPath,
      verbose: config.verbose || false,
      format: config.format || 'unified', // unified, split, stats
      context: config.context || 3, // Lines of context in diff
      colorize: config.colorize !== false,
      maxFileSize: config.maxFileSize || 1000000, // 1MB
      interactive: config.interactive || false,
    };

    this.diffs = [];
    this.stats = {
      filesChanged: 0,
      insertions: 0,
      deletions: 0,
      features: [],
    };
  }

  /**
   * Execute preview command
   * @param {string} feature - Feature name to preview
   * @param {string} outputPath - Flutter output path
   * @returns {Promise<Object>} Preview result
   */
  async execute(feature, outputPath) {
    this.config.outputPath = outputPath || this.config.outputPath;

    try {
      // Load conversion artifacts
      const artifactsPath = path.join(this.config.outputPath, '.prprompts/artifacts');

      if (!await fs.pathExists(artifactsPath)) {
        console.log(chalk.yellow('⚠️  No conversion artifacts found'));
        console.log(chalk.gray('Run "prprompts refactor" first to generate artifacts'));
        return { status: 'no_artifacts' };
      }

      // If no feature specified, show interactive selection
      if (!feature && this.config.interactive) {
        feature = await this.selectFeature(artifactsPath);
        if (!feature) {
          console.log(chalk.yellow('No feature selected'));
          return { status: 'cancelled' };
        }
      }

      // Load feature diffs
      const featurePath = path.join(artifactsPath, 'features', feature);

      if (!await fs.pathExists(featurePath)) {
        console.log(chalk.red(`❌ Feature "${feature}" not found`));
        await this.listAvailableFeatures(artifactsPath);
        return { status: 'not_found' };
      }

      // Load diff data
      await this.loadFeatureDiffs(featurePath);

      // Display based on format
      switch (this.config.format) {
        case 'split':
          await this.displaySplitView();
          break;

        case 'stats':
          this.displayStatistics();
          break;

        case 'unified':
        default:
          await this.displayUnifiedDiff();
          break;
      }

      // Interactive mode - ask what to do next
      if (this.config.interactive) {
        const action = await this.askForAction();
        return { status: 'success', action };
      }

      return {
        status: 'success',
        feature,
        stats: this.stats,
      };

    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      return {
        status: 'error',
        error: error.message,
      };
    }
  }

  /**
   * Select feature interactively
   * @param {string} artifactsPath - Artifacts directory path
   * @returns {Promise<string>} Selected feature
   */
  async selectFeature(artifactsPath) {
    const featuresPath = path.join(artifactsPath, 'features');

    if (!await fs.pathExists(featuresPath)) {
      return null;
    }

    const features = await fs.readdir(featuresPath);

    if (features.length === 0) {
      return null;
    }

    // Load feature metadata
    const featureChoices = [];

    for (const feature of features) {
      const metaPath = path.join(featuresPath, feature, 'meta.json');
      let meta = { components: 0, status: 'unknown' };

      if (await fs.pathExists(metaPath)) {
        meta = await fs.readJson(metaPath);
      }

      featureChoices.push({
        name: `${feature} (${meta.components} components) - ${meta.status}`,
        value: feature,
        short: feature,
      });
    }

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'feature',
        message: 'Select feature to preview:',
        choices: featureChoices,
        pageSize: 10,
      },
    ]);

    return answer.feature;
  }

  /**
   * List available features
   * @param {string} artifactsPath - Artifacts directory path
   */
  async listAvailableFeatures(artifactsPath) {
    const featuresPath = path.join(artifactsPath, 'features');

    if (!await fs.pathExists(featuresPath)) {
      console.log(chalk.gray('No features available'));
      return;
    }

    const features = await fs.readdir(featuresPath);

    if (features.length === 0) {
      console.log(chalk.gray('No features available'));
      return;
    }

    console.log(chalk.cyan('\nAvailable features:'));

    for (const feature of features) {
      const metaPath = path.join(featuresPath, feature, 'meta.json');

      if (await fs.pathExists(metaPath)) {
        const meta = await fs.readJson(metaPath);
        console.log(`  • ${chalk.yellow(feature)} - ${meta.components || 0} components`);
      } else {
        console.log(`  • ${chalk.yellow(feature)}`);
      }
    }
  }

  /**
   * Load feature diffs
   * @param {string} featurePath - Feature directory path
   */
  async loadFeatureDiffs(featurePath) {
    this.diffs = [];
    this.stats = {
      filesChanged: 0,
      insertions: 0,
      deletions: 0,
      features: [],
    };

    // Load all diff files
    const diffPath = path.join(featurePath, 'diffs');

    if (!await fs.pathExists(diffPath)) {
      throw new Error('No diffs found for this feature');
    }

    const diffFiles = await fs.readdir(diffPath);

    for (const file of diffFiles) {
      if (file.endsWith('.diff')) {
        const diffContent = await fs.readFile(path.join(diffPath, file), 'utf8');
        const parsedDiff = this.parseDiff(diffContent);

        this.diffs.push({
          file: file.replace('.diff', ''),
          content: diffContent,
          parsed: parsedDiff,
        });

        // Update statistics
        this.stats.filesChanged++;
        this.stats.insertions += parsedDiff.insertions;
        this.stats.deletions += parsedDiff.deletions;
      }
    }

    // Load feature metadata
    const metaPath = path.join(featurePath, 'meta.json');
    if (await fs.pathExists(metaPath)) {
      const meta = await fs.readJson(metaPath);
      this.stats.features = [meta];
    }
  }

  /**
   * Parse diff content
   * @param {string} diffContent - Diff content
   * @returns {Object} Parsed diff
   */
  parseDiff(diffContent) {
    const lines = diffContent.split('\n');
    let insertions = 0;
    let deletions = 0;
    const hunks = [];
    let currentHunk = null;

    for (const line of lines) {
      if (line.startsWith('@@')) {
        // New hunk
        const match = line.match(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@(.*)/);
        if (match) {
          currentHunk = {
            oldStart: parseInt(match[1]),
            oldLines: parseInt(match[2] || '1'),
            newStart: parseInt(match[3]),
            newLines: parseInt(match[4] || '1'),
            header: match[5] || '',
            lines: [],
          };
          hunks.push(currentHunk);
        }
      } else if (currentHunk) {
        if (line.startsWith('+') && !line.startsWith('+++')) {
          insertions++;
          currentHunk.lines.push({ type: 'add', content: line.substring(1) });
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          deletions++;
          currentHunk.lines.push({ type: 'delete', content: line.substring(1) });
        } else if (!line.startsWith('\\')) {
          currentHunk.lines.push({ type: 'context', content: line.substring(1) });
        }
      }
    }

    return {
      insertions,
      deletions,
      hunks,
      changes: insertions + deletions,
    };
  }

  /**
   * Display unified diff
   */
  async displayUnifiedDiff() {
    console.log(chalk.bold.blue('\n📄 Feature Preview - Unified Diff\n'));

    // Display statistics
    this.displayStatistics();

    // Display each file diff
    for (const fileDiff of this.diffs) {
      console.log(chalk.yellow(`\n${'─'.repeat(60)}`));
      console.log(chalk.cyan.bold(`File: ${fileDiff.file}`));
      console.log(chalk.yellow(`${'─'.repeat(60)}`));

      if (this.config.colorize) {
        this.displayColorizedDiff(fileDiff.content);
      } else {
        console.log(fileDiff.content);
      }
    }

    console.log(chalk.yellow(`\n${'═'.repeat(60)}\n`));
  }

  /**
   * Display colorized diff
   * @param {string} diffContent - Diff content
   */
  displayColorizedDiff(diffContent) {
    const lines = diffContent.split('\n');

    for (const line of lines) {
      if (line.startsWith('+++') || line.startsWith('---')) {
        console.log(chalk.gray(line));
      } else if (line.startsWith('@@')) {
        console.log(chalk.cyan(line));
      } else if (line.startsWith('+')) {
        console.log(chalk.green(line));
      } else if (line.startsWith('-')) {
        console.log(chalk.red(line));
      } else {
        console.log(line);
      }
    }
  }

  /**
   * Display split view (side-by-side)
   */
  async displaySplitView() {
    console.log(chalk.bold.blue('\n📄 Feature Preview - Split View\n'));

    // Display statistics
    this.displayStatistics();

    // Display each file in split view
    for (const fileDiff of this.diffs) {
      console.log(chalk.yellow(`\n${'─'.repeat(80)}`));
      console.log(chalk.cyan.bold(`File: ${fileDiff.file}`));
      console.log(chalk.yellow(`${'─'.repeat(80)}`));

      const table = new Table({
        head: [
          chalk.red('React (Original)'),
          chalk.green('Flutter (Converted)'),
        ],
        colWidths: [40, 40],
        wordWrap: true,
        wrapOnWordBoundary: false,
      });

      // Process hunks for split view
      for (const hunk of fileDiff.parsed.hunks) {
        const leftLines = [];
        const rightLines = [];

        for (const line of hunk.lines) {
          if (line.type === 'delete') {
            leftLines.push(chalk.red(`- ${line.content}`));
          } else if (line.type === 'add') {
            rightLines.push(chalk.green(`+ ${line.content}`));
          } else {
            leftLines.push(`  ${line.content}`);
            rightLines.push(`  ${line.content}`);
          }
        }

        // Pad shorter column
        const maxLength = Math.max(leftLines.length, rightLines.length);
        while (leftLines.length < maxLength) leftLines.push('');
        while (rightLines.length < maxLength) rightLines.push('');

        // Add rows to table
        for (let i = 0; i < maxLength; i++) {
          table.push([leftLines[i], rightLines[i]]);
        }
      }

      console.log(table.toString());
    }

    console.log(chalk.yellow(`\n${'═'.repeat(80)}\n`));
  }

  /**
   * Display statistics
   */
  displayStatistics() {
    const table = new Table({
      head: ['Metric', 'Value'],
      colWidths: [20, 15],
      style: {
        head: ['cyan'],
      },
    });

    table.push(
      ['Files Changed', this.stats.filesChanged],
      ['Insertions', chalk.green(`+${this.stats.insertions}`)],
      ['Deletions', chalk.red(`-${this.stats.deletions}`)],
      ['Total Changes', this.stats.insertions + this.stats.deletions],
    );

    console.log(chalk.bold('📊 Change Statistics'));
    console.log(table.toString());

    if (this.config.format === 'stats') {
      // Additional detailed statistics
      console.log(chalk.bold('\n📁 File Details'));

      const fileTable = new Table({
        head: ['File', 'Insertions', 'Deletions', 'Total'],
        colWidths: [30, 12, 12, 10],
        style: {
          head: ['cyan'],
        },
      });

      for (const fileDiff of this.diffs) {
        fileTable.push([
          fileDiff.file,
          chalk.green(`+${fileDiff.parsed.insertions}`),
          chalk.red(`-${fileDiff.parsed.deletions}`),
          fileDiff.parsed.changes,
        ]);
      }

      console.log(fileTable.toString());
    }
  }

  /**
   * Ask for action in interactive mode
   * @returns {Promise<string>} Selected action
   */
  async askForAction() {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Apply these changes', value: 'apply' },
          { name: 'Preview another feature', value: 'another' },
          { name: 'Save diff to file', value: 'save' },
          { name: 'Exit', value: 'exit' },
        ],
      },
    ]);

    if (answer.action === 'save') {
      await this.saveDiffToFile();
    }

    return answer.action;
  }

  /**
   * Save diff to file
   */
  async saveDiffToFile() {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'filename',
        message: 'Enter filename for diff:',
        default: `preview-${Date.now()}.diff`,
      },
    ]);

    const content = this.diffs.map(d => d.content).join('\n\n');
    await fs.writeFile(answer.filename, content, 'utf8');
    console.log(chalk.green(`✅ Diff saved to ${answer.filename}`));
  }

  /**
   * Generate HTML preview
   * @returns {string} HTML content
   */
  generateHTMLPreview() {
    const html = [`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Feature Preview</title>
  <style>
    body {
      font-family: monospace;
      margin: 20px;
      background: #1e1e1e;
      color: #d4d4d4;
    }
    .file {
      margin-bottom: 30px;
      border: 1px solid #444;
      border-radius: 5px;
      overflow: hidden;
    }
    .file-header {
      background: #2d2d2d;
      padding: 10px;
      font-weight: bold;
      color: #4ec9b0;
    }
    .diff {
      padding: 10px;
      overflow-x: auto;
    }
    .line {
      white-space: pre;
      font-family: 'Courier New', monospace;
    }
    .add {
      background: #1e3a1e;
      color: #4ec9b0;
    }
    .delete {
      background: #3a1e1e;
      color: #f48771;
    }
    .context {
      color: #808080;
    }
    .hunk-header {
      background: #2d2d2d;
      color: #569cd6;
      margin: 10px 0;
      padding: 5px;
    }
    .stats {
      background: #2d2d2d;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 5px;
    }
    .stats table {
      width: 100%;
      border-collapse: collapse;
    }
    .stats td {
      padding: 5px 10px;
      border-bottom: 1px solid #444;
    }
  </style>
</head>
<body>
  <h1>Feature Preview</h1>

  <div class="stats">
    <h2>Statistics</h2>
    <table>
      <tr><td>Files Changed</td><td>${this.stats.filesChanged}</td></tr>
      <tr><td>Insertions</td><td style="color: #4ec9b0">+${this.stats.insertions}</td></tr>
      <tr><td>Deletions</td><td style="color: #f48771">-${this.stats.deletions}</td></tr>
      <tr><td>Total Changes</td><td>${this.stats.insertions + this.stats.deletions}</td></tr>
    </table>
  </div>`];

    for (const fileDiff of this.diffs) {
      html.push(`
  <div class="file">
    <div class="file-header">${fileDiff.file}</div>
    <div class="diff">`);

      for (const hunk of fileDiff.parsed.hunks) {
        html.push(`<div class="hunk-header">@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@ ${hunk.header}</div>`);

        for (const line of hunk.lines) {
          const className = line.type === 'add' ? 'add' :
                           line.type === 'delete' ? 'delete' : 'context';
          const prefix = line.type === 'add' ? '+' :
                        line.type === 'delete' ? '-' : ' ';
          html.push(`<div class="line ${className}">${prefix}${this.escapeHtml(line.content)}</div>`);
        }
      }

      html.push(`
    </div>
  </div>`);
    }

    html.push(`
</body>
</html>`);

    return html.join('\n');
  }

  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };

    return text.replace(/[&<>"'/]/g, char => map[char]);
  }
}

module.exports = PreviewCommand;