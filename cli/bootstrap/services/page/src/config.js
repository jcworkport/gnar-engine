/**
 * Gnar Engine Service Config
 */
export const config = {
    // service name
    serviceName: 'pageService',

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
        type: 'mongodb',

        // MongoDB
        connectionUrl: process.env.PAGE_MONGO_URL,
        connectionArgs: {},
    },

    // message broker
    message: {
        url: process.env.RABBITMQ_URL,
        queueName: 'pageServiceQueue',
        prefetch: 20
    },

    webSockets: {
        reconnectInterval: 5000,
        maxInitialConnectionAttempts: 5
    },

    hashNameSpace: '',
}
