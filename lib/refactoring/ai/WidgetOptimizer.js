/**
 * AI-Powered Widget Optimizer
 * Analyzes widget tree and suggests performance optimizations
 */

class WidgetOptimizer {
  constructor(aiClient, logger = console) {
    this.aiClient = aiClient;
    this.logger = logger;
  }

  /**
   * Analyze and optimize widget tree
   * @param {Object} widgetModel - Widget tree model
   * @param {string} code - Generated widget code
   * @returns {Promise<Object>} Optimization recommendations
   */
  async optimize(widgetModel, code) {
    try {
      this.logger.log('🔍 Analyzing widget tree for optimizations...');

      // First, run local analysis
      const localOptimizations = this._analyzeLocally(widgetModel, code);

      // Then, enhance with AI
      const aiOptimizations = await this._analyzeWithAI(widgetModel, code);

      // Merge results
      const allOptimizations = this._mergeOptimizations(localOptimizations, aiOptimizations);

      // Prioritize by impact
      const prioritized = this._prioritizeOptimizations(allOptimizations);

      this.logger.log(`✓ Found ${prioritized.length} optimization opportunities`);

      return {
        optimizations: prioritized,
        overallScore: aiOptimizations.overall_score || this._calculateScore(prioritized),
        summary: aiOptimizations.summary || this._generateSummary(prioritized)
      };

    } catch (error) {
      this.logger.error(`❌ Optimization analysis failed: ${error.message}`);
      return {
        optimizations: [],
        overallScore: 0.5,
        summary: `Analysis failed: ${error.message}`
      };
    }
  }

  /**
   * Local analysis (no AI)
   * @private
   */
  _analyzeLocally(widgetModel, code) {
    const optimizations = [];

    // Check for const constructors
    const constOpportunities = this._findConstOpportunities(code);
    optimizations.push(...constOpportunities);

    // Check build method complexity
    const complexityIssues = this._checkBuildComplexity(code);
    optimizations.push(...complexityIssues);

    // Check for unnecessary rebuilds
    const rebuildIssues = this._detectUnnecessaryRebuilds(code);
    optimizations.push(...rebuildIssues);

    // Check for ListView usage
    const listViewIssues = this._checkListViewUsage(code);
    optimizations.push(...listViewIssues);

    // Check for missing keys
    const keyIssues = this._checkForMissingKeys(code);
    optimizations.push(...keyIssues);

    return optimizations;
  }

  /**
   * AI-powered analysis
   * @private
   */
  async _analyzeWithAI(widgetModel, code) {
    try {
      return await this.aiClient.optimize({
        type: widgetModel.type,
        name: widgetModel.name,
        children: widgetModel.children?.length || 0,
        hasState: !!widgetModel.hasState,
        code: code.substring(0, 2000) // Limit for context
      });
    } catch (error) {
      this.logger.warn(`⚠️  AI optimization failed: ${error.message}`);
      return { optimizations: [], overall_score: 0.5 };
    }
  }

  /**
   * Find const constructor opportunities
   * @private
   */
  _findConstOpportunities(code) {
    const opportunities = [];

    // Find widgets without const that could use it
    const widgetPattern = /\b(Text|Icon|SizedBox|Padding|Container)\s*\(/g;
    let match;

    while ((match = widgetPattern.exec(code)) !== null) {
      const before = code.substring(Math.max(0, match.index - 10), match.index);
      if (!before.includes('const')) {
        const widgetName = match[1];
        // Check if it has no dynamic values (simple heuristic)
        const snippet = code.substring(match.index, match.index + 100);
        if (!snippet.includes('$') && !snippet.includes('widget.')) {
          opportunities.push({
            type: 'const',
            widget: widgetName,
            suggestion: `Add const constructor to ${widgetName}`,
            impact: 'medium',
            code_snippet: `const ${widgetName}(...)`
          });
        }
      }
    }

    return opportunities;
  }

  /**
   * Check build method complexity
   * @private
   */
  _checkBuildComplexity(code) {
    const issues = [];

    // Find build method
    const buildMatch = code.match(/Widget\s+build\s*\([^)]*\)\s*{([\s\S]*?)^  }/m);
    if (buildMatch) {
      const buildBody = buildMatch[1];
      const lines = buildBody.split('\n').length;

      if (lines > 100) {
        issues.push({
          type: 'extraction',
          widget: 'build method',
          suggestion: `Extract complex widgets from build method (${lines} lines)`,
          impact: 'high',
          code_snippet: `// Extract to separate widgets:\nWidget _buildHeader() { ... }\nWidget _buildBody() { ... }`
        });
      }

      // Check for deeply nested widgets
      const maxIndent = buildBody.split('\n').reduce((max, line) => {
        const indent = line.match(/^(\s*)/)[1].length;
        return Math.max(max, indent);
      }, 0);

      if (maxIndent > 40) { // More than ~10 levels deep
        issues.push({
          type: 'extraction',
          widget: 'nested widgets',
          suggestion: 'Widget tree is deeply nested, consider extracting sub-widgets',
          impact: 'medium'
        });
      }
    }

    return issues;
  }

  /**
   * Detect unnecessary rebuilds
   * @private
   */
  _detectUnnecessaryRebuilds(code) {
    const issues = [];

    // Check for BlocBuilder without buildWhen
    if (code.includes('BlocBuilder') && !code.includes('buildWhen:')) {
      issues.push({
        type: 'rebuild',
        widget: 'BlocBuilder',
        suggestion: 'Add buildWhen to prevent unnecessary rebuilds',
        impact: 'high',
        code_snippet: 'BlocBuilder<MyBloc, MyState>(\n  buildWhen: (prev, curr) => prev.data != curr.data,\n  builder: ...\n)'
      });
    }

    // Check for StatefulWidget with setState but no conditions
    if (code.includes('setState(')) {
      const setStateCount = (code.match(/setState\(/g) || []).length;
      if (setStateCount > 5) {
        issues.push({
          type: 'rebuild',
          widget: 'StatefulWidget',
          suggestion: `Consider using BLoC/Cubit instead of ${setStateCount} setState calls`,
          impact: 'medium'
        });
      }
    }

    return issues;
  }

  /**
   * Check ListView usage
   * @private
   */
  _checkListViewUsage(code) {
    const issues = [];

    // Check for ListView without .builder
    if (code.includes('ListView(') && code.includes('children:')) {
      issues.push({
        type: 'performance',
        widget: 'ListView',
        suggestion: 'Use ListView.builder for better performance with large lists',
        impact: 'high',
        code_snippet: 'ListView.builder(\n  itemCount: items.length,\n  itemBuilder: (context, index) => ...\n)'
      });
    }

    return issues;
  }

  /**
   * Check for missing keys
   * @private
   */
  _checkForMissingKeys(code) {
    const issues = [];

    // Check if ListView.builder has Key
    if (code.includes('ListView.builder') && !code.includes('key:')) {
      issues.push({
        type: 'keys',
        widget: 'ListView.builder items',
        suggestion: 'Add keys to list items for better performance when reordering',
        impact: 'low',
        code_snippet: 'ListTile(\n  key: ValueKey(item.id),\n  ...\n)'
      });
    }

    return issues;
  }

  /**
   * Merge local and AI optimizations
   * @private
   */
  _mergeOptimizations(local, ai) {
    const merged = [...local];

    // Add AI optimizations that aren't duplicates
    (ai.optimizations || []).forEach(aiOpt => {
      const duplicate = merged.some(localOpt =>
        localOpt.type === aiOpt.type && localOpt.widget === aiOpt.widget
      );
      if (!duplicate) {
        merged.push(aiOpt);
      }
    });

    return merged;
  }

  /**
   * Prioritize optimizations by impact
   * @private
   */
  _prioritizeOptimizations(optimizations) {
    const priority = { high: 0, medium: 1, low: 2 };

    return optimizations.sort((a, b) => {
      return priority[a.impact] - priority[b.impact];
    });
  }

  /**
   * Calculate overall score
   * @private
   */
  _calculateScore(optimizations) {
    if (optimizations.length === 0) return 1.0;

    const highImpact = optimizations.filter(o => o.impact === 'high').length;
    const mediumImpact = optimizations.filter(o => o.impact === 'medium').length;

    // Deduct points for issues
    let score = 1.0;
    score -= highImpact * 0.15;
    score -= mediumImpact * 0.08;

    return Math.max(0, score);
  }

  /**
   * Generate summary
   * @private
   */
  _generateSummary(optimizations) {
    const high = optimizations.filter(o => o.impact === 'high').length;
    const medium = optimizations.filter(o => o.impact === 'medium').length;
    const low = optimizations.filter(o => o.impact === 'low').length;

    if (optimizations.length === 0) {
      return 'Widget tree is well optimized';
    }

    const parts = [];
    if (high > 0) parts.push(`${high} high-impact`);
    if (medium > 0) parts.push(`${medium} medium-impact`);
    if (low > 0) parts.push(`${low} low-impact`);

    return `Found ${parts.join(', ')} optimization opportunities`;
  }

  /**
   * Format optimizations for display
   */
  formatOptimizations(result) {
    let output = `\n📊 Widget Optimization Report\n`;
    output += `Overall Score: ${(result.overallScore * 100).toFixed(0)}%\n`;
    output += `Summary: ${result.summary}\n\n`;

    if (result.optimizations.length === 0) {
      output += '✓ No optimizations needed\n';
      return output;
    }

    const byImpact = {
      high: result.optimizations.filter(o => o.impact === 'high'),
      medium: result.optimizations.filter(o => o.impact === 'medium'),
      low: result.optimizations.filter(o => o.impact === 'low')
    };

    Object.entries(byImpact).forEach(([impact, opts]) => {
      if (opts.length > 0) {
        const icon = impact === 'high' ? '🔴' : impact === 'medium' ? '🟡' : '🟢';
        output += `${icon} ${impact.toUpperCase()} Impact (${opts.length}):\n`;
        opts.forEach(opt => {
          output += `  • ${opt.suggestion}\n`;
          if (opt.code_snippet) {
            output += `    Example:\n${this._indentCode(opt.code_snippet, 4)}\n`;
          }
        });
        output += '\n';
      }
    });

    return output;
  }

  /**
   * Indent code snippet
   * @private
   */
  _indentCode(code, spaces) {
    const indent = ' '.repeat(spaces);
    return code.split('\n').map(line => indent + line).join('\n');
  }
}

module.exports = WidgetOptimizer;
