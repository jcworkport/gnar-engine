import { commands } from '@gnar-engine/core';
import { authorise } from '../policies/block.policy.js';

/**
 * HTTP controller
 */
export const httpController = {

	/**
	 * Get single block
	 */
	getSingle: {
		method: 'GET',
		url: '/blocks/:id',
		preHandler: async (request, reply) => authorise.getSingle(request, reply),
		handler: async (request, reply) => {
			const params = {
				id: request.params.id
			};
			const result = await commands.execute('getSingleBlock', params);
			reply.code(200).send({ block: result });
		}
	},

	/**
	 * Get multiple blocks
	 */
	getMany: {
		method: 'GET',
		url: '/blocks/',
		preHandler: async (request, reply) => authorise.getMany(request, reply),
		handler: async (request, reply) => {
			const params = {};
			const results = await commands.execute('getManyBlocks', params);
			reply.code(200).send({ blocks: results });
		}
	},

	/**
	 * Create new block
	 */
	create: {
		method: 'POST',
		url: '/blocks/',
		preHandler: async (request, reply) => authorise.create(request, reply),
		handler: async (request, reply) => {
			const params = {
				blocks: [request.body.block]
			};
			const results = await commands.execute('createBlock', params);
			reply.code(200).send({ blocks: results });
		},
	},

	/**
	 * Update block
	 */
	update: {
		method: 'POST',
		url: '/blocks/:id',
		preHandler: async (request, reply) => authorise.update(request, reply),
		handler: async (request, reply) => {
			const params = {
				id: request.params.id,
				newBlockData: request.body
			};
			const result = await commands.execute('updateBlock', params);
			reply.code(200).send({ page: result });
		},
	},

	/**
	 * Delete block
	 */
	delete: {
		method: 'DELETE',
		url: '/blocks/:id',
		preHandler: async (request, reply) => authorise.delete(request, reply),
		handler: async (request, reply) => {
			const params = {
				id: request.params.id
			};
			await commands.execute('deleteBlock', params);
			reply.code(200).send({ message: 'Block deleted' });
		},
	},
}
