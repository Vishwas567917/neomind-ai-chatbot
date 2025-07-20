import { NextResponse } from 'next/server';
import { isTestEnvironment, isDevelopmentEnvironment } from '../constants';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function handleApiError(error: any, req?: Request) {
  const isDev = isDevelopmentEnvironment || isTestEnvironment;
  
  console.error('API Error:', {
    message: error.message,
    stack: isDev ? error.stack : undefined,
    url: req?.url,
    timestamp: new Date().toISOString(),
  });

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        status: 'error',
        ...(isDev && { stack: error.stack }),
      },
      { status: error.statusCode }
    );
  }

  // Database errors
  if (error.message?.includes('database') || error.message?.includes('postgres')) {
    return NextResponse.json(
      {
        error: 'Database temporarily unavailable. Using fallback mode.',
        status: 'degraded',
        ...(isDev && { originalError: error.message }),
      },
      { status: 503 }
    );
  }

  // AI API errors
  if (error.message?.includes('API') || error.message?.includes('rate limit')) {
    return NextResponse.json(
      {
        error: 'AI service temporarily unavailable. Please try again.',
        status: 'degraded',
        ...(isDev && { originalError: error.message }),
      },
      { status: 503 }
    );
  }

  // Generic error response
  return NextResponse.json(
    {
      error: isDev ? error.message : 'Internal server error',
      status: 'error',
      ...(isDev && { stack: error.stack }),
    },
    { status: 500 }
  );
}

export function asyncHandler(fn: Function) {
  return (req: Request, ...args: any[]) => {
    return Promise.resolve(fn(req, ...args)).catch((error) => {
      return handleApiError(error, req);
    });
  };
}