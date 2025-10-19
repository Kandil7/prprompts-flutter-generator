#!/usr/bin/env node

/**
 * API Key Validator for PRPROMPTS Flutter Generator
 * Validates API keys for Claude, Qwen, and Gemini before execution
 * @version 4.1.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

class APIKeyValidator {
  constructor() {
    this.validators = {
      claude: this.validateClaudeKey.bind(this),
      qwen: this.validateQwenKey.bind(this),
      gemini: this.validateGeminiKey.bind(this)
    };

    this.keyLocations = {
      claude: [
        process.env.CLAUDE_API_KEY,
        process.env.ANTHROPIC_API_KEY,
        path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'claude', 'api_key'),
        path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'api_key')
      ],
      qwen: [
        process.env.QWEN_API_KEY,
        process.env.ALIBABA_API_KEY,
        path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'qwen', 'api_key'),
        path.join(process.env.HOME || process.env.USERPROFILE, '.qwen', 'api_key')
      ],
      gemini: [
        process.env.GEMINI_API_KEY,
        process.env.GOOGLE_API_KEY,
        path.join(process.env.HOME || process.env.USERPROFILE, '.config', 'gemini', 'api_key'),
        path.join(process.env.HOME || process.env.USERPROFILE, '.gemini', 'api_key')
      ]
    };

    this.cache = new Map();
    this.cacheTimeout = 3600000; // 1 hour cache
  }

  /**
   * Find API key from various locations
   */
  findAPIKey(ai) {
    const locations = this.keyLocations[ai] || [];

    for (const location of locations) {
      if (!location) continue;

      // Check environment variable
      if (location.startsWith('sk-') || location.startsWith('AIzaSy') || location.length > 20) {
        return location;
      }

      // Check file
      try {
        if (fs.existsSync(location)) {
          const key = fs.readFileSync(location, 'utf8').trim();
          if (key) return key;
        }
      } catch (error) {
        // Ignore file read errors
      }
    }

    return null;
  }

  /**
   * Validate API key with caching
   */
  async validate(ai, key = null) {
    // Check cache first
    const cacheKey = `${ai}-${key || 'auto'}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.result;
      }
    }

    // Find key if not provided
    const apiKey = key || this.findAPIKey(ai);
    if (!apiKey) {
      return {
        valid: false,
        error: `No API key found for ${ai}`,
        suggestion: this.getKeySuggestion(ai)
      };
    }

    // Validate based on AI type
    const validator = this.validators[ai];
    if (!validator) {
      return {
        valid: true,
        warning: `No validator available for ${ai}, assuming valid`
      };
    }

    try {
      const result = await validator(apiKey);

      // Cache result
      this.cache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      return {
        valid: false,
        error: `Validation failed: ${error.message}`,
        suggestion: 'Check your internet connection and API key format'
      };
    }
  }

  /**
   * Validate Claude API key
   */
  async validateClaudeKey(key) {
    // Basic format validation
    if (!key.startsWith('sk-ant-')) {
      return {
        valid: false,
        error: 'Invalid Claude API key format',
        suggestion: 'Claude API keys should start with "sk-ant-"'
      };
    }

    // Test with minimal API call
    return new Promise((resolve) => {
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/models',
        method: 'GET',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01'
        },
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        if (res.statusCode === 401) {
          resolve({
            valid: false,
            error: 'Invalid or expired API key',
            suggestion: 'Check your Claude API key at https://console.anthropic.com'
          });
        } else if (res.statusCode === 429) {
          resolve({
            valid: true,
            warning: 'Rate limited but key is valid'
          });
        } else if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            valid: true,
            message: 'Claude API key validated successfully'
          });
        } else {
          resolve({
            valid: true,
            warning: `Received status ${res.statusCode}, assuming key is valid`
          });
        }
      });

      req.on('error', () => {
        resolve({
          valid: true,
          warning: 'Could not validate online, assuming key is valid'
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          valid: true,
          warning: 'Validation timed out, assuming key is valid'
        });
      });

      req.end();
    });
  }

  /**
   * Validate Qwen API key
   */
  async validateQwenKey(key) {
    // Basic format validation
    if (key.length < 32) {
      return {
        valid: false,
        error: 'Invalid Qwen API key format',
        suggestion: 'Qwen API keys should be at least 32 characters'
      };
    }

    // Qwen validation would go here if API available
    // For now, basic validation
    return {
      valid: true,
      message: 'Qwen API key format appears valid'
    };
  }

  /**
   * Validate Gemini API key
   */
  async validateGeminiKey(key) {
    // Basic format validation
    if (!key.startsWith('AIzaSy')) {
      return {
        valid: false,
        error: 'Invalid Gemini API key format',
        suggestion: 'Gemini API keys should start with "AIzaSy"'
      };
    }

    // Test with minimal API call
    return new Promise((resolve) => {
      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models?key=${key}`,
        method: 'GET',
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        if (res.statusCode === 400 || res.statusCode === 401) {
          resolve({
            valid: false,
            error: 'Invalid or expired API key',
            suggestion: 'Check your Gemini API key at https://makersuite.google.com/app/apikey'
          });
        } else if (res.statusCode === 429) {
          resolve({
            valid: true,
            warning: 'Rate limited but key is valid'
          });
        } else if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            valid: true,
            message: 'Gemini API key validated successfully'
          });
        } else {
          resolve({
            valid: true,
            warning: `Received status ${res.statusCode}, assuming key is valid`
          });
        }
      });

      req.on('error', () => {
        resolve({
          valid: true,
          warning: 'Could not validate online, assuming key is valid'
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          valid: true,
          warning: 'Validation timed out, assuming key is valid'
        });
      });

      req.end();
    });
  }

  /**
   * Get suggestion for missing API key
   */
  getKeySuggestion(ai) {
    const suggestions = {
      claude: `Set your Claude API key:
  - Export: export CLAUDE_API_KEY="sk-ant-..."
  - Or save to: ~/.config/claude/api_key
  - Get key from: https://console.anthropic.com`,

      qwen: `Set your Qwen API key:
  - Export: export QWEN_API_KEY="your-key-here"
  - Or save to: ~/.config/qwen/api_key
  - Get key from: https://qwen.aliyun.com`,

      gemini: `Set your Gemini API key:
  - Export: export GEMINI_API_KEY="AIzaSy..."
  - Or save to: ~/.config/gemini/api_key
  - Get key from: https://makersuite.google.com/app/apikey`
    };

    return suggestions[ai] || 'Please set your API key';
  }

  /**
   * Validate all configured AIs
   */
  async validateAll() {
    const results = {};

    for (const ai of ['claude', 'qwen', 'gemini']) {
      try {
        const commandExists = this.checkCommandExists(ai);
        if (commandExists) {
          results[ai] = await this.validate(ai);
        } else {
          results[ai] = { skipped: true, reason: 'AI not installed' };
        }
      } catch (error) {
        results[ai] = {
          valid: false,
          error: error.message
        };
      }
    }

    return results;
  }

  /**
   * Check if AI command exists
   */
  checkCommandExists(command) {
    try {
      execSync(`${process.platform === 'win32' ? 'where' : 'which'} ${command} 2>nul`,
        { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Interactive API key setup
   */
  async setupAPIKey(ai) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      console.log(`\n🔑 Setting up ${ai.toUpperCase()} API Key\n`);
      console.log(this.getKeySuggestion(ai));
      console.log('\n');

      rl.question(`Enter your ${ai} API key (or press Enter to skip): `, async (key) => {
        rl.close();

        if (!key) {
          console.log('Skipped API key setup');
          resolve(false);
          return;
        }

        // Validate the key
        const result = await this.validate(ai, key);

        if (result.valid) {
          // Save the key
          const configDir = path.join(
            process.env.HOME || process.env.USERPROFILE,
            '.config',
            ai
          );

          try {
            fs.mkdirSync(configDir, { recursive: true });
            fs.writeFileSync(
              path.join(configDir, 'api_key'),
              key,
              { mode: 0o600 }
            );
            console.log(`✅ API key saved to ${configDir}/api_key`);
            resolve(true);
          } catch (error) {
            console.error(`❌ Failed to save key: ${error.message}`);
            console.log(`\nYou can manually set it with:`);
            console.log(`export ${ai.toUpperCase()}_API_KEY="${key}"`);
            resolve(false);
          }
        } else {
          console.error(`❌ ${result.error || 'Invalid API key'}`);
          if (result.suggestion) {
            console.log(`\n💡 ${result.suggestion}`);
          }
          resolve(false);
        }
      });
    });
  }
}

// CLI Interface
if (require.main === module) {
  const validator = new APIKeyValidator();
  const args = process.argv.slice(2);
  const command = args[0];
  const ai = args[1];

  async function main() {
    switch (command) {
      case 'validate':
        if (!ai) {
          console.log('Validating all API keys...\n');
          const results = await validator.validateAll();

          for (const [aiName, result] of Object.entries(results)) {
            if (result.skipped) {
              console.log(`⏭️  ${aiName}: Skipped (not installed)`);
            } else if (result.valid) {
              console.log(`✅ ${aiName}: Valid`);
              if (result.warning) {
                console.log(`   ⚠️  ${result.warning}`);
              }
            } else {
              console.log(`❌ ${aiName}: Invalid`);
              console.log(`   ${result.error}`);
              if (result.suggestion) {
                console.log(`   💡 ${result.suggestion}`);
              }
            }
          }
        } else {
          const result = await validator.validate(ai);
          if (result.valid) {
            console.log(`✅ ${ai} API key is valid`);
            if (result.warning) {
              console.log(`⚠️  ${result.warning}`);
            }
          } else {
            console.log(`❌ ${result.error}`);
            if (result.suggestion) {
              console.log(`\n💡 ${result.suggestion}`);
            }
            process.exit(1);
          }
        }
        break;

      case 'setup':
        if (!ai) {
          console.log('Please specify an AI: setup claude|qwen|gemini');
          process.exit(1);
        }
        await validator.setupAPIKey(ai);
        break;

      case 'find':
        if (!ai) {
          console.log('Please specify an AI: find claude|qwen|gemini');
          process.exit(1);
        }
        const key = validator.findAPIKey(ai);
        if (key) {
          console.log(`Found ${ai} API key: ${key.substring(0, 10)}...`);
        } else {
          console.log(`No API key found for ${ai}`);
          console.log(validator.getKeySuggestion(ai));
        }
        break;

      default:
        console.log(`API Key Validator for PRPROMPTS

Usage:
  node api-key-validator.js validate [ai]     # Validate API keys
  node api-key-validator.js setup <ai>        # Interactive setup
  node api-key-validator.js find <ai>         # Find API key location

Examples:
  node api-key-validator.js validate          # Validate all
  node api-key-validator.js validate claude   # Validate Claude only
  node api-key-validator.js setup gemini      # Setup Gemini API key
`);
    }
  }

  main().catch(console.error);
}

module.exports = APIKeyValidator;