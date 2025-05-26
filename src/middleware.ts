// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // First try to get token from Authorization header
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If no token in header, try to get it from cookies
    if (!token) {
      token = req.cookies.token; // Read from cookie
    }

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    console.log(decoded);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

