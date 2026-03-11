import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction): void => {
  console.error('Error:', err.message);

  const statusCode = err.statusCode || 500;
  const message = statusCode < 500 ? err.message : 'Internal Server Error';

  res.status(statusCode).json({
    error: err.name || 'Error',
    message,
    timestamp: new Date().toISOString(),
  });
};

export default errorHandler;
