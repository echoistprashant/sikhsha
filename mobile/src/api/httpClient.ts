import { Platform } from 'react-native';
import { logger } from '../utils/logger';
import Toast from 'react-native-toast-message';

// Production API URL
const PRODUCTION_BASE_URL = 'https://api.sikhsha.in/api';

// For local development on Physical Android Device
const ANDROID_BASE_URL = 'https://ambrose-unfulgent-bolsteringly.ngrok-free.dev/api';

// For local development on iOS Simulator
// const IOS_BASE_URL = 'http://localhost:3001/api';

// Use production URL by default
// const API_BASE_URL = PRODUCTION_BASE_URL;
const API_BASE_URL = PRODUCTION_BASE_URL;

// Request timeout in milliseconds
const DEFAULT_TIMEOUT = 10000; // 10 seconds for normal requests
const AI_GENERATION_TIMEOUT = 240000; // 60 seconds for AI generation (OpenAI can be slow)

// Endpoints that need longer timeout
const AI_ENDPOINTS = [
  '/teacher/deck/generate',
  '/teacher/activity/generate',
  '/teacher/lesson-plan/generate',
  '/questions/generate',
  '/questions/generate-mixed',
];

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  token?: string;
  body?: unknown;
  _isRetry?: boolean; // Internal flag to prevent infinite retry loops
}

// Global callback for token refresh - set by AuthContext
let globalRefreshTokenCallback: (() => Promise<string | null>) | null = null;

/**
 * Set the global token refresh callback
 * This should be called by AuthContext during initialization
 */
export function setTokenRefreshCallback(callback: () => Promise<string | null>) {
  globalRefreshTokenCallback = callback;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', token, body, _isRetry = false } = options;
  const fullUrl = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Log the request
  logger.apiRequest(method, fullUrl, body ? { body } : undefined);

  // Determine timeout based on endpoint
  const isAIEndpoint = AI_ENDPOINTS.some(endpoint => path.includes(endpoint));
  const timeout = isAIEndpoint ? AI_GENERATION_TIMEOUT : DEFAULT_TIMEOUT;

  if (isAIEndpoint) {
    logger.info(
      `Using extended timeout (${timeout / 1000}s) for AI generation endpoint`,
    );
  }

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(fullUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await response.text();
    let data: unknown;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (error) {
      logger.error('Failed to parse response as JSON', { text });
      data = null;
    }

    // Log the response
    logger.apiResponse(method, fullUrl, response.status, data);

    if (!response.ok) {
      const message =
        (data as any)?.error?.message ||
        (data as any)?.message ||
        `Request failed with status ${response.status}`;

      logger.apiError(method, fullUrl, {
        status: response.status,
        message,
        data,
      });

      // Handle 401 Unauthorized - attempt token refresh and retry
      if (response.status === 401 && !_isRetry && globalRefreshTokenCallback) {
        logger.info('Received 401, attempting token refresh and retry...');

        try {
          const newToken = await globalRefreshTokenCallback();

          if (newToken) {
            logger.info('Token refreshed, retrying original request');
            // Retry the original request with the new token
            return request<T>(path, {
              ...options,
              token: newToken,
              _isRetry: true, // Prevent infinite retry loop
            });
          } else {
            logger.warn('Token refresh returned null, cannot retry');
          }
        } catch (refreshError) {
          logger.error('Token refresh failed during 401 retry', { error: refreshError });
          // Fall through to throw the original 401 error
        }
      }

      throw new Error(message);
    }

    return data as T;
  } catch (error: any) {
    // Enhanced debugging - log the full error object
    logger.error('=== NETWORK REQUEST FAILED ===');
    logger.error(`URL: ${fullUrl}`);
    logger.error(`Method: ${method}`);
    logger.error(`Error Type: ${typeof error}`);
    logger.error(`Error Name: ${error?.name}`);
    logger.error(`Error Message: ${error?.message}`);
    logger.error(`Error Code: ${error?.code}`);
    logger.error(`Error Stack: ${error?.stack}`);
    logger.error('Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    // Handle different types of errors
    let errorMessage = 'An unexpected error occurred';

    if (error.name === 'AbortError') {
      errorMessage = isAIEndpoint
        ? 'AI generation is taking longer than expected. This might be due to high OpenAI API load. Please try again.'
        : 'Request timeout - please check your internet connection';
      logger.error(`Request timeout: ${method} ${fullUrl}`);
    } else if (error.message === 'Network request failed') {
      errorMessage = `Cannot connect to server at ${API_BASE_URL}. Please check:\n1. Backend is running\n2. You're on the same Wi-Fi network\n3. Firewall allows port 3001`;
      logger.error(`Network error: ${method} ${fullUrl}`, {
        baseUrl: API_BASE_URL,
      });
    } else {
      errorMessage = error.message || errorMessage;
      logger.apiError(method, fullUrl, error);
    }

    // Show toast for network errors
    if (error.name === 'AbortError' || error.message === 'Network request failed') {
      Toast.show({
        type: 'error',
        text1: 'Connection Error',
        text2: errorMessage,
        visibilityTime: 5000,
      });
    }

    throw new Error(errorMessage);
  }
}
