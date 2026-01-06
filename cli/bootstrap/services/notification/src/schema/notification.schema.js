import { schema } from '@gnar-engine/core';
import { config } from '../config.js';

export const notificationSchema = {
    schemaName: 'notificationService.notificationSchema',
    schema: {
        type: 'object',
        properties: {
            // Add your properties here
            
        },
        required: [],
        additionalProperties: false
    }
};

export const validateNotification = schema.compile(notificationSchema);
