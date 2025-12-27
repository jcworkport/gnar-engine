import { loggerService } from './logger.service.js';
import { s3StorageDriver } from '../drivers/storage/s3.js';

export const storageService = {

    driverName: '',
    driver: null,

    /**
     * @param {Object} config — Storage configuration
     */
    init: async (config) => {
        try {
            if (!config.driver) {
                loggerService.info('No storage driver specified, skipping storage initialization.');
                return;
            }

            switch (config.driver) {
                case 's3':
                    storageService.driverName = 's3';
                    storageService.driver = s3StorageDriver;
                    break;
                default:
                    throw new Error(`Unsupported storage type: ${config.driver}`);
            }

            await storageService.driver.init(config);
        } catch (error) {
            loggerService.error(`Storage initialization error: ${error.message}`);
            throw error;
        }
    },

    /**
     * @param {Buffer|Stream} file — File data to upload
     * @param {string} key — Destination path/key (e.g., 'uploads/user123/photo.png')
     * @param {string} contentType — MIME type for S3 objects, optional for local
     * @param {Object} metadata — Optional metadata tags (S3: object metadata, Local: sidecar JSON if implemented)
     * @return {Promise<string>} - Returns the file URL or key upon successful upload
     */
    upload: async ({file, key, contentType, metadata}) => {
        try {
            return await storageService.driver.upload({file, key, contentType, metadata});
        } catch (error) {
            loggerService.error(`Storage upload error: ${error.message}`);
            throw error;
        }
    },

    /**
     * @param {string} key — File path/key to retrieve
     * @param {boolean} [stream] — If true, return a readable Stream instead of Buffer
     */
    download: async ({key, stream}) => {
        try {
            return await storageService.driver.download({key, stream});
        } catch (error) {
            loggerService.error(`Storage download error: ${error.message}`);
            throw error;
        }
    },

    /**
     * @param {string} key — Path/key of the file to delete
     */
    delete: async ({key}) => {
        try {
            return await storageService.driver.delete({key});
        } catch (error) {
            loggerService.error(`Storage delete error: ${error.message}`);
            throw error;
        }
    },

    /**
     * @param {string} key — Path/key of the file
     * @param {number} [expiresIn] — Seconds until expiry (S3 signed URLs), ignored by local unless you implement your own
     */
    getUrl: async ({key, expiresIn}) => {
        try {
            return await storageService.driver.getUrl({key, expiresIn});
        } catch (error) {
            loggerService.error(`Storage getUrl error: ${error.message}`);
            throw error;
        }
    }
}
