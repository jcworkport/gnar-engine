import { commands, logger, error, storage } from '@gnar-engine/core';
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
commands.register('pageService.createPages', async ({ pages, requestUser }) => {
    const validationErrors = [];
    let createdNewPages = [];

    for (const newData of pages) {
        const { errors } = validatePage(newData);
        if (errors?.length) {
            validationErrors.push(errors);
            continue;
        }

        newData = await commands.execute('processUploadsInData', { data: newData, requestUser });

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
commands.register('pageService.updatePage', async ({id, newPageData, requestUser}) => {

    const validationErrors = [];

    if (!id) {
        throw new error.badRequest('Page ID required');

    }

    const obj = await page.getById({id: id});

    if (!obj) {
        throw new error.notFound('Page not found');

    }

    delete newPageData.id;

    const { errors } = validatePage(newPageData);

    if (errors?.length) {
        validationErrors.push(errors);
    }

    if (validationErrors.length) {
        throw new error.badRequest(`Invalid page data: ${validationErrors}`);
    }

    newPageData = await commands.execute('processUploadsInData', { data: newPageData, requestUser });

    return await page.update({
        id: id,
        updatedData: newPageData
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


/**
 * Find file and image uploads and store them
 *
 * @param {Object} data - The data object to search for files/images
 * @param {Function} uploadFn - Function to handle the actual upload process
 * @returns {Object} - The updated data object with stored file/image references
 */
commands.register('pageService.processUploadsInData', async ({ data, requestUser }) => {

    const uploadFilesRecursive = async (data) => {
        if (Array.isArray(data)) {
            return Promise.all(data.map(item => uploadFilesRecursive(item)));
        } else if (data && typeof data === 'object') {
            const result = { ...data };

            for (const [key, value] of Object.entries(data)) {
                if (key === 'file' && typeof value === 'string') {

                    logger.info('Processing file upload in page data');

                    // Filename
                    const fileName = result.fileName || `upload_${Date.now()}`;

                    // Mime type 
                    let mimeType = result.mimeType;
                    let base64Data = value;

                    const matches = value.match(/^data:(.+);base64,(.+)$/);
                    if (matches) {
                        mimeType = mimeType || matches[1];
                        base64Data = matches[2];
                    }

                    if (!mimeType) mimeType = 'application/octet-stream';

                    // Upload
                    const url = await storage.upload({
                        file: Buffer.from(base64Data, 'base64'),
                        key: 'public/page-content/' + fileName,
                        contentType: mimeType,
                        metadata: {
                            uploadedAt: new Date().toISOString(),
                            uploadedBy: requestUser ? requestUser.id : 'unknown'
                        }
                    });

                    // Add url and remove upload keys
                    result.url = url;
                    delete result.file;
                    if (result.fileName) delete result.fileName;
                    if (result.mimeType) delete result.mimeType;

                } else {
                    result[key] = await uploadFilesRecursive(value);
                }
            }

            return result;
        }

        return data;
    };

    return await uploadFilesRecursive(data);
});
