import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: { uid: string; email: string; };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    if (token === 'mock-jwt-token-admin') {
      req.user = { uid: 'mock-admin-uid-123', email: 'admin@system.com' };
      next();
    } else {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
