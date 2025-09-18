import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    organizationId: string;
    role: string;
    permissions: string[];
  };
}

// Temporary role system until full migration
const TEMP_ROLES = {
  admin: ['clients:view', 'clients:create', 'clients:edit', 'clients:delete', 'portfolios:view', 'portfolios:create', 'portfolios:edit', 'portfolios:delete', 'planning:view', 'planning:create', 'planning:edit', 'reports:view', 'reports:create', 'compliance:view', 'compliance:manage', 'org:settings', 'org:users'],
  adviser: ['clients:view', 'clients:create', 'clients:edit', 'portfolios:view', 'portfolios:create', 'portfolios:edit', 'planning:view', 'planning:create', 'planning:edit', 'reports:view', 'reports:create', 'compliance:view'],
  paraplanner: ['clients:view', 'portfolios:view', 'planning:view', 'planning:create', 'planning:edit', 'reports:view', 'reports:create', 'compliance:view'],
};

// JWT utility functions
export const generateTokens = (user: any) => {
  const role = user.role || 'adviser'; // Default to adviser
  const organizationId = user.organizationId || 'temp-org-' + user.id; // Temporary org ID
  
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      organizationId,
      role,
      permissions: TEMP_ROLES[role as keyof typeof TEMP_ROLES] || TEMP_ROLES.adviser,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Authentication middleware  
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Get fresh user data using raw SQL for compatibility
      const result = await db.execute(sql`
        SELECT * FROM users WHERE id = ${decoded.id} AND is_active = true
      `);

      if (!result.rows.length) {
        return res.status(401).json({ message: 'User not found or inactive' });
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        organizationId: decoded.organizationId,
        role: decoded.role,
        permissions: decoded.permissions || [],
      };

      next();
    } catch (jwtError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Authentication failed' });
  }
};

// Role-based authorization middleware
export const authorize = (requiredPermission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: requiredPermission,
        available: req.user.permissions
      });
    }

    next();
  };
};

// Organization isolation middleware - ensures users can only access their org's data
export const requireOrganization = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.organizationId) {
    return res.status(401).json({ message: 'Organization context required' });
  }
  next();
};

// Admin role check
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Temporary login function for existing users
export const loginUser = async (email: string, password: string) => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user.length || !user[0].password) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return null;
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user[0].id));

    return user[0];
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

// Register new user with role
export const registerUser = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}) => {
  try {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);

    if (existingUser.length) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isActive: true,
        emailVerified: true,
      })
      .returning();

    return newUser[0];
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};