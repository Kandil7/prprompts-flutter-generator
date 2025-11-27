const fs = require('fs');

try {
    const content = fs.readFileSync('refactoring_failures.json', 'utf8');
    // The output might contain non-JSON text at the beginning/end (logs).
    // We need to extract the JSON part.
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
        console.error('Could not find JSON in output');
        process.exit(1);
    }

    const jsonStr = content.substring(jsonStart, jsonEnd + 1);
    console.log('Extracted JSON start:', jsonStr.substring(0, 200));

    const data = JSON.parse(jsonStr);

    console.log(`Total Failed Tests: ${data.numFailedTests}`);
    console.log(`Total Failed Suites: ${data.numFailedTestSuites}`);

    const failedSuites = data.testResults.filter(suite => suite.status === 'failed');

    failedSuites.forEach(suite => {
        console.log(`\nFile: ${suite.name}`);
        suite.assertionResults
            .filter(test => test.status === 'failed')
            .forEach(test => {
                console.log(`  Test: ${test.fullName}`);
                if (test.failureMessages && test.failureMessages.length > 0) {
                    console.log(`  Error: ${test.failureMessages[0].split('\n')[0]}`);
                } else {
                    console.log(`  Error: No failure message`);
                }
            });
    });

} catch (error) {
    console.error('Error parsing failures:', error);
}
