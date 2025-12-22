import pino from 'pino';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Pino logger
export const loggerService = pino({
    level: process.env.LOG_MODE || 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
        }
    }
});

// Table method 
loggerService.table = (data, columns) => {
    if (Array.isArray(data) && data.length > 0) {
        if (columns) {
            console.table(data, columns);
        } else {
            console.table(data);
        }
    } else if (typeof data === 'object') {
        console.table([data]);
    } else {
        loggerService.info(data);
    }
};
