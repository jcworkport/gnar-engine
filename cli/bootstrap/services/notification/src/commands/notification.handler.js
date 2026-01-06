import { commands, logger, error } from '@gnar-engine/core';
import { notification } from '../services/notification.service.js';
import { config } from '../config.js';
import { validateNotification } from '../schema/notification.schema.js';


/**
 * Get single notification
 */
commands.register('notificationService.getSingleNotification', async ({id}) => {
    if (id) {
        return await notification.getById({id: id});
    } else {
        throw new error.badRequest('Notification email or id required');
    }
});

/**
 * Get many notifications
 */
commands.register('notificationService.getManyNotifications', async ({}) => {
    return await notification.getAll();
});

/**
 * Create notifications
 */
commands.register('notificationService.createNotifications', async ({ notifications }) => {
    const validationErrors = [];
    let createdNewNotifications = [];

    for (const newData of notifications) {
        const { errors } = validateNotification(newData);
        if (errors?.length) {
            validationErrors.push(errors);
            continue;
        }

        const created = await notification.create(newData);
        createdNewNotifications.push(created);
    }

    if (validationErrors.length) {
        throw new error.badRequest(`Invalid notification data: ${validationErrors}`);
    }

    return createdNewNotifications;
});

/**
 * Update notification
 */
commands.register('notificationService.updateNotification', async ({id, newNotificationData}) => {
    
    const validationErrors = [];
    
    if (!id) {
        throw new error.badRequest('Notification ID required');
    
    }
    
    const obj = await notification.getById({id: id});
    
    if (!obj) {
        throw new error.notFound('Notification not found');
    
    }
    
    delete newNotificationData.id;
    
    const { errors } = validateNotificationUpdate(newNotificationData);
    
    if (errors?.length) {
        validationErrors.push(errors);
    }
    
    if (validationErrors.length) {
        throw new error.badRequest(`Invalid notification data: ${validationErrors}`);
    }
    
    return await notification.update({
        id: id,
        updatedData: newNotificationData
    });
});

/**
 * Delete notification
 */
commands.register('notificationService.deleteNotification', async ({id}) => {
    const obj = await notification.getById({id: id});
    if (!obj) {
        throw new error.notFound('Notification not found');
    }
    return await notification.delete({id: id});
});
