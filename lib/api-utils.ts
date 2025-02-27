import { NextRequest, NextResponse } from 'next/server'
import { AppError, ErrorType } from '@/lib/error-handling-utils'
import { ZodError, ZodSchema } from 'zod'

/**
 * API response structure
 */
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  errors?: Record<string, string[]>
  success: boolean
  status: number
}

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      success: true,
      status
    },
    { status }
  )
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  error: unknown,
  status = 500
): NextResponse<ApiResponse> {
  // Handle different error types
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        errors: error.details,
        success: false,
        status: error.status || status
      },
      { status: error.status || status }
    )
  }

  if (error instanceof ZodError) {
    // Format Zod validation errors
    const errors: Record<string, string[]> = {}
    
    for (const issue of error.errors) {
      const path = issue.path.join('.')
      
      if (!errors[path]) {
        errors[path] = []
      }
      
      errors[path].push(issue.message)
    }
    
    return NextResponse.json(
      {
        error: 'Validation error',
        errors,
        success: false,
        status: 400
      },
      { status: 400 }
    )
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message,
        success: false,
        status
      },
      { status }
    )
  }

  // Default case for unknown errors
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      success: false,
      status
    },
    { status }
  )
}

/**
 * Validate request body against a Zod schema
 */
export async function validateRequest<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await req.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      throw error
    }
    throw new AppError('Invalid request body', ErrorType.VALIDATION, 400)
  }
}

/**
 * Safe API route handler with built-in error handling
 */
export function createApiHandler<T>(
  handler: (req: NextRequest) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req)
    } catch (error) {
      console.error('[API Error]', error)
      return createErrorResponse(error)
    }
  }
}

/**
 * Example usage:
 * 
 * ```ts
 * // Route handler with built-in error handling
 * export const POST = createApiHandler(async (req) => {
 *   // Validate request body
 *   const data = await validateRequest(req, bookingSchema)
 *   
 *   // Process request
 *   const result = await createBooking(data)
 *   
 *   // Return success response
 *   return createSuccessResponse(result, 201)
 * })
 * ```
 */