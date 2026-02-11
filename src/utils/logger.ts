/**
 * Logger Utility
 * 统一日志管理
 */

import winston from 'winston';

/**
 * 日志级别定义
 */
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  VERBOSE: 'silly'
};

/**
 * 日志格式
 */
const LOG_FORMAT = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * 控制台传输格式
 */
const CONSOLE_FORMAT = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(
    '[%s] [%s]: %s',
    winston.format.colorize().level(null, 'level'),
    winston.format.timestamp(),
    winston.format.splat()
  )
);

/**
 * 创建Logger实例
 */
function createLogger(label: string) {
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || LOG_LEVELS.INFO,
    format: LOG_FORMAT,
    transports: [
      // 控制台输出
      new winston.transports.Console({
        format: CONSOLE_FORMAT,
        handleExceptions: true,
        handleRejections: true
      })
    ]
  });

  return logger;
}

/**
 * 主Logger实例
 */
export const logger = createLogger('openclaw-mcp-bridge');

/**
 * 子Logger实例
 */
export const mcpClientLogger = createLogger('mcp-client');
export const mcpServerLogger = createLogger('mcp-server');
export const bridgeLogger = createLogger('bridge');

/**
 * 便捷方法
 */
export const logError = (message: string, meta?: any) => {
  logger.error(message, meta);
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

/**
 * 工具调用日志
 */
export const logToolCall = (
  serverId: string,
  toolName: string,
  args: any,
  result?: any,
  error?: any,
  duration?: number
) => {
  bridgeLogger.info('MCP Tool Call', {
    server: serverId,
    tool: toolName,
    args: typeof args === 'object' ? JSON.stringify(args).substring(0, 200) : args,
    success: !error,
    duration: duration || 0,
    result: result ? JSON.stringify(result).substring(0, 200) : undefined,
    error: error ? error.message : undefined
  });
};

/**
 * MCP服务器连接日志
 */
export const logMCPConnection = (
  action: 'connect' | 'disconnect' | 'reconnect',
  serverId: string,
  details?: any
) => {
  mcpClientLogger.info(`MCP Server ${action}`, {
    server: serverId,
    ...details
  });
};

/**
 * 性能日志
 */
export const logPerformance = (
  operation: string,
  duration: number,
  threshold: number = 1000
) => {
  if (duration > threshold) {
    logWarn('Slow operation detected', {
      operation,
      duration: `${duration}ms`,
      threshold: `${threshold}ms`
    });
  }
};

/**
 * 错误日志
 */
export const logErrorWithStack = (
  message: string,
  error: Error,
  context?: any
) => {
  logger.error(message, {
    message,
    error: error.message,
    stack: error.stack,
    context
  });
};

export default logger;
