import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../database/models';

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Try to get token from Authorization header first, then from query parameter (for SSE)
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token && req.query.token) {
      token = req.query.token as string;
      console.log('🔐 [AUTH] Token from query parameter (SSE)');
    }
    
    console.log('🔐 [AUTH] Checking authentication for:', req.path);
    console.log('🔐 [AUTH] Token provided:', token ? 'YES' : 'NO');
    
    if (!token) {
      console.log('❌ [AUTH] No token provided');
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    console.log('🔐 [AUTH] Token decoded, userId:', decoded.userId);
    
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      console.log('❌ [AUTH] User not found for userId:', decoded.userId);
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    console.log('✅ [AUTH] Authentication successful for user:', user.email);
    req.user = user;
    next();
  } catch (error: any) {
    console.error('❌ [AUTH] Authentication error:', error.message);
    res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    next();
  };
};
