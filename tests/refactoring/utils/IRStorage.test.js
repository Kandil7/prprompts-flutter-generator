/**
 * IRStorage Tests
 *
 * Tests for Intermediate Representation storage and caching
 * - Component serialization
 * - Feature organization
 * - Cache management
 * - Manifest generation
 * - Complexity calculation
 */

const IRStorage = require('../../../lib/refactoring/utils/IRStorage');
const fs = require('fs-extra');
const path = require('path');

describe('IRStorage', () => {
  let storage;
  let testDir;

  beforeEach(() => {
    testDir = path.join(__dirname, '__test_ir__');
    fs.ensureDirSync(testDir);

    storage = new IRStorage({
      basePath: testDir,
      cacheExpiry: 3600000, // 1 hour
      compress: false,
      verbose: false
    });
  });

  afterEach(() => {
    fs.removeSync(testDir);
  });

  describe('Component Serialization', () => {
    test('should serialize component to JSON', () => {
      const component = {
        name: 'UserCard',
        type: 'functional',
        props: [
          { name: 'user', type: 'User', required: true },
          { name: 'onClick', type: 'function', required: false }
        ],
        state: [
          { name: 'isHovered', initialValue: 'false', type: 'boolean' }
        ],
        hooks: [
          { type: 'useState', variable: 'isHovered' },
          { type: 'useEffect', dependencies: ['user'] }
        ],
        jsx: '<div>...</div>',
        imports: ['React', 'useState', 'useEffect']
      };

      const serialized = storage.serializeComponent(component);
      expect(serialized).toContain('"name":"UserCard"');
      expect(serialized).toContain('"type":"functional"');
      expect(serialized).toContain('"props":[');
    });

    test('should deserialize JSON to component', () => {
      const json = JSON.stringify({
        name: 'Button',
        type: 'functional',
        props: [],
        state: [],
        hooks: [],
        jsx: '<button>Click</button>',
        imports: []
      });

      const component = storage.deserializeComponent(json);
      expect(component.name).toBe('Button');
      expect(component.type).toBe('functional');
      expect(component.jsx).toBe('<button>Click</button>');
    });

    test('should preserve complex nested structures', () => {
      const component = {
        name: 'ComplexComponent',
        type: 'functional',
        props: [
          {
            name: 'config',
            type: 'object',
            schema: {
              title: 'string',
              settings: {
                enabled: 'boolean',
                count: 'number'
              }
            }
          }
        ],
        state: [],
        hooks: [],
        jsx: '<div/>',
        imports: []
      };

      const serialized = storage.serializeComponent(component);
      const deserialized = storage.deserializeComponent(serialized);

      expect(deserialized.props[0].schema.settings.enabled).toBe('boolean');
    });
  });

  describe('Feature Organization', () => {
    test('should create feature-based directory structure', async () => {
      const component = {
        name: 'LoginForm',
        type: 'functional',
        feature: 'authentication',
        props: [],
        state: [],
        hooks: [],
        jsx: '<form/>',
        imports: []
      };

      await storage.saveComponent(component);

      const featurePath = path.join(testDir, 'authentication');
      expect(fs.existsSync(featurePath)).toBe(true);
    });

    test('should save component in correct feature directory', async () => {
      const component = {
        name: 'ProductCard',
        type: 'functional',
        feature: 'products',
        props: [],
        state: [],
        hooks: [],
        jsx: '<div/>',
        imports: []
      };

      const filePath = await storage.saveComponent(component);
      expect(filePath).toContain('products');
      expect(filePath).toContain('ProductCard.json');
    });

    test('should handle components without feature assignment', async () => {
      const component = {
        name: 'GenericButton',
        type: 'functional',
        props: [],
        state: [],
        hooks: [],
        jsx: '<button/>',
        imports: []
      };

      const filePath = await storage.saveComponent(component);
      expect(filePath).toContain('common');
    });
  });

  describe('Cache Management', () => {
    test('should cache component after saving', async () => {
      const component = {
        name: 'CachedComponent',
        type: 'functional',
        feature: 'test',
        props: [],
        state: [],
        hooks: [],
        jsx: '<div/>',
        imports: []
      };

      await storage.saveComponent(component);
      const cacheKey = storage.getCacheKey('test', 'CachedComponent');
      const cached = storage.getFromCache(cacheKey);

      expect(cached).toBeDefined();
      expect(cached.name).toBe('CachedComponent');
    });

    test('should return cached component on second read', async () => {
      const component = {
        name: 'TestComponent',
        type: 'functional',
        feature: 'cache',
        props: [],
        state: [],
        hooks: [],
        jsx: '<span/>',
        imports: []
      };

      await storage.saveComponent(component);

      // First read - from file
      const first = await storage.loadComponent('cache', 'TestComponent');

      // Second read - from cache
      const second = await storage.loadComponent('cache', 'TestComponent');

      expect(first).toEqual(second);
    });

    test('should expire cache after specified time', async () => {
      const shortCacheStorage = new IRStorage({
        basePath: testDir,
        cacheExpiry: 100, // 100ms
        verbose: false
      });

      const component = {
        name: 'ExpireTest',
        type: 'functional',
        feature: 'expire',
        props: [],
        state: [],
        hooks: [],
        jsx: '<div/>',
        imports: []
      };

      await shortCacheStorage.saveComponent(component);

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      const cacheKey = shortCacheStorage.getCacheKey('expire', 'ExpireTest');
      const cached = shortCacheStorage.getFromCache(cacheKey);

      expect(cached).toBeNull();
    });

    test('should clear cache on demand', async () => {
      const component = {
        name: 'ClearTest',
        type: 'functional',
        feature: 'clear',
        props: [],
        state: [],
        hooks: [],
        jsx: '<div/>',
        imports: []
      };

      await storage.saveComponent(component);
      storage.clearCache();

      const cacheKey = storage.getCacheKey('clear', 'ClearTest');
      const cached = storage.getFromCache(cacheKey);

      expect(cached).toBeNull();
    });
  });

  describe('Manifest Generation', () => {
    test('should generate manifest for feature', async () => {
      const components = [
        {
          name: 'Component1',
          type: 'functional',
          feature: 'manifest-test',
          props: [],
          state: [],
          hooks: [],
          jsx: '<div/>',
          imports: []
        },
        {
          name: 'Component2',
          type: 'class',
          feature: 'manifest-test',
          props: [],
          state: [],
          hooks: [],
          jsx: '<span/>',
          imports: []
        }
      ];

      for (const comp of components) {
        await storage.saveComponent(comp);
      }

      const manifest = await storage.generateFeatureManifest('manifest-test');

      expect(manifest.featureName).toBe('manifest-test');
      expect(manifest.componentCount).toBe(2);
      expect(manifest.components).toHaveLength(2);
    });

    test('should include component metadata in manifest', async () => {
      const component = {
        name: 'MetaTest',
        type: 'functional',
        feature: 'meta',
        props: [{ name: 'value', type: 'string' }],
        state: [{ name: 'count', type: 'number' }],
        hooks: [{ type: 'useState' }],
        jsx: '<div/>',
        imports: ['React', 'useState']
      };

      await storage.saveComponent(component);
      const manifest = await storage.generateFeatureManifest('meta');

      const comp = manifest.components[0];
      expect(comp.name).toBe('MetaTest');
      expect(comp.type).toBe('functional');
      expect(comp.propsCount).toBe(1);
      expect(comp.stateCount).toBe(1);
      expect(comp.hooksCount).toBe(1);
    });

    test('should generate global manifest for all features', async () => {
      const features = ['feature1', 'feature2'];

      for (const feature of features) {
        await storage.saveComponent({
          name: `${feature}Component`,
          type: 'functional',
          feature,
          props: [],
          state: [],
          hooks: [],
          jsx: '<div/>',
          imports: []
        });
      }

      const globalManifest = await storage.generateGlobalManifest();

      expect(globalManifest.totalFeatures).toBe(2);
      expect(globalManifest.totalComponents).toBe(2);
      expect(globalManifest.features).toHaveLength(2);
    });
  });

  describe('Complexity Calculation', () => {
    test('should calculate basic component complexity', () => {
      const component = {
        name: 'Simple',
        type: 'functional',
        props: [],
        state: [],
        hooks: [],
        jsx: '<div>Hello</div>',
        imports: []
      };

      const complexity = storage.calculateComplexity(component);
      expect(complexity).toBe(1); // Base complexity
    });

    test('should increase complexity with state', () => {
      const component = {
        name: 'Stateful',
        type: 'functional',
        props: [],
        state: [
          { name: 'count', type: 'number' },
          { name: 'name', type: 'string' }
        ],
        hooks: [],
        jsx: '<div/>',
        imports: []
      };

      const complexity = storage.calculateComplexity(component);
      expect(complexity).toBeGreaterThan(1);
    });

    test('should increase complexity with hooks', () => {
      const component = {
        name: 'Hooked',
        type: 'functional',
        props: [],
        state: [],
        hooks: [
          { type: 'useEffect' },
          { type: 'useCallback' },
          { type: 'useMemo' }
        ],
        jsx: '<div/>',
        imports: []
      };

      const complexity = storage.calculateComplexity(component);
      expect(complexity).toBeGreaterThan(1);
    });

    test('should count conditionals in JSX', () => {
      const component = {
        name: 'Conditional',
        type: 'functional',
        props: [],
        state: [],
        hooks: [],
        jsx: `
          <div>
            {condition && <span/>}
            {value ? <a/> : <b/>}
            {items.map(item => <li key={item}>{item}</li>)}
          </div>
        `,
        imports: []
      };

      const complexity = storage.calculateComplexity(component);
      const conditionalCount = storage.countConditionals(component.jsx);

      expect(conditionalCount).toBeGreaterThan(0);
      expect(complexity).toBeGreaterThan(1);
    });

    test('should count loops in JSX', () => {
      const component = {
        name: 'Looped',
        type: 'functional',
        props: [],
        state: [],
        hooks: [],
        jsx: `
          <ul>
            {items.map(item => <li>{item}</li>)}
            {data.filter(x => x.active).map(x => <div>{x.name}</div>)}
          </ul>
        `,
        imports: []
      };

      const loopCount = storage.countLoops(component.jsx);
      expect(loopCount).toBe(2);
    });

    test('should classify complexity levels', () => {
      const simple = { name: 'S', type: 'functional', props: [], state: [], hooks: [], jsx: '<div/>', imports: [] };
      const complex = {
        name: 'C',
        type: 'functional',
        props: Array(10).fill({ name: 'p', type: 'any' }),
        state: Array(5).fill({ name: 's', type: 'any' }),
        hooks: Array(8).fill({ type: 'useEffect' }),
        jsx: '<div/>',
        imports: []
      };

      expect(storage.getComplexityLevel(storage.calculateComplexity(simple))).toBe('low');
      expect(storage.getComplexityLevel(storage.calculateComplexity(complex))).toBe('high');
    });
  });

  describe('Storage Statistics', () => {
    test('should calculate storage size', async () => {
      const components = Array.from({ length: 5 }, (_, i) => ({
        name: `Component${i}`,
        type: 'functional',
        feature: 'stats',
        props: [],
        state: [],
        hooks: [],
        jsx: '<div/>',
        imports: []
      }));

      for (const comp of components) {
        await storage.saveComponent(comp);
      }

      const stats = await storage.getStorageStats();
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.fileCount).toBe(5);
    });

    test('should format storage size', () => {
      expect(storage.formatSize(1024)).toBe('1.00 KB');
      expect(storage.formatSize(1048576)).toBe('1.00 MB');
      expect(storage.formatSize(500)).toBe('500 B');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing component gracefully', async () => {
      await expect(storage.loadComponent('nonexistent', 'Missing')).rejects.toThrow();
    });

    test('should handle corrupted JSON', async () => {
      const corruptedPath = path.join(testDir, 'corrupted', 'Bad.json');
      fs.ensureDirSync(path.dirname(corruptedPath));
      fs.writeFileSync(corruptedPath, 'not valid json{{{');

      await expect(storage.loadComponent('corrupted', 'Bad')).rejects.toThrow();
    });

    test('should validate component structure before saving', async () => {
      const invalid = {
        // Missing required fields
        name: 'Invalid'
      };

      await expect(storage.saveComponent(invalid)).rejects.toThrow();
    });
  });
});
