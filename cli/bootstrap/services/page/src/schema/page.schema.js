import { schema } from '@gnar-engine/core';
import { config } from '../config.js';

export const pageSchema = {
    schemaName: 'pageService.pageSchema',
    schema: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            slug: { type: 'string' },
            blocks: {
                type: 'array',
                items: { $ref: 'pageService.blockSchema' }
            }
        },
        required: ['name', 'slug'],
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
                        { $ref: 'pageService.wysiwygSchema' },
                        { $ref: 'pageService.imageSchema' }
                    ]
                }
            }
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
            type: { type: 'string', enum: ['textInput'] },
            content: { type: 'string' },
        },
        required: ['key', 'type'],
        additionalProperties: false
    }
}

export const wysiwygSchema = {
    $id: 'pageService.wysiwygSchema',
    schemaName: 'pageService.wysiwygSchema',
    schema: {
        type: 'object',
        properties: {
            key: { type: 'string' },
            type: { type: 'string', enum: ['wysiwyg'] },
            content: { type: 'string' },
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
            type: { type: 'string', enum: ['image'] },
            url: { type: 'string', format: 'uri' },
            altText: { type: 'string' }
        },
        required: ['key', 'type'],
        additionalProperties: false
    }
}


export const validatePage = schema.compile(pageSchema);
