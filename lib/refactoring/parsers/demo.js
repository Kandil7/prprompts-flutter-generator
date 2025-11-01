/**
 * Demo script to test the parsers
 */

const fs = require('fs');
const path = require('path');
const { ReactParser } = require('./ReactParser');
const { TypeExtractor } = require('./TypeExtractor');
const { StateManagementDetector } = require('./StateManagementDetector');
const { ApiExtractor } = require('./ApiExtractor');
const { StyleExtractor } = require('./StyleExtractor');

console.log('='.repeat(80));
console.log('PHASE 2: React Parser Implementation - Demo');
console.log('='.repeat(80));
console.log('');

// Test ReactParser
console.log('1. Testing ReactParser with SimpleComponent.tsx');
console.log('-'.repeat(80));
try {
  const parser = new ReactParser();
  const filePath = path.join(__dirname, '../../../tests/refactoring/fixtures/react/SimpleComponent.tsx');
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const component = parser.parse(sourceCode, filePath);

  if (component) {
    console.log('✓ Component parsed successfully');
    console.log(`  Name: ${component.name}`);
    console.log(`  Type: ${component.type}`);
    console.log(`  Props: ${component.props.length}`);
    console.log(`  Exports: ${component.exports.length}`);
    console.log(`  Complexity Score: ${component.getComplexityScore()}`);
    console.log('');
  } else {
    console.log('✗ Failed to parse component');
  }
} catch (error) {
  console.log(`✗ Error: ${error.message}`);
}

// Test TypeExtractor
console.log('2. Testing TypeExtractor');
console.log('-'.repeat(80));
try {
  const extractor = new TypeExtractor();
  const code = `
    interface User {
      name: string;
      age: number;
      email?: string;
    }
  `;
  const result = extractor.extract(code, 'test.ts');
  console.log(`✓ Extracted ${result.interfaces.length} interface(s)`);
  if (result.interfaces.length > 0) {
    console.log(`  Interface: ${result.interfaces[0].name}`);
    console.log(`  Properties: ${result.interfaces[0].properties.length}`);
  }
  console.log('');
} catch (error) {
  console.log(`✗ Error: ${error.message}`);
}

// Test StateManagementDetector
console.log('3. Testing StateManagementDetector');
console.log('-'.repeat(80));
try {
  const detector = new StateManagementDetector();
  const code = `
    import { useState } from 'react';

    const Counter = () => {
      const [count, setCount] = useState(0);
      return <div>{count}</div>;
    };
  `;
  const result = detector.detect(code, 'test.jsx');
  console.log(`✓ Detected pattern: ${result.pattern}`);
  console.log(`  Flutter recommendation: ${result.flutterRecommendation}`);
  console.log(`  Complexity: ${result.complexity}`);
  console.log('');
} catch (error) {
  console.log(`✗ Error: ${error.message}`);
}

// Test ApiExtractor
console.log('4. Testing ApiExtractor');
console.log('-'.repeat(80));
try {
  const extractor = new ApiExtractor();
  const code = `
    const fetchData = async () => {
      const response = await fetch('/api/users');
      return response.json();
    };
  `;
  const result = extractor.extract(code, 'test.js');
  console.log(`✓ Extracted ${result.endpoints.length} endpoint(s)`);
  if (result.endpoints.length > 0) {
    console.log(`  Method: ${result.endpoints[0].method}`);
    console.log(`  Path: ${result.endpoints[0].path}`);
  }
  console.log('');
} catch (error) {
  console.log(`✗ Error: ${error.message}`);
}

// Test StyleExtractor
console.log('5. Testing StyleExtractor');
console.log('-'.repeat(80));
try {
  const extractor = new StyleExtractor();
  const code = `
    const styles = {
      container: {
        padding: 20,
        backgroundColor: '#fff',
      },
    };
  `;
  const result = extractor.extract(code, 'test.js');
  console.log(`✓ Extracted ${Object.keys(result.styles).length} style(s)`);
  console.log(`  Inline styles: ${result.inlineStyles.length}`);
  console.log(`  Theme variables: ${Object.keys(result.themeVariables).length}`);
  console.log('');
} catch (error) {
  console.log(`✗ Error: ${error.message}`);
}

console.log('='.repeat(80));
console.log('Demo completed!');
console.log('='.repeat(80));
