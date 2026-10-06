import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): Response | void {
  const error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Mongoose bad ObjectId
  if (error.message && error.message.includes('Cast to ObjectId failed')) {
    const message = 'Resource not found';
    return res.status(404).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }

  // Mongoose duplicate key
  if (error.message && error.message.includes('duplicate key error')) {
    const field =
      Object.keys(error).length > 0 ? Object.keys(error)[0] : 'field';
    const message = `${field} already exists`;
    return res.status(400).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }

  // JWT errors
  if (error.message && error.message.includes('jwt malformed')) {
    const message = 'Not authorized, token failed';
    return res.status(401).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }

  // Validation errors
  if (error.message && error.message.includes('ValidationError')) {
    const message = 'Invalid input data';
    return res.status(400).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }

  // Default to 500 Internal Server Error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // In development, send stack trace
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      error: message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }

  // In production, don't leak error details
  return res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Something went wrong' : message,
    timestamp: new Date().toISOString(),
  });
}
