import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { AuthUser } from '../api/authApi';
import * as authApi from '../api/authApi';
import * as tokenStorage from '../utils/tokenStorage';
import { setTokenRefreshCallback } from '../api/httpClient';
import { logger } from '../utils/logger';
import Toast from 'react-native-toast-message';

interface AuthState {
  user?: AuthUser;
  token?: string;
  loading: boolean;
  initializing: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface ProviderProps {
  children: React.ReactNode;
}

// Check token expiration every 5 minutes
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000;

// Refresh token when it has less than 20% of its lifetime remaining
// For 7-day tokens, this means refresh after ~5.6 days
const REFRESH_THRESHOLD_PERCENT = 0.2;

export const AuthProvider: React.FC<ProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | undefined>();
  const [token, setToken] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const refreshTimerRef = useRef<any>(null);

  // Load token from storage on mount
  useEffect(() => {
    const loadStoredToken = async () => {
      try {
        const storedToken = await tokenStorage.getToken();
        if (storedToken) {
          // Check if token is expired
          if (tokenStorage.isTokenExpired(storedToken)) {
            logger.warn('Stored token is expired, clearing');
            await tokenStorage.deleteToken();
          } else {
            // Decode token to get user info
            const decoded = tokenStorage.decodeToken(storedToken);
            if (decoded) {
              setToken(storedToken);
              setUser({
                id: decoded.id,
                email: decoded.email,
                role: decoded.role as any,
                school_id: decoded.school_id,
              });
              logger.info('Restored session from storage', { userId: decoded.id });
            }
          }
        }
      } catch (error) {
        logger.error('Failed to load stored token', { error });
      } finally {
        setInitializing(false);
      }
    };

    loadStoredToken();
  }, []);

  // Auto-refresh token timer
  useEffect(() => {
    if (!token) {
      // Clear timer if no token
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      return;
    }

    const checkAndRefreshToken = async () => {
      try {
        const timeRemaining = tokenStorage.getTokenTimeRemaining(token);
        const expiration = tokenStorage.getTokenExpiration(token);

        if (!expiration) {
          logger.error('Invalid token expiration');
          return;
        }

        const totalLifetime = expiration - (tokenStorage.decodeToken(token)?.iat || 0) * 1000;
        const refreshThreshold = totalLifetime * REFRESH_THRESHOLD_PERCENT;

        if (timeRemaining < refreshThreshold) {
          logger.info('Token approaching expiration, refreshing...', {
            timeRemaining: Math.floor(timeRemaining / 1000 / 60) + ' minutes',
          });
          await refreshAccessToken();
        }
      } catch (error) {
        logger.error('Auto-refresh check failed', { error });
      }
    };

    // Initial check
    checkAndRefreshToken();

    // Set up interval
    refreshTimerRef.current = setInterval(checkAndRefreshToken, TOKEN_CHECK_INTERVAL);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [token]);

  const refreshAccessToken = useCallback(async () => {
    if (!token) {
      logger.warn('Cannot refresh: no token available');
      return;
    }

    try {
      logger.info('Refreshing access token...');
      const result = await authApi.refreshToken(token);

      // Save new token
      await tokenStorage.saveToken(result.token);
      setToken(result.token);

      // Decode to update user info (in case it changed)
      const decoded = tokenStorage.decodeToken(result.token);
      if (decoded) {
        setUser({
          id: decoded.id,
          email: decoded.email,
          role: decoded.role as any,
          school_id: decoded.school_id,
        });
      }

      logger.info('Token refreshed successfully');
    } catch (error: any) {
      logger.error('Token refresh failed', { error: error.message });

      // If refresh fails, logout user
      Toast.show({
        type: 'error',
        text1: 'Session Expired',
        text2: 'Please log in again',
        visibilityTime: 3000,
      });

      await logout();
    }
  }, [token]);

  // Register refresh callback with httpClient for 401 error handling
  useEffect(() => {
    if (refreshAccessToken) {
      setTokenRefreshCallback(async () => {
        try {
          await refreshAccessToken();
          // Return the updated token
          const newToken = await tokenStorage.getToken();
          return newToken;
        } catch (error) {
          logger.error('Refresh callback failed', { error });
          return null;
        }
      });
    }
  }, [refreshAccessToken]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    logger.auth(`Attempting login with email: ${email}`);

    try {
      const result = await authApi.login(email, password);

      // Save token to storage
      await tokenStorage.saveToken(result.token);

      setUser(result.user);
      setToken(result.token);

      logger.auth('Login successful', {
        userId: result.user.id,
        role: result.user.role,
      });

      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: `Logged in as ${result.user.role}`,
        visibilityTime: 2000,
      });
    } catch (error: any) {
      logger.auth('Login failed', { error: error.message });

      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message || 'Please check your credentials',
        visibilityTime: 4000,
      });

      // Re-throw the error so LoginScreen can also handle it
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    logger.info('Logging out user');

    // Clear stored token
    await tokenStorage.deleteToken();

    // Clear state
    setUser(undefined);
    setToken(undefined);

    Toast.show({
      type: 'info',
      text1: 'Logged out',
      text2: 'See you next time!',
      visibilityTime: 2000,
    });
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({ user, token, loading, initializing, login, logout, refreshAccessToken }),
    [user, token, loading, initializing, login, logout, refreshAccessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
