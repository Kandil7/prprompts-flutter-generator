/**
 * PerformanceValidator - Validates Flutter performance best practices
 *
 * Checks:
 * - Missing const constructors
 * - Excessive rebuilds (BlocBuilder without buildWhen)
 * - ListView usage (builder vs direct)
 * - Expensive operations in build()
 * - Unnecessary setState() calls
 * - Image loading (cached vs network)
 */

const { ValidationResult } = require('../models/ValidationResult');
const logger = require('../utils/logger');

class PerformanceValidator {
  constructor(config = {}) {
    this.config = {
      enforceConst: true,
      checkListViews: true,
      checkImageOptimization: true,
      ...config
    };
  }

  validate(filePath, code) {
    const errors = [];
    const warnings = [];
    const info = [];

    try {
      // 1. Check for missing const constructors
      this._checkConstConstructors(code, warnings, info);

      // 2. Check for excessive rebuilds
      this._checkRebuilds(code, warnings, info);

      // 3. Check ListView usage
      this._checkListViews(code, warnings, info);

      // 4. Check for expensive operations in build()
      this._checkExpensiveBuildOperations(code, warnings);

      // 5. Check setState() usage
      this._checkSetStateUsage(code, warnings, info);

      // 6. Check image loading
      this._checkImageLoading(code, warnings, info);

      // 7. Check for RepaintBoundary usage
      this._checkRepaintBoundary(code, info);

      // 8. Check for useMemoized/cached computations
      this._checkMemoization(code, info);

      const score = this._calculateScore(errors, warnings);

      return new ValidationResult({
        isValid: errors.length === 0,
        score,
        errors,
        warnings,
        info,
        target: filePath,
        validator: 'PerformanceValidator',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error(`PerformanceValidator failed for ${filePath}:`, error);
      return new ValidationResult({
        isValid: false,
        score: 0,
        errors: [{ message: `Validation failed: ${error.message}`, severity: 'error' }],
        warnings: [],
        info: [],
        target: filePath,
        validator: 'PerformanceValidator',
        timestamp: new Date().toISOString()
      });
    }
  }

  _checkConstConstructors(code, warnings, info) {
    // Count widgets without const
    const widgetPattern = /(?<!const\s)(Text|Icon|SizedBox|Padding|Container|Center|Column|Row)\s*\(/g;
    const matches = [...code.matchAll(widgetPattern)];

    if (matches.length > 10) {
      warnings.push({
        message: `${matches.length} widgets without const constructor`,
        severity: 'warning',
        suggestion: 'Use const constructors for better performance: const Text(...)'
      });
    } else if (matches.length > 0) {
      info.push({
        message: `${matches.length} potential const optimization(s)`,
        severity: 'info',
        suggestion: 'Consider using const constructors where possible'
      });
    }
  }

  _checkRebuilds(code, warnings, info) {
    // Check BlocBuilder without buildWhen
    const blocBuilderPattern = /BlocBuilder<[^>]+,\s*[^>]+>\s*\(\s*builder:/g;
    const blocBuilderWithWhen = /BlocBuilder<[^>]+,\s*[^>]+>\s*\([^)]*buildWhen:/g;

    const totalBuilders = (code.match(blocBuilderPattern) || []).length;
    const buildersWithWhen = (code.match(blocBuilderWithWhen) || []).length;
    const buildersWithoutWhen = totalBuilders - buildersWithWhen;

    if (buildersWithoutWhen > 0) {
      warnings.push({
        message: `${buildersWithoutWhen} BlocBuilder(s) without buildWhen`,
        severity: 'warning',
        suggestion: 'Add buildWhen to prevent unnecessary rebuilds'
      });
    }

    // Check for StreamBuilder/FutureBuilder optimizations
    const streamBuilderCount = (code.match(/StreamBuilder</g) || []).length;
    const futureBuilderCount = (code.match(/FutureBuilder</g) || []).length;

    if (streamBuilderCount + futureBuilderCount > 3) {
      info.push({
        message: `Multiple async builders (${streamBuilderCount + futureBuilderCount})`,
        severity: 'info',
        suggestion: 'Consider using BLoC for better state management'
      });
    }
  }

  _checkListViews(code, warnings, info) {
    // Check for ListView with children (inefficient for long lists)
    const listViewChildren = /ListView\s*\([^)]*children:\s*\[/g;
    const matches = [...code.matchAll(listViewChildren)];

    for (const match of matches) {
      // Check if it's generating a large list
      const snippet = code.substring(match.index, match.index + 200);
      if (snippet.includes('List.generate') || snippet.includes('.map(')) {
        warnings.push({
          message: 'ListView with children array (inefficient for long lists)',
          line: code.substring(0, match.index).split('\n').length,
          severity: 'warning',
          suggestion: 'Use ListView.builder for better performance with large lists'
        });
      }
    }

    // Check for GridView without builder
    const gridViewChildren = /GridView\s*\([^)]*children:\s*\[/g;
    if (gridViewChildren.test(code)) {
      warnings.push({
        message: 'GridView with children array',
        severity: 'warning',
        suggestion: 'Use GridView.builder for better performance'
      });
    }
  }

  _checkExpensiveBuildOperations(code, warnings) {
    // Check for sorting/filtering in build()
    const buildMethodPattern = /Widget\s+build\s*\([^)]*\)\s*\{([^}]+\{[^}]*\})*[^}]*\}/g;
    const buildMatch = buildMethodPattern.exec(code);

    if (buildMatch) {
      const buildBody = buildMatch[0];

      // Check for expensive operations
      const expensiveOps = [
        { pattern: /\.sort\s*\(/g, name: 'sorting' },
        { pattern: /\.where\s*\(/g, name: 'filtering' },
        { pattern: /\.map\s*\(/g, name: 'mapping' },
        { pattern: /for\s*\(/g, name: 'loops' },
        { pattern: /RegExp\s*\(/g, name: 'regex compilation' }
      ];

      for (const { pattern, name } of expensiveOps) {
        const count = (buildBody.match(pattern) || []).length;
        if (count > 2) {
          warnings.push({
            message: `Expensive operation in build(): ${name} (${count} occurrences)`,
            severity: 'warning',
            suggestion: `Move ${name} to initState() or use memoization`
          });
        }
      }
    }
  }

  _checkSetStateUsage(code, warnings, info) {
    const setStateCount = (code.match(/setState\s*\(/g) || []).length;

    if (setStateCount > 5) {
      warnings.push({
        message: `Multiple setState() calls (${setStateCount})`,
        severity: 'warning',
        suggestion: 'Consider using BLoC/Cubit for complex state management'
      });
    }

    // Check for setState in loops
    if (code.match(/for\s*\([^)]*\)\s*\{[^}]*setState/)) {
      warnings.push({
        message: 'setState() called in loop',
        severity: 'warning',
        suggestion: 'Batch state updates outside of loop'
      });
    }
  }

  _checkImageLoading(code, warnings, info) {
    // Check for Image.network without caching
    const networkImagePattern = /Image\.network\s*\(/g;
    const cachedNetworkImagePattern = /CachedNetworkImage\s*\(/g;

    const networkCount = (code.match(networkImagePattern) || []).length;
    const cachedCount = (code.match(cachedNetworkImagePattern) || []).length;

    if (networkCount > 0 && cachedCount === 0) {
      warnings.push({
        message: `${networkCount} uncached network image(s)`,
        severity: 'warning',
        suggestion: 'Use CachedNetworkImage for better performance'
      });
    }

    // Check for large image sizes
    if (code.includes('Image.') && !code.includes('cacheWidth') && !code.includes('cacheHeight')) {
      info.push({
        message: 'Images without size constraints',
        severity: 'info',
        suggestion: 'Use cacheWidth/cacheHeight to reduce memory usage'
      });
    }
  }

  _checkRepaintBoundary(code, info) {
    const hasAnimations = code.includes('Animation') ||
                         code.includes('AnimatedBuilder') ||
                         code.includes('AnimatedWidget');

    const hasRepaintBoundary = code.includes('RepaintBoundary');

    if (hasAnimations && !hasRepaintBoundary) {
      info.push({
        message: 'Animations without RepaintBoundary',
        severity: 'info',
        suggestion: 'Wrap animations in RepaintBoundary to limit repaint scope'
      });
    }
  }

  _checkMemoization(code, info) {
    const hasExpensiveOps = code.includes('.sort') ||
                           code.includes('.filter') ||
                           code.includes('.map');

    const usesMemoization = code.includes('useMemoized') ||
                           code.includes('memo(') ||
                           code.includes('cached');

    if (hasExpensiveOps && !usesMemoization) {
      info.push({
        message: 'Expensive operations without memoization',
        severity: 'info',
        suggestion: 'Consider caching expensive computations'
      });
    }
  }

  _calculateScore(errors, warnings) {
    const errorPenalty = errors.length * 10;
    const warningPenalty = warnings.length * 2;
    return Math.max(0, Math.min(100, 100 - errorPenalty - warningPenalty));
  }
}

module.exports = PerformanceValidator;
