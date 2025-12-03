/**
 * Authentication and authorization models
 * @module auth/models
 */

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword?: string;
  [key: string]: any; // Allow additional fields like name, firstName, lastName, etc.
}

/**
 * OAuth login request
 */
export interface OAuthLoginRequest {
  provider: 'google' | 'github' | 'facebook' | string;
  code?: string;
  state?: string;
}

/**
 * User role
 */
export interface Role {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  permissions?: Permission[];
}

/**
 * Permission definition
 */
export interface Permission {
  id: string | number;
  name: string;
  resource?: string;
  action?: string;
  description?: string;
}

/**
 * Authenticated user data
 */
export interface AuthUser {
  id: string;
  email: string;
  password?: string;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  lastLoginAt?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string;
  passwordChangedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  roles?: Role[];
  roleIds?: number[];
  permissions?: Permission[];
}

/**
 * Authentication response from backend
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string; // Optional if using httpOnly cookies
  user: AuthUser;
  expiresIn?: number;
}

/**
 * Token refresh response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn?: number;
}

/**
 * Session information
 */
export interface SessionInfo {
  id: string;
  userId: string | number;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date | string;
  expiresAt: Date | string;
  lastActivityAt: Date | string;
}

/**
 * Auth state
 */
export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Permission check options
 */
export interface PermissionCheckOptions {
  /**
   * If true, user must have ALL specified permissions
   * If false, user must have ANY of the specified permissions
   * @default true
   */
  requireAll?: boolean;
}
