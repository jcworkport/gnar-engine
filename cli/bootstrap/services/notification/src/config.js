/**
 * Gnar Engine Service Config
 */
export const config = {
    // service name
    serviceName: 'notificationService',

    // environment
    environment: process.env.NOTIFICATION_NODE_ENV || 'dev',
    runTests: process.env.NOTIFICATION_RUN_TESTS || false,

    // microservice | modular-monolith
    architecture: process.env.GLOBAL_ARCHITECTURE || 'microservice',

    // web server
    http: {
        allowedOrigins: [],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        rateLimiting: {
			max: 5,
			timeWindow: '1 minute',
		}
    },

    // database
    db: {
        // type: mongodb | mysql
        type: 'mysql',

        // MongoDB
        connectionUrl: process.env.NOTIFICATION_MONGO_URL,
        connectionArgs: {},

        // MySQL
        host: process.env.NOTIFICATION_MYSQL_HOST,
        user: process.env.NOTIFICATION_MYSQL_USER,
        password: process.env.NOTIFICATION_MYSQL_PASSWORD,
        database: process.env.NOTIFICATION_MYSQL_DATABASE,
        connectionLimit: 10,
        queueLimit: 20,
        maxRetries: 5
    },

    // message broker
    message: {
        url: process.env.RABBITMQ_URL,
        queueName: 'notificationServiceQueue',
        prefetch: 20
    },

    webSockets: {
        reconnectInterval: 5000,
        maxInitialConnectionAttempts: 5
    },

    hashNameSpace: '',
}
