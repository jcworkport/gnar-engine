import { schema } from '@gnar-engine/core';
import { config } from '../config.js';

export const pageSchema = {
    schemaName: 'pageService.pageSchema',
    schema: {
        type: 'object',
        properties: {
            // Add your properties here
            
        },
        required: [],
        additionalProperties: false
    }
};

export const validatePage = schema.compile(pageSchema);
