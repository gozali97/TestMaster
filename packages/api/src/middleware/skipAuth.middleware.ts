import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to bypass authentication for specific routes
 * Used for public endpoints that don't require user authentication
 */
export const skipAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔓 [SKIP-AUTH] Bypassing authentication for:', req.path);
  // Mark this request as authenticated without checking token
  (req as any).skipAuth = true;
  next();
};
