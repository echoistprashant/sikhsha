/**
 * Logger utility for consistent logging across the mobile app
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = __DEV__;

class Logger {
    private log(level: LogLevel, message: string, data?: any) {
        if (!isDevelopment && level === 'debug') {
            return; // Skip debug logs in production
        }

        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        if (data !== undefined) {
            console[level === 'debug' ? 'log' : level](`${prefix} ${message}`, data);
        } else {
            console[level === 'debug' ? 'log' : level](`${prefix} ${message}`);
        }
    }

    debug(message: string, data?: any) {
        this.log('debug', message, data);
    }

    info(message: string, data?: any) {
        this.log('info', message, data);
    }

    warn(message: string, data?: any) {
        this.log('warn', message, data);
    }

    error(message: string, data?: any) {
        this.log('error', message, data);
    }

    // Specialized loggers for common scenarios
    apiRequest(method: string, url: string, data?: any) {
        this.info(`API Request: ${method} ${url}`, data);
    }

    apiResponse(method: string, url: string, status: number, data?: any) {
        this.info(`API Response: ${method} ${url} - ${status}`, data);
    }

    apiError(method: string, url: string, error: any) {
        this.error(`API Error: ${method} ${url}`, error);
    }

    auth(message: string, data?: any) {
        this.info(`AUTH: ${message}`, data);
    }

    navigation(message: string, data?: any) {
        this.debug(`NAV: ${message}`, data);
    }
}

export const logger = new Logger();
