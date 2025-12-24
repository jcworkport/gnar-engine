import { commands, logger, error } from '@gnar-engine/core';
import { page } from '../services/page.service.js';
import { config } from '../config.js';
import { validatePage } from '../schema/page.schema.js';


/**
 * Get single page
 */
commands.register('pageService.getSinglePage', async ({id}) => {
    if (id) {
        return await page.getById({id: id});
    } else {
        throw new error.badRequest('Page email or id required');
    }
});

/**
 * Get many pages
 */
commands.register('pageService.getManyPages', async ({}) => {
    return await page.getAll();
});

/**
 * Create pages
 */
commands.register('pageService.createPages', async ({ pages }) => {
    const validationErrors = [];
    let createdNewPages = [];

    for (const newData of pages) {
        const { errors } = validatePage(newData);
        if (errors?.length) {
            validationErrors.push(errors);
            continue;
        }

        const created = await page.create(newData);
        createdNewPages.push(created);
    }

    if (validationErrors.length) {
        throw new error.badRequest(`Invalid page data: ${validationErrors}`);
    }

    return createdNewPages;
});

/**
 * Update page
 */
commands.register('pageService.updatePage', async ({id, newPageData}) => {
    
    const validationErrors = [];
    
    if (!id) {
        throw new error.badRequest('Page ID required');
    
    }
    
    const obj = await page.getById({id: id});
    
    if (!obj) {
        throw new error.notFound('Page not found');
    
    }
    
    delete newPageData.id;
    
    const { errors } = validatePageUpdate(newPageData);
    
    if (errors?.length) {
        validationErrors.push(errors);
    }
    
    if (validationErrors.length) {
        throw new error.badRequest(`Invalid page data: ${validationErrors}`);
    }
    
    return await page.update({
        id: id,
        ...newPageData
    });
});

/**
 * Delete page
 */
commands.register('pageService.deletePage', async ({id}) => {
    const obj = await page.getById({id: id});
    if (!obj) {
        throw new error.notFound('Page not found');
    }
    return await page.delete({id: id});
});
