import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { logger } from './logger';

const TOKEN_KEY = '@sikhsha_auth_token';

interface TokenPayload {
    id: string;
    email: string;
    role: string;
    school_id?: string | null;
    grade_level?: string | null;
    exp: number;
    iat: number;
}

/**
 * Save authentication token to AsyncStorage
 */
export async function saveToken(token: string): Promise<void> {
    try {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        logger.info('Token saved to storage');
    } catch (error) {
        logger.error('Failed to save token', { error });
        throw new Error('Failed to save authentication token');
    }
}

/**
 * Get authentication token from AsyncStorage
 */
export async function getToken(): Promise<string | null> {
    try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
            logger.info('Token retrieved from storage');
        }
        return token;
    } catch (error) {
        logger.error('Failed to get token', { error });
        return null;
    }
}

/**
 * Delete authentication token from AsyncStorage
 */
export async function deleteToken(): Promise<void> {
    try {
        await AsyncStorage.removeItem(TOKEN_KEY);
        logger.info('Token deleted from storage');
    } catch (error) {
        logger.error('Failed to delete token', { error });
    }
}

/**
 * Decode JWT token and get expiration time
 * @returns Expiration timestamp in milliseconds, or null if invalid
 */
export function getTokenExpiration(token: string): number | null {
    try {
        const decoded = jwtDecode<TokenPayload>(token);
        // JWT exp is in seconds, convert to milliseconds
        return decoded.exp * 1000;
    } catch (error) {
        logger.error('Failed to decode token', { error });
        return null;
    }
}

/**
 * Check if token is expired or about to expire
 * @param token JWT token to check
 * @param bufferMinutes Number of minutes before expiration to consider token as expired (default: 5)
 * @returns true if token is expired or will expire within buffer time
 */
export function isTokenExpired(token: string, bufferMinutes: number = 5): boolean {
    const expiration = getTokenExpiration(token);
    if (!expiration) {
        return true; // Invalid token is considered expired
    }

    const now = Date.now();
    const bufferMs = bufferMinutes * 60 * 1000;

    return now >= expiration - bufferMs;
}

/**
 * Get time remaining until token expires
 * @returns Time remaining in milliseconds, or 0 if expired
 */
export function getTokenTimeRemaining(token: string): number {
    const expiration = getTokenExpiration(token);
    if (!expiration) {
        return 0;
    }

    const remaining = expiration - Date.now();
    return Math.max(0, remaining);
}

/**
 * Decode token and extract user payload
 */
export function decodeToken(token: string): TokenPayload | null {
    try {
        return jwtDecode<TokenPayload>(token);
    } catch (error) {
        logger.error('Failed to decode token', { error });
        return null;
    }
}
