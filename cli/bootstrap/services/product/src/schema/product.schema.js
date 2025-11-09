import { schema } from '@gnar-engine/core';
import { config } from '../config.js';

export const productSchema = {
    schemaName: 'productService.productSchema',
    schema: {
        type: 'object',
        properties: {
            // Add your properties here
            
        },
        required: [],
        additionalProperties: false
    }
};

export const validateProduct = schema.compile(productSchema);
