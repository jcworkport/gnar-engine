import pino from 'pino';

export const loggerService = {

    cloudProjectId: '',
    serviceName: '',
    logs: [],
    transports: [],
    flushIntervalMs: 5000,
    timer: null,

    init: ({ cloudProjectId, serviceName, transports, flushIntervalMs }) => {
        loggerService.cloudProjectId = cloudProjectId || '';

        if (!serviceName) {
            throw new Error('Service name is required for logger initialization');
        }

        loggerService.serviceName = serviceName;
        loggerService.transports = transports || [];
        loggerService.flushIntervalMs = flushIntervalMs || 5000;

        loggerService.startFlushTimer();
    },

    info: (args1, args2, args3, args4) => {
        loggerService.addLog({ args1, args2, args3, args4, level: 'info' });
    },

    warning: (args1, args2, args3, args4) => {
        loggerService.addLog({ args1, args2, args3, args4, level: 'warning' });
    },

    error: (args1, args2, args3, args4) => {
        loggerService.addLog({ args1, args2, args3, args4, level: 'error' });
    },

    table: (args1, args2, args3, args4) => {
        loggerService.addLog({ args1, args2, args3, args4, level: 'table' });
    },

    testResult: (test, testResult, message) => {
        loggerService.addLog({
            args1: message,
            level: 'test_result',
            testResult,
            test
        });
    },

    addTransport: (transport) => {
        
    },

    addLog: ({ args1, args2, args3, args4, level, testResult, test }) => {
        const args = [args1, args2, args3, args4].filter(arg => arg !== undefined);
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg);
                } catch (e) {
                    return '[Object]';
                }
            } else {
                return String(arg);
            }
        }).join(' ');

        const log = {
            cloudProjectId: loggerService.cloudProjectId || null,
            service: loggerService.serviceName,
            timestamp: Date.now(),
            level: level || 'info',
            message: message,
            testResult: testResult || null,
            test: test || null,
        }

        // std out if no transports are defined
        if (loggerService.transports.length == 0) {

            // tables
            if (log.level === 'table') {
                try {
                    const parsed = JSON.parse(log.message);
                    console.table(parsed);
                } catch {
                    console.log('[table] unable to parse table data:', log.message);
                }

                return;
            }

            // everything else
            else {
                console.log(loggerService.formatForConsole(log));
            }
        }

        // else add to batch
        else {
            loggerService.logs.push(log);
        }
    },

    startFlushTimer() {
        if (loggerService.timer) {
            clearInterval(loggerService.timer);
        }
        loggerService.timer = setInterval(() => loggerService.flush(), loggerService.flushIntervalMs);
    },

    flush: () => {

        loggerService.transports.forEach(transport => {
                
        });
        loggerService.logs = [];
    },

    formatForConsole: (log) => {
        const LEVEL_WIDTH = 12;

        const colors = {
            error: '\x1b[31m',   // red
            warning: '\x1b[33m', // yellow
            reset: '\x1b[0m'
        };

        const time = new Date(log.timestamp).toISOString();
        const levelText = (log.level || 'info').toUpperCase();
        const paddedLevel = levelText.padEnd(LEVEL_WIDTH);

        let line = `${time} ${paddedLevel} — ${log.message}`;

        const color = colors[log.level] || '';
        const reset = color ? colors.reset : '';

        return `${color}${line}${reset}`;
    }
}

