/**
 * LLMTestCommand - Test LLM providers and connections
 *
 * Features:
 * - Health check for LLM providers
 * - Model availability testing
 * - Response validation
 * - Performance benchmarking
 * - Cost estimation
 * - Provider comparison
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');

class LLMTestCommand {
  constructor(config = {}) {
    this.config = {
      verbose: config.verbose || false,
      timeout: config.timeout || 30000, // 30 seconds
      testPrompt: config.testPrompt || 'Convert this React component to Flutter: function Hello() { return <div>Hello World</div>; }',
    };

    this.results = [];
  }

  /**
   * Execute LLM test command
   * @param {string} provider - Provider to test (claude, gemini, qwen, all)
   * @param {Object} options - Test options
   * @returns {Promise<Object>} Test results
   */
  async execute(provider = 'all', options = {}) {
    console.log(chalk.bold.blue('\n🧪 LLM Provider Testing\n'));

    const providers = provider === 'all'
      ? ['claude', 'gemini', 'qwen']
      : [provider];

    for (const providerName of providers) {
      await this.testProvider(providerName);
    }

    // Display summary
    this.displaySummary();

    return {
      status: 'success',
      results: this.results,
    };
  }

  /**
   * Test a single provider
   * @param {string} providerName - Provider name
   */
  async testProvider(providerName) {
    const spinner = ora(`Testing ${providerName}...`).start();

    const result = {
      provider: providerName,
      available: false,
      healthy: false,
      models: [],
      response: null,
      latency: null,
      error: null,
      features: {
        streaming: false,
        functionCalling: false,
        vision: false,
      },
      cost: null,
    };

    try {
      // Load provider adapter
      const adapter = await this.loadAdapter(providerName);

      // Check availability
      spinner.text = `Checking ${providerName} availability...`;
      result.available = await this.checkAvailability(adapter);

      if (!result.available) {
        spinner.fail(`${providerName} is not available`);
        result.error = 'Provider not configured or credentials missing';
        this.results.push(result);
        return;
      }

      // Health check
      spinner.text = `Health check for ${providerName}...`;
      result.healthy = await this.healthCheck(adapter);

      if (!result.healthy) {
        spinner.warn(`${providerName} is available but not healthy`);
        result.error = 'Health check failed';
        this.results.push(result);
        return;
      }

      // Get available models
      spinner.text = `Fetching ${providerName} models...`;
      result.models = await this.getModels(adapter);

      // Test response
      spinner.text = `Testing ${providerName} response...`;
      const responseTest = await this.testResponse(adapter);
      result.response = responseTest.response;
      result.latency = responseTest.latency;

      // Check features
      spinner.text = `Checking ${providerName} features...`;
      result.features = await this.checkFeatures(adapter);

      // Estimate cost
      result.cost = this.estimateCost(providerName, result.response);

      spinner.succeed(`${providerName} test completed`);

    } catch (error) {
      spinner.fail(`${providerName} test failed`);
      result.error = error.message;

      if (this.config.verbose) {
        console.error(chalk.gray(error.stack));
      }
    }

    this.results.push(result);
  }

  /**
   * Load provider adapter
   * @param {string} providerName - Provider name
   * @returns {Promise<Object>} Adapter instance
   */
  async loadAdapter(providerName) {
    const adapterMap = {
      claude: '../ai/ClaudeClient',
      gemini: '../ai/GeminiClient',
      qwen: '../ai/QwenClient',
    };

    const adapterPath = adapterMap[providerName];
    if (!adapterPath) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    try {
      const AdapterClass = require(adapterPath);
      return new AdapterClass({
        verbose: this.config.verbose,
        timeout: this.config.timeout,
      });
    } catch (error) {
      throw new Error(`Failed to load adapter: ${error.message}`);
    }
  }

  /**
   * Check if provider is available
   * @param {Object} adapter - Provider adapter
   * @returns {Promise<boolean>} Is available
   */
  async checkAvailability(adapter) {
    try {
      // Check if credentials are configured
      if (typeof adapter.isConfigured === 'function') {
        return await adapter.isConfigured();
      }

      // Try a simple health check
      if (typeof adapter.healthCheck === 'function') {
        await adapter.healthCheck();
        return true;
      }

      // If no specific method, assume available
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Perform health check
   * @param {Object} adapter - Provider adapter
   * @returns {Promise<boolean>} Is healthy
   */
  async healthCheck(adapter) {
    try {
      if (typeof adapter.healthCheck === 'function') {
        const result = await adapter.healthCheck();
        return result.healthy !== false;
      }

      // If no health check method, try a simple request
      await this.testResponse(adapter);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get available models
   * @param {Object} adapter - Provider adapter
   * @returns {Promise<Array>} List of models
   */
  async getModels(adapter) {
    try {
      if (typeof adapter.listModels === 'function') {
        return await adapter.listModels();
      }

      if (typeof adapter.models === 'function') {
        return await adapter.models();
      }

      // Default models for each provider
      const defaultModels = {
        claude: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
        gemini: ['gemini-pro', 'gemini-pro-vision'],
        qwen: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
      };

      const providerName = adapter.constructor.name.toLowerCase().replace('client', '');
      return defaultModels[providerName] || [];
    } catch (error) {
      if (this.config.verbose) {
        console.warn(chalk.yellow(`Could not fetch models: ${error.message}`));
      }
      return [];
    }
  }

  /**
   * Test provider response
   * @param {Object} adapter - Provider adapter
   * @returns {Promise<Object>} Response test result
   */
  async testResponse(adapter) {
    const startTime = Date.now();

    try {
      let response;

      if (typeof adapter.complete === 'function') {
        response = await adapter.complete(this.config.testPrompt);
      } else if (typeof adapter.chat === 'function') {
        response = await adapter.chat([
          { role: 'user', content: this.config.testPrompt }
        ]);
      } else if (typeof adapter.generate === 'function') {
        response = await adapter.generate(this.config.testPrompt);
      } else {
        throw new Error('No supported method found (complete, chat, generate)');
      }

      const latency = Date.now() - startTime;

      // Extract text from response
      let text = response;
      if (typeof response === 'object') {
        text = response.text || response.content || response.message || JSON.stringify(response);
      }

      return {
        response: text,
        latency,
        success: true,
      };
    } catch (error) {
      return {
        response: null,
        latency: Date.now() - startTime,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check provider features
   * @param {Object} adapter - Provider adapter
   * @returns {Promise<Object>} Features
   */
  async checkFeatures(adapter) {
    const features = {
      streaming: false,
      functionCalling: false,
      vision: false,
      codeExecution: false,
      fileUpload: false,
    };

    try {
      // Check for streaming support
      if (typeof adapter.stream === 'function' || typeof adapter.streamComplete === 'function') {
        features.streaming = true;
      }

      // Check for function calling
      if (typeof adapter.callFunction === 'function' || typeof adapter.tools === 'function') {
        features.functionCalling = true;
      }

      // Check for vision support
      if (typeof adapter.analyzeImage === 'function' || typeof adapter.vision === 'function') {
        features.vision = true;
      }

      // Check for code execution
      if (typeof adapter.executeCode === 'function') {
        features.codeExecution = true;
      }

      // Check for file upload
      if (typeof adapter.uploadFile === 'function') {
        features.fileUpload = true;
      }

      // Check capabilities property
      if (adapter.capabilities) {
        Object.assign(features, adapter.capabilities);
      }

    } catch (error) {
      if (this.config.verbose) {
        console.warn(chalk.yellow(`Could not check features: ${error.message}`));
      }
    }

    return features;
  }

  /**
   * Estimate cost for the test
   * @param {string} provider - Provider name
   * @param {string} response - Response text
   * @returns {Object} Cost estimate
   */
  estimateCost(provider, response) {
    if (!response) {
      return null;
    }

    // Rough token estimation (1 token ≈ 4 characters)
    const inputTokens = Math.ceil(this.config.testPrompt.length / 4);
    const outputTokens = Math.ceil(response.length / 4);

    // Pricing per 1M tokens (approximate)
    const pricing = {
      claude: {
        input: 3.0,  // $3 per 1M input tokens (Sonnet)
        output: 15.0, // $15 per 1M output tokens
      },
      gemini: {
        input: 0.5,   // $0.50 per 1M input tokens
        output: 1.5,  // $1.50 per 1M output tokens
      },
      qwen: {
        input: 0.5,   // Estimated
        output: 1.5,  // Estimated
      },
    };

    const providerPricing = pricing[provider] || { input: 1, output: 3 };

    const inputCost = (inputTokens / 1000000) * providerPricing.input;
    const outputCost = (outputTokens / 1000000) * providerPricing.output;
    const totalCost = inputCost + outputCost;

    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputCost: inputCost.toFixed(6),
      outputCost: outputCost.toFixed(6),
      totalCost: totalCost.toFixed(6),
      currency: 'USD',
    };
  }

  /**
   * Display test summary
   */
  displaySummary() {
    console.log(chalk.bold.blue('\n📊 Test Summary\n'));

    const table = new Table({
      head: ['Provider', 'Status', 'Latency', 'Models', 'Features', 'Cost'],
      colWidths: [12, 12, 12, 10, 25, 12],
      style: {
        head: ['cyan'],
      },
    });

    for (const result of this.results) {
      const status = result.healthy
        ? chalk.green('✓ Healthy')
        : result.available
        ? chalk.yellow('⚠ Available')
        : chalk.red('✗ Unavailable');

      const latency = result.latency
        ? `${result.latency}ms`
        : '-';

      const modelCount = result.models.length;

      const features = [];
      if (result.features.streaming) features.push('Stream');
      if (result.features.functionCalling) features.push('Functions');
      if (result.features.vision) features.push('Vision');
      const featuresStr = features.join(', ') || 'Basic';

      const cost = result.cost
        ? `$${result.cost.totalCost}`
        : '-';

      table.push([
        result.provider,
        status,
        latency,
        modelCount,
        featuresStr,
        cost,
      ]);
    }

    console.log(table.toString());

    // Display errors if any
    const errors = this.results.filter(r => r.error);
    if (errors.length > 0) {
      console.log(chalk.bold.red('\n❌ Errors\n'));
      for (const result of errors) {
        console.log(`${chalk.yellow(result.provider)}: ${result.error}`);
      }
    }

    // Display recommendations
    console.log(chalk.bold.blue('\n💡 Recommendations\n'));
    this.displayRecommendations();
  }

  /**
   * Display recommendations based on test results
   */
  displayRecommendations() {
    const healthy = this.results.filter(r => r.healthy);
    const unhealthy = this.results.filter(r => !r.healthy);

    if (healthy.length === 0) {
      console.log(chalk.red('  • No LLM providers are available'));
      console.log(chalk.gray('  • Configure at least one provider in config'));
      console.log(chalk.gray('  • Set API keys in environment variables'));
      return;
    }

    // Find fastest provider
    const fastest = healthy.reduce((min, r) =>
      r.latency < (min.latency || Infinity) ? r : min
    );

    console.log(`  • Fastest provider: ${chalk.green(fastest.provider)} (${fastest.latency}ms)`);

    // Find most cost-effective
    if (healthy.some(r => r.cost)) {
      const cheapest = healthy
        .filter(r => r.cost)
        .reduce((min, r) =>
          parseFloat(r.cost.totalCost) < parseFloat(min.cost?.totalCost || Infinity) ? r : min
        );

      console.log(`  • Most cost-effective: ${chalk.green(cheapest.provider)} ($${cheapest.cost.totalCost})`);
    }

    // Find most feature-rich
    const featureCounts = healthy.map(r => ({
      provider: r.provider,
      count: Object.values(r.features).filter(Boolean).length,
    }));

    const mostFeatures = featureCounts.reduce((max, r) =>
      r.count > max.count ? r : max
    );

    console.log(`  • Most features: ${chalk.green(mostFeatures.provider)} (${mostFeatures.count} features)`);

    // Recommendations for unavailable providers
    if (unhealthy.length > 0) {
      console.log(chalk.yellow('\n  Unavailable providers:'));
      for (const result of unhealthy) {
        console.log(`    • ${result.provider}: ${result.error || 'Not configured'}`);
      }
    }
  }

  /**
   * Generate detailed report
   * @param {string} outputPath - Output file path
   */
  async generateReport(outputPath) {
    const report = {
      timestamp: new Date().toISOString(),
      testPrompt: this.config.testPrompt,
      results: this.results,
      summary: {
        totalProviders: this.results.length,
        healthyProviders: this.results.filter(r => r.healthy).length,
        availableProviders: this.results.filter(r => r.available).length,
        unavailableProviders: this.results.filter(r => !r.available).length,
      },
    };

    await fs.writeJson(outputPath, report, { spaces: 2 });
    console.log(chalk.green(`\n✓ Report saved to ${outputPath}`));
  }

  /**
   * Run performance benchmark
   * @param {string} provider - Provider to benchmark
   * @param {number} iterations - Number of iterations
   * @returns {Promise<Object>} Benchmark results
   */
  async benchmark(provider, iterations = 5) {
    console.log(chalk.bold.blue(`\n⏱️  Benchmarking ${provider} (${iterations} iterations)\n`));

    const adapter = await this.loadAdapter(provider);
    const latencies = [];
    const costs = [];

    for (let i = 0; i < iterations; i++) {
      const spinner = ora(`Iteration ${i + 1}/${iterations}...`).start();

      const result = await this.testResponse(adapter);

      if (result.success) {
        latencies.push(result.latency);

        const cost = this.estimateCost(provider, result.response);
        if (cost) {
          costs.push(parseFloat(cost.totalCost));
        }

        spinner.succeed(`Iteration ${i + 1}: ${result.latency}ms`);
      } else {
        spinner.fail(`Iteration ${i + 1}: Failed`);
      }
    }

    const stats = {
      iterations,
      latency: {
        min: Math.min(...latencies),
        max: Math.max(...latencies),
        avg: latencies.reduce((a, b) => a + b, 0) / latencies.length,
        median: this.median(latencies),
      },
      cost: costs.length > 0 ? {
        min: Math.min(...costs).toFixed(6),
        max: Math.max(...costs).toFixed(6),
        avg: (costs.reduce((a, b) => a + b, 0) / costs.length).toFixed(6),
      } : null,
    };

    console.log(chalk.bold.blue('\n📈 Benchmark Results\n'));
    console.log(`  Min latency: ${stats.latency.min}ms`);
    console.log(`  Max latency: ${stats.latency.max}ms`);
    console.log(`  Avg latency: ${Math.round(stats.latency.avg)}ms`);
    console.log(`  Median latency: ${stats.latency.median}ms`);

    if (stats.cost) {
      console.log(`\n  Avg cost: $${stats.cost.avg} per request`);
    }

    return stats;
  }

  /**
   * Calculate median value
   * @param {Array<number>} values - Values
   * @returns {number} Median
   */
  median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }
}

module.exports = LLMTestCommand;