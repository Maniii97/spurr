import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import type { AppError } from '../types';

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Always log the full error server-side
  if (env.isDev) {
    console.error('[Error Handler]', err.stack ?? err.message);
  } else {
    console.error('[Error Handler]', err.message);
  }

  const statusCode = err.statusCode ?? 500;

  // Never expose stack traces to the client in production
  res.status(statusCode).json({
    error:
      statusCode >= 500
        ? 'An internal server error occurred. Please try again.'
        : err.message,
  });
}
