/**
 * AssetConverter - Handles conversion and optimization of assets from React to Flutter
 *
 * Features:
 * - Copy and organize images/SVGs to Flutter assets directory
 * - Generate pubspec.yaml asset entries
 * - Optimize images for mobile
 * - Convert SVGs for flutter_svg compatibility
 * - Handle font files
 * - Process JSON/data files
 */

const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp'); // For image optimization
const SVGO = require('svgo'); // For SVG optimization
const yaml = require('js-yaml');
const glob = require('glob');
const crypto = require('crypto');

class AssetConverter {
  constructor(config = {}) {
    this.config = {
      optimizeImages: config.optimizeImages !== false,
      generateMultipleResolutions: config.generateMultipleResolutions !== false,
      svgOptimization: config.svgOptimization !== false,
      maxImageWidth: config.maxImageWidth || 2048,
      maxImageHeight: config.maxImageHeight || 2048,
      jpegQuality: config.jpegQuality || 85,
      pngQuality: config.pngQuality || 90,
      webpQuality: config.webpQuality || 85,
      assetFolder: config.assetFolder || 'assets',
      verbose: config.verbose || false,
    };

    // SVGO configuration
    this.svgo = new SVGO({
      plugins: [
        { removeDoctype: true },
        { removeXMLProcInst: true },
        { removeComments: true },
        { removeMetadata: true },
        { removeTitle: true },
        { removeDesc: true },
        { removeUselessDefs: true },
        { removeEditorsNSData: true },
        { removeEmptyAttrs: true },
        { removeHiddenElems: true },
        { removeEmptyText: true },
        { removeEmptyContainers: true },
        { cleanupEnableBackground: true },
        { convertStyleToAttrs: true },
        { convertColors: true },
        { convertPathData: true },
        { convertTransform: true },
        { removeUnknownsAndDefaults: true },
        { removeNonInheritableGroupAttrs: true },
        { removeUselessStrokeAndFill: true },
        { removeUnusedNS: true },
        { cleanupIDs: true },
        { cleanupNumericValues: true },
        { moveElemsAttrsToGroup: true },
        { moveGroupAttrsToElems: true },
        { collapseGroups: true },
        { removeRasterImages: false },
        { mergePaths: true },
        { convertShapeToPath: true },
        { sortAttrs: true },
        { removeDimensions: false }, // Keep dimensions for Flutter
      ],
    });

    this.processedAssets = [];
    this.assetManifest = {
      images: [],
      svgs: [],
      fonts: [],
      data: [],
      animations: [],
    };
  }

  /**
   * Convert assets from React project to Flutter
   * @param {string} reactPath - Path to React project
   * @param {string} flutterPath - Path to Flutter project
   * @returns {Promise<Object>} Conversion result
   */
  async convertAssets(reactPath, flutterPath) {
    const startTime = Date.now();
    const results = {
      success: true,
      totalAssets: 0,
      processedAssets: 0,
      optimizedAssets: 0,
      errors: [],
      manifest: null,
      pubspecEntries: null,
    };

    try {
      // Find all assets in React project
      const assets = await this.findAssets(reactPath);
      results.totalAssets = assets.length;

      if (this.config.verbose) {
        console.log(`Found ${assets.length} assets to convert`);
      }

      // Create Flutter asset directories
      await this.createAssetDirectories(flutterPath);

      // Process each asset
      for (const asset of assets) {
        try {
          await this.processAsset(asset, reactPath, flutterPath);
          results.processedAssets++;
        } catch (error) {
          results.errors.push({
            asset: asset.path,
            error: error.message,
          });
        }
      }

      // Generate asset manifest
      this.assetManifest = await this.generateManifest();
      results.manifest = this.assetManifest;

      // Generate pubspec.yaml entries
      const pubspecEntries = this.generatePubspecEntries();
      results.pubspecEntries = pubspecEntries;

      // Update pubspec.yaml if it exists
      const pubspecPath = path.join(flutterPath, 'pubspec.yaml');
      if (await fs.pathExists(pubspecPath)) {
        await this.updatePubspecYaml(pubspecPath, pubspecEntries);
      }

      // Write asset manifest
      await fs.writeJson(
        path.join(flutterPath, this.config.assetFolder, 'asset_manifest.json'),
        this.assetManifest,
        { spaces: 2 }
      );

      results.optimizedAssets = this.processedAssets.filter(a => a.optimized).length;
      results.duration = Date.now() - startTime;

      return results;

    } catch (error) {
      results.success = false;
      results.errors.push({
        general: error.message,
      });
      return results;
    }
  }

  /**
   * Find all assets in React project
   * @param {string} reactPath - React project path
   * @returns {Promise<Array>} List of assets
   */
  async findAssets(reactPath) {
    const assets = [];
    const patterns = [
      'src/**/*.{png,jpg,jpeg,gif,svg,webp,ico}', // Images
      'public/**/*.{png,jpg,jpeg,gif,svg,webp,ico}', // Public images
      'src/**/*.{ttf,otf,woff,woff2}', // Fonts
      'src/**/*.{json,xml}', // Data files
      'src/**/*.{mp4,webm,mp3,wav}', // Media files
      'src/**/*.{lottie,json}', // Lottie animations
    ];

    for (const pattern of patterns) {
      const files = await new Promise((resolve, reject) => {
        glob(path.join(reactPath, pattern), (err, matches) => {
          if (err) reject(err);
          else resolve(matches);
        });
      });

      for (const file of files) {
        const stat = await fs.stat(file);
        const relativePath = path.relative(reactPath, file);
        const ext = path.extname(file).toLowerCase();

        assets.push({
          path: file,
          relativePath,
          size: stat.size,
          type: this.getAssetType(ext),
          extension: ext,
        });
      }
    }

    // Deduplicate by content hash
    const uniqueAssets = await this.deduplicateAssets(assets);
    return uniqueAssets;
  }

  /**
   * Deduplicate assets by content hash
   * @param {Array} assets - List of assets
   * @returns {Promise<Array>} Deduplicated assets
   */
  async deduplicateAssets(assets) {
    const hashMap = new Map();
    const unique = [];

    for (const asset of assets) {
      const hash = await this.getFileHash(asset.path);

      if (!hashMap.has(hash)) {
        hashMap.set(hash, asset);
        unique.push(asset);
      } else {
        if (this.config.verbose) {
          console.log(`Duplicate found: ${asset.relativePath} (same as ${hashMap.get(hash).relativePath})`);
        }
      }
    }

    return unique;
  }

  /**
   * Get file hash for deduplication
   * @param {string} filePath - File path
   * @returns {Promise<string>} File hash
   */
  async getFileHash(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);

      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Process individual asset
   * @param {Object} asset - Asset information
   * @param {string} reactPath - React project path
   * @param {string} flutterPath - Flutter project path
   * @returns {Promise<void>}
   */
  async processAsset(asset, reactPath, flutterPath) {
    const destDir = this.getDestinationDirectory(asset, flutterPath);
    await fs.ensureDir(destDir);

    const fileName = path.basename(asset.path);
    const destPath = path.join(destDir, fileName);

    switch (asset.type) {
      case 'image':
        await this.processImage(asset.path, destPath);
        break;

      case 'svg':
        await this.processSVG(asset.path, destPath);
        break;

      case 'font':
        await this.processFont(asset.path, destPath);
        break;

      case 'data':
        await this.processDataFile(asset.path, destPath);
        break;

      case 'animation':
        await this.processAnimation(asset.path, destPath);
        break;

      default:
        await fs.copy(asset.path, destPath);
    }

    // Track processed asset
    this.processedAssets.push({
      original: asset.relativePath,
      destination: path.relative(flutterPath, destPath),
      type: asset.type,
      size: asset.size,
      optimized: ['image', 'svg'].includes(asset.type),
    });
  }

  /**
   * Process image files with optimization
   * @param {string} srcPath - Source image path
   * @param {string} destPath - Destination path
   * @returns {Promise<void>}
   */
  async processImage(srcPath, destPath) {
    if (!this.config.optimizeImages) {
      await fs.copy(srcPath, destPath);
      return;
    }

    const ext = path.extname(srcPath).toLowerCase();
    const nameWithoutExt = path.basename(destPath, ext);
    const destDir = path.dirname(destPath);

    try {
      const image = sharp(srcPath);
      const metadata = await image.metadata();

      // Resize if too large
      if (metadata.width > this.config.maxImageWidth ||
          metadata.height > this.config.maxImageHeight) {
        image.resize(this.config.maxImageWidth, this.config.maxImageHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Generate multiple resolutions for Flutter
      if (this.config.generateMultipleResolutions) {
        // Generate 1x, 2x, 3x versions
        const resolutions = [
          { scale: 1, folder: '' },
          { scale: 2, folder: '2.0x' },
          { scale: 3, folder: '3.0x' },
        ];

        for (const res of resolutions) {
          const resDir = res.folder ? path.join(destDir, res.folder) : destDir;
          await fs.ensureDir(resDir);
          const resPath = path.join(resDir, `${nameWithoutExt}${ext}`);

          const resImage = sharp(srcPath);
          if (res.scale > 1) {
            resImage.resize(
              Math.round(metadata.width * res.scale),
              Math.round(metadata.height * res.scale),
              { fit: 'inside' }
            );
          }

          // Apply optimization based on format
          switch (ext) {
            case '.jpg':
            case '.jpeg':
              await resImage
                .jpeg({ quality: this.config.jpegQuality })
                .toFile(resPath);
              break;

            case '.png':
              await resImage
                .png({ quality: this.config.pngQuality })
                .toFile(resPath);
              break;

            case '.webp':
              await resImage
                .webp({ quality: this.config.webpQuality })
                .toFile(resPath);
              break;

            default:
              await resImage.toFile(resPath);
          }
        }
      } else {
        // Single resolution with optimization
        switch (ext) {
          case '.jpg':
          case '.jpeg':
            await image
              .jpeg({ quality: this.config.jpegQuality })
              .toFile(destPath);
            break;

          case '.png':
            await image
              .png({ quality: this.config.pngQuality })
              .toFile(destPath);
            break;

          case '.webp':
            await image
              .webp({ quality: this.config.webpQuality })
              .toFile(destPath);
            break;

          default:
            await image.toFile(destPath);
        }
      }

      // Add to manifest
      this.assetManifest.images.push({
        path: path.relative(path.join(path.dirname(destPath), '..', '..'), destPath),
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      });

    } catch (error) {
      // If Sharp fails, fall back to simple copy
      console.warn(`Failed to optimize ${srcPath}: ${error.message}`);
      await fs.copy(srcPath, destPath);
    }
  }

  /**
   * Process SVG files with optimization
   * @param {string} srcPath - Source SVG path
   * @param {string} destPath - Destination path
   * @returns {Promise<void>}
   */
  async processSVG(srcPath, destPath) {
    const content = await fs.readFile(srcPath, 'utf8');

    if (this.config.svgOptimization) {
      try {
        const result = await this.svgo.optimize(content, { path: srcPath });
        await fs.writeFile(destPath, result.data, 'utf8');

        // Add to manifest
        this.assetManifest.svgs.push({
          path: path.relative(path.join(path.dirname(destPath), '..', '..'), destPath),
          originalSize: content.length,
          optimizedSize: result.data.length,
        });
      } catch (error) {
        console.warn(`Failed to optimize SVG ${srcPath}: ${error.message}`);
        await fs.copy(srcPath, destPath);
      }
    } else {
      await fs.copy(srcPath, destPath);
    }
  }

  /**
   * Process font files
   * @param {string} srcPath - Source font path
   * @param {string} destPath - Destination path
   * @returns {Promise<void>}
   */
  async processFont(srcPath, destPath) {
    await fs.copy(srcPath, destPath);

    // Extract font information
    const fontName = path.basename(srcPath, path.extname(srcPath));

    this.assetManifest.fonts.push({
      family: fontName,
      fonts: [{
        asset: path.relative(path.join(path.dirname(destPath), '..', '..'), destPath),
        weight: this.extractFontWeight(fontName),
        style: this.extractFontStyle(fontName),
      }],
    });
  }

  /**
   * Process data files (JSON, XML)
   * @param {string} srcPath - Source data file path
   * @param {string} destPath - Destination path
   * @returns {Promise<void>}
   */
  async processDataFile(srcPath, destPath) {
    const ext = path.extname(srcPath).toLowerCase();

    if (ext === '.json') {
      // Validate and minify JSON
      try {
        const content = await fs.readJson(srcPath);
        await fs.writeJson(destPath, content, { spaces: 0 });
      } catch (error) {
        // If not valid JSON, copy as-is
        await fs.copy(srcPath, destPath);
      }
    } else {
      await fs.copy(srcPath, destPath);
    }

    this.assetManifest.data.push({
      path: path.relative(path.join(path.dirname(destPath), '..', '..'), destPath),
      type: ext.substring(1),
    });
  }

  /**
   * Process animation files (Lottie, etc.)
   * @param {string} srcPath - Source animation path
   * @param {string} destPath - Destination path
   * @returns {Promise<void>}
   */
  async processAnimation(srcPath, destPath) {
    const ext = path.extname(srcPath).toLowerCase();

    if (ext === '.json') {
      // Check if it's a Lottie animation
      try {
        const content = await fs.readJson(srcPath);
        if (content.v && content.fr && content.layers) {
          // Looks like a Lottie file
          await fs.writeJson(destPath, content, { spaces: 0 });

          this.assetManifest.animations.push({
            path: path.relative(path.join(path.dirname(destPath), '..', '..'), destPath),
            type: 'lottie',
            version: content.v,
            framerate: content.fr,
          });
          return;
        }
      } catch (error) {
        // Not a valid Lottie file
      }
    }

    await fs.copy(srcPath, destPath);
  }

  /**
   * Get asset type from extension
   * @param {string} ext - File extension
   * @returns {string} Asset type
   */
  getAssetType(ext) {
    const typeMap = {
      '.png': 'image',
      '.jpg': 'image',
      '.jpeg': 'image',
      '.gif': 'image',
      '.webp': 'image',
      '.ico': 'image',
      '.svg': 'svg',
      '.ttf': 'font',
      '.otf': 'font',
      '.woff': 'font',
      '.woff2': 'font',
      '.json': 'data',
      '.xml': 'data',
      '.mp4': 'video',
      '.webm': 'video',
      '.mp3': 'audio',
      '.wav': 'audio',
      '.lottie': 'animation',
    };

    return typeMap[ext] || 'other';
  }

  /**
   * Get destination directory for asset
   * @param {Object} asset - Asset information
   * @param {string} flutterPath - Flutter project path
   * @returns {string} Destination directory
   */
  getDestinationDirectory(asset, flutterPath) {
    const baseDir = path.join(flutterPath, this.config.assetFolder);

    switch (asset.type) {
      case 'image':
        return path.join(baseDir, 'images');

      case 'svg':
        return path.join(baseDir, 'icons');

      case 'font':
        return path.join(baseDir, 'fonts');

      case 'data':
        return path.join(baseDir, 'data');

      case 'animation':
        return path.join(baseDir, 'animations');

      case 'video':
        return path.join(baseDir, 'videos');

      case 'audio':
        return path.join(baseDir, 'audio');

      default:
        return path.join(baseDir, 'other');
    }
  }

  /**
   * Create Flutter asset directories
   * @param {string} flutterPath - Flutter project path
   * @returns {Promise<void>}
   */
  async createAssetDirectories(flutterPath) {
    const dirs = [
      path.join(flutterPath, this.config.assetFolder, 'images'),
      path.join(flutterPath, this.config.assetFolder, 'images', '2.0x'),
      path.join(flutterPath, this.config.assetFolder, 'images', '3.0x'),
      path.join(flutterPath, this.config.assetFolder, 'icons'),
      path.join(flutterPath, this.config.assetFolder, 'fonts'),
      path.join(flutterPath, this.config.assetFolder, 'data'),
      path.join(flutterPath, this.config.assetFolder, 'animations'),
      path.join(flutterPath, this.config.assetFolder, 'videos'),
      path.join(flutterPath, this.config.assetFolder, 'audio'),
    ];

    for (const dir of dirs) {
      await fs.ensureDir(dir);
    }
  }

  /**
   * Generate asset manifest
   * @returns {Object} Asset manifest
   */
  async generateManifest() {
    return {
      ...this.assetManifest,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalAssets: this.processedAssets.length,
        optimizedCount: this.processedAssets.filter(a => a.optimized).length,
      },
    };
  }

  /**
   * Generate pubspec.yaml entries
   * @returns {Object} Pubspec entries
   */
  generatePubspecEntries() {
    const entries = {
      flutter: {
        assets: [],
        fonts: [],
      },
    };

    // Add image assets
    if (this.assetManifest.images.length > 0) {
      entries.flutter.assets.push(`${this.config.assetFolder}/images/`);
    }

    // Add SVG assets
    if (this.assetManifest.svgs.length > 0) {
      entries.flutter.assets.push(`${this.config.assetFolder}/icons/`);
    }

    // Add data assets
    if (this.assetManifest.data.length > 0) {
      entries.flutter.assets.push(`${this.config.assetFolder}/data/`);
    }

    // Add animation assets
    if (this.assetManifest.animations.length > 0) {
      entries.flutter.assets.push(`${this.config.assetFolder}/animations/`);
    }

    // Add font entries
    if (this.assetManifest.fonts.length > 0) {
      entries.flutter.fonts = this.assetManifest.fonts;
    }

    return entries;
  }

  /**
   * Update pubspec.yaml with asset entries
   * @param {string} pubspecPath - Path to pubspec.yaml
   * @param {Object} entries - Asset entries
   * @returns {Promise<void>}
   */
  async updatePubspecYaml(pubspecPath, entries) {
    const content = await fs.readFile(pubspecPath, 'utf8');
    const pubspec = yaml.load(content);

    // Merge flutter section
    if (!pubspec.flutter) {
      pubspec.flutter = {};
    }

    // Merge assets
    if (entries.flutter.assets.length > 0) {
      pubspec.flutter.assets = [
        ...(pubspec.flutter.assets || []),
        ...entries.flutter.assets,
      ];

      // Remove duplicates
      pubspec.flutter.assets = [...new Set(pubspec.flutter.assets)];
    }

    // Merge fonts
    if (entries.flutter.fonts.length > 0) {
      pubspec.flutter.fonts = [
        ...(pubspec.flutter.fonts || []),
        ...entries.flutter.fonts,
      ];
    }

    // Write back
    const newContent = yaml.dump(pubspec, { lineWidth: -1 });
    await fs.writeFile(pubspecPath, newContent, 'utf8');
  }

  /**
   * Extract font weight from font name
   * @param {string} fontName - Font name
   * @returns {number} Font weight
   */
  extractFontWeight(fontName) {
    const lowerName = fontName.toLowerCase();

    if (lowerName.includes('thin')) return 100;
    if (lowerName.includes('extralight')) return 200;
    if (lowerName.includes('light')) return 300;
    if (lowerName.includes('regular')) return 400;
    if (lowerName.includes('medium')) return 500;
    if (lowerName.includes('semibold')) return 600;
    if (lowerName.includes('bold')) return 700;
    if (lowerName.includes('extrabold')) return 800;
    if (lowerName.includes('black')) return 900;

    return 400; // Default to regular
  }

  /**
   * Extract font style from font name
   * @param {string} fontName - Font name
   * @returns {string} Font style
   */
  extractFontStyle(fontName) {
    const lowerName = fontName.toLowerCase();

    if (lowerName.includes('italic')) return 'italic';
    if (lowerName.includes('oblique')) return 'italic';

    return 'normal';
  }

  /**
   * Generate asset usage report
   * @returns {Object} Usage report
   */
  generateUsageReport() {
    const report = {
      summary: {
        totalAssets: this.processedAssets.length,
        totalSize: this.processedAssets.reduce((sum, a) => sum + a.size, 0),
        byType: {},
      },
      details: this.processedAssets,
      recommendations: [],
    };

    // Group by type
    for (const asset of this.processedAssets) {
      if (!report.summary.byType[asset.type]) {
        report.summary.byType[asset.type] = {
          count: 0,
          size: 0,
        };
      }
      report.summary.byType[asset.type].count++;
      report.summary.byType[asset.type].size += asset.size;
    }

    // Add recommendations
    if (this.assetManifest.images.some(img => img.width > 2048 || img.height > 2048)) {
      report.recommendations.push('Some images are very large. Consider resizing for better performance.');
    }

    if (this.assetManifest.svgs.length > 20) {
      report.recommendations.push('Many SVG files found. Consider using icon fonts for better performance.');
    }

    return report;
  }
}

module.exports = AssetConverter;