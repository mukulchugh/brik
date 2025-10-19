/**
 * Enhanced Error Handling System for Brik v0.3.0
 * Enterprise-grade error codes, categorization, and recovery guidance
 */

export enum BrikErrorCode {
  // Compilation Errors (BR001-BR099)
  COMPILATION_FAILED = 'BR001',
  PARSE_ERROR = 'BR002',
  INVALID_JSX = 'BR003',
  UNSUPPORTED_SYNTAX = 'BR004',
  INVALID_WIDGET_DEFINITION = 'BR005',
  MISSING_ACTIVITY_CONFIG = 'BR006',
  INVALID_STYLE = 'BR007',
  TYPE_VALIDATION_FAILED = 'BR008',

  // Code Generation Errors (BR100-BR199)
  CODEGEN_FAILED = 'BR100',
  INVALID_IR = 'BR101',
  UNSUPPORTED_NODE_TYPE = 'BR102',
  TEMPLATE_ERROR = 'BR103',
  FILE_WRITE_ERROR = 'BR104',

  // Runtime Errors (BR200-BR299)
  ACTIVITY_START_FAILED = 'BR200',
  ACTIVITY_UPDATE_FAILED = 'BR201',
  ACTIVITY_END_FAILED = 'BR202',
  ACTIVITY_NOT_FOUND = 'BR203',
  PUSH_TOKEN_UNAVAILABLE = 'BR204',
  NATIVE_MODULE_NOT_FOUND = 'BR205',
  PLATFORM_UNSUPPORTED = 'BR206',
  PERMISSION_DENIED = 'BR207',

  // Configuration Errors (BR300-BR399)
  INVALID_CONFIG = 'BR300',
  MISSING_DEPENDENCY = 'BR301',
  VERSION_MISMATCH = 'BR302',
  PLUGIN_ERROR = 'BR303',

  // Widget Storage Errors (BR400-BR499)
  STORAGE_READ_FAILED = 'BR400',
  STORAGE_WRITE_FAILED = 'BR401',
  STORAGE_DELETE_FAILED = 'BR402',
  DATA_EXPIRED = 'BR403',
  SCHEMA_MISMATCH = 'BR404',

  // Network Errors (BR500-BR599)
  NETWORK_ERROR = 'BR500',
  TIMEOUT = 'BR501',
  INVALID_RESPONSE = 'BR502',

  // Internal Errors (BR900-BR999)
  UNKNOWN_ERROR = 'BR900',
  NOT_IMPLEMENTED = 'BR901',
  INTERNAL_ERROR = 'BR902',
}

export enum BrikErrorSeverity {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface BrikErrorMetadata {
  code: BrikErrorCode;
  severity: BrikErrorSeverity;
  message: string;
  details?: string;
  solution?: string;
  documentation?: string;
  context?: Record<string, any>;
  timestamp: number;
  stack?: string;
}

/**
 * Base Brik Error Class
 */
export class BrikError extends Error {
  public readonly code: BrikErrorCode;
  public readonly severity: BrikErrorSeverity;
  public readonly details?: string;
  public readonly solution?: string;
  public readonly documentation?: string;
  public readonly context?: Record<string, any>;
  public readonly timestamp: number;

  constructor(metadata: BrikErrorMetadata) {
    super(metadata.message);
    this.name = 'BrikError';
    this.code = metadata.code;
    this.severity = metadata.severity;
    this.details = metadata.details;
    this.solution = metadata.solution;
    this.documentation = metadata.documentation;
    this.context = metadata.context;
    this.timestamp = metadata.timestamp;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BrikError);
    }
  }

  /**
   * Get formatted error message with all details
   */
  getFormattedMessage(): string {
    const lines: string[] = [
      `[${this.code}] ${this.message}`,
    ];

    if (this.details) {
      lines.push(`Details: ${this.details}`);
    }

    if (this.solution) {
      lines.push(`Solution: ${this.solution}`);
    }

    if (this.documentation) {
      lines.push(`Documentation: ${this.documentation}`);
    }

    if (this.context && Object.keys(this.context).length > 0) {
      lines.push(`Context: ${JSON.stringify(this.context, null, 2)}`);
    }

    return lines.join('\n');
  }

  /**
   * Convert to JSON for logging/telemetry
   */
  toJSON(): Record<string, any> {
    return {
      code: this.code,
      severity: this.severity,
      message: this.message,
      details: this.details,
      solution: this.solution,
      documentation: this.documentation,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Compilation Error
 */
export class BrikCompilationError extends BrikError {
  constructor(message: string, details?: string, context?: Record<string, any>) {
    super({
      code: BrikErrorCode.COMPILATION_FAILED,
      severity: BrikErrorSeverity.ERROR,
      message,
      details,
      solution: 'Check your JSX syntax and widget structure. Ensure all required props are provided.',
      documentation: 'https://brik.dev/docs/errors/compilation',
      context,
      timestamp: Date.now(),
    });
    this.name = 'BrikCompilationError';
  }
}

/**
 * Runtime Error (Live Activities, Widgets)
 */
export class BrikRuntimeError extends BrikError {
  constructor(message: string, code?: BrikErrorCode, details?: string, context?: Record<string, any>) {
    super({
      code: code || BrikErrorCode.INTERNAL_ERROR,
      severity: BrikErrorSeverity.ERROR,
      message,
      details,
      solution: 'Check native module linkage and platform permissions.',
      documentation: 'https://brik.dev/docs/errors/runtime',
      context,
      timestamp: Date.now(),
    });
    this.name = 'BrikRuntimeError';
  }
}

/**
 * Configuration Error
 */
export class BrikConfigError extends BrikError {
  constructor(message: string, details?: string, context?: Record<string, any>) {
    super({
      code: BrikErrorCode.INVALID_CONFIG,
      severity: BrikErrorSeverity.ERROR,
      message,
      details,
      solution: 'Review your brik.config.js or package.json configuration.',
      documentation: 'https://brik.dev/docs/errors/config',
      context,
      timestamp: Date.now(),
    });
    this.name = 'BrikConfigError';
  }
}

/**
 * Storage Error
 */
export class BrikStorageError extends BrikError {
  constructor(message: string, code?: BrikErrorCode, details?: string, context?: Record<string, any>) {
    super({
      code: code || BrikErrorCode.STORAGE_READ_FAILED,
      severity: BrikErrorSeverity.ERROR,
      message,
      details,
      solution: 'Check AsyncStorage permissions and available disk space.',
      documentation: 'https://brik.dev/docs/errors/storage',
      context,
      timestamp: Date.now(),
    });
    this.name = 'BrikStorageError';
  }
}

/**
 * Error Handler
 */
export class BrikErrorHandler {
  private static instance: BrikErrorHandler;
  private errorListeners: Array<(error: BrikError) => void> = [];

  private constructor() {}

  static getInstance(): BrikErrorHandler {
    if (!BrikErrorHandler.instance) {
      BrikErrorHandler.instance = new BrikErrorHandler();
    }
    return BrikErrorHandler.instance;
  }

  /**
   * Register error listener
   */
  onError(listener: (error: BrikError) => void): () => void {
    this.errorListeners.push(listener);
    return () => {
      const index = this.errorListeners.indexOf(listener);
      if (index > -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }

  /**
   * Handle error
   */
  handle(error: Error | BrikError): void {
    const brikError = error instanceof BrikError
      ? error
      : new BrikError({
          code: BrikErrorCode.UNKNOWN_ERROR,
          severity: BrikErrorSeverity.ERROR,
          message: error.message,
          details: error.stack,
          timestamp: Date.now(),
        });

    // Notify listeners
    this.errorListeners.forEach((listener) => {
      try {
        listener(brikError);
      } catch (listenerError) {
        console.error('[Brik Error Handler] Listener error:', listenerError);
      }
    });

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Brik Error]', brikError.getFormattedMessage());
    }
  }
}

/**
 * Global error handler instance
 */
export const errorHandler = BrikErrorHandler.getInstance();

/**
 * Error helpers
 */
export function createError(
  code: BrikErrorCode,
  message: string,
  options?: {
    severity?: BrikErrorSeverity;
    details?: string;
    solution?: string;
    context?: Record<string, any>;
  }
): BrikError {
  return new BrikError({
    code,
    severity: options?.severity || BrikErrorSeverity.ERROR,
    message,
    details: options?.details,
    solution: options?.solution,
    context: options?.context,
    timestamp: Date.now(),
  });
}

/**
 * Assert helper with Brik errors
 */
export function assert(
  condition: boolean,
  message: string,
  code: BrikErrorCode = BrikErrorCode.INTERNAL_ERROR
): asserts condition {
  if (!condition) {
    throw createError(code, message, {
      severity: BrikErrorSeverity.FATAL,
    });
  }
}

/**
 * Try-catch wrapper with error handling
 */
export async function tryExecute<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: Error) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error as Error);
    } else {
      BrikErrorHandler.getInstance().handle(error as Error);
    }
    return null;
  }
}
