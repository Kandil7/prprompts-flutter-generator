/**
 * logger.js
 * Logging utility with debug, info, warn, error levels
 *
 * Provides structured logging for the React to Flutter refactoring process
 */

const fs = require('fs');
const path = require('path');

/**
 * Log levels
 * @enum {number}
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4,
};

/**
 * Log level names
 * @type {Object}
 */
const LogLevelNames = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.SILENT]: 'SILENT',
};

/**
 * ANSI color codes for terminal output
 */
const Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

/**
 * Logger class with configurable levels and output
 */
class Logger {
  /**
   * @param {Object} options
   * @param {number} [options.level=LogLevel.INFO] - Minimum log level
   * @param {boolean} [options.timestamp=true] - Include timestamps
   * @param {boolean} [options.colorize=true] - Colorize output
   * @param {string} [options.prefix=''] - Log prefix
   * @param {string} [options.logFile=null] - Log file path (null = no file logging)
   * @param {boolean} [options.appendToFile=true] - Append to log file
   */
  constructor({
    level = LogLevel.INFO,
    timestamp = true,
    colorize = true,
    prefix = '',
    logFile = null,
    appendToFile = true,
  } = {}) {
    this.level = level;
    this.timestamp = timestamp;
    this.colorize = colorize && this._supportsColor();
    this.prefix = prefix;
    this.logFile = logFile;
    this.appendToFile = appendToFile;

    // Initialize log file if specified
    if (this.logFile && !this.appendToFile) {
      this._initLogFile();
    }
  }

  /**
   * Check if terminal supports colors
   * @returns {boolean}
   * @private
   */
  _supportsColor() {
    // Check if running in a TTY
    if (!process.stdout.isTTY) {
      return false;
    }

    // Check environment variables
    if (process.env.NO_COLOR || process.env.NODE_DISABLE_COLORS) {
      return false;
    }

    return true;
  }

  /**
   * Initialize log file (clear existing content)
   * @private
   */
  _initLogFile() {
    try {
      const dir = path.dirname(this.logFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.logFile, '', 'utf8');
    } catch (error) {
      console.error(`Failed to initialize log file: ${error.message}`);
    }
  }

  /**
   * Format timestamp
   * @returns {string}
   * @private
   */
  _getTimestamp() {
    const now = new Date();
    return now.toISOString();
  }

  /**
   * Colorize text
   * @param {string} text
   * @param {string} color
   * @returns {string}
   * @private
   */
  _colorize(text, color) {
    if (!this.colorize) return text;
    return `${color}${text}${Colors.reset}`;
  }

  /**
   * Format log message
   * @param {number} level
   * @param {string} message
   * @param {Object} metadata
   * @returns {string}
   * @private
   */
  _formatMessage(level, message, metadata = {}) {
    const parts = [];

    // Timestamp
    if (this.timestamp) {
      const ts = this._colorize(this._getTimestamp(), Colors.dim);
      parts.push(`[${ts}]`);
    }

    // Log level
    const levelName = LogLevelNames[level];
    let levelColor = Colors.white;

    switch (level) {
      case LogLevel.DEBUG:
        levelColor = Colors.cyan;
        break;
      case LogLevel.INFO:
        levelColor = Colors.green;
        break;
      case LogLevel.WARN:
        levelColor = Colors.yellow;
        break;
      case LogLevel.ERROR:
        levelColor = Colors.red;
        break;
    }

    parts.push(this._colorize(`[${levelName}]`, levelColor));

    // Prefix
    if (this.prefix) {
      parts.push(`[${this.prefix}]`);
    }

    // Message
    parts.push(message);

    // Metadata
    if (Object.keys(metadata).length > 0) {
      parts.push(JSON.stringify(metadata, null, 2));
    }

    return parts.join(' ');
  }

  /**
   * Write log to console and file
   * @param {number} level
   * @param {string} message
   * @param {Object} metadata
   * @private
   */
  _log(level, message, metadata = {}) {
    // Check if should log
    if (level < this.level) {
      return;
    }

    const formattedMessage = this._formatMessage(level, message, metadata);

    // Console output
    if (level === LogLevel.ERROR) {
      console.error(formattedMessage);
    } else {
      console.log(formattedMessage);
    }

    // File output (without colors)
    if (this.logFile) {
      this._writeToFile(level, message, metadata);
    }
  }

  /**
   * Write to log file
   * @param {number} level
   * @param {string} message
   * @param {Object} metadata
   * @private
   */
  _writeToFile(level, message, metadata) {
    try {
      const timestamp = this._getTimestamp();
      const levelName = LogLevelNames[level];
      const prefix = this.prefix ? `[${this.prefix}]` : '';
      const metadataStr = Object.keys(metadata).length > 0 ?
        ` ${JSON.stringify(metadata)}` : '';

      const logLine = `[${timestamp}] [${levelName}] ${prefix} ${message}${metadataStr}\n`;

      fs.appendFileSync(this.logFile, logLine, 'utf8');
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }

  /**
   * Set log level
   * @param {number} level
   */
  setLevel(level) {
    this.level = level;
  }

  /**
   * Enable/disable colors
   * @param {boolean} enabled
   */
  setColorize(enabled) {
    this.colorize = enabled && this._supportsColor();
  }

  /**
   * Set log prefix
   * @param {string} prefix
   */
  setPrefix(prefix) {
    this.prefix = prefix;
  }

  /**
   * Log debug message
   * @param {string} message
   * @param {Object} [metadata={}]
   */
  debug(message, metadata = {}) {
    this._log(LogLevel.DEBUG, message, metadata);
  }

  /**
   * Log info message
   * @param {string} message
   * @param {Object} [metadata={}]
   */
  info(message, metadata = {}) {
    this._log(LogLevel.INFO, message, metadata);
  }

  /**
   * Log warning message
   * @param {string} message
   * @param {Object} [metadata={}]
   */
  warn(message, metadata = {}) {
    this._log(LogLevel.WARN, message, metadata);
  }

  /**
   * Log error message
   * @param {string} message
   * @param {Object} [metadata={}]
   */
  error(message, metadata = {}) {
    this._log(LogLevel.ERROR, message, metadata);
  }

  /**
   * Log with custom level
   * @param {number} level
   * @param {string} message
   * @param {Object} [metadata={}]
   */
  log(level, message, metadata = {}) {
    this._log(level, message, metadata);
  }

  /**
   * Create a child logger with additional prefix
   * @param {string} childPrefix
   * @returns {Logger}
   */
  child(childPrefix) {
    return new Logger({
      level: this.level,
      timestamp: this.timestamp,
      colorize: this.colorize,
      prefix: this.prefix ? `${this.prefix}:${childPrefix}` : childPrefix,
      logFile: this.logFile,
      appendToFile: true,
    });
  }

  /**
   * Log a separator line
   * @param {string} [char='-']
   * @param {number} [length=80]
   */
  separator(char = '-', length = 80) {
    const line = char.repeat(length);
    this.info(line);
  }

  /**
   * Log a section header
   * @param {string} title
   */
  section(title) {
    this.separator('=', 80);
    this.info(this._colorize(title, Colors.bright));
    this.separator('=', 80);
  }

  /**
   * Log success message (green)
   * @param {string} message
   * @param {Object} [metadata={}]
   */
  success(message, metadata = {}) {
    const successMsg = this._colorize(`✓ ${message}`, Colors.green);
    this._log(LogLevel.INFO, successMsg, metadata);
  }

  /**
   * Log failure message (red)
   * @param {string} message
   * @param {Object} [metadata={}]
   */
  failure(message, metadata = {}) {
    const failureMsg = this._colorize(`✗ ${message}`, Colors.red);
    this._log(LogLevel.ERROR, failureMsg, metadata);
  }

  /**
   * Start a timer
   * @param {string} label
   */
  time(label) {
    console.time(label);
  }

  /**
   * End a timer
   * @param {string} label
   */
  timeEnd(label) {
    console.timeEnd(label);
  }

  /**
   * Log progress
   * @param {number} current
   * @param {number} total
   * @param {string} [label='Progress']
   */
  progress(current, total, label = 'Progress') {
    const percentage = ((current / total) * 100).toFixed(1);
    const bar = this._createProgressBar(current, total);
    this.info(`${label}: ${bar} ${percentage}% (${current}/${total})`);
  }

  /**
   * Create a progress bar
   * @param {number} current
   * @param {number} total
   * @param {number} [width=30]
   * @returns {string}
   * @private
   */
  _createProgressBar(current, total, width = 30) {
    const filled = Math.floor((current / total) * width);
    const empty = width - filled;
    return `[${'='.repeat(filled)}${' '.repeat(empty)}]`;
  }
}

/**
 * Create a default logger instance
 * @type {Logger}
 */
const defaultLogger = new Logger();

/**
 * Create a logger with custom options
 * @param {Object} options
 * @returns {Logger}
 */
function createLogger(options) {
  return new Logger(options);
}

/**
 * Create a logger for a specific module
 * @param {string} moduleName
 * @returns {Logger}
 */
function createModuleLogger(moduleName) {
  return new Logger({
    prefix: moduleName,
    level: process.env.LOG_LEVEL ?
      parseInt(process.env.LOG_LEVEL, 10) : LogLevel.INFO,
  });
}

module.exports = {
  Logger,
  LogLevel,
  LogLevelNames,
  Colors,
  createLogger,
  createModuleLogger,
  default: defaultLogger,
};
