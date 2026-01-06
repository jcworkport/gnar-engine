import { db } from '@gnar-engine/core';

export const notification = {
    async getById({ id }) {
        const [result] = await db.query('SELECT * FROM notifications WHERE id = ?', [id]);
        return result || null;
    },

    async getByEmail({ email }) {
        // Placeholder: implement if your service uses email
        return null;
    },

    async getAll() {
        return await db.query('SELECT * FROM notifications');
    },

    async create(data) {
        const { insertId } = await db.query('INSERT INTO notifications (created_at, updated_at) VALUES (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)');
        return await this.getById({ id: insertId });
    },

    async update({ id, ...data }) {
        await db.query('UPDATE notifications SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        return await this.getById({ id });
    },

    async delete({ id }) {
        await db.query('DELETE FROM notifications WHERE id = ?', [id]);
        return true;
    },
};
