"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.stream = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
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
winston_1.default.addColors(colors);
// Define log format
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json(), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`));
// Define which transports to use
const transports = [
    // Console transport
    new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`)),
    }),
    // File transport for errors
    new winston_1.default.transports.File({
        filename: path_1.default.join('logs', 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
    // File transport for all logs
    new winston_1.default.transports.File({
        filename: path_1.default.join('logs', 'combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
];
// Create the logger
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format,
    transports,
    exitOnError: false,
});
// Create a stream object for morgan
exports.stream = {
    write: (message) => {
        logger.http(message.trim());
    },
};
// Export logger with correlation ID support
class Logger {
    correlationId;
    context;
    constructor(context, correlationId) {
        this.context = context;
        this.correlationId = correlationId;
    }
    formatMessage(message) {
        const parts = [];
        if (this.correlationId) {
            parts.push(`[${this.correlationId}]`);
        }
        if (this.context) {
            parts.push(`[${this.context}]`);
        }
        parts.push(message);
        return parts.join(' ');
    }
    error(message, error) {
        if (error instanceof Error) {
            logger.error(this.formatMessage(message), { error: error.message, stack: error.stack });
        }
        else {
            logger.error(this.formatMessage(message), { error });
        }
    }
    warn(message, meta) {
        logger.warn(this.formatMessage(message), meta);
    }
    info(message, meta) {
        logger.info(this.formatMessage(message), meta);
    }
    http(message, meta) {
        logger.http(this.formatMessage(message), meta);
    }
    debug(message, meta) {
        logger.debug(this.formatMessage(message), meta);
    }
    setCorrelationId(correlationId) {
        this.correlationId = correlationId;
    }
    setContext(context) {
        this.context = context;
    }
}
exports.Logger = Logger;
exports.default = logger;
//# sourceMappingURL=logger.js.map