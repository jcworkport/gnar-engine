import { db, logger } from '@gnar-engine/core';
import { ObjectId } from 'mongodb';

export const block = {

    // Get all blocks
    getAll: async () => {
        try {
            const items = await db.collection('blocks').find().toArray();
            return items.map(mappings);
        } catch (error) {
            logger.error("Error fetching blocks:", error);
            throw error;
        }
    },

    // Create a block
    create: async (data) => {
        try {
            const collection = db.collection('blocks');
            const result = await collection.insertOne(data);
            const insterted = await collection.findOne({ _id: result.insertedId });
            return mappings(insterted);
        } catch (error) {
            logger.error("Error creating block:", error);
            throw error;
        }
    },

    // Get a block by ID
    getById: async ({ id }) => {
        try {
            const collection = db.collection('blocks');
            const objectId = new ObjectId(id);
            const item = await collection.findOne({ _id: objectId });
            return mappings(item);
        } catch (error) {
            logger.error("Error fetching block:", error);
            throw error;
        }
    },

    // Update a block
    update: async ({ id, updatedData }) => {
        try {
            const collection = db.collection('blocks');
            const objectId = new ObjectId(id);
            const result = await collection.updateOne(
                { _id: objectId },
                { $set: updatedData }
            );
            return result.modifiedCount > 0;
        } catch (error) {
            logger.error("Error updating block:", error);
            throw error;
        }
    },

    // Delete a block
    delete: async ({ id }) => {
        try {
            const collection = db.collection('blocks');
            const objectId = new ObjectId(id);
            const result = await collection.deleteOne({ _id: objectId });
            return result.deletedCount > 0;
        } catch (error) {
            logger.error("Error deleting block:", error);
            throw error;
        }
    }
};

const mappings = (item) => {
    if (!item) {
        return item;
    }

    // _id -> id
    const { _id, ...rest } = item;
    item = { id: _id.toString(), ...rest };
    
    return item;
}
