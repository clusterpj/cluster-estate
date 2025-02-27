/**
 * Centralized error handling utilities for Cluster Estate
 */
import { toast } from '@/components/ui/toast'

/**
 * Error types for the application
 */
export enum ErrorType {
  // Authentication and authorization errors
  AUTHENTICATION = 'authentication',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  
  // Data errors
  NOT_FOUND = 'not_found',
  VALIDATION = 'validation',
  CONFLICT = 'conflict',
  
  // API errors
  NETWORK = 'network',
  SERVER = 'server',
  TIMEOUT = 'timeout',
  
  // Payment errors
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_CANCELED = 'payment_canceled',
  
  // Booking errors
  AVAILABILITY = 'availability',
  BOOKING_FAILED = 'booking_failed',
  
  // Unexpected errors
  UNKNOWN = 'unknown'
}

/**
 * Application error class with type information
 */
export class AppError extends Error {
  public type: ErrorType;
  public status?: number;
  public details?: Record<string, any>;
  
  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    status?: number,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.status = status;
    this.details = details;
  }
  
  /**
   * Create an error from an API response
   */
  static fromApiResponse(response: Response, data?: any): AppError {
    const message = data?.error || data?.message || response.statusText || 'Unknown API error';
    let type = ErrorType.UNKNOWN;
    
    // Map HTTP status codes to error types
    switch (response.status) {
      case 400:
        type = ErrorType.VALIDATION;
        break;
      case 401:
        type = ErrorType.AUTHENTICATION;
        break;
      case 403:
        type = ErrorType.FORBIDDEN;
        break;
      case 404:
        type = ErrorType.NOT_FOUND;
        break;
      case 409:
        type = ErrorType.CONFLICT;
        break;
      case 500:
      case 502:
      case 503:
        type = ErrorType.SERVER;
        break;
      default:
        if (response.status >= 500) {
          type = ErrorType.SERVER;
        } else if (response.status >= 400) {
          type = ErrorType.VALIDATION;
        }
    }
    
    return new AppError(message, type, response.status, data);
  }
  
  /**
   * Create an error from an unknown exception
   */
  static fromUnknown(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }
    
    if (error instanceof Error) {
      // Handle network errors
      if (error.name === 'NetworkError' || error.message.includes('network')) {
        return new AppError('Network error. Please check your connection.', ErrorType.NETWORK);
      }
      
      // Handle timeout errors
      if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
        return new AppError('Request timed out. Please try again.', ErrorType.TIMEOUT);
      }
      
      return new AppError(error.message);
    }
    
    // Handle string errors
    if (typeof error === 'string') {
      return new AppError(error);
    }
    
    // Default case for truly unknown errors
    return new AppError('An unexpected error occurred');
  }
}

/**
 * Error handling configuration
 */
export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  rethrow?: boolean;
  defaultMessage?: string;
}

/**
 * Default options for error handling
 */
const defaultErrorOptions: ErrorHandlerOptions = {
  showToast: true,
  logToConsole: true,
  rethrow: false,
  defaultMessage: 'An unexpected error occurred'
};

/**
 * Translate error type to user-friendly message translation key
 */
export function getErrorTranslationKey(error: AppError): string {
  const baseKey = 'errors';
  
  // Use specific error translation if it exists
  if (error.type) {
    return `${baseKey}.${error.type}`;
  }
  
  return `${baseKey}.unknown`;
}

/**
 * Handle an error with consistent behavior
 */
export function handleError(
  error: unknown,
  t: (key: string, options?: any) => string,
  options?: ErrorHandlerOptions
): AppError {
  const opts = { ...defaultErrorOptions, ...options };
  const appError = AppError.fromUnknown(error);
  
  // Log to console if enabled
  if (opts.logToConsole) {
    console.error('[Error]', appError.type, appError.message, appError);
  }
  
  // Show toast notification if enabled
  if (opts.showToast) {
    const translationKey = getErrorTranslationKey(appError);
    const message = t(translationKey, {
      defaultValue: appError.message || opts.defaultMessage,
      ...appError.details
    });
    
    toast({
      title: t('errors.title', { defaultValue: 'Error' }),
      description: message,
      variant: 'destructive',
    });
  }
  
  // Rethrow if required (useful for try/catch flows)
  if (opts.rethrow) {
    throw appError;
  }
  
  return appError;
}

/**
 * API request wrapper with error handling
 */
export async function apiRequest<T>(
  url: string,
  options?: RequestInit,
  t?: (key: string, options?: any) => string
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw AppError.fromApiResponse(response, data);
    }
    
    return data as T;
  } catch (error) {
    if (t) {
      handleError(error, t);
    }
    throw AppError.fromUnknown(error);
  }
}

/**
 * Create a try/catch wrapper for async functions
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  t: (key: string, options?: any) => string,
  options?: ErrorHandlerOptions
): (...args: Parameters<T>) => Promise<ReturnType<T> | undefined> {
  return async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, t, options);
      if (options?.rethrow) {
        throw error;
      }
      return undefined;
    }
  };
}