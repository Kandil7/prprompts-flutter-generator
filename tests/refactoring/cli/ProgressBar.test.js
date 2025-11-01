/**
 * Tests for ProgressBar
 */

const ProgressBar = require('../../../lib/refactoring/cli/ProgressBar');
const { Spinner, MultiProgress } = require('../../../lib/refactoring/cli/ProgressBar');

describe('ProgressBar', () => {
  let progressBar;
  let mockStream;

  beforeEach(() => {
    mockStream = {
      write: jest.fn(),
      clearLine: jest.fn(),
      cursorTo: jest.fn()
    };

    progressBar = new ProgressBar({
      total: 100,
      stream: mockStream,
      updateInterval: 0 // Disable throttling for tests
    });
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const bar = new ProgressBar();

      expect(bar.total).toBe(100);
      expect(bar.current).toBe(0);
      expect(bar.barLength).toBe(30);
    });

    it('should accept custom options', () => {
      const bar = new ProgressBar({
        total: 50,
        barLength: 20,
        format: 'Custom {bar}'
      });

      expect(bar.total).toBe(50);
      expect(bar.barLength).toBe(20);
      expect(bar.format).toBe('Custom {bar}');
    });
  });

  describe('increment', () => {
    it('should increment progress by 1', () => {
      progressBar.increment();

      expect(progressBar.current).toBe(1);
    });

    it('should increment progress by custom delta', () => {
      progressBar.increment(5);

      expect(progressBar.current).toBe(5);
    });

    it('should not exceed total', () => {
      progressBar.current = 99;
      progressBar.increment(10);

      expect(progressBar.current).toBe(100);
    });

    it('should call render', () => {
      const spy = jest.spyOn(progressBar, 'render');

      progressBar.increment();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should set progress to specific value', () => {
      progressBar.update(50);

      expect(progressBar.current).toBe(50);
    });

    it('should not exceed total', () => {
      progressBar.update(150);

      expect(progressBar.current).toBe(100);
    });

    it('should accept metadata', () => {
      progressBar.update(50, { currentFile: 'test.js' });

      expect(progressBar.metadata).toEqual({ currentFile: 'test.js' });
    });
  });

  describe('render', () => {
    it('should clear line and write progress', () => {
      progressBar.update(50);

      expect(mockStream.clearLine).toHaveBeenCalled();
      expect(mockStream.cursorTo).toHaveBeenCalledWith(0);
      expect(mockStream.write).toHaveBeenCalled();
    });

    it('should include percentage', () => {
      progressBar.update(50);

      const output = mockStream.write.mock.calls[0][0];
      expect(output).toContain('50%');
    });

    it('should include bar visualization', () => {
      progressBar.update(50);

      const output = mockStream.write.mock.calls[0][0];
      expect(output).toContain('█');
      expect(output).toContain('░');
    });

    it('should include current and total values', () => {
      progressBar.update(50);

      const output = mockStream.write.mock.calls[0][0];
      expect(output).toContain('50/100');
    });

    it('should include metadata if present', () => {
      progressBar.update(50, { currentFile: 'test.js' });

      const output = mockStream.write.mock.calls[0][0];
      expect(output).toContain('test.js');
    });
  });

  describe('complete', () => {
    it('should set current to total', () => {
      progressBar.complete();

      expect(progressBar.current).toBe(100);
    });

    it('should write newline', () => {
      progressBar.complete();

      expect(mockStream.write).toHaveBeenCalledWith('\n');
    });

    it('should write message if provided', () => {
      progressBar.complete('Done!');

      expect(mockStream.write).toHaveBeenCalledWith('Done!\n');
    });

    it('should clear line if clearOnComplete is true', () => {
      progressBar.clearOnComplete = true;
      progressBar.complete();

      expect(mockStream.clearLine).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should write newline', () => {
      progressBar.stop();

      expect(mockStream.write).toHaveBeenCalledWith('\n');
    });

    it('should not write newline if clearOnComplete is true', () => {
      progressBar.clearOnComplete = true;
      mockStream.write.mockClear();

      progressBar.stop();

      expect(mockStream.write).not.toHaveBeenCalled();
    });
  });
});

describe('Spinner', () => {
  let spinner;
  let mockStream;

  beforeEach(() => {
    mockStream = {
      write: jest.fn(),
      clearLine: jest.fn(),
      cursorTo: jest.fn()
    };

    spinner = new Spinner({
      text: 'Loading...',
      stream: mockStream,
      interval: 10
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    if (spinner.timer) {
      spinner.stop();
    }
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const spin = new Spinner();

      expect(spin.text).toBe('Loading...');
      expect(spin.frames.length).toBeGreaterThan(0);
    });
  });

  describe('start', () => {
    it('should start timer', () => {
      spinner.start();

      expect(spinner.timer).toBeTruthy();
    });

    it('should update text if provided', () => {
      spinner.start('Processing...');

      expect(spinner.text).toBe('Processing...');
    });

    it('should write frames periodically', () => {
      spinner.start();

      jest.advanceTimersByTime(50);

      expect(mockStream.write.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('stop', () => {
    it('should clear timer', () => {
      spinner.start();
      spinner.stop();

      expect(spinner.timer).toBeNull();
    });

    it('should clear line', () => {
      spinner.start();
      spinner.stop();

      expect(mockStream.clearLine).toHaveBeenCalled();
      expect(mockStream.cursorTo).toHaveBeenCalledWith(0);
    });
  });

  describe('succeed', () => {
    it('should stop spinner and write success message', () => {
      spinner.start();
      spinner.succeed('Complete!');

      expect(mockStream.write).toHaveBeenCalledWith(
        expect.stringContaining('✅')
      );
      expect(mockStream.write).toHaveBeenCalledWith(
        expect.stringContaining('Complete!')
      );
    });
  });

  describe('fail', () => {
    it('should stop spinner and write error message', () => {
      spinner.start();
      spinner.fail('Failed!');

      expect(mockStream.write).toHaveBeenCalledWith(
        expect.stringContaining('❌')
      );
    });
  });

  describe('warn', () => {
    it('should stop spinner and write warning message', () => {
      spinner.start();
      spinner.warn('Warning!');

      expect(mockStream.write).toHaveBeenCalledWith(
        expect.stringContaining('⚠️')
      );
    });
  });

  describe('info', () => {
    it('should stop spinner and write info message', () => {
      spinner.start();
      spinner.info('Info!');

      expect(mockStream.write).toHaveBeenCalledWith(
        expect.stringContaining('ℹ️')
      );
    });
  });
});

describe('MultiProgress', () => {
  let multiProgress;

  beforeEach(() => {
    multiProgress = new MultiProgress();
  });

  describe('create', () => {
    it('should create a new progress bar', () => {
      const bar = multiProgress.create({ total: 100 });

      expect(bar).toBeInstanceOf(ProgressBar);
      expect(multiProgress.bars).toContain(bar);
    });

    it('should pass options to progress bar', () => {
      const bar = multiProgress.create({ total: 50, barLength: 20 });

      expect(bar.total).toBe(50);
      expect(bar.barLength).toBe(20);
    });
  });

  describe('stop', () => {
    it('should stop all bars', () => {
      const bar1 = multiProgress.create({ total: 100 });
      const bar2 = multiProgress.create({ total: 100 });

      const spy1 = jest.spyOn(bar1, 'stop');
      const spy2 = jest.spyOn(bar2, 'stop');

      multiProgress.stop();

      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });
  });
});
