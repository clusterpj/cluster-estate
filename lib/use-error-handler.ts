'use client'

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { 
  AppError, 
  ErrorType, 
  handleError, 
  ErrorHandlerOptions, 
  withErrorHandling 
} from '@/lib/error-handling-utils'

/**
 * Hook for handling errors in React components
 */
export function useErrorHandler() {
  const t = useTranslations()
  
  /**
   * Handle an error with consistent behavior
   */
  const handleAppError = useCallback(
    (error: unknown, options?: ErrorHandlerOptions): AppError => {
      return handleError(error, t, options)
    },
    [t]
  )
  
  /**
   * Wrap an async function with error handling
   */
  const withAppErrorHandling = useCallback(
    <T extends (...args: any[]) => Promise<any>>(
      fn: T,
      options?: ErrorHandlerOptions
    ): ((...args: Parameters<T>) => Promise<ReturnType<T> | undefined>) => {
      return withErrorHandling(fn, t, options)
    },
    [t]
  )
  
  /**
   * Create a safe async function that handles its own errors
   */
  const createSafeAsyncFunction = useCallback(
    <T extends (...args: any[]) => Promise<any>>(
      fn: T,
      options?: ErrorHandlerOptions
    ) => {
      return async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
        try {
          return await fn(...args)
        } catch (error) {
          handleAppError(error, options)
          return undefined
        }
      }
    },
    [handleAppError]
  )

  return {
    handleError: handleAppError,
    withErrorHandling: withAppErrorHandling,
    createSafeAsyncFunction,
    ErrorType
  }
}