import client from './client.js';

export const pages = {
    getMany: async () => {
        const { data } = await client.get('/pages/');
        return data;
    },

    getSingle: async ( id ) => {
        const { data } = await client.get(`/pages/${id}`);
        return data;
    },

    create: async ( page ) => {
        const { data } = await client.post('/pages/', { page });
        return data;
    },

    update: async ( id, page ) => {
        const { data } = await client.post(`/pages/${id}`, { page });
        return data;
    },

    delete: async ( id ) => {
        await client.delete(`/pages/${id}`);
    }
};

