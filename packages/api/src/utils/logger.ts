import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Define which transports to use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
      )
    ),
  }),
  // File transport for errors
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  // File transport for all logs
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create a stream object for morgan
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Export logger with correlation ID support
export class Logger {
  private correlationId?: string;
  private context?: string;

  constructor(context?: string, correlationId?: string) {
    this.context = context;
    this.correlationId = correlationId;
  }

  private formatMessage(message: string): string {
    const parts: string[] = [];
    if (this.correlationId) {
      parts.push(`[${this.correlationId}]`);
    }
    if (this.context) {
      parts.push(`[${this.context}]`);
    }
    parts.push(message);
    return parts.join(' ');
  }

  error(message: string, error?: Error | unknown): void {
    if (error instanceof Error) {
      logger.error(this.formatMessage(message), { error: error.message, stack: error.stack });
    } else {
      logger.error(this.formatMessage(message), { error });
    }
  }

  warn(message: string, meta?: any): void {
    logger.warn(this.formatMessage(message), meta);
  }

  info(message: string, meta?: any): void {
    logger.info(this.formatMessage(message), meta);
  }

  http(message: string, meta?: any): void {
    logger.http(this.formatMessage(message), meta);
  }

  debug(message: string, meta?: any): void {
    logger.debug(this.formatMessage(message), meta);
  }

  setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
  }

  setContext(context: string): void {
    this.context = context;
  }
}

export default logger;
