#!/usr/bin/env node

/**
 * Rate Limiter for PRPROMPTS Flutter Generator
 * Tracks and manages API rate limits for Claude, Qwen, and Gemini
 * @version 4.1.0
 */

const fs = require('fs');
const path = require('path');

class RateLimiter {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.stateFile = path.join(
      process.env.HOME || process.env.USERPROFILE,
      '.prprompts',
      'rate-limits.json'
    );

    // Rate limits per AI (requests per minute)
    this.limits = {
      claude: {
        free: { rpm: 5, rpd: 100, tokens: 10000 },
        starter: { rpm: 50, rpd: 1000, tokens: 100000 },
        pro: { rpm: 1000, rpd: 10000, tokens: 1000000 }
      },
      qwen: {
        free: { rpm: 10, rpd: 200, tokens: 20000 },
        plus: { rpm: 100, rpd: 2000, tokens: 200000 },
        pro: { rpm: 1000, rpd: 20000, tokens: 2000000 }
      },
      gemini: {
        free: { rpm: 60, rpd: 1500, tokens: 32000 },
        pro: { rpm: 1000, rpd: 30000, tokens: 1000000 }
      }
    };

    // Default tiers
    this.defaultTiers = {
      claude: process.env.CLAUDE_TIER || 'free',
      qwen: process.env.QWEN_TIER || 'free',
      gemini: process.env.GEMINI_TIER || 'free'
    };

    this.state = this.loadState();
    this.initializeState();
  }

  /**
   * Load rate limit state
   */
  loadState() {
    try {
      if (fs.existsSync(this.stateFile)) {
        const data = fs.readFileSync(this.stateFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load rate limit state:', error.message);
    }

    return {
      claude: { requests: [], tokens: 0, tier: 'free' },
      qwen: { requests: [], tokens: 0, tier: 'free' },
      gemini: { requests: [], tokens: 0, tier: 'free' }
    };
  }

  /**
   * Save rate limit state
   */
  saveState() {
    try {
      const dir = path.dirname(this.stateFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error('Failed to save rate limit state:', error.message);
    }
  }

  /**
   * Initialize state with defaults
   */
  initializeState() {
    for (const ai of ['claude', 'qwen', 'gemini']) {
      if (!this.state[ai]) {
        this.state[ai] = {
          requests: [],
          tokens: 0,
          tier: this.defaultTiers[ai]
        };
      }
      // Update tier from environment
      this.state[ai].tier = this.defaultTiers[ai];
    }
    this.cleanOldRequests();
  }

  /**
   * Clean requests older than 24 hours
   */
  cleanOldRequests() {
    const dayAgo = Date.now() - 86400000;

    for (const ai of ['claude', 'qwen', 'gemini']) {
      if (this.state[ai] && this.state[ai].requests) {
        this.state[ai].requests = this.state[ai].requests.filter(
          req => req > dayAgo
        );
      }
    }
  }

  /**
   * Check if rate limit allows request
   */
  canMakeRequest(ai) {
    const aiState = this.state[ai];
    if (!aiState) return true;

    const tier = aiState.tier || 'free';
    const limits = this.limits[ai]?.[tier];
    if (!limits) return true;

    // Clean old requests
    const minuteAgo = Date.now() - 60000;
    const dayAgo = Date.now() - 86400000;

    const recentRequests = aiState.requests.filter(req => req > minuteAgo);
    const dailyRequests = aiState.requests.filter(req => req > dayAgo);

    // Check rate limits
    if (recentRequests.length >= limits.rpm) {
      const waitTime = Math.ceil((minuteAgo + 60000 - Date.now()) / 1000);
      return {
        allowed: false,
        reason: 'minute',
        limit: limits.rpm,
        current: recentRequests.length,
        waitSeconds: waitTime
      };
    }

    if (dailyRequests.length >= limits.rpd) {
      const waitTime = Math.ceil((dayAgo + 86400000 - Date.now()) / 1000);
      return {
        allowed: false,
        reason: 'daily',
        limit: limits.rpd,
        current: dailyRequests.length,
        waitSeconds: waitTime
      };
    }

    return { allowed: true };
  }

  /**
   * Record a request
   */
  recordRequest(ai, tokens = 0) {
    if (!this.state[ai]) {
      this.state[ai] = {
        requests: [],
        tokens: 0,
        tier: this.defaultTiers[ai]
      };
    }

    this.state[ai].requests.push(Date.now());
    this.state[ai].tokens += tokens;
    this.cleanOldRequests();
    this.saveState();
  }

  /**
   * Wait for rate limit to clear
   */
  async waitForRateLimit(ai) {
    const check = this.canMakeRequest(ai);

    if (check.allowed) return true;

    console.log(`\n⏳ Rate limit reached for ${ai} (${check.reason})`);
    console.log(`   Limit: ${check.limit}, Current: ${check.current}`);
    console.log(`   Waiting ${check.waitSeconds} seconds...`);

    // Show countdown
    for (let i = check.waitSeconds; i > 0; i--) {
      process.stdout.write(`\r   ${i} seconds remaining... `);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    process.stdout.write('\r   Ready to continue!      \n');

    return true;
  }

  /**
   * Get current usage stats
   */
  getUsageStats(ai) {
    const aiState = this.state[ai];
    if (!aiState) return null;

    const tier = aiState.tier || 'free';
    const limits = this.limits[ai]?.[tier];
    if (!limits) return null;

    const minuteAgo = Date.now() - 60000;
    const dayAgo = Date.now() - 86400000;

    const recentRequests = aiState.requests.filter(req => req > minuteAgo);
    const dailyRequests = aiState.requests.filter(req => req > dayAgo);

    return {
      tier,
      minute: {
        used: recentRequests.length,
        limit: limits.rpm,
        percentage: Math.round((recentRequests.length / limits.rpm) * 100)
      },
      daily: {
        used: dailyRequests.length,
        limit: limits.rpd,
        percentage: Math.round((dailyRequests.length / limits.rpd) * 100)
      },
      tokens: {
        used: aiState.tokens,
        limit: limits.tokens,
        percentage: Math.round((aiState.tokens / limits.tokens) * 100)
      }
    };
  }

  /**
   * Display usage for all AIs
   */
  displayUsage() {
    console.log('\n📊 Rate Limit Usage\n');

    for (const ai of ['claude', 'qwen', 'gemini']) {
      const stats = this.getUsageStats(ai);
      if (!stats) continue;

      console.log(`${ai.toUpperCase()} (${stats.tier} tier):`);

      // Minute usage bar
      const minuteBar = this.createProgressBar(stats.minute.percentage);
      console.log(`  Per minute: ${minuteBar} ${stats.minute.used}/${stats.minute.limit}`);

      // Daily usage bar
      const dailyBar = this.createProgressBar(stats.daily.percentage);
      console.log(`  Per day:    ${dailyBar} ${stats.daily.used}/${stats.daily.limit}`);

      // Token usage
      const tokenBar = this.createProgressBar(stats.tokens.percentage);
      console.log(`  Tokens:     ${tokenBar} ${this.formatNumber(stats.tokens.used)}/${this.formatNumber(stats.tokens.limit)}`);

      console.log('');
    }
  }

  /**
   * Create a progress bar
   */
  createProgressBar(percentage) {
    const width = 20;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;

    let color = '\x1b[32m'; // Green
    if (percentage > 80) color = '\x1b[31m'; // Red
    else if (percentage > 60) color = '\x1b[33m'; // Yellow

    const bar = color + '█'.repeat(filled) + '\x1b[0m' + '░'.repeat(empty);
    return `[${bar}] ${percentage}%`;
  }

  /**
   * Format large numbers
   */
  formatNumber(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  /**
   * Reset usage for an AI
   */
  resetUsage(ai) {
    if (this.state[ai]) {
      this.state[ai] = {
        requests: [],
        tokens: 0,
        tier: this.state[ai].tier
      };
      this.saveState();
      console.log(`✅ Reset usage for ${ai}`);
    }
  }

  /**
   * Set tier for an AI
   */
  setTier(ai, tier) {
    if (!this.limits[ai]?.[tier]) {
      console.error(`Invalid tier '${tier}' for ${ai}`);
      console.log(`Available tiers: ${Object.keys(this.limits[ai] || {}).join(', ')}`);
      return false;
    }

    if (!this.state[ai]) {
      this.state[ai] = {
        requests: [],
        tokens: 0,
        tier
      };
    } else {
      this.state[ai].tier = tier;
    }

    this.saveState();
    console.log(`✅ Set ${ai} to ${tier} tier`);
    return true;
  }

  /**
   * Suggest optimal AI based on rate limits
   */
  suggestAI() {
    const scores = {};

    for (const ai of ['claude', 'qwen', 'gemini']) {
      const stats = this.getUsageStats(ai);
      if (!stats) continue;

      // Calculate availability score (inverse of usage)
      const minuteAvail = 100 - stats.minute.percentage;
      const dailyAvail = 100 - stats.daily.percentage;
      const tokenAvail = 100 - stats.tokens.percentage;

      scores[ai] = Math.min(minuteAvail, dailyAvail, tokenAvail);
    }

    // Sort by availability
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) return null;

    return {
      best: sorted[0][0],
      score: sorted[0][1],
      alternatives: sorted.slice(1).map(([ai, score]) => ({ ai, score }))
    };
  }

  /**
   * Check and enforce rate limits with backoff
   */
  async enforceRateLimit(ai) {
    let backoff = 1000; // Start with 1 second
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const check = this.canMakeRequest(ai);

      if (check.allowed) {
        return true;
      }

      if (check.reason === 'daily') {
        console.error(`❌ Daily limit reached for ${ai}. Try again tomorrow.`);
        const suggestion = this.suggestAI();
        if (suggestion && suggestion.best !== ai) {
          console.log(`💡 Consider using ${suggestion.best} instead (${suggestion.score}% available)`);
        }
        return false;
      }

      // Exponential backoff for minute limits
      console.log(`⏳ Rate limit hit, waiting ${backoff / 1000}s (attempt ${attempts + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, backoff));

      backoff = Math.min(backoff * 2, 60000); // Max 1 minute
      attempts++;
    }

    return false;
  }
}

// CLI Interface
if (require.main === module) {
  const limiter = new RateLimiter();
  const args = process.argv.slice(2);
  const command = args[0];

  async function main() {
    switch (command) {
      case 'status':
        limiter.displayUsage();
        break;

      case 'check':
        const ai = args[1];
        if (!ai) {
          console.log('Please specify an AI: check claude|qwen|gemini');
          process.exit(1);
        }

        const check = limiter.canMakeRequest(ai);
        if (check.allowed) {
          console.log(`✅ ${ai} can make requests`);
        } else {
          console.log(`❌ ${ai} rate limit exceeded (${check.reason})`);
          console.log(`   Wait ${check.waitSeconds} seconds`);
        }
        break;

      case 'wait':
        const waitAi = args[1];
        if (!waitAi) {
          console.log('Please specify an AI: wait claude|qwen|gemini');
          process.exit(1);
        }
        await limiter.waitForRateLimit(waitAi);
        break;

      case 'reset':
        const resetAi = args[1];
        if (resetAi) {
          limiter.resetUsage(resetAi);
        } else {
          for (const ai of ['claude', 'qwen', 'gemini']) {
            limiter.resetUsage(ai);
          }
        }
        break;

      case 'tier':
        const tierAi = args[1];
        const newTier = args[2];
        if (!tierAi || !newTier) {
          console.log('Usage: tier <ai> <tier>');
          console.log('Example: tier claude pro');
          process.exit(1);
        }
        limiter.setTier(tierAi, newTier);
        break;

      case 'suggest':
        const suggestion = limiter.suggestAI();
        if (suggestion) {
          console.log(`\n🎯 Suggested AI: ${suggestion.best} (${suggestion.score}% available)`);
          if (suggestion.alternatives.length > 0) {
            console.log('\nAlternatives:');
            suggestion.alternatives.forEach(alt => {
              console.log(`  - ${alt.ai}: ${alt.score}% available`);
            });
          }
        } else {
          console.log('No AI suggestions available');
        }
        break;

      default:
        console.log(`Rate Limiter for PRPROMPTS

Usage:
  node rate-limiter.js status              # Show usage for all AIs
  node rate-limiter.js check <ai>          # Check if can make request
  node rate-limiter.js wait <ai>           # Wait for rate limit to clear
  node rate-limiter.js reset [ai]          # Reset usage counters
  node rate-limiter.js tier <ai> <tier>    # Set tier (free/pro/etc)
  node rate-limiter.js suggest             # Suggest best AI to use

Examples:
  node rate-limiter.js status              # View all usage
  node rate-limiter.js check claude        # Check Claude limits
  node rate-limiter.js tier gemini pro     # Set Gemini to pro tier
  node rate-limiter.js suggest             # Get AI recommendation
`);
    }
  }

  main().catch(console.error);
}

module.exports = RateLimiter;