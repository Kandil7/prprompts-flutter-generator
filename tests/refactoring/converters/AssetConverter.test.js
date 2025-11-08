/**
 * AssetConverter Tests
 *
 * Tests for React asset conversion to Flutter
 * - Image optimization
 * - SVG handling
 * - Font conversion
 * - Multi-resolution generation
 * - Asset deduplication
 */

const AssetConverter = require('../../../lib/refactoring/converters/AssetConverter');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

describe('AssetConverter', () => {
  let converter;
  let testDir;
  let sourceDir;
  let targetDir;

  beforeEach(() => {
    testDir = path.join(__dirname, '__test_assets__');
    sourceDir = path.join(testDir, 'source');
    targetDir = path.join(testDir, 'target');

    fs.ensureDirSync(sourceDir);
    fs.ensureDirSync(targetDir);

    converter = new AssetConverter({
      sourceDir,
      targetDir,
      compress: true,
      generateMultiRes: true,
      verbose: false
    });
  });

  afterEach(() => {
    fs.removeSync(testDir);
  });

  describe('Image Processing', () => {
    test('should identify image files correctly', () => {
      expect(converter.isImageFile('photo.jpg')).toBe(true);
      expect(converter.isImageFile('icon.png')).toBe(true);
      expect(converter.isImageFile('banner.webp')).toBe(true);
      expect(converter.isImageFile('document.pdf')).toBe(false);
    });

    test('should extract resolution from filename', () => {
      expect(converter.extractResolution('icon@2x.png')).toBe(2);
      expect(converter.extractResolution('icon@3x.png')).toBe(3);
      expect(converter.extractResolution('icon.png')).toBe(1);
    });

    test('should generate correct output path structure', () => {
      const inputPath = path.join(sourceDir, 'images', 'icon.png');
      const outputPath = converter.getFlutterAssetPath(inputPath, 1);

      expect(outputPath).toContain('assets');
      expect(outputPath).toContain('images');
      expect(outputPath).toContain('icon.png');
    });

    test('should handle multi-resolution path generation', () => {
      const inputPath = path.join(sourceDir, 'images', 'icon.png');
      const output2x = converter.getFlutterAssetPath(inputPath, 2);
      const output3x = converter.getFlutterAssetPath(inputPath, 3);

      expect(output2x).toContain('2.0x');
      expect(output3x).toContain('3.0x');
    });
  });

  describe('SVG Handling', () => {
    test('should identify SVG files', () => {
      expect(converter.isSVGFile('icon.svg')).toBe(true);
      expect(converter.isSVGFile('icon.png')).toBe(false);
    });

    test('should extract SVG dimensions from viewBox', () => {
      const svgContent = '<svg viewBox="0 0 24 24"><path d="..."/></svg>';
      const dimensions = converter.extractSVGDimensions(svgContent);

      expect(dimensions).toEqual({ width: 24, height: 24 });
    });

    test('should extract SVG dimensions from width/height attributes', () => {
      const svgContent = '<svg width="100" height="50"><rect/></svg>';
      const dimensions = converter.extractSVGDimensions(svgContent);

      expect(dimensions).toEqual({ width: 100, height: 50 });
    });
  });

  describe('Font Conversion', () => {
    test('should identify font files', () => {
      expect(converter.isFontFile('Roboto-Regular.ttf')).toBe(true);
      expect(converter.isFontFile('OpenSans-Bold.otf')).toBe(true);
      expect(converter.isFontFile('icons.woff')).toBe(true);
      expect(converter.isFontFile('style.css')).toBe(false);
    });

    test('should extract font family name', () => {
      expect(converter.extractFontFamily('Roboto-Regular.ttf')).toBe('Roboto');
      expect(converter.extractFontFamily('OpenSans-Bold.otf')).toBe('OpenSans');
      expect(converter.extractFontFamily('Material-Icons.ttf')).toBe('Material-Icons');
    });

    test('should extract font weight from filename', () => {
      expect(converter.extractFontWeight('Roboto-Thin.ttf')).toBe(100);
      expect(converter.extractFontWeight('Roboto-Regular.ttf')).toBe(400);
      expect(converter.extractFontWeight('Roboto-Bold.ttf')).toBe(700);
      expect(converter.extractFontWeight('Roboto-Black.ttf')).toBe(900);
    });

    test('should extract font style from filename', () => {
      expect(converter.extractFontStyle('Roboto-Italic.ttf')).toBe('italic');
      expect(converter.extractFontStyle('Roboto-BoldItalic.ttf')).toBe('italic');
      expect(converter.extractFontStyle('Roboto-Regular.ttf')).toBe('normal');
    });
  });

  describe('Asset Deduplication', () => {
    test('should calculate file hash', async () => {
      const testFile = path.join(sourceDir, 'test.txt');
      fs.writeFileSync(testFile, 'test content');

      const hash = await converter.calculateHash(testFile);
      const expectedHash = crypto.createHash('md5').update('test content').digest('hex');

      expect(hash).toBe(expectedHash);
    });

    test('should detect duplicate assets', async () => {
      const file1 = path.join(sourceDir, 'image1.png');
      const file2 = path.join(sourceDir, 'image2.png');

      // Create identical files
      fs.writeFileSync(file1, 'identical content');
      fs.writeFileSync(file2, 'identical content');

      const hash1 = await converter.calculateHash(file1);
      const hash2 = await converter.calculateHash(file2);

      expect(hash1).toBe(hash2);
    });

    test('should track deduplicated assets', async () => {
      const file1 = path.join(sourceDir, 'duplicate1.png');
      const file2 = path.join(sourceDir, 'duplicate2.png');

      fs.writeFileSync(file1, 'same content');
      fs.writeFileSync(file2, 'same content');

      const hash = await converter.calculateHash(file1);
      converter.assetHashes.set(hash, file1);

      const isDuplicate = await converter.isDuplicate(file2);
      expect(isDuplicate).toBe(true);
    });
  });

  describe('Pubspec Generation', () => {
    test('should generate assets section for images', () => {
      const assetPaths = [
        'assets/images/logo.png',
        'assets/images/icons/home.png'
      ];

      const pubspecSection = converter.generatePubspecAssets(assetPaths);

      expect(pubspecSection).toContain('assets:');
      expect(pubspecSection).toContain('- assets/images/logo.png');
      expect(pubspecSection).toContain('- assets/images/icons/home.png');
    });

    test('should generate fonts section', () => {
      const fonts = [
        {
          family: 'Roboto',
          fonts: [
            { asset: 'fonts/Roboto-Regular.ttf', weight: 400 },
            { asset: 'fonts/Roboto-Bold.ttf', weight: 700 }
          ]
        }
      ];

      const pubspecSection = converter.generatePubspecFonts(fonts);

      expect(pubspecSection).toContain('fonts:');
      expect(pubspecSection).toContain('family: Roboto');
      expect(pubspecSection).toContain('weight: 400');
      expect(pubspecSection).toContain('weight: 700');
    });

    test('should generate complete pubspec flutter section', () => {
      converter.convertedAssets = ['assets/images/logo.png'];
      converter.convertedFonts = [
        {
          family: 'Roboto',
          fonts: [{ asset: 'fonts/Roboto-Regular.ttf', weight: 400 }]
        }
      ];

      const flutterSection = converter.generatePubspecFlutterSection();

      expect(flutterSection).toContain('flutter:');
      expect(flutterSection).toContain('assets:');
      expect(flutterSection).toContain('fonts:');
    });
  });

  describe('Lottie Animation Support', () => {
    test('should identify Lottie files', () => {
      expect(converter.isLottieFile('animation.json')).toBe(true);
      expect(converter.isLottieFile('data.json')).toBe(true);
      expect(converter.isLottieFile('config.json')).toBe(false);
    });

    test('should validate Lottie JSON structure', () => {
      const validLottie = JSON.stringify({
        v: '5.5.7',
        fr: 30,
        ip: 0,
        op: 60,
        w: 500,
        h: 500,
        layers: []
      });

      expect(converter.isValidLottie(validLottie)).toBe(true);
    });

    test('should reject invalid Lottie JSON', () => {
      const invalidLottie = JSON.stringify({
        data: 'not a lottie file'
      });

      expect(converter.isValidLottie(invalidLottie)).toBe(false);
    });
  });

  describe('Asset Statistics', () => {
    test('should track conversion statistics', () => {
      converter.stats = {
        totalAssets: 10,
        processedAssets: 8,
        skippedAssets: 2,
        duplicatesRemoved: 3,
        totalSizeBefore: 5000000, // 5MB
        totalSizeAfter: 3000000   // 3MB
      };

      const compressionRatio = converter.calculateCompressionRatio();
      expect(compressionRatio).toBe(40); // 40% size reduction
    });

    test('should format bytes to human readable', () => {
      expect(converter.formatBytes(1024)).toBe('1.00 KB');
      expect(converter.formatBytes(1048576)).toBe('1.00 MB');
      expect(converter.formatBytes(500)).toBe('500 B');
    });

    test('should generate statistics report', () => {
      converter.stats = {
        totalAssets: 10,
        processedAssets: 8,
        skippedAssets: 2,
        duplicatesRemoved: 3,
        totalSizeBefore: 5000000,
        totalSizeAfter: 3000000
      };

      const report = converter.generateStatisticsReport();

      expect(report).toContain('Asset Conversion Statistics');
      expect(report).toContain('Total Assets: 10');
      expect(report).toContain('Processed: 8');
      expect(report).toContain('Duplicates Removed: 3');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing source directory', async () => {
      const invalidConverter = new AssetConverter({
        sourceDir: '/nonexistent/path',
        targetDir
      });

      await expect(invalidConverter.initialize()).rejects.toThrow();
    });

    test('should handle corrupted image files gracefully', async () => {
      const corruptedImage = path.join(sourceDir, 'corrupted.png');
      fs.writeFileSync(corruptedImage, 'not an image');

      const result = await converter.processImage(corruptedImage, targetDir);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should skip unsupported file types', () => {
      const unsupported = path.join(sourceDir, 'file.xyz');
      const shouldProcess = converter.shouldProcessFile(unsupported);

      expect(shouldProcess).toBe(false);
    });
  });
});
