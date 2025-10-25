// Auth Service - Reusable authentication functions

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  organizationName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: number;
      email: string;
      name: string;
      role: string;
      organizationId: number;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
  error?: string;
  message?: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  }

  /**
   * Login user
   */
  static async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Token refresh failed',
      };
    }
  }

  /**
   * Store tokens in localStorage
   */
  static storeTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  /**
   * Get stored access token
   */
  static getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  /**
   * Get stored refresh token
   */
  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  /**
   * Clear stored tokens (logout)
   */
  static clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Logout user
   */
  static logout(): void {
    this.clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  /**
   * Get authorization header
   */
  static getAuthHeader(): { Authorization: string } | {} {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Make authenticated API request
   */
  static async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAccessToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired, try refresh
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        const refreshResult = await this.refreshToken(refreshToken);
        if (refreshResult.success && refreshResult.data?.tokens) {
          this.storeTokens(
            refreshResult.data.tokens.accessToken,
            refreshResult.data.tokens.refreshToken
          );
          // Retry original request
          return this.apiRequest<T>(endpoint, options);
        }
      }
      // Refresh failed, logout
      this.logout();
    }

    return await response.json();
  }
}
