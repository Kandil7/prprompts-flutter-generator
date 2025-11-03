/**
 * ProgressBar - Terminal progress bar visualization
 * Shows conversion progress with ETA and current file
 */

const readline = require('readline');

class ProgressBar {
  constructor(options = {}) {
    this.total = options.total || 100;
    this.current = 0;
    this.format = options.format || 'Progress... {bar} {percentage}% ({value}/{total})';
    this.barLength = options.barLength || 30;
    this.startTime = Date.now();
    this.updateInterval = options.updateInterval || 100; // ms
    this.lastUpdate = 0;
    this.stream = options.stream || process.stdout;
    this.clearOnComplete = options.clearOnComplete || false;
  }

  /**
   * Increment progress
   */
  increment(delta = 1) {
    this.current = Math.min(this.current + delta, this.total);
    this.render();
  }

  /**
   * Set progress to specific value
   */
  update(value, metadata = {}) {
    this.current = Math.min(value, this.total);
    this.metadata = metadata;
    this.render();
  }

  /**
   * Render progress bar
   */
  render() {
    // Throttle updates
    const now = Date.now();
    if (now - this.lastUpdate < this.updateInterval && this.current < this.total) {
      return;
    }
    this.lastUpdate = now;

    const percentage = Math.floor((this.current / this.total) * 100);
    const filled = Math.floor((this.current / this.total) * this.barLength);
    const empty = this.barLength - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);

    // Calculate ETA
    const elapsed = (now - this.startTime) / 1000;
    const rate = this.current / elapsed;
    const remaining = this.total - this.current;
    const eta = remaining > 0 ? Math.ceil(remaining / rate) : 0;

    // Format output
    let output = this.format
      .replace('{bar}', bar)
      .replace('{percentage}', percentage)
      .replace('{value}', this.current)
      .replace('{total}', this.total)
      .replace('{eta}', eta)
      .replace('{elapsed}', Math.floor(elapsed));

    // Add metadata if present
    if (this.metadata) {
      if (this.metadata.currentFile) {
        output += ` [${this.metadata.currentFile}]`;
      }
      if (this.metadata.status) {
        output += ` ${this.metadata.status}`;
      }
    }

    // Clear line and write
    if (this.stream.isTTY) {
      readline.clearLine(this.stream, 0);
      readline.cursorTo(this.stream, 0);
    }
    this.stream.write(output);
  }

  /**
   * Complete progress bar
   */
  complete(message) {
    this.current = this.total;
    this.render();

    if (this.clearOnComplete && this.stream.isTTY) {
      readline.clearLine(this.stream, 0);
      readline.cursorTo(this.stream, 0);
    } else {
      this.stream.write('\n');
    }

    if (message) {
      this.stream.write(message + '\n');
    }
  }

  /**
   * Stop progress bar
   */
  stop() {
    if (!this.clearOnComplete) {
      this.stream.write('\n');
    }
  }
}

/**
 * Spinner for indeterminate progress
 */
class Spinner {
  constructor(options = {}) {
    this.text = options.text || 'Loading...';
    this.frames = options.frames || ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.interval = options.interval || 80;
    this.stream = options.stream || process.stdout;
    this.frameIndex = 0;
    this.timer = null;
  }

  /**
   * Start spinner
   */
  start(text) {
    if (text) {
      this.text = text;
    }

    this.timer = setInterval(() => {
      const frame = this.frames[this.frameIndex];
      if (this.stream.isTTY) {
        readline.clearLine(this.stream, 0);
        readline.cursorTo(this.stream, 0);
      }
      this.stream.write(`${frame} ${this.text}`);
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }, this.interval);
  }

  /**
   * Update spinner text
   */
  update(text) {
    this.text = text;
  }

  /**
   * Stop spinner with success
   */
  succeed(message) {
    this.stop();
    this.stream.write(`✅ ${message || this.text}\n`);
  }

  /**
   * Stop spinner with failure
   */
  fail(message) {
    this.stop();
    this.stream.write(`❌ ${message || this.text}\n`);
  }

  /**
   * Stop spinner with warning
   */
  warn(message) {
    this.stop();
    this.stream.write(`⚠️  ${message || this.text}\n`);
  }

  /**
   * Stop spinner with info
   */
  info(message) {
    this.stop();
    this.stream.write(`ℹ️  ${message || this.text}\n`);
  }

  /**
   * Stop spinner
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.stream.isTTY) {
      readline.clearLine(this.stream, 0);
      readline.cursorTo(this.stream, 0);
    }
  }
}

/**
 * Multi-line progress tracker
 */
class MultiProgress {
  constructor() {
    this.bars = [];
    this.stream = process.stdout;
  }

  /**
   * Create a new progress bar
   */
  create(options) {
    const bar = new ProgressBar({
      ...options,
      stream: this.stream
    });
    this.bars.push(bar);
    return bar;
  }

  /**
   * Render all bars
   */
  render() {
    // Clear previous output
    this.stream.moveCursor(0, -this.bars.length);

    // Render each bar
    this.bars.forEach(bar => {
      bar.render();
      this.stream.write('\n');
    });
  }

  /**
   * Stop all bars
   */
  stop() {
    this.bars.forEach(bar => bar.stop());
  }
}

module.exports = ProgressBar;
module.exports.Spinner = Spinner;
module.exports.MultiProgress = MultiProgress;
