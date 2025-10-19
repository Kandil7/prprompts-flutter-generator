#!/usr/bin/env node

/**
 * Command History System for PRPROMPTS Flutter Generator
 * Tracks, stores, and suggests previous commands
 * @version 4.1.0
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class CommandHistory {
  constructor(options = {}) {
    this.maxHistory = options.maxHistory || 1000;
    this.maxSuggestions = options.maxSuggestions || 5;
    this.historyFile = options.historyFile || path.join(
      process.env.HOME || process.env.USERPROFILE,
      '.prprompts',
      'command-history.json'
    );

    this.history = this.loadHistory();
    this.session = [];
    this.currentIndex = -1;
  }

  /**
   * Load history from file
   */
  loadHistory() {
    try {
      if (fs.existsSync(this.historyFile)) {
        const data = fs.readFileSync(this.historyFile, 'utf8');
        const parsed = JSON.parse(data);
        return {
          commands: parsed.commands || [],
          frequency: parsed.frequency || {},
          contexts: parsed.contexts || {},
          timestamps: parsed.timestamps || {},
          tags: parsed.tags || {}
        };
      }
    } catch (error) {
      console.error('Failed to load history:', error.message);
    }

    return {
      commands: [],
      frequency: {},
      contexts: {},
      timestamps: {},
      tags: {}
    };
  }

  /**
   * Save history to file
   */
  saveHistory() {
    try {
      const dir = path.dirname(this.historyFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Trim history to max size
      if (this.history.commands.length > this.maxHistory) {
        this.history.commands = this.history.commands.slice(-this.maxHistory);
      }

      fs.writeFileSync(
        this.historyFile,
        JSON.stringify(this.history, null, 2)
      );
    } catch (error) {
      console.error('Failed to save history:', error.message);
    }
  }

  /**
   * Add command to history
   */
  addCommand(command, context = {}) {
    if (!command || command.trim() === '') return;

    const cmd = command.trim();
    const timestamp = Date.now();

    // Add to history
    this.history.commands.push(cmd);
    this.session.push(cmd);

    // Update frequency
    this.history.frequency[cmd] = (this.history.frequency[cmd] || 0) + 1;

    // Store timestamp
    this.history.timestamps[cmd] = timestamp;

    // Store context
    if (context.project) {
      if (!this.history.contexts[context.project]) {
        this.history.contexts[context.project] = [];
      }
      this.history.contexts[context.project].push(cmd);
    }

    // Auto-tag commands
    this.autoTagCommand(cmd);

    // Save to file
    this.saveHistory();
  }

  /**
   * Auto-tag commands for better organization
   */
  autoTagCommand(command) {
    const tags = [];

    // Tag by command type
    if (command.includes('create')) tags.push('create');
    if (command.includes('generate')) tags.push('generate');
    if (command.includes('auto-')) tags.push('automation');
    if (command.includes('test')) tags.push('testing');
    if (command.includes('validate')) tags.push('validation');
    if (command.includes('claude')) tags.push('claude');
    if (command.includes('qwen')) tags.push('qwen');
    if (command.includes('gemini')) tags.push('gemini');

    // Store tags
    if (tags.length > 0) {
      this.history.tags[command] = tags;
    }
  }

  /**
   * Get command suggestions
   */
  getSuggestions(prefix = '', context = {}) {
    const suggestions = [];
    const seen = new Set();

    // Helper to add suggestion
    const addSuggestion = (cmd, score) => {
      if (!seen.has(cmd) && cmd.startsWith(prefix)) {
        seen.add(cmd);
        suggestions.push({ command: cmd, score });
      }
    };

    // 1. Recent commands from session (highest priority)
    const recentSession = this.session.slice(-10).reverse();
    recentSession.forEach((cmd, i) => {
      addSuggestion(cmd, 1000 - i);
    });

    // 2. Context-specific commands
    if (context.project && this.history.contexts[context.project]) {
      const contextCommands = this.history.contexts[context.project].slice(-10);
      contextCommands.forEach((cmd, i) => {
        addSuggestion(cmd, 900 - i);
      });
    }

    // 3. Frequently used commands
    const frequentCommands = Object.entries(this.history.frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    frequentCommands.forEach(([cmd, freq]) => {
      addSuggestion(cmd, 800 + freq);
    });

    // 4. Recently used commands
    const recentCommands = this.history.commands.slice(-20).reverse();
    recentCommands.forEach((cmd, i) => {
      addSuggestion(cmd, 700 - i);
    });

    // Sort by score and return top suggestions
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, this.maxSuggestions)
      .map(s => s.command);
  }

  /**
   * Search history
   */
  searchHistory(query, filters = {}) {
    let results = [...this.history.commands];

    // Filter by query
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(cmd =>
        cmd.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(cmd => {
        const cmdTags = this.history.tags[cmd] || [];
        return filters.tags.some(tag => cmdTags.includes(tag));
      });
    }

    // Filter by time range
    if (filters.since) {
      const sinceTime = Date.now() - filters.since;
      results = results.filter(cmd => {
        const timestamp = this.history.timestamps[cmd];
        return timestamp && timestamp > sinceTime;
      });
    }

    // Remove duplicates and reverse for most recent first
    return [...new Set(results)].reverse();
  }

  /**
   * Get previous command (for up arrow navigation)
   */
  getPrevious() {
    if (this.session.length === 0) return null;

    if (this.currentIndex === -1) {
      this.currentIndex = this.session.length - 1;
    } else if (this.currentIndex > 0) {
      this.currentIndex--;
    }

    return this.session[this.currentIndex] || null;
  }

  /**
   * Get next command (for down arrow navigation)
   */
  getNext() {
    if (this.session.length === 0) return null;

    if (this.currentIndex < this.session.length - 1) {
      this.currentIndex++;
      return this.session[this.currentIndex];
    }

    this.currentIndex = -1;
    return '';
  }

  /**
   * Reset navigation index
   */
  resetNavigation() {
    this.currentIndex = -1;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const stats = {
      totalCommands: this.history.commands.length,
      uniqueCommands: new Set(this.history.commands).size,
      sessionCommands: this.session.length,
      mostUsed: [],
      recentProjects: [],
      commandsByTag: {}
    };

    // Most used commands
    stats.mostUsed = Object.entries(this.history.frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([cmd, count]) => ({ command: cmd, count }));

    // Recent projects
    stats.recentProjects = Object.keys(this.history.contexts).slice(-5);

    // Commands by tag
    for (const [cmd, tags] of Object.entries(this.history.tags)) {
      for (const tag of tags) {
        if (!stats.commandsByTag[tag]) {
          stats.commandsByTag[tag] = 0;
        }
        stats.commandsByTag[tag]++;
      }
    }

    return stats;
  }

  /**
   * Clear history
   */
  clearHistory(options = {}) {
    if (options.all) {
      // Clear everything
      this.history = {
        commands: [],
        frequency: {},
        contexts: {},
        timestamps: {},
        tags: {}
      };
      this.session = [];
    } else if (options.session) {
      // Clear session only
      this.session = [];
    } else if (options.older) {
      // Clear commands older than specified time
      const cutoff = Date.now() - options.older;
      this.history.commands = this.history.commands.filter(cmd => {
        const timestamp = this.history.timestamps[cmd];
        return timestamp && timestamp > cutoff;
      });
    }

    this.saveHistory();
  }

  /**
   * Export history
   */
  exportHistory(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.history, null, 2);
    } else if (format === 'txt') {
      return this.history.commands.join('\n');
    } else if (format === 'bash') {
      // Bash history format
      return this.history.commands.map((cmd, i) => `${i + 1}  ${cmd}`).join('\n');
    }
  }

  /**
   * Import history
   */
  importHistory(data, format = 'json') {
    try {
      if (format === 'json') {
        const imported = JSON.parse(data);
        this.history.commands.push(...(imported.commands || []));

        // Merge other data
        Object.assign(this.history.frequency, imported.frequency || {});
        Object.assign(this.history.contexts, imported.contexts || {});
        Object.assign(this.history.timestamps, imported.timestamps || {});
        Object.assign(this.history.tags, imported.tags || {});
      } else if (format === 'txt' || format === 'bash') {
        const commands = data.split('\n')
          .map(line => line.replace(/^\d+\s+/, '').trim())
          .filter(cmd => cmd);
        this.history.commands.push(...commands);
      }

      this.saveHistory();
      return true;
    } catch (error) {
      console.error('Failed to import history:', error.message);
      return false;
    }
  }

  /**
   * Interactive history browser
   */
  async browseHistory() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n📚 Command History Browser\n');

    const showMenu = () => {
      console.log('1. Show recent commands');
      console.log('2. Search history');
      console.log('3. Show most used');
      console.log('4. Show by tag');
      console.log('5. Statistics');
      console.log('6. Clear history');
      console.log('q. Quit\n');
    };

    const prompt = () => new Promise(resolve => {
      rl.question('> ', resolve);
    });

    let running = true;
    while (running) {
      showMenu();
      const choice = await prompt();

      switch (choice) {
        case '1':
          console.log('\n📅 Recent Commands:\n');
          this.history.commands.slice(-20).reverse().forEach(cmd => {
            console.log(`  ${cmd}`);
          });
          console.log('');
          break;

        case '2':
          const query = await new Promise(resolve => {
            rl.question('Search query: ', resolve);
          });
          const results = this.searchHistory(query);
          console.log(`\n🔍 Search Results (${results.length}):\n`);
          results.slice(0, 20).forEach(cmd => {
            console.log(`  ${cmd}`);
          });
          console.log('');
          break;

        case '3':
          console.log('\n🏆 Most Used Commands:\n');
          const mostUsed = Object.entries(this.history.frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
          mostUsed.forEach(([cmd, count]) => {
            console.log(`  ${count}x - ${cmd}`);
          });
          console.log('');
          break;

        case '4':
          console.log('\n🏷️  Commands by Tag:\n');
          const tagCounts = {};
          for (const [cmd, tags] of Object.entries(this.history.tags)) {
            for (const tag of tags) {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }
          }
          Object.entries(tagCounts).forEach(([tag, count]) => {
            console.log(`  ${tag}: ${count} commands`);
          });
          console.log('');
          break;

        case '5':
          const stats = this.getStatistics();
          console.log('\n📊 Statistics:\n');
          console.log(`  Total commands: ${stats.totalCommands}`);
          console.log(`  Unique commands: ${stats.uniqueCommands}`);
          console.log(`  Session commands: ${stats.sessionCommands}`);
          console.log('');
          break;

        case '6':
          const confirm = await new Promise(resolve => {
            rl.question('Clear all history? (y/n): ', resolve);
          });
          if (confirm.toLowerCase() === 'y') {
            this.clearHistory({ all: true });
            console.log('✅ History cleared\n');
          }
          break;

        case 'q':
          running = false;
          break;

        default:
          console.log('Invalid option\n');
      }
    }

    rl.close();
  }
}

// CLI Interface
if (require.main === module) {
  const history = new CommandHistory();
  const args = process.argv.slice(2);
  const command = args[0];

  async function main() {
    switch (command) {
      case 'browse':
        await history.browseHistory();
        break;

      case 'search':
        const query = args.slice(1).join(' ');
        const results = history.searchHistory(query);
        console.log(`\n🔍 Search results for "${query}":\n`);
        results.slice(0, 20).forEach(cmd => {
          console.log(`  ${cmd}`);
        });
        break;

      case 'stats':
        const stats = history.getStatistics();
        console.log('\n📊 Command History Statistics\n');
        console.log(`Total commands: ${stats.totalCommands}`);
        console.log(`Unique commands: ${stats.uniqueCommands}`);
        console.log(`\nMost used commands:`);
        stats.mostUsed.forEach(({ command, count }) => {
          console.log(`  ${count}x - ${command}`);
        });
        break;

      case 'clear':
        history.clearHistory({ all: true });
        console.log('✅ History cleared');
        break;

      case 'export':
        const format = args[1] || 'json';
        const exported = history.exportHistory(format);
        console.log(exported);
        break;

      case 'add':
        const cmd = args.slice(1).join(' ');
        if (cmd) {
          history.addCommand(cmd);
          console.log(`✅ Added to history: ${cmd}`);
        }
        break;

      case 'suggest':
        const prefix = args[1] || '';
        const suggestions = history.getSuggestions(prefix);
        console.log(`\n💡 Suggestions for "${prefix}":\n`);
        suggestions.forEach(cmd => {
          console.log(`  ${cmd}`);
        });
        break;

      default:
        console.log(`Command History for PRPROMPTS

Usage:
  node command-history.js browse              # Interactive browser
  node command-history.js search <query>      # Search history
  node command-history.js stats               # Show statistics
  node command-history.js clear               # Clear all history
  node command-history.js export [format]     # Export (json/txt/bash)
  node command-history.js add <command>       # Add to history
  node command-history.js suggest [prefix]    # Get suggestions

Examples:
  node command-history.js search create       # Find 'create' commands
  node command-history.js suggest prprompts   # Get suggestions
  node command-history.js export txt > cmds.txt
`);
    }
  }

  main().catch(console.error);
}

module.exports = CommandHistory;