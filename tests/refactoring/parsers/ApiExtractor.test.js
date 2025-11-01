/**
 * ApiExtractor tests
 */

const { ApiExtractor } = require('../../../lib/refactoring/parsers/ApiExtractor');

describe('ApiExtractor', () => {
  let extractor;

  beforeEach(() => {
    extractor = new ApiExtractor();
  });

  describe('fetch() Detection', () => {
    test('should extract fetch GET request', () => {
      const code = `
        const fetchData = async () => {
          const response = await fetch('/api/users');
          return response.json();
        };
      `;

      const result = extractor.extract(code, 'test.js');
      expect(result.endpoints.length).toBe(1);
      expect(result.endpoints[0].method).toBe('GET');
      expect(result.endpoints[0].path).toBe('/api/users');
    });

    test('should extract fetch POST request', () => {
      const code = `
        const createUser = async (user) => {
          const response = await fetch('/api/users', {
            method: 'POST',
            body: JSON.stringify({ name: user.name, email: user.email })
          });
        };
      `;

      const result = extractor.extract(code, 'test.js');
      expect(result.endpoints.length).toBe(1);
      expect(result.endpoints[0].method).toBe('POST');
      expect(result.endpoints[0].parameters).toContain('name');
      expect(result.endpoints[0].parameters).toContain('email');
    });
  });

  describe('axios Detection', () => {
    test('should extract axios GET request', () => {
      const code = `
        import axios from 'axios';

        const fetchUser = async (id) => {
          const response = await axios.get(\`/api/users/\${id}\`);
          return response.data;
        };
      `;

      const result = extractor.extract(code, 'test.js');
      expect(result.endpoints.length).toBe(1);
      expect(result.endpoints[0].method).toBe('GET');
      expect(result.endpoints[0].path).toContain('/api/users');
    });

    test('should extract axios POST request', () => {
      const code = `
        import axios from 'axios';

        const createPost = async (data) => {
          return await axios.post('/api/posts', { title: data.title, content: data.content });
        };
      `;

      const result = extractor.extract(code, 'test.js');
      expect(result.endpoints.length).toBe(1);
      expect(result.endpoints[0].method).toBe('POST');
      expect(result.endpoints[0].parameters.length).toBeGreaterThan(0);
    });
  });

  describe('GraphQL Detection', () => {
    test('should detect GraphQL query', () => {
      const code = `
        import { useQuery } from '@apollo/client';
        import { gql } from 'graphql-tag';

        const GET_USER = gql\`
          query GetUser {
            user {
              name
              email
            }
          }
        \`;
      `;

      const result = extractor.extract(code, 'test.js');
      expect(result.hasGraphQL).toBe(true);
    });
  });

  describe('Base URL Detection', () => {
    test('should extract base URL', () => {
      const code = `
        const API_BASE_URL = 'https://api.example.com';
      `;

      const result = extractor.extract(code, 'test.js');
      expect(result.baseUrl).toBe('https://api.example.com');
    });
  });

  describe('Flutter Service Generation', () => {
    test('should generate Flutter service suggestion', () => {
      const extractionResult = {
        endpoints: [
          {
            method: 'GET',
            path: '/api/users',
            description: 'Get users',
            parameters: [],
          },
        ],
        baseUrl: null,
        hasGraphQL: false,
      };

      const suggestion = extractor.generateFlutterService(extractionResult);
      expect(suggestion.packages).toContain('dio: ^5.0.0');
      expect(suggestion.methods.length).toBe(1);
    });
  });
});
