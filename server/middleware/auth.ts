import { Request, Response, NextFunction } from 'express';
import * as Sentry from "@sentry/node";
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userIdRawAuth = (req.auth as any)?.userId ?? (req.auth as any);
    const userId = Array.isArray(userIdRawAuth) ? userIdRawAuth[0] : userIdRawAuth;

    if (!userId) {
      console.log('Auth failed: No userId found in req.auth', req.auth);
      return res.status(401).json({ message: 'Unauthorized' });
    }

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    Sentry.captureException(error);
    return res.status(500).json({ 
      message: error.code || error.message || 'Internal Server Error' 
    });
  }
};