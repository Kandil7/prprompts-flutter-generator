/**
 * AI Enhancement Layer - Usage Example
 * Demonstrates how to use Phase 4 AI services to enhance generated Flutter code
 */

const {
  createAIClient,
  createAIServices
} = require('../lib/refactoring/ai');

// Sample generated Flutter code from Phase 3
const generatedFlutterCode = `
Widget build(BuildContext context) {
  var userdata = null;
  var isloading = false;

  return Container(
    child: Column(
      children: [
        Text('User Profile'),
        IconButton(
          icon: Icon(Icons.settings),
          onPressed: () {},
        ),
        ListView(
          children: users.map((user) => UserCard(user)).toList(),
        ),
      ],
    ),
  );
}
`;

// Sample React code for context
const reactCode = `
function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      <h1>User Profile</h1>
      <button onClick={handleSettings}>
        <Settings />
      </button>
      {users.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
}
`;

// Component model from Phase 1
const componentModel = {
  name: 'UserProfile',
  type: 'Page',
  feature: 'user',
  filePath: 'src/pages/UserProfile.tsx',
  props: [],
  state: [
    { name: 'userData', type: 'User', initialValue: 'null' },
    { name: 'isLoading', type: 'bool', initialValue: 'false' }
  ],
  methods: ['handleSettings'],
  apiCalls: [
    { endpoint: '/api/users', method: 'GET' }
  ]
};

// Widget model from Phase 3
const widgetModel = {
  type: 'StatefulWidget',
  name: 'UserProfilePage',
  hasState: true,
  children: [
    { type: 'Text' },
    { type: 'IconButton' },
    { type: 'ListView' }
  ]
};

/**
 * Main enhancement workflow
 */
async function enhanceWithAI() {
  console.log('🚀 AI Enhancement Example\n');

  // Step 1: Create AI client (using mock for demo - no API calls)
  console.log('Step 1: Creating AI client...');
  const aiClient = createAIClient('mock', {
    apiKey: 'demo-key'
  });

  // Step 2: Create enhancement services
  console.log('Step 2: Creating enhancement services...');
  const {
    codeEnhancer,
    widgetOptimizer,
    testGenerator,
    accessibilityChecker
  } = createAIServices(aiClient, console);

  console.log('\n---\n');

  // Step 3: Enhance code
  console.log('Step 3: Enhancing code with AI...');
  const enhancementResult = await codeEnhancer.enhance(
    generatedFlutterCode,
    {
      reactCode,
      componentName: 'UserProfile',
      feature: 'user'
    }
  );

  console.log('\nEnhanced Code Preview:');
  console.log(enhancementResult.enhancedCode.substring(0, 300) + '...\n');

  console.log('Changelog:');
  console.log(codeEnhancer.formatChangelog(enhancementResult.changelog));

  console.log(`Confidence: ${(enhancementResult.confidence * 100).toFixed(0)}%\n`);

  console.log('\n---\n');

  // Step 4: Optimize widget tree
  console.log('Step 4: Optimizing widget tree...');
  const optimizationResult = await widgetOptimizer.optimize(
    widgetModel,
    enhancementResult.enhancedCode
  );

  console.log(widgetOptimizer.formatOptimizations(optimizationResult));

  console.log('\n---\n');

  // Step 5: Generate tests
  console.log('Step 5: Generating tests...');
  const testResults = await testGenerator.generateTests(
    componentModel,
    enhancementResult.enhancedCode
  );

  console.log('Widget Tests Generated:');
  console.log(testResults.widgetTests.substring(0, 300) + '...\n');

  console.log('Unit Tests Generated:');
  console.log(testResults.unitTests.substring(0, 200) + '...\n');

  console.log('\n---\n');

  // Step 6: Check accessibility
  console.log('Step 6: Checking accessibility...');
  const accessibilityResult = await accessibilityChecker.check(
    enhancementResult.enhancedCode,
    {
      checkAccessibility: true,
      checkPerformance: true,
      checkSecurity: true
    }
  );

  console.log(accessibilityChecker.formatReport(accessibilityResult));

  console.log('\n---\n');

  // Step 7: Summary
  console.log('📊 Enhancement Summary:');
  console.log(`- Code changes: ${enhancementResult.changelog.length}`);
  console.log(`- Optimizations found: ${optimizationResult.optimizations.length}`);
  console.log(`- Widget tree score: ${(optimizationResult.overallScore * 100).toFixed(0)}%`);
  console.log(`- Accessibility score: ${(accessibilityResult.score * 100).toFixed(0)}%`);
  console.log(`- Tests generated: Widget, Unit, Integration`);

  // Token usage
  const tokenUsage = aiClient.getTokenUsage();
  console.log(`\n💰 Token Usage:`);
  console.log(`- Total tokens: ${tokenUsage.totalTokens}`);
  console.log(`- Requests: ${tokenUsage.requestCount}`);

  console.log('\n✅ Enhancement complete!\n');
}

/**
 * Example with real AI provider (Claude)
 * Requires CLAUDE_API_KEY environment variable
 */
async function enhanceWithClaude() {
  if (!process.env.CLAUDE_API_KEY) {
    console.log('⚠️  CLAUDE_API_KEY not set. Skipping real AI example.');
    console.log('   Set it with: export CLAUDE_API_KEY=your-key\n');
    return;
  }

  console.log('🤖 Enhancing with Claude AI...\n');

  const aiClient = createAIClient('claude', {
    apiKey: process.env.CLAUDE_API_KEY,
    model: 'claude-sonnet-4-20250514',
    maxTokens: 4000,
    temperature: 0.3
  });

  const { codeEnhancer } = createAIServices(aiClient, console);

  try {
    const result = await codeEnhancer.enhance(
      generatedFlutterCode,
      {
        reactCode,
        componentName: 'UserProfile',
        feature: 'user'
      }
    );

    console.log('Enhanced Code:');
    console.log(result.enhancedCode);
    console.log('\n');
    console.log(codeEnhancer.formatChangelog(result.changelog));

  } catch (error) {
    console.error('❌ Enhancement failed:', error.message);
  }
}

// Run examples
if (require.main === module) {
  (async () => {
    try {
      // Run mock example (always works, no API key needed)
      await enhanceWithAI();

      // Run real Claude example (only if API key is set)
      await enhanceWithClaude();

    } catch (error) {
      console.error('Error running example:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  enhanceWithAI,
  enhanceWithClaude
};
