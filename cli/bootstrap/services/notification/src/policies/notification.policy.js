import { config } from '../config.js';

export const authorise = {

    /**
     * Authorise get single notification
     */
    getSingle: async (request, reply) => {
        if (!request.user || request.user.role !== 'service_admin') {
            reply.code(403).send({error: 'not authorised'});
        }
    },

    /**
     * Authorise get many notifications
     */
    getMany: async (request, reply) => {
        if (!request.user || request.user.role !== 'service_admin') {
            reply.code(403).send({error: 'not authorised'});
        }
    },

    /**
     * Authorise create notifications
     */
    create: async (request, reply) => {
        if (!request.user || request.user.role !== 'service_admin') {
            reply.code(403).send({error: 'not authorised'});
        }
    },

    /**
     * Authorise update notification
     */
    update: async (request, reply) => {
        if (!request.user || request.user.role !== 'service_admin') {
            reply.code(403).send({error: 'not authorised'});
        }
    },

    /**
     * Authorise delete notification
     */
    delete: async (request, reply) => {
        if (!request.user || request.user.role !== 'service_admin') {
            reply.code(403).send({error: 'not authorised'});
        }
    }
}
