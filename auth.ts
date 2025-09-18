import bcrypt from "bcrypt";
import { storage } from "./storage";
import type { User, InsertUser } from "@shared/schema";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function registerUser(userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username?: string;
}): Promise<User> {
  // Check if user already exists
  const existingUser = await storage.getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Check username availability
  if (userData.username) {
    const existingUsername = await storage.getUserByUsername(userData.username);
    if (existingUsername) {
      throw new Error("Username is already taken");
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create user with freemium plan by default
  const newUser: InsertUser = {
    email: userData.email,
    password: hashedPassword,
    firstName: userData.firstName,
    lastName: userData.lastName,
    username: userData.username || null,
    provider: "email",
    currentPlan: "freemium", // New users get freemium plan by default
    monthlyUsage: 0,
    isActive: true,
    emailVerified: false,
  };

  return await storage.createUser(newUser);
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  const user = await storage.getUserByEmail(email);
  if (!user || !user.password) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    return null;
  }

  // Update last login
  await storage.updateUser(user.id, { lastLoginAt: new Date() });

  return user;
}

// OAuth user registration/login
export async function upsertOAuthUser(profile: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  provider: "google" | "facebook";
}): Promise<User> {
  return await storage.upsertUser({
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    profileImageUrl: profile.profileImageUrl || null,
    provider: profile.provider,
    providerId: profile.id,
    currentPlan: "freemium", // New users get freemium plan by default
    monthlyUsage: 0,
    isActive: true,
    emailVerified: true,
    lastLoginAt: new Date(),
  });
}