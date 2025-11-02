const path = require('path');
const fs = require('fs-extra');
const { RefactorCommand } = require('../../../lib/refactoring/cli/RefactorCommand');
const { performance } = require('perf_hooks');

describe('Large Project Performance Tests', () => {
  let tempDir;
  const PERFORMANCE_THRESHOLDS = {
    smallProject: 5000, // 5 seconds for 10 components
    mediumProject: 15000, // 15 seconds for 50 components
    largeProject: 60000, // 60 seconds for 100 components
    perComponent: 1000, // 1 second per component average
    memoryLimit: 500 * 1024 * 1024, // 500MB
  };

  beforeAll(async () => {
    tempDir = path.join(__dirname, '..', 'temp', 'perf-tests');
    await fs.ensureDir(tempDir);
  });

  afterAll(async () => {
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }
  });

  describe('Scalability Tests', () => {
    test('should convert 10 component project within time limit', async () => {
      const projectPath = await createTestProject(tempDir, '10-components', 10);

      const startTime = performance.now();
      const startMemory = process.memoryUsage().heapUsed;

      const command = new RefactorCommand();
      const result = await command.execute(
        projectPath.source,
        projectPath.target,
        { ai: 'mock', validate: false }
      );

      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;

      const duration = endTime - startTime;
      const memoryUsed = endMemory - startMemory;

      console.log(`10 components: ${duration.toFixed(2)}ms, Memory: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB`);

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.smallProject);
      expect(memoryUsed).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryLimit);
      expect(result.success).toBe(true);
    }, 30000); // 30 second timeout

    test('should convert 50 component project within time limit', async () => {
      const projectPath = await createTestProject(tempDir, '50-components', 50);

      const startTime = performance.now();
      const startMemory = process.memoryUsage().heapUsed;

      const command = new RefactorCommand();
      const result = await command.execute(
        projectPath.source,
        projectPath.target,
        { ai: 'mock', validate: false }
      );

      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;

      const duration = endTime - startTime;
      const memoryUsed = endMemory - startMemory;

      console.log(`50 components: ${duration.toFixed(2)}ms, Memory: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB`);

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.mediumProject);
      expect(memoryUsed).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryLimit);
      expect(result.success).toBe(true);
    }, 60000); // 60 second timeout

    test('should convert 100+ component project within time limit', async () => {
      const projectPath = await createTestProject(tempDir, '100-components', 100);

      const startTime = performance.now();
      const startMemory = process.memoryUsage().heapUsed;

      const command = new RefactorCommand();
      const result = await command.execute(
        projectPath.source,
        projectPath.target,
        { ai: 'mock', validate: false }
      );

      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;

      const duration = endTime - startTime;
      const memoryUsed = endMemory - startMemory;

      console.log(`100 components: ${duration.toFixed(2)}ms, Memory: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB`);

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.largeProject);
      expect(memoryUsed).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryLimit);
      expect(result.success).toBe(true);
    }, 120000); // 120 second timeout
  });

  describe('Linear Scaling', () => {
    test('should scale linearly with component count', async () => {
      const sizes = [10, 20, 30];
      const timings = [];

      for (const size of sizes) {
        const projectPath = await createTestProject(tempDir, `${size}-linear`, size);

        const startTime = performance.now();

        const command = new RefactorCommand();
        await command.execute(
          projectPath.source,
          projectPath.target,
          { ai: 'mock', validate: false }
        );

        const endTime = performance.now();
        const duration = endTime - startTime;

        timings.push({ size, duration });
        console.log(`${size} components: ${duration.toFixed(2)}ms`);
      }

      // Check for linear scaling (each doubling should roughly double time)
      const ratio1 = timings[1].duration / timings[0].duration;
      const ratio2 = timings[2].duration / timings[1].duration;

      // Should be roughly linear (allow for overhead)
      expect(ratio1).toBeGreaterThan(1.5);
      expect(ratio1).toBeLessThan(3.0);
      expect(ratio2).toBeGreaterThan(1.0);
      expect(ratio2).toBeLessThan(2.5);
    }, 180000);
  });

  describe('Memory Leaks', () => {
    test('should not leak memory across multiple conversions', async () => {
      const iterations = 5;
      const memorySnapshots = [];

      for (let i = 0; i < iterations; i++) {
        const projectPath = await createTestProject(tempDir, `iteration-${i}`, 20);

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }

        const beforeMemory = process.memoryUsage().heapUsed;

        const command = new RefactorCommand();
        await command.execute(
          projectPath.source,
          projectPath.target,
          { ai: 'mock', validate: false }
        );

        if (global.gc) {
          global.gc();
        }

        const afterMemory = process.memoryUsage().heapUsed;
        const growth = afterMemory - beforeMemory;

        memorySnapshots.push(growth);
        console.log(`Iteration ${i + 1}: Memory growth ${(growth / 1024 / 1024).toFixed(2)}MB`);
      }

      // Memory growth should stabilize (not keep increasing)
      const firstHalfAvg = average(memorySnapshots.slice(0, 2));
      const secondHalfAvg = average(memorySnapshots.slice(3, 5));

      // Second half should not be significantly larger than first half
      const growthRatio = secondHalfAvg / firstHalfAvg;
      expect(growthRatio).toBeLessThan(2.0); // Allow some growth but not excessive
    }, 180000);
  });

  describe('Concurrent Processing', () => {
    test('should handle concurrent conversions efficiently', async () => {
      const concurrentProjects = 3;
      const projectPaths = [];

      // Create multiple projects
      for (let i = 0; i < concurrentProjects; i++) {
        const paths = await createTestProject(tempDir, `concurrent-${i}`, 15);
        projectPaths.push(paths);
      }

      const startTime = performance.now();

      // Run all conversions concurrently
      const conversions = projectPaths.map(async (paths) => {
        const command = new RefactorCommand();
        return command.execute(paths.source, paths.target, { ai: 'mock', validate: false });
      });

      const results = await Promise.all(conversions);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`${concurrentProjects} concurrent conversions: ${duration.toFixed(2)}ms`);

      // All should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Should be faster than sequential (allow for overhead)
      const sequentialEstimate = concurrentProjects * (PERFORMANCE_THRESHOLDS.smallProject / 10) * 15;
      expect(duration).toBeLessThan(sequentialEstimate);
    }, 120000);
  });

  describe('Component Complexity Impact', () => {
    test('should handle deeply nested components efficiently', async () => {
      const sourcePath = path.join(tempDir, 'nested-deep', 'source');
      await fs.ensureDir(sourcePath);

      // Create deeply nested component (10 levels)
      const deepComponent = generateDeeplyNestedComponent(10);
      await fs.writeFile(path.join(sourcePath, 'DeepNested.jsx'), deepComponent);

      const startTime = performance.now();

      const command = new RefactorCommand();
      await command.execute(
        sourcePath,
        path.join(tempDir, 'nested-deep', 'target'),
        { ai: 'mock', validate: false }
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Deep nested component: ${duration.toFixed(2)}ms`);

      // Should still complete within reasonable time
      expect(duration).toBeLessThan(5000);
    }, 30000);

    test('should handle components with many props efficiently', async () => {
      const sourcePath = path.join(tempDir, 'many-props', 'source');
      await fs.ensureDir(sourcePath);

      // Create component with 50 props
      const manyPropsComponent = generateComponentWithManyProps(50);
      await fs.writeFile(path.join(sourcePath, 'ManyProps.jsx'), manyPropsComponent);

      const startTime = performance.now();

      const command = new RefactorCommand();
      await command.execute(
        sourcePath,
        path.join(tempDir, 'many-props', 'target'),
        { ai: 'mock', validate: false }
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Many props component: ${duration.toFixed(2)}ms`);

      expect(duration).toBeLessThan(5000);
    }, 30000);
  });

  describe('File I/O Performance', () => {
    test('should efficiently read and write large number of files', async () => {
      const fileCount = 100;
      const sourcePath = path.join(tempDir, 'many-files', 'source');
      await fs.ensureDir(sourcePath);

      // Create many small components
      for (let i = 0; i < fileCount; i++) {
        await fs.writeFile(
          path.join(sourcePath, `Component${i}.jsx`),
          `import React from 'react'; const Component${i} = () => <div>Component ${i}</div>; export default Component${i};`
        );
      }

      const startTime = performance.now();

      const command = new RefactorCommand();
      await command.execute(
        sourcePath,
        path.join(tempDir, 'many-files', 'target'),
        { ai: 'mock', validate: false }
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`${fileCount} files: ${duration.toFixed(2)}ms`);

      // Should process files efficiently
      const avgTimePerFile = duration / fileCount;
      expect(avgTimePerFile).toBeLessThan(PERFORMANCE_THRESHOLDS.perComponent);
    }, 120000);
  });
});

// Helper functions
async function createTestProject(basePath, name, componentCount) {
  const sourcePath = path.join(basePath, name, 'source', 'src');
  const targetPath = path.join(basePath, name, 'target');

  await fs.ensureDir(sourcePath);
  await fs.ensureDir(targetPath);

  // Create package.json
  await fs.writeJson(path.join(sourcePath, '..', 'package.json'), {
    name: `test-project-${name}`,
    version: '1.0.0',
    dependencies: {
      'react': '^18.0.0',
      'react-dom': '^18.0.0'
    }
  });

  // Create components
  for (let i = 0; i < componentCount; i++) {
    const componentCode = generateTestComponent(i);
    await fs.writeFile(path.join(sourcePath, `Component${i}.jsx`), componentCode);
  }

  return { source: path.join(sourcePath, '..'), target: targetPath };
}

function generateTestComponent(index) {
  const hasState = index % 3 === 0;
  const hasProps = index % 2 === 0;

  if (hasState) {
    return `
import React, { useState, useEffect } from 'react';

const Component${index} = (${hasProps ? '{ title, count }' : ''}) => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setValue(value + 1);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="component-${index}">
      ${hasProps ? '<h2>{title}</h2>' : ''}
      <p>Value: {value}</p>
      ${hasProps ? '<p>Count: {count}</p>' : ''}
      {loading && <span>Loading...</span>}
      <button onClick={() => setValue(value + 1)}>Increment</button>
    </div>
  );
};

export default Component${index};
`;
  } else {
    return `
import React from 'react';

const Component${index} = (${hasProps ? '{ title, description }' : ''}) => {
  return (
    <div className="component-${index}">
      ${hasProps ? '<h2>{title}</h2>' : '<h2>Component ' + index + '</h2>'}
      ${hasProps ? '<p>{description}</p>' : '<p>Static content</p>'}
    </div>
  );
};

export default Component${index};
`;
  }
}

function generateDeeplyNestedComponent(depth) {
  let jsx = '';
  for (let i = 0; i < depth; i++) {
    jsx += `<div className="level-${i}">`;
  }
  jsx += 'Deep content';
  for (let i = 0; i < depth; i++) {
    jsx += '</div>';
  }

  return `
import React from 'react';

const DeeplyNested = () => {
  return (
    ${jsx}
  );
};

export default DeeplyNested;
`;
}

function generateComponentWithManyProps(propCount) {
  const props = Array.from({ length: propCount }, (_, i) => `prop${i}`).join(', ');
  const propUsage = Array.from({ length: propCount }, (_, i) => `<p>{prop${i}}</p>`).join('\n      ');

  return `
import React from 'react';

const ManyProps = ({ ${props} }) => {
  return (
    <div>
      ${propUsage}
    </div>
  );
};

export default ManyProps;
`;
}

function average(numbers) {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}
