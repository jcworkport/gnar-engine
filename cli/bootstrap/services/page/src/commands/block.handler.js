import { commands, logger, error } from '@gnar-engine/core';
import { block } from '../services/block.service.js';
import { config } from '../config.js';
import { validateBlock } from '../schema/page.schema.js';


/**
 * Get single block
 */
commands.register('pageService.getSingleBlock', async ({id}) => {
    if (id) {
        return await block.getById({id: id});
    } else {
        throw new error.badRequest('Block id required');
    }
});

/**
 * Get many blocks
 */
commands.register('pageService.getManyBlocks', async ({}) => {
    return await block.getAll();
});

/**
 * Create blocks
 */
commands.register('pageService.createBlocks', async ({ blocks }) => {
    const validationErrors = [];
    let createdNewBlocks = [];

    for (const newData of blocks) {
        const { errors } = validateBlock(newData);
        if (errors?.length) {
            validationErrors.push(errors);
            continue;
        }

        const created = await block.create(newData);
        createdNewBlocks.push(created);
    }

    if (validationErrors.length) {
        throw new error.badRequest(`Invalid block data: ${validationErrors}`);
    }

    return createdNewBlocks;
});

/**
 * Update block
 */
commands.register('pageService.updateBlock', async ({id, newBlockData}) => {

    const validationErrors = [];

    if (!id) {
        throw new error.badRequest('Block ID required');
    }

    const obj = await block.getById({id: id});

    if (!obj) {
        throw new error.notFound('Block not found');
    }

    delete newBlockData.id;

    const { errors } = validateBlock(newBlockData);

    if (errors?.length) {
        validationErrors.push(errors);
    }

    if (validationErrors.length) {
        throw new error.badRequest(`Invalid block data: ${validationErrors}`);
    }

    return await block.update({
        id: id,
        updatedData: newBlockData
    });
});

/**
 * Delete block
 */
commands.register('pageService.deleteBlock', async ({id}) => {
    const obj = await block.getById({id: id});
    if (!obj) {
        throw new error.notFound('Block not found');
    }
    return await block.delete({id: id});
});
