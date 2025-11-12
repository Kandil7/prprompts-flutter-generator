#!/usr/bin/env node

/**
 * Synchronize versions across all extension manifests
 * Ensures all AI extension manifests match package.json version
 *
 * Usage: npm run sync-versions
 *
 * Updates:
 * - claude-extension.json
 * - qwen-extension.json
 * - gemini-extension.json
 * - .claude-plugin/plugin.json
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Files to synchronize
const MANIFEST_FILES = [
  'claude-extension.json',
  'qwen-extension.json',
  'gemini-extension.json',
  path.join('.claude-plugin', 'plugin.json')
];

/**
 * Read and parse JSON file
 */
function readJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Failed to read ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Write JSON file with formatting
 */
function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    return true;
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Failed to write ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Main sync function
 */
function syncVersions() {
  console.log(`${colors.bold}${colors.cyan}PRPROMPTS Version Synchronizer${colors.reset}`);
  console.log('━'.repeat(50));

  // Get package.json version
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageData = readJSON(packagePath);

  if (!packageData) {
    console.error(`${colors.red}✗ Cannot read package.json${colors.reset}`);
    process.exit(1);
  }

  const targetVersion = packageData.version;
  console.log(`${colors.blue}📦 Package version:${colors.reset} ${colors.bold}${targetVersion}${colors.reset}\n`);

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  // Process each manifest file
  MANIFEST_FILES.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    const displayName = file.replace(/\\/g, '/');

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`${colors.yellow}⚠${colors.reset}  ${displayName} - ${colors.yellow}File not found${colors.reset}`);
      errorCount++;
      return;
    }

    // Read current manifest
    const manifest = readJSON(filePath);
    if (!manifest) {
      errorCount++;
      return;
    }

    const currentVersion = manifest.version;

    // Check if update needed
    if (currentVersion === targetVersion) {
      console.log(`${colors.green}✓${colors.reset}  ${displayName} - ${colors.green}Already up to date${colors.reset}`);
      skippedCount++;
      return;
    }

    // Update version
    const oldVersion = manifest.version;
    manifest.version = targetVersion;

    // Write updated manifest
    if (writeJSON(filePath, manifest)) {
      console.log(`${colors.green}✓${colors.reset}  ${displayName} - Updated ${colors.yellow}${oldVersion}${colors.reset} → ${colors.green}${targetVersion}${colors.reset}`);
      updatedCount++;
    } else {
      errorCount++;
    }
  });

  // Summary
  console.log('\n' + '━'.repeat(50));
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  ${colors.green}✓ Updated:${colors.reset} ${updatedCount} files`);
  console.log(`  ${colors.blue}⊝ Skipped:${colors.reset} ${skippedCount} files (already up to date)`);

  if (errorCount > 0) {
    console.log(`  ${colors.red}✗ Errors:${colors.reset} ${errorCount} files`);
    console.log(`\n${colors.red}⚠ Version sync completed with errors${colors.reset}`);
    process.exit(1);
  } else if (updatedCount > 0) {
    console.log(`\n${colors.green}✅ Version sync completed successfully!${colors.reset}`);
    console.log(`${colors.cyan}All extension manifests now at version ${colors.bold}${targetVersion}${colors.reset}`);
  } else {
    console.log(`\n${colors.blue}ℹ All manifests already synchronized${colors.reset}`);
  }

  // Additional validation
  validateVersionConsistency(targetVersion);
}

/**
 * Validate that all versions are consistent
 */
function validateVersionConsistency(expectedVersion) {
  console.log(`\n${colors.bold}Validation:${colors.reset}`);

  let allValid = true;

  MANIFEST_FILES.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    const displayName = file.replace(/\\/g, '/');

    if (!fs.existsSync(filePath)) {
      return;
    }

    const manifest = readJSON(filePath);
    if (!manifest) {
      return;
    }

    if (manifest.version === expectedVersion) {
      console.log(`  ${colors.green}✓${colors.reset} ${displayName}: ${colors.green}${manifest.version}${colors.reset}`);
    } else {
      console.log(`  ${colors.red}✗${colors.reset} ${displayName}: ${colors.red}${manifest.version}${colors.reset} (expected ${expectedVersion})`);
      allValid = false;
    }
  });

  if (allValid) {
    console.log(`\n${colors.green}✅ All versions validated successfully${colors.reset}`);
  } else {
    console.log(`\n${colors.red}❌ Version validation failed${colors.reset}`);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  syncVersions();
}

module.exports = { syncVersions };