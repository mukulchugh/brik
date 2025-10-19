/**
 * Tests for Enhanced Error Handling System (v0.3.0)
 */

import {
  BrikError,
  BrikErrorCode,
  BrikErrorSeverity,
  BrikCompilationError,
  BrikRuntimeError,
  BrikConfigError,
  BrikStorageError,
  BrikErrorHandler,
  errorHandler,
  createError,
  assert,
  tryExecute,
} from '../src/errors';

describe('BrikError', () => {
  it('should create a BrikError with all metadata', () => {
    const error = new BrikError({
      code: BrikErrorCode.COMPILATION_FAILED,
      severity: BrikErrorSeverity.ERROR,
      message: 'Compilation failed',
      details: 'Invalid JSX syntax',
      solution: 'Check your JSX',
      documentation: 'https://brik.dev/docs',
      context: { file: 'test.tsx' },
      timestamp: Date.now(),
    });

    expect(error.code).toBe(BrikErrorCode.COMPILATION_FAILED);
    expect(error.severity).toBe(BrikErrorSeverity.ERROR);
    expect(error.message).toBe('Compilation failed');
    expect(error.details).toBe('Invalid JSX syntax');
    expect(error.solution).toBe('Check your JSX');
    expect(error.documentation).toBe('https://brik.dev/docs');
    expect(error.context).toEqual({ file: 'test.tsx' });
    expect(error.timestamp).toBeLessThanOrEqual(Date.now());
  });

  it('should format error message with all details', () => {
    const error = new BrikError({
      code: BrikErrorCode.COMPILATION_FAILED,
      severity: BrikErrorSeverity.ERROR,
      message: 'Test error',
      details: 'More details',
      solution: 'Fix it',
      documentation: 'https://docs.com',
      context: { key: 'value' },
      timestamp: Date.now(),
    });

    const formatted = error.getFormattedMessage();
    expect(formatted).toContain('[BR001] Test error');
    expect(formatted).toContain('Details: More details');
    expect(formatted).toContain('Solution: Fix it');
    expect(formatted).toContain('Documentation: https://docs.com');
    expect(formatted).toContain('"key": "value"');
  });

  it('should convert to JSON', () => {
    const error = new BrikError({
      code: BrikErrorCode.COMPILATION_FAILED,
      severity: BrikErrorSeverity.ERROR,
      message: 'Test error',
      timestamp: Date.now(),
    });

    const json = error.toJSON();
    expect(json.code).toBe('BR001');
    expect(json.severity).toBe('error');
    expect(json.message).toBe('Test error');
    expect(json.stack).toBeDefined();
  });
});

describe('BrikCompilationError', () => {
  it('should create a compilation error with default values', () => {
    const error = new BrikCompilationError('Compilation failed');

    expect(error.code).toBe(BrikErrorCode.COMPILATION_FAILED);
    expect(error.severity).toBe(BrikErrorSeverity.ERROR);
    expect(error.message).toBe('Compilation failed');
    expect(error.solution).toContain('JSX syntax');
  });

  it('should include context', () => {
    const error = new BrikCompilationError(
      'Invalid widget',
      'Missing required prop',
      { widget: 'OrderTracker', prop: 'orderId' }
    );

    expect(error.details).toBe('Missing required prop');
    expect(error.context).toEqual({ widget: 'OrderTracker', prop: 'orderId' });
  });
});

describe('BrikRuntimeError', () => {
  it('should create a runtime error with default code', () => {
    const error = new BrikRuntimeError('Activity failed');

    expect(error.code).toBe(BrikErrorCode.INTERNAL_ERROR);
    expect(error.severity).toBe(BrikErrorSeverity.ERROR);
  });

  it('should accept custom error code', () => {
    const error = new BrikRuntimeError(
      'Activity not found',
      BrikErrorCode.ACTIVITY_NOT_FOUND
    );

    expect(error.code).toBe(BrikErrorCode.ACTIVITY_NOT_FOUND);
  });
});

describe('BrikConfigError', () => {
  it('should create a config error', () => {
    const error = new BrikConfigError('Invalid config');

    expect(error.code).toBe(BrikErrorCode.INVALID_CONFIG);
    expect(error.solution).toContain('brik.config.js');
  });
});

describe('BrikStorageError', () => {
  it('should create a storage error with default code', () => {
    const error = new BrikStorageError('Storage read failed');

    expect(error.code).toBe(BrikErrorCode.STORAGE_READ_FAILED);
  });

  it('should accept custom storage error code', () => {
    const error = new BrikStorageError(
      'Storage write failed',
      BrikErrorCode.STORAGE_WRITE_FAILED
    );

    expect(error.code).toBe(BrikErrorCode.STORAGE_WRITE_FAILED);
  });
});

describe('BrikErrorHandler', () => {
  it('should be a singleton', () => {
    const handler1 = BrikErrorHandler.getInstance();
    const handler2 = BrikErrorHandler.getInstance();

    expect(handler1).toBe(handler2);
  });

  it('should register and notify error listeners', () => {
    const handler = BrikErrorHandler.getInstance();
    const mockListener = jest.fn();

    const unsubscribe = handler.onError(mockListener);

    const error = createError(BrikErrorCode.COMPILATION_FAILED, 'Test error');
    handler.handle(error);

    expect(mockListener).toHaveBeenCalledWith(error);

    unsubscribe();
  });

  it('should convert regular Error to BrikError', () => {
    const handler = BrikErrorHandler.getInstance();
    const mockListener = jest.fn();

    handler.onError(mockListener);

    const regularError = new Error('Regular error');
    handler.handle(regularError);

    expect(mockListener).toHaveBeenCalled();
    const capturedError = mockListener.mock.calls[0][0];
    expect(capturedError).toBeInstanceOf(BrikError);
    expect(capturedError.code).toBe(BrikErrorCode.UNKNOWN_ERROR);
  });

  it('should handle listener errors gracefully', () => {
    const handler = BrikErrorHandler.getInstance();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    handler.onError(() => {
      throw new Error('Listener error');
    });

    const error = createError(BrikErrorCode.COMPILATION_FAILED, 'Test');
    handler.handle(error);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Brik Error Handler] Listener error:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});

describe('createError helper', () => {
  it('should create error with default severity', () => {
    const error = createError(BrikErrorCode.PARSE_ERROR, 'Parse failed');

    expect(error.code).toBe(BrikErrorCode.PARSE_ERROR);
    expect(error.severity).toBe(BrikErrorSeverity.ERROR);
    expect(error.message).toBe('Parse failed');
  });

  it('should accept custom severity and options', () => {
    const error = createError(
      BrikErrorCode.PARSE_ERROR,
      'Parse warning',
      {
        severity: BrikErrorSeverity.WARNING,
        details: 'Minor issue',
        context: { line: 42 },
      }
    );

    expect(error.severity).toBe(BrikErrorSeverity.WARNING);
    expect(error.details).toBe('Minor issue');
    expect(error.context).toEqual({ line: 42 });
  });
});

describe('assert helper', () => {
  it('should not throw when condition is true', () => {
    expect(() => {
      assert(true, 'Should not throw');
    }).not.toThrow();
  });

  it('should throw BrikError when condition is false', () => {
    expect(() => {
      assert(false, 'Assertion failed');
    }).toThrow(BrikError);

    try {
      assert(false, 'Assertion failed', BrikErrorCode.INVALID_CONFIG);
    } catch (error) {
      expect(error).toBeInstanceOf(BrikError);
      const brikError = error as BrikError;
      expect(brikError.code).toBe(BrikErrorCode.INVALID_CONFIG);
      expect(brikError.severity).toBe(BrikErrorSeverity.FATAL);
    }
  });
});

describe('tryExecute helper', () => {
  it('should return result on success', async () => {
    const result = await tryExecute(async () => {
      return 'success';
    });

    expect(result).toBe('success');
  });

  it('should return null and handle error on failure', async () => {
    const mockHandler = jest.fn();

    const result = await tryExecute(
      async () => {
        throw new Error('Test error');
      },
      mockHandler
    );

    expect(result).toBeNull();
    expect(mockHandler).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should use global error handler if no custom handler provided', async () => {
    const mockListener = jest.fn();
    errorHandler.onError(mockListener);

    const result = await tryExecute(async () => {
      throw new Error('Global error');
    });

    expect(result).toBeNull();
    expect(mockListener).toHaveBeenCalled();
  });
});

describe('Error Codes', () => {
  it('should have all required error code categories', () => {
    // Compilation errors (BR001-BR099)
    expect(BrikErrorCode.COMPILATION_FAILED).toBe('BR001');
    expect(BrikErrorCode.PARSE_ERROR).toBe('BR002');

    // Code generation errors (BR100-BR199)
    expect(BrikErrorCode.CODEGEN_FAILED).toBe('BR100');

    // Runtime errors (BR200-BR299)
    expect(BrikErrorCode.ACTIVITY_START_FAILED).toBe('BR200');
    expect(BrikErrorCode.NATIVE_MODULE_NOT_FOUND).toBe('BR205');

    // Configuration errors (BR300-BR399)
    expect(BrikErrorCode.INVALID_CONFIG).toBe('BR300');

    // Storage errors (BR400-BR499)
    expect(BrikErrorCode.STORAGE_READ_FAILED).toBe('BR400');

    // Network errors (BR500-BR599)
    expect(BrikErrorCode.NETWORK_ERROR).toBe('BR500');

    // Internal errors (BR900-BR999)
    expect(BrikErrorCode.UNKNOWN_ERROR).toBe('BR900');
  });
});
