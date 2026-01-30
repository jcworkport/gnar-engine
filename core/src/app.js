import { httpController } from './controllers/http.controller.js';
import { messageController } from './controllers/message.controller.js';
import { commandBus } from './commands/command-bus.js';
import { runSeeders, internalHealthCheck } from './commands/handlers/control.handler.js';
import { BadRequestError, initErrorResponses, NotFoundError, UnauthorisedError, FailedHealthCheckError } from './errors/errors.js';
import { initDbConnection, checkConnection, dropDatabaseData } from './db/db.js';
import { sqlHelpers } from './db/helpers.js';
import { migrations } from './services/migration.service.js';
import { seeders } from './services/seeder.service.js';
import { loggerService } from './services/logger.service.js';
import { setRabbitConnectionUrl } from './services/rabbit.js';
import { messageAwaitResponse, messageAndForget } from './services/message.service.js';
import { wsManager } from './services/websocket.service.js';
import schemaService from './services/schema.service.js';
import { testService } from './services/test.service.js';
import { storageService } from './services/storage.service.js';
import { manifest } from './commands/command-manifest.js';
import { v4 as uuidv4 } from 'uuid';
import { v5 as uuidv5 } from 'uuid';

const configModule = await import(process.env.GLOBAL_SERVICE_BASE_DIR + 'config.js');
export const config = configModule.config;

/**
 * Gnar Engine
 * 
 * @module GnarEngine
 * @description Gnar Engine service core for building microservices and modular monoliths.
 * It provides a set of utilities and services to help developers create scalable and maintainable applications.
 */
const GnarEngine = {

	/**
	 * Initialise
	 */
	init: async (config) => {

        // Set config
        GnarEngine.config = config;

		// Initialise http server
		GnarEngine.http = httpController;
        if (config.http) {
            await GnarEngine.http.init(config.http);
        }

		// Initialise command bus
		GnarEngine.commands = commandBus;
        GnarEngine.commands.init(config);

		// Connect to database
		try { 
			GnarEngine.db = await initDbConnection(config.db);
		} catch (err) {
			loggerService.error('Error connecting to database: ' + err);
			process.exit(1);
		}

		// Db utilities
		GnarEngine.db.checkConnection = checkConnection;
		GnarEngine.db.migrations = migrations;
		GnarEngine.db.seeders = seeders;

        sqlHelpers.init(GnarEngine.db);
        GnarEngine.db.sql = {};
        GnarEngine.db.sql.helpers = sqlHelpers;

		// On ready
		GnarEngine.http.addHook('onReady', async () => {
			// Internal health check
			setInterval(() => {
				commandBus.execute('internalHealthCheck', {});
			}, 60000);
		});

		// Initialise errors
		initErrorResponses(GnarEngine.http);

		// Initialise message client
        setRabbitConnectionUrl(config.message?.url || '');
		GnarEngine.message = messageController;
		GnarEngine.message.sendAwaitResponse = messageAwaitResponse;
		GnarEngine.message.sendAndForget = messageAndForget;

        // Initialise websocket server
        GnarEngine.webSockets = wsManager;

		// Register core handlers
        GnarEngine.commands.register(`${config.serviceName}.runMigrations`, () => migrations.runMigrations({config}));
		GnarEngine.commands.register(`${config.serviceName}.runSeeders`, seeders.runSeeders);
		GnarEngine.commands.register(`${config.serviceName}.internalHealthCheck`, internalHealthCheck);
        GnarEngine.commands.register(`${config.serviceName}.dropDatabaseData`, dropDatabaseData);

		// Schema
		GnarEngine.schema = schemaService;

		// Logger
		GnarEngine.logger = loggerService;

		// Errors
		GnarEngine.error = {
			notFound: NotFoundError,
			badRequest: BadRequestError,
			unauthorised: UnauthorisedError,
			failedHealthCheck: FailedHealthCheckError
		}

		// Utils
		GnarEngine.utils = {
			uuid: () => uuidv4(),
			hash: (term, hashNameSpace) => uuidv5(term, hashNameSpace)
		}

		// Global pre-handlers
		GnarEngine.http.addHook('onRequest', async (request, reply) => {
		    const { url, method } = request;

			// Append trailing slash internally (no redirect)
			if (!url.endsWith('/') && !url.includes('.') && url !== '/') {
				const parsedUrl = new URL(request.raw.url, `http://${request.headers.host}`);
				parsedUrl.pathname += '/';
				request.raw.url = parsedUrl.pathname + (parsedUrl.search || '');
			}

            // set authenticated user
			const authHeader = request.raw.headers.authorization || '';
			const token = authHeader ? authHeader.split(' ')[1] : '';
		
			if (token) {
				// get authenticated user from authentication service
				const userResult = await GnarEngine.commands.execute('userService.getAuthenticatedUser', {
					token: token
				})

                if (userResult) {
				    request.user = userResult;
                }
			}
		});

		GnarEngine.registerService = async () => {
			if (config.serviceName !== 'controlService') {
				try {
					await GnarEngine.commands.execute('controlService.registerService', {
						service: {
							name: config.serviceName,
							manifest: manifest.manifest
						}
					});
					GnarEngine.logger.info(`Service ${config.serviceName} registered with control service.`);
				} catch (error) {
					GnarEngine.logger.error(`Failed to register service ${config.serviceName} with control service: ${error.message}`);
				}
			}
		}

        // Tests
        GnarEngine.test = testService;

        // Storage
        if (config.storage && config.storage.driver) {
            storageService.init(config.storage);
            GnarEngine.storage = storageService;
        } else {
            const storageError = () => {
                throw new Error('Storage service not configured - please configure storage in config.js')
            }
            GnarEngine.storage = {
                upload: storageError,
                download: storageError,
                getUrl: storageError
            }
        }
	}
}

await GnarEngine.init(config);

export default GnarEngine;
export const { commands, http, message, db, schema, logger, error, utils, registerService, webSockets, test, storage } = GnarEngine;
