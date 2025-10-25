import winston from 'winston';
declare const logger: winston.Logger;
export declare const stream: {
    write: (message: string) => void;
};
export declare class Logger {
    private correlationId?;
    private context?;
    constructor(context?: string, correlationId?: string);
    private formatMessage;
    error(message: string, error?: Error | unknown): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    http(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
    setCorrelationId(correlationId: string): void;
    setContext(context: string): void;
}
export default logger;
//# sourceMappingURL=logger.d.ts.map