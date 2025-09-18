import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '15m';

// Temporary role system for finance industry compliance
const FINANCE_ROLES = {
  admin: [
    'clients:view', 'clients:create', 'clients:edit', 'clients:delete',
    'portfolios:view', 'portfolios:create', 'portfolios:edit', 'portfolios:delete',
    'planning:view', 'planning:create', 'planning:edit',
    'reports:view', 'reports:create', 'reports:export',
    'compliance:view', 'compliance:manage', 'compliance:audit',
    'org:settings', 'org:users', 'org:billing'
  ],
  adviser: [
    'clients:view', 'clients:create', 'clients:edit',
    'portfolios:view', 'portfolios:create', 'portfolios:edit',
    'planning:view', 'planning:create', 'planning:edit',
    'reports:view', 'reports:create', 'reports:export',
    'compliance:view'
  ],
  paraplanner: [
    'clients:view', 'portfolios:view',
    'planning:view', 'planning:create', 'planning:edit',
    'reports:view', 'reports:create',
    'compliance:view'
  ],
} as const;

// Auth adapter for current database schema
export class AuthAdapter {
  // Hash password with finance industry standards (12 rounds minimum)
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Create user with current schema
  static async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    organizationId?: string;
  }) {
    const hashedPassword = await this.hashPassword(userData.password);
    
    // Get or create default organization if none provided
    let orgId = userData.organizationId;
    if (!orgId) {
      orgId = await this.getOrCreateDefaultOrganization();
    }
    
    const result = await db.execute(sql`
      INSERT INTO users (
        email, password, first_name, last_name, organization_id, role,
        is_active, email_verified, created_at, updated_at
      ) 
      VALUES (
        ${userData.email}, ${hashedPassword}, ${userData.firstName}, ${userData.lastName}, 
        ${orgId}, ${userData.role || 'adviser'}, true, true, NOW(), NOW()
      ) 
      RETURNING *
    `);
    
    return result.rows[0];
  }

  // Get or create default organization for demo purposes
  static async getOrCreateDefaultOrganization(): Promise<string> {
    // Check if default org exists
    const existingOrg = await db.execute(sql`
      SELECT id FROM organizations WHERE slug = 'demo-financial-firm' LIMIT 1
    `);
    
    if (existingOrg.rows.length > 0) {
      return existingOrg.rows[0].id as string;
    }
    
    // Create default organization
    const newOrg = await db.execute(sql`
      INSERT INTO organizations (
        name, slug, email, phone, plan, is_active, created_at, updated_at
      ) 
      VALUES (
        'Demo Financial Advisory Firm', 'demo-financial-firm', 
        'contact@demofinancial.com', '+44 20 7123 4567', 'pro', true, NOW(), NOW()
      ) 
      RETURNING id
    `);
    
    return newOrg.rows[0].id as string;
  }

  // Get user by email with organization info
  static async getUserByEmail(email: string) {
    const result = await db.execute(sql`
      SELECT u.*, o.name as organization_name, o.domain as organization_domain
      FROM users u 
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.email = ${email} AND u.is_active = true
    `);
    return result.rows[0];
  }

  // Get user by ID
  static async getUserById(id: string) {
    const result = await db.execute(sql`
      SELECT * FROM users WHERE id = ${id} AND is_active = true
    `);
    return result.rows[0];
  }

  // Generate JWT tokens
  static generateTokens(user: any) {
    const role = user.role || user.current_plan || 'adviser';
    const organizationId = user.organization_id || `org-${user.id}`;
    
    const accessToken = jwt.sign(
      {
        id: user.id || user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        organizationId,
        role,
        permissions: FINANCE_ROLES[role as keyof typeof FINANCE_ROLES] || FINANCE_ROLES.adviser,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: user.id || user.user_id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  // Login user
  static async loginUser(email: string, password: string) {
    try {
      const user = await this.getUserByEmail(email);
      
      if (!user || !user.password) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await this.comparePassword(password, user.password || '');
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await db.execute(sql`
        UPDATE users 
        SET last_login_at = NOW(), updated_at = NOW()
        WHERE id = ${user.id}
      `);

      const tokens = this.generateTokens(user);
      
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role || user.current_plan || 'adviser',
          organizationId: user.organization_id || `org-${user.id}`,
        },
        ...tokens
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid credentials');
    }
  }

  // Register new user
  static async registerUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Finance industry password requirements
      if (userData.password.length < 12) {
        throw new Error('Password must be at least 12 characters long');
      }

      const user = await this.createUser(userData);
      const tokens = this.generateTokens(user);
      
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role || user.current_plan || 'adviser',
          organizationId: user.organization_id || `org-${user.id}`,
        },
        ...tokens
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  }

  // Verify JWT token
  static verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET);
  }
}

// Create admin user for testing
export async function createAdminUser() {
  try {
    const adminEmail = 'admin@financeplatform.com';
    const existingAdmin = await AuthAdapter.getUserByEmail(adminEmail);
    
    if (!existingAdmin) {
      // Get or create default organization first
      const orgId = await AuthAdapter.getOrCreateDefaultOrganization();
      
      const adminUser = await AuthAdapter.createUser({
        email: adminEmail,
        password: 'SecureAdmin2024!', // Finance industry compliant password
        firstName: 'Platform',
        lastName: 'Administrator',
        role: 'admin',
        organizationId: orgId
      });
      
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@financeplatform.com');
      console.log('🔑 Password: SecureAdmin2024!');
      
      return adminUser;
    } else {
      console.log('ℹ️ Admin user already exists');
      return existingAdmin;
    }
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    throw error;
  }
}