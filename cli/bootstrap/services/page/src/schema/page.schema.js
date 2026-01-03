import { schema } from '@gnar-engine/core';
import { config } from '../config.js';

export const pageSchema = {
    schemaName: 'pageService.pageSchema',
    schema: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            key: { type: 'string' },
            blocks: {
                type: 'array',
                items: { $ref: 'pageService.blockSchema' }
            }
        },
        required: ['name', 'key'],
        additionalProperties: false
    }
};

export const blockSchema  = {
    $id: 'pageService.blockSchema',
    schemaName: 'pageService.blockSchema',
    schema: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            key: { type: 'string' },
            blocks: {
                type: 'array',
                items: { $ref: 'pageService.blockSchema' }
            },
            fields: {
                type: 'array',
                items: { 
                    oneOf: [
                        { $ref: 'pageService.textInputSchema' },
                        { $ref: 'pageService.richTextSchema' },
                        { $ref: 'pageService.imageSchema' },
                        { $ref: 'pageService.blockSchema' },
                        { $ref: 'pageService.repeaterSchema' }
                    ]
                }
            },
            type: { type: 'string', enum: ['block'] },
            instanceId: { type: 'string' }
        },
        required: ['name', 'key'],
        additionalProperties: false
    }
}

export const textInputSchema = {
    $id: 'pageService.textInputSchema',
    schemaName: 'pageService.textInputSchema',
    schema: {
        type: 'object',
        properties: {
            key: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['text'] },
            value: { type: 'string' }
        },
        required: ['key', 'type'],
        additionalProperties: false
    }
}

export const richTextSchema = {
    $id: 'pageService.richTextSchema',
    schemaName: 'pageService.richTextSchema',
    schema: {
        type: 'object',
        properties: {
            key: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['richtext'] },
            value: { type: 'string' }
        },
        required: ['key', 'type'],
        additionalProperties: false
    }
}

export const imageSchema = {
    $id: 'pageService.imageSchema',
    schemaName: 'pageService.imageSchema',
    schema: {
        type: 'object',
        properties: {
            key: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['image'] },
            value: {
                type: 'object',
                properties: {
                    file: { type: 'string' },
                    mimeType: { type: 'string' },
                    fileName: { type: 'string' },
                    url: { type: 'string' }
                }
            },
            altText: { type: 'string' }
        },
        required: ['key', 'type'],
        additionalProperties: false
    }
}

export const repeaterSchema = {
    $id: 'pageService.repeaterSchema',
    schemaName: 'pageService.repeaterSchema',
    schema: {
        type: 'object',
        properties: {
            key: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['repeater'] },
            repeaterType: { type: 'string' },
            value: { 
                type: 'array',
                items: {
                    $ref: 'pageService.blockSchema'
                },
            }
        },
        required: ['key', 'type', 'repeaterType'],
        additionalProperties: false
    }
}

schema.addSchema(blockSchema);
schema.addSchema(textInputSchema);
schema.addSchema(richTextSchema);
schema.addSchema(imageSchema);
schema.addSchema(repeaterSchema);

export const validatePage = schema.compile(pageSchema);
export const validateBlock = schema.compile(blockSchema);
