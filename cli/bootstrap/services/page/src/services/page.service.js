import { db, logger } from '@gnar-engine/core';
import { ObjectId } from 'mongodb';

export const page = {

    // Get all pages
    getAll: async () => {
        try {
            const items = await db.collection('pages').find().toArray();
            return items.map(mappings);
        } catch (error) {
            logger.error("Error fetching pages:", error);
            throw error;
        }
    },

    // Create a page
    create: async (data) => {
        try {
            const collection = db.collection('pages');
            const result = await collection.insertOne(data);
            const insterted = await collection.findOne({ _id: result.insertedId });
            return mappings(insterted);
        } catch (error) {
            logger.error("Error creating page:", error);
            throw error;
        }
    },

    // Get a page by ID
    getById: async ({ id }) => {
        try {
            const collection = db.collection('pages');
            const objectId = new ObjectId(id);
            const item = await collection.findOne({ _id: objectId });
            return mappings(item);
        } catch (error) {
            logger.error("Error fetching page:", error);
            throw error;
        }
    },

    // Update a page
    update: async ({ id, updatedData }) => {
        try {
            const collection = db.collection('pages');
            const objectId = new ObjectId(id);
            const result = await collection.updateOne(
                { _id: objectId },
                { $set: updatedData }
            );
            return result.modifiedCount > 0;
        } catch (error) {
            logger.error("Error updating page:", error);
            throw error;
        }
    },

    // Delete a page
    delete: async ({ id }) => {
        try {
            const collection = db.collection('pages');
            const objectId = new ObjectId(id);
            const result = await collection.deleteOne({ _id: objectId });
            return result.deletedCount > 0;
        } catch (error) {
            logger.error("Error deleting page:", error);
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
