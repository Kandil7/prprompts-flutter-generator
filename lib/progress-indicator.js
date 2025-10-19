#!/usr/bin/env node

/**
 * Progress Indicator for PRPROMPTS Flutter Generator
 * Provides visual progress bars and spinners for long-running operations
 * @version 4.1.0
 */

const process = require('process');

class ProgressIndicator {
  constructor(options = {}) {
    this.type = options.type || 'bar'; // bar, spinner, dots, steps
    this.total = options.total || 100;
    this.current = 0;
    this.message = options.message || 'Processing';
    this.width = options.width || 40;
    this.showPercentage = options.showPercentage !== false;
    this.showTime = options.showTime || false;
    this.startTime = Date.now();
    this.lastRenderTime = 0;
    this.renderInterval = options.renderInterval || 100;
    this.isComplete = false;
    this.stream = options.stream || process.stdout;

    // Spinner frames
    this.spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.spinnerIndex = 0;

    // Dots animation
    this.dotsFrames = ['.  ', '.. ', '...', '   '];
    this.dotsIndex = 0;

    // Color codes
    this.colors = {
      reset: '\x1b[0m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      red: '\x1b[31m',
      gray: '\x1b[90m',
      bold: '\x1b[1m'
    };

    // Steps for multi-step progress
    this.steps = options.steps || [];
    this.currentStep = 0;

    // Hide cursor for cleaner display
    this.hideCursor();
  }

  /**
   * Hide terminal cursor
   */
  hideCursor() {
    if (this.stream.isTTY) {
      this.stream.write('\x1b[?25l');
    }
  }

  /**
   * Show terminal cursor
   */
  showCursor() {
    if (this.stream.isTTY) {
      this.stream.write('\x1b[?25h');
    }
  }

  /**
   * Update progress
   */
  update(current, message) {
    this.current = Math.min(current, this.total);
    if (message) this.message = message;

    const now = Date.now();
    if (now - this.lastRenderTime >= this.renderInterval) {
      this.render();
      this.lastRenderTime = now;
    }

    if (this.current >= this.total && !this.isComplete) {
      this.complete();
    }
  }

  /**
   * Increment progress
   */
  increment(amount = 1, message) {
    this.update(this.current + amount, message);
  }

  /**
   * Render progress based on type
   */
  render() {
    if (!this.stream.isTTY) return;

    switch (this.type) {
      case 'bar':
        this.renderBar();
        break;
      case 'spinner':
        this.renderSpinner();
        break;
      case 'dots':
        this.renderDots();
        break;
      case 'steps':
        this.renderSteps();
        break;
      default:
        this.renderBar();
    }
  }

  /**
   * Render progress bar
   */
  renderBar() {
    const percentage = Math.round((this.current / this.total) * 100);
    const filled = Math.round((this.current / this.total) * this.width);
    const empty = this.width - filled;

    // Choose color based on percentage
    let color = this.colors.green;
    if (percentage < 33) color = this.colors.red;
    else if (percentage < 66) color = this.colors.yellow;

    // Build progress bar
    let bar = color;
    bar += '█'.repeat(filled);
    bar += this.colors.gray;
    bar += '░'.repeat(empty);
    bar += this.colors.reset;

    // Build line
    let line = '\r';
    line += `${this.message}: `;
    line += `[${bar}]`;

    if (this.showPercentage) {
      line += ` ${percentage}%`;
    }

    if (this.showTime) {
      const elapsed = this.getElapsedTime();
      const eta = this.getETA();
      line += ` ${elapsed}`;
      if (eta && percentage < 100) {
        line += ` / ETA: ${eta}`;
      }
    }

    // Clear line and write
    this.stream.write('\x1b[K' + line);
  }

  /**
   * Render spinner
   */
  renderSpinner() {
    this.spinnerIndex = (this.spinnerIndex + 1) % this.spinnerFrames.length;
    const spinner = this.spinnerFrames[this.spinnerIndex];

    let line = '\r';
    line += `${this.colors.blue}${spinner}${this.colors.reset} `;
    line += this.message;

    if (this.showPercentage && this.total > 0) {
      const percentage = Math.round((this.current / this.total) * 100);
      line += ` ${percentage}%`;
    }

    if (this.showTime) {
      const elapsed = this.getElapsedTime();
      line += ` ${this.colors.gray}(${elapsed})${this.colors.reset}`;
    }

    this.stream.write('\x1b[K' + line);
  }

  /**
   * Render dots animation
   */
  renderDots() {
    this.dotsIndex = (this.dotsIndex + 1) % this.dotsFrames.length;
    const dots = this.dotsFrames[this.dotsIndex];

    let line = '\r';
    line += `${this.message}${dots}`;

    if (this.showPercentage && this.total > 0) {
      const percentage = Math.round((this.current / this.total) * 100);
      line += ` ${percentage}%`;
    }

    this.stream.write('\x1b[K' + line);
  }

  /**
   * Render steps progress
   */
  renderSteps() {
    if (this.steps.length === 0) return;

    // Clear previous output
    this.stream.write('\x1b[2K\r');

    // Calculate which step we're on
    const stepSize = this.total / this.steps.length;
    this.currentStep = Math.floor(this.current / stepSize);

    // Render steps
    this.steps.forEach((step, index) => {
      let symbol, color;

      if (index < this.currentStep) {
        symbol = '✓';
        color = this.colors.green;
      } else if (index === this.currentStep) {
        symbol = '→';
        color = this.colors.blue;
      } else {
        symbol = '○';
        color = this.colors.gray;
      }

      const line = `${color}${symbol}${this.colors.reset} ${step}\n`;
      this.stream.write(line);
    });

    // Move cursor up to overwrite on next render
    this.stream.write(`\x1b[${this.steps.length}A`);
  }

  /**
   * Get elapsed time
   */
  getElapsedTime() {
    const elapsed = Date.now() - this.startTime;
    return this.formatTime(elapsed);
  }

  /**
   * Get ETA
   */
  getETA() {
    if (this.current === 0) return null;

    const elapsed = Date.now() - this.startTime;
    const rate = this.current / elapsed;
    const remaining = this.total - this.current;
    const eta = remaining / rate;

    return this.formatTime(eta);
  }

  /**
   * Format time in human readable format
   */
  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);

    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Complete the progress
   */
  complete(message) {
    this.isComplete = true;
    this.current = this.total;

    if (message) this.message = message;

    // Final render
    if (this.type === 'steps') {
      this.currentStep = this.steps.length;
      this.renderSteps();
      this.stream.write('\n');
    } else {
      this.render();
      this.stream.write('\n');
    }

    // Show cursor again
    this.showCursor();
  }

  /**
   * Clear the progress display
   */
  clear() {
    if (this.stream.isTTY) {
      if (this.type === 'steps') {
        for (let i = 0; i < this.steps.length; i++) {
          this.stream.write('\x1b[2K\x1b[1A');
        }
        this.stream.write('\x1b[2K\r');
      } else {
        this.stream.write('\x1b[2K\r');
      }
    }
    this.showCursor();
  }

  /**
   * Stop the progress indicator
   */
  stop() {
    this.clear();
    this.showCursor();
  }
}

/**
 * Create a simple progress bar
 */
function createProgressBar(total, message, options = {}) {
  return new ProgressIndicator({
    type: 'bar',
    total,
    message,
    ...options
  });
}

/**
 * Create a spinner
 */
function createSpinner(message, options = {}) {
  return new ProgressIndicator({
    type: 'spinner',
    message,
    ...options
  });
}

/**
 * Create a dots animation
 */
function createDots(message, options = {}) {
  return new ProgressIndicator({
    type: 'dots',
    message,
    ...options
  });
}

/**
 * Create a steps progress
 */
function createSteps(steps, options = {}) {
  return new ProgressIndicator({
    type: 'steps',
    steps,
    total: steps.length * 100,
    ...options
  });
}

/**
 * Demo/test the progress indicators
 */
async function demo() {
  console.log('Progress Indicator Demo\n');

  // Progress bar demo
  console.log('1. Progress Bar:');
  const bar = createProgressBar(100, 'Downloading', {
    showTime: true,
    showPercentage: true
  });

  for (let i = 0; i <= 100; i++) {
    bar.update(i);
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('\n2. Spinner:');
  const spinner = createSpinner('Loading data', { showTime: true });

  for (let i = 0; i <= 30; i++) {
    spinner.update(i, `Loading data (${i}/30)`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  spinner.complete('Data loaded!');

  console.log('\n3. Dots Animation:');
  const dots = createDots('Connecting');

  for (let i = 0; i <= 20; i++) {
    dots.update(i);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  dots.complete('Connected!');

  console.log('\n4. Steps Progress:');
  const steps = createSteps([
    'Initialize project',
    'Install dependencies',
    'Generate PRPROMPTS',
    'Bootstrap structure',
    'Run tests'
  ]);

  for (let i = 0; i <= 500; i += 10) {
    steps.update(i);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n5. Multiple Progress Bars:');
  const bars = [
    createProgressBar(100, 'File 1', { width: 30 }),
    createProgressBar(100, 'File 2', { width: 30 }),
    createProgressBar(100, 'File 3', { width: 30 })
  ];

  // Simulate parallel progress
  const progress = [0, 0, 0];
  while (progress.some(p => p < 100)) {
    for (let i = 0; i < 3; i++) {
      if (progress[i] < 100) {
        progress[i] += Math.random() * 10;
        progress[i] = Math.min(progress[i], 100);
        bars[i].update(progress[i]);
        if (i < 2) console.log(''); // Move to next line
      }
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    // Move cursor up for next update
    process.stdout.write('\x1b[2A');
  }
  console.log(''); // Final newline

  console.log('\nDemo complete!');
}

// Run demo if called directly
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args[0] === 'demo') {
    demo().catch(console.error);
  } else {
    console.log(`Progress Indicator for PRPROMPTS

Usage:
  node progress-indicator.js demo    # Run interactive demo

In your code:
  const { createProgressBar, createSpinner } = require('./progress-indicator');

  // Progress bar
  const progress = createProgressBar(100, 'Processing');
  progress.update(50);

  // Spinner
  const spinner = createSpinner('Loading');
  spinner.complete('Done!');
`);
  }
}

module.exports = {
  ProgressIndicator,
  createProgressBar,
  createSpinner,
  createDots,
  createSteps
};