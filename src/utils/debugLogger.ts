/**
 * Debug Logger Utility
 * Provides structured logging for debugging and development
 */

export type LogLevel = 'startup' | 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

class DebugLogger {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  private log(level: LogLevel, module: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
    };

    this.logs.push(entry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with emoji
    const emoji = {
      startup: '🚀',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🐛',
    };

    const prefix = `${emoji[level]} [${module}]`;

    if (data) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }

  startup(module: string, message: string, data?: any) {
    this.log('startup', module, message, data);
  }

  info(module: string, message: string, data?: any) {
    this.log('info', module, message, data);
  }

  warn(module: string, message: string, data?: any) {
    this.log('warn', module, message, data);
  }

  error(module: string, message: string, data?: any) {
    this.log('error', module, message, data);
  }

  debug(module: string, message: string, data?: any) {
    this.log('debug', module, message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

// Singleton instance
const logger = new DebugLogger();

// Export convenience functions
export const logStartup = (module: string, message: string, data?: any) =>
  logger.startup(module, message, data);

export const logInfo = (module: string, message: string, data?: any) =>
  logger.info(module, message, data);

export const logWarn = (module: string, message: string, data?: any) =>
  logger.warn(module, message, data);

export const logError = (module: string, message: string, data?: any) =>
  logger.error(module, message, data);

export const logDebug = (module: string, message: string, data?: any) =>
  logger.debug(module, message, data);

export const getLogs = () => logger.getLogs();
export const clearLogs = () => logger.clearLogs();

// Create a logger for a specific module
export const createLogger = (module: string) => ({
  startup: (message: string, data?: any) => logStartup(module, message, data),
  info: (message: string, data?: any) => logInfo(module, message, data),
  warn: (message: string, data?: any) => logWarn(module, message, data),
  error: (message: string, data?: any) => logError(module, message, data),
  debug: (message: string, data?: any) => logDebug(module, message, data),
});

export default logger;
