import { loggerService } from '../services/logger.service.js';

// SQL database helpers
export const sqlHelpers = {

    db: {},

    init(db) {
        sqlHelpers.db = db;
    },

    /**
     * Sync many-to-many relationship links in a join table
     *
     * @param {string} table - The join table name
     * @param {string} parentId - The ID of the parent entity
     * @param {Array<string>} childIds - The array of child entity IDs to link
     * @param {string} parentColumn - The column name for the parent entity ID
     * @param {string} childColumn - The column name for the child entity ID
     * @returns {Promise<{added: Array, removed: Array}>} - The added and removed IDs
     */
    async syncManyToMany({ table, parentId, childIds, parentColumn, childColumn }) {
        try {
            if (!childIds || !childIds.length) childIds = [];

            // Read current links from DB
            const currentRows = await sqlHelpers.db.query(
                `SELECT ${childColumn} FROM ${table} WHERE ${parentColumn} = ?`,
                [parentId]
            );
            const currentIds = currentRows.map(row => row[childColumn]);

            // Compute diff
            const toAdd = childIds.filter(id => !currentIds.includes(id));
            const toRemove = currentIds.filter(id => !childIds.includes(id));

            // Remove old links
            if (toRemove.length) {
                await sqlHelpers.db.query(
                    `DELETE FROM ${table} WHERE ${parentColumn} = ? AND ${childColumn} IN (?)`,
                    [parentId, toRemove]
                );
            }

            // Add new links
            if (toAdd.length) {
                const values = toAdd.map(id => [parentId, id]);
                await sqlHelpers.db.query(
                    `INSERT INTO ${table} (${parentColumn}, ${childColumn}) VALUES ?`,
                    [values]
                );
            }

            return { added: toAdd, removed: toRemove };
        } catch (error) {
            loggerService.error('Error syncing many-to-many relationship: ' + error.message);
            throw error;
        }
    },

    /**
     * Sync one-to-many relationship
     *
     * @param {string} table - Child table name (e.g. 'units')
     * @param {string} parentId - Parent entity ID
     * @param {Array<string>} childIds - Child IDs that should belong to the parent
     * @param {string} parentColumn - FK column on child table (e.g. 'property_id')
     * @param {string} childIdColumn - PK column on child table (default: 'id')
     * @returns {Promise<{linked: Array, unlinked: Array}>}
     */
    async syncOneToMany({ table, parentId, childIds, parentColumn, childIdColumn = 'id' }) {
        try {
            if (!Array.isArray(childIds)) childIds = [];

            // Get currently linked children
            const currentRows = await sqlHelpers.db.query(
                `SELECT ${childIdColumn}
                 FROM ${table}
                 WHERE ${parentColumn} = ?`,
                [parentId]
            );

            const currentIds = currentRows.map(row => row[childIdColumn]);

            const toLink = childIds.filter(id => !currentIds.includes(id));
            const toUnlink = currentIds.filter(id => !childIds.includes(id));

            // Unlink removed children
            if (toUnlink.length) {
                await sqlHelpers.db.query(
                    `UPDATE ${table}
                     SET ${parentColumn} = NULL
                     WHERE ${childIdColumn} IN (?)`,
                    [toUnlink]
                );
            }

            // Link new children
            if (toLink.length) {
                await sqlHelpers.db.query(
                    `UPDATE ${table}
                     SET ${parentColumn} = ?
                     WHERE ${childIdColumn} IN (?)`,
                    [parentId, toLink]
                );
            }

            return { linked: toLink, unlinked: toUnlink };
        } catch (error) {
            loggerService.error('Error syncing one-to-many relationship: ' + error.message);
            throw error;
        }
    },

    /**
     * To snake case
     *
     * @param {string}
     * @returns {string}
     */
    toSnake(str) {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }
}
