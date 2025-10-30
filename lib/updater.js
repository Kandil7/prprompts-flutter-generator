#!/usr/bin/env node

/**
 * PRPROMPTS Auto-Updater
 * Handles version checking and automatic updates from npm registry
 * Version: 4.4.1
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

// Configuration
const PACKAGE_NAME = 'prprompts-flutter-generator';
const NPM_REGISTRY = 'https://registry.npmjs.org';
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
  try {
    const packagePath = path.join(__dirname, '..', 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      return packageJson.version;
    }
  } catch (error) {
    // Fallback to version file
  }

  if (fs.existsSync(VERSION_FILE)) {
    const versionData = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
    return versionData.version;
  }

  if (fs.existsSync(CONFIG_FILE)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    return config.version || '4.4.1';
  }

  return '4.4.1'; // fallback
}

// Get latest version from npm registry
async function getLatestVersion() {
  try {
    const packageInfo = await httpsGet(`${NPM_REGISTRY}/${PACKAGE_NAME}/latest`);
    return packageInfo.version;
  } catch (error) {
    console.error('Error fetching latest version:', error.message);
    return null;
  }
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

// Save version information to all AI configs
function saveVersionInfo(version) {
  const versionInfo = {
    version,
    updated_at: new Date().toISOString(),
    installed_ais: []
  };

  // Save version to each AI config directory
  const ais = ['claude', 'qwen', 'gemini'];
  ais.forEach(ai => {
    const aiConfigPath = path.join(os.homedir(), '.config', ai);
    if (fs.existsSync(aiConfigPath)) {
      const aiVersionFile = path.join(aiConfigPath, '.prprompts-version.json');
      const aiVersionInfo = {
        prprompts_version: version,
        updated_at: new Date().toISOString(),
        ai: ai
      };

      try {
        fs.writeFileSync(aiVersionFile, JSON.stringify(aiVersionInfo, null, 2));
        versionInfo.installed_ais.push(ai);
      } catch (error) {
        console.warn(colorize(`Warning: Could not save version to ${ai} config`, 'yellow'));
      }
    }
  });

  // Save central version file
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(VERSION_FILE, JSON.stringify(versionInfo, null, 2));
  } catch (error) {
    console.warn(colorize('Warning: Could not save central version file', 'yellow'));
  }

  return versionInfo;
}

// Perform update using npm
async function performUpdate() {
  console.log('');
  console.log(colorize('🔄 Starting update process...', 'cyan'));
  console.log('');

  try {
    // 1. Check for updates first
    const updateInfo = await checkForUpdates(true);

    if (!updateInfo.updateAvailable) {
      console.log(colorize('✓ Already up to date', 'green'));
      return;
    }

    console.log(colorize(`Updating from v${updateInfo.currentVersion} to v${updateInfo.latestVersion}...`, 'cyan'));

    // 2. Backup current installation
    const backupPath = backupInstallation();

    // 3. Install latest version from npm
    console.log(colorize('📥 Installing latest version from npm...', 'cyan'));

    execSync(`npm install -g ${PACKAGE_NAME}@latest`, {
      stdio: 'inherit',
      windowsHide: true
    });

    console.log(colorize('✓ Installed', 'green'));

    // 4. Save new version info to all AI configs
    saveVersionInfo(updateInfo.latestVersion);

    console.log('');
    console.log(colorize('✅ Update completed successfully!', 'green'));
    console.log(colorize(`📦 New version: ${updateInfo.latestVersion}`, 'cyan'));
    console.log(colorize(`📦 Backup saved: ${backupPath}`, 'cyan'));
    console.log('');
    console.log(colorize('Note: Restart your terminal to use the new version', 'yellow'));
    console.log('');

  } catch (error) {
    console.error('');
    console.error(colorize('❌ Update failed:', 'red'), error.message);
    console.error('');
    console.error(colorize('You can manually update by running:', 'yellow'));
    console.error(`  npm install -g ${PACKAGE_NAME}@latest`);
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

    case 'background':
      // Silent background check
      await backgroundUpdateCheck();
      break;

    case 'info':
      const versionInfo = getVersionInfo();
      if (versionInfo) {
        console.log(colorize('\n📦 PRPROMPTS Version Information', 'cyan'));
        console.log(colorize('═'.repeat(50), 'cyan'));
        console.log(colorize(`Version:     ${versionInfo.version}`, 'cyan'));
        console.log(colorize(`Updated:     ${new Date(versionInfo.updated_at).toLocaleString()}`, 'cyan'));
        console.log(colorize(`Installed in: ${versionInfo.installed_ais.join(', ')}`, 'cyan'));
      } else {
        console.log(colorize('No version information available', 'yellow'));
      }
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

// Get update channel (stable, beta, etc.)
function getUpdateChannel() {
  // Check environment variable first
  if (process.env.PRPROMPTS_UPDATE_CHANNEL) {
    return process.env.PRPROMPTS_UPDATE_CHANNEL;
  }

  // Check config file
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return config.updateChannel || 'stable';
    } catch {
      // Silent fail
    }
  }

  return 'stable';
}

// Check if auto-update is enabled
function isAutoUpdateEnabled() {
  // Environment variable takes precedence
  if (process.env.PRPROMPTS_AUTO_UPDATE !== undefined) {
    return process.env.PRPROMPTS_AUTO_UPDATE === 'true';
  }

  // Check config file
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return config.features?.auto_update !== false;
    } catch {
      // Silent fail
    }
  }

  return true; // Default to enabled
}

// Clean old backups (retention in days)
function cleanOldBackups(retentionDays = 30) {
  const backupDir = path.join(CONFIG_DIR, 'backups');

  if (!fs.existsSync(backupDir)) {
    return;
  }

  const now = Date.now();
  const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
  let cleaned = 0;

  fs.readdirSync(backupDir).forEach(item => {
    const itemPath = path.join(backupDir, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory() && item.startsWith('backup-')) {
      const age = now - stats.mtime.getTime();

      if (age > retentionMs) {
        fs.rmSync(itemPath, { recursive: true, force: true });
        cleaned++;
      }
    }
  });

  if (cleaned > 0) {
    console.log(colorize(`🧹 Cleaned ${cleaned} old backup(s)`, 'cyan'));
  }
}

// Background update check (silent)
async function backgroundUpdateCheck() {
  try {
    const updateInfo = await checkForUpdates(true);

    // Save update check result
    const checkFile = path.join(CONFIG_DIR, 'update-check.json');
    const checkData = {
      checked_at: new Date().toISOString(),
      update_available: updateInfo.updateAvailable,
      current: updateInfo.currentVersion,
      latest: updateInfo.latestVersion
    };

    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(checkFile, JSON.stringify(checkData, null, 2));

    return updateInfo;
  } catch (error) {
    // Silently fail for background checks
    return null;
  }
}

// Check if we should notify user about update (once per day)
function shouldNotifyUpdate() {
  try {
    const checkFile = path.join(CONFIG_DIR, 'update-check.json');
    if (!fs.existsSync(checkFile)) return true;

    const checkData = JSON.parse(fs.readFileSync(checkFile, 'utf8'));
    const lastCheck = new Date(checkData.checked_at);
    const now = new Date();
    const hoursSinceCheck = (now - lastCheck) / (1000 * 60 * 60);

    return hoursSinceCheck >= 24;
  } catch (error) {
    return true;
  }
}

// Get update notification to display (if any)
function getUpdateNotification() {
  try {
    const checkFile = path.join(CONFIG_DIR, 'update-check.json');
    if (!fs.existsSync(checkFile)) return null;

    const checkData = JSON.parse(fs.readFileSync(checkFile, 'utf8'));
    if (checkData.update_available) {
      return {
        current: checkData.current,
        latest: checkData.latest,
        updateAvailable: true
      };
    }
  } catch (error) {
    // Ignore errors
  }
  return null;
}

// Display update notification
function displayUpdateNotification(updateInfo) {
  if (updateInfo && updateInfo.updateAvailable) {
    console.log(colorize('\n╔════════════════════════════════════════════════════╗', 'cyan'));
    console.log(colorize('║                                                    ║', 'cyan'));
    console.log(colorize('║          🎉 PRPROMPTS Update Available!          ║', 'yellow'));
    console.log(colorize('║                                                    ║', 'cyan'));
    console.log(colorize('╚════════════════════════════════════════════════════╝', 'cyan'));
    console.log(colorize(`\nCurrent version: ${updateInfo.current}`, 'yellow'));
    console.log(colorize(`Latest version:  ${updateInfo.latest}`, 'green'));
    console.log(colorize('\nTo update, run:', 'cyan'));
    console.log(colorize('  prprompts update', 'bright'));
    console.log('');
  }
}

// Get version info for display
function getVersionInfo() {
  try {
    if (fs.existsSync(VERSION_FILE)) {
      return JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
    }
  } catch (error) {
    return null;
  }
  return null;
}

// Export for use in other scripts
module.exports = {
  checkForUpdates,
  performUpdate,
  getCurrentVersion,
  getLatestVersion,
  compareVersions,
  saveVersionInfo,
  backupInstallation,
  rollbackToPrevious,
  getUpdateChannel,
  isAutoUpdateEnabled,
  cleanOldBackups,
  backgroundUpdateCheck,
  shouldNotifyUpdate,
  getUpdateNotification,
  displayUpdateNotification,
  getVersionInfo
};

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(colorize('Error:', 'red'), error.message);
    process.exit(1);
  });
}
