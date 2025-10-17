#!/usr/bin/env node

/**
 * PRPROMPTS Auto-Updater
 * Checks for and installs updates from GitHub
 * Version: 3.0.0
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

// Configuration
const REPO_OWNER = 'Kandil7';
const REPO_NAME = 'prprompts-flutter-generator';
const GITHUB_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
const CONFIG_DIR = path.join(os.homedir(), '.prprompts');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const VERSION_FILE = path.join(CONFIG_DIR, 'version.json');

// Colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

function colorize(text, color) {
  return `${colors[color] || ''}${text}${colors.reset}`;
}

// HTTP GET request with promise
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'PRPROMPTS-Updater'
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Get current version
function getCurrentVersion() {
  if (fs.existsSync(VERSION_FILE)) {
    const versionData = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
    return versionData.version;
  }

  if (fs.existsSync(CONFIG_FILE)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    return config.version || '2.2.0';
  }

  return '2.2.0'; // fallback
}

// Get latest version from GitHub
async function getLatestVersion() {
  try {
    const release = await httpsGet(`${GITHUB_API}/releases/latest`);
    return release.tag_name.replace(/^v/, '');
  } catch (error) {
    // If no releases, try tags
    try {
      const tags = await httpsGet(`${GITHUB_API}/tags`);
      if (tags.length > 0) {
        return tags[0].name.replace(/^v/, '');
      }
    } catch (err) {
      // Silent fail
    }
  }

  return null;
}

// Compare versions (returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2)
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }

  return 0;
}

// Check for updates
async function checkForUpdates(silent = false) {
  if (!silent) {
    console.log(colorize('🔍 Checking for updates...', 'cyan'));
  }

  const currentVersion = getCurrentVersion();
  const latestVersion = await getLatestVersion();

  if (!latestVersion) {
    if (!silent) {
      console.log(colorize('⚠ Could not check for updates', 'yellow'));
    }
    return { updateAvailable: false };
  }

  const comparison = compareVersions(currentVersion, latestVersion);

  if (comparison < 0) {
    if (!silent) {
      console.log('');
      console.log(colorize(`🎉 Update available!`, 'green'));
      console.log(colorize(`   Current: ${currentVersion}`, 'yellow'));
      console.log(colorize(`   Latest:  ${latestVersion}`, 'green'));
      console.log('');
    }

    return {
      updateAvailable: true,
      currentVersion,
      latestVersion
    };
  } else {
    if (!silent) {
      console.log(colorize(`✓ You're up to date (v${currentVersion})`, 'green'));
    }

    return {
      updateAvailable: false,
      currentVersion,
      latestVersion
    };
  }
}

// Backup current installation
function backupInstallation() {
  const backupDir = path.join(CONFIG_DIR, 'backups');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupPath = path.join(backupDir, `backup-${timestamp}`);

  console.log(colorize('📦 Creating backup...', 'cyan'));

  fs.mkdirSync(backupPath, { recursive: true });

  // Backup config files
  ['config.json', 'version.json'].forEach(file => {
    const srcFile = path.join(CONFIG_DIR, file);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join(backupPath, file));
    }
  });

  console.log(colorize(`✓ Backup created: ${backupPath}`, 'green'));
  return backupPath;
}

// Perform update
async function performUpdate() {
  console.log('');
  console.log(colorize('🔄 Starting update process...', 'cyan'));
  console.log('');

  try {
    // 1. Backup
    const backupPath = backupInstallation();

    // 2. Clone latest version
    const tempDir = path.join(os.tmpdir(), `prprompts-update-${Date.now()}`);
    console.log(colorize('📥 Downloading latest version...', 'cyan'));

    execSync(`git clone --depth 1 https://github.com/${REPO_OWNER}/${REPO_NAME}.git "${tempDir}"`, {
      stdio: 'ignore'
    });

    console.log(colorize('✓ Downloaded', 'green'));

    // 3. Run smart installer
    console.log(colorize('🚀 Installing update...', 'cyan'));

    const installerPath = path.join(tempDir, 'scripts', 'smart-install.sh');
    if (fs.existsSync(installerPath)) {
      execSync(`bash "${installerPath}"`, { stdio: 'inherit' });
    } else {
      // Fallback to manual installation
      const scriptDir = path.join(tempDir, 'scripts');

      // Re-detect which AIs are installed
      const claudeInstalled = commandExists('claude');
      const qwenInstalled = commandExists('qwen');
      const geminiInstalled = commandExists('gemini');

      if (claudeInstalled) {
        execSync(`bash "${path.join(scriptDir, 'install-commands.sh')}" --global`, { stdio: 'inherit' });
      }
      if (qwenInstalled) {
        execSync(`bash "${path.join(scriptDir, 'install-qwen-commands.sh')}" --global`, { stdio: 'inherit' });
      }
      if (geminiInstalled) {
        execSync(`bash "${path.join(scriptDir, 'install-gemini-commands.sh')}" --global`, { stdio: 'inherit' });
      }

      // Update CLI wrapper
      const binSrc = path.join(tempDir, 'bin', 'prprompts');
      const binDest = path.join(CONFIG_DIR, 'bin', 'prprompts');
      if (fs.existsSync(binSrc)) {
        fs.mkdirSync(path.dirname(binDest), { recursive: true });
        fs.copyFileSync(binSrc, binDest);
        fs.chmodSync(binDest, '755');
      }
    }

    // 4. Update version file
    const latestVersion = await getLatestVersion();
    if (latestVersion) {
      const versionData = {
        version: latestVersion,
        updated_at: new Date().toISOString(),
        backup: backupPath
      };
      fs.writeFileSync(VERSION_FILE, JSON.stringify(versionData, null, 2));
    }

    // 5. Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log('');
    console.log(colorize('✅ Update completed successfully!', 'green'));
    console.log(colorize(`📦 Backup saved: ${backupPath}`, 'cyan'));
    console.log('');

  } catch (error) {
    console.error('');
    console.error(colorize('❌ Update failed:', 'red'), error.message);
    console.error('');
    console.error(colorize('You can manually update by running:', 'yellow'));
    console.error(`  git clone https://github.com/${REPO_OWNER}/${REPO_NAME}.git`);
    console.error('  cd prprompts-flutter-generator');
    console.error('  ./scripts/smart-install.sh');
    console.error('');
    process.exit(1);
  }
}

// Check if command exists
function commandExists(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Rollback to previous version
function rollbackToPrevious() {
  console.log(colorize('⏪ Rolling back to previous version...', 'cyan'));

  const backupDir = path.join(CONFIG_DIR, 'backups');

  if (!fs.existsSync(backupDir)) {
    console.error(colorize('❌ No backups found', 'red'));
    process.exit(1);
  }

  // Find latest backup
  const backups = fs.readdirSync(backupDir)
    .filter(name => name.startsWith('backup-'))
    .sort()
    .reverse();

  if (backups.length === 0) {
    console.error(colorize('❌ No backups available', 'red'));
    process.exit(1);
  }

  const latestBackup = path.join(backupDir, backups[0]);
  console.log(colorize(`📦 Restoring from: ${latestBackup}`, 'cyan'));

  // Restore config files
  ['config.json', 'version.json'].forEach(file => {
    const backupFile = path.join(latestBackup, file);
    const targetFile = path.join(CONFIG_DIR, file);

    if (fs.existsSync(backupFile)) {
      fs.copyFileSync(backupFile, targetFile);
    }
  });

  console.log(colorize('✓ Rollback completed', 'green'));
}

// Main CLI
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'check':
      await checkForUpdates(false);
      break;

    case 'update':
    case 'upgrade':
      const updateInfo = await checkForUpdates(true);
      if (updateInfo.updateAvailable) {
        console.log(colorize(`Update available: ${updateInfo.currentVersion} → ${updateInfo.latestVersion}`, 'green'));
        await performUpdate();
      } else {
        console.log(colorize(`Already up to date (v${updateInfo.currentVersion})`, 'green'));
      }
      break;

    case 'rollback':
      rollbackToPrevious();
      break;

    default:
      console.log(`
${colorize('PRPROMPTS Updater', 'cyan')}

${colorize('Usage:', 'bright')}
  node lib/updater.js <command>

${colorize('Commands:', 'bright')}
  check      Check for updates
  update     Update to latest version
  rollback   Rollback to previous version

${colorize('Examples:', 'bright')}
  node lib/updater.js check
  node lib/updater.js update
`);
  }
}

// Export for use in other scripts
module.exports = {
  checkForUpdates,
  performUpdate,
  getCurrentVersion,
  getLatestVersion,
  compareVersions
};

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(colorize('Error:', 'red'), error.message);
    process.exit(1);
  });
}
