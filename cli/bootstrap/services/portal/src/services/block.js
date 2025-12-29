import client from './client.js';

export const blocks = {
    getMany: async () => {
        const { data } = await client.get('/blocks/');
        return data;
    },

    getBlock: async ({ id }) => {
        const { data } = await client.get(`/blocks/${id}`);
        return data;
    },

    create: async ({ block }) => {
        const { data } = await client.post('/blocks/', { block });
        return data;
    },

    update: async ({ id, block }) => {
        const { data } = await client.post(`/blocks/${id}`, { block });
        return data;
    },

    delete: async ({ id }) => {
        await client.delete(`/users/${id}`);
    }
};

