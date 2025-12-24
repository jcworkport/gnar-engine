import { commands } from '@gnar-engine/core';

export const messageHandlers = {

    getPage: async (payload) => {
        let result;
        if (payload.data?.id) {
            result = await commands.execute('getSinglePage', {
                id: payload.data.id
            });
        } else if (payload.data?.email) {
            result = await commands.execute('getSinglePage', {
                email: payload.data.email
            });
        } else {
            throw new Error('No page ID or email provided');
        }
        if (!result) {
            throw new Error('Page not found');
        }
        return { page: result };
    },

    getManyPages: async (payload) => {
        const results = await commands.execute('getManyPages', {});
        return { pages: results };
    },

    createPage: async (payload) => {
        const results = await commands.execute('createPages', {
            pages: [payload.data.page]
        });
        return { pages: results };
    },

    updatePage: async (payload) => {
        const result = await commands.execute('updatePage', {
            id: payload.data.id,
            newPageData: payload.data
        });
        return { page: result };
    },

    deletePage: async (payload) => {
        await commands.execute('deletePage', {
            id: payload.data.id
        });
        return { message: 'Page deleted' };
    },

};
