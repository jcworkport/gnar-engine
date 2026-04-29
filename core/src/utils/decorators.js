export const decorators = {
    /**
     * Uses the command handler to extract specific fields of data for a list of entity ids.
     * @param {Object} param0
     * @param {Object} param0.commandsHandler - The command handler to use for executing the command to get the data
     * @param {String} param0.command - The command to execute to get the data (e.g. 'propertyService.getManyProperties')
     * @param {Array} param0.ids - The ids of the entities to get data for
     * @param {Array} param0.fields - The fields to extract from the data (e.g. ['name', 'address'])
     * @param {String} param0.prefix - The prefix to use for the extracted fields in the result (e.g. 'property' to extract name as propertyName)
     * @param {String} param0.idField - The field to use as the id in the result, if not provided it will use 'id' (e.g. 'propertyId' to use the propertyId field as the id in the result)
     * @returns {Object} An object mapping entity ids to their extracted data (e.g. { 'propertyId1': { name: 'Property 1', address: 'Address 1' }, ... }) 
     */
    async extractEntityData({ commandsHandler, command, ids, fields, prefix, idField }) {
        const entityData = {};

        if (ids.length) {
            const entities = await commandsHandler.execute(command, { [`${prefix ? `${prefix}Ids` : 'ids'}`]: ids });
            entities?.data.forEach(entity => {
                const key = idField ? entity[idField] : entity.id;
                entityData[key] = {};
                fields.forEach(field => {
                    entityData[key][field] = entity[field];
                });
            });
        }

        return entityData;
    },

    /**
     * Decorates the data with additional fields from the decorator data.
     * You will need to asign the result to the data array to update the data with the decorated data.
     * @param {Object} param0
     * @param {Array} param0.data - The data to decorate (e.g. list of journal entries with propertyId)
     * @param {Object} param0.decorateWith - The data to use for decoration (e.g. property data with name and address)
     * @param {Array} param0.includeFields - The fields to decorate onto the data (e.g. ['name', 'address'])
     * @param {String} param0.propertyName - The property name  to use for the decorated fields (e.g. 'property' to decorate name as propertyName)
     * @param {String} param0.lookupKey - The key to use for looking up the decorator data (e.g. 'propertyId' to match journal entries with property data), defaults to `${propertyName}Id` 
     * @returns {void}
     */
    async decorateEntityData({ data, decorateWith, includeFields, propertyName, lookupKey }) {
        return data.map(item => {
            const id = item[lookupKey ?? `${propertyName}Id`];

            const updated = { ...item };

            if (id && decorateWith[id]) {
                // Build nested object
                const nested = {};

                includeFields.forEach(field => {
                    nested[field] = decorateWith[id][field] ?? null;
                });

                // Assign as a single property
                updated[propertyName] = nested;
            } else {
                // Optional: still include empty object for consistency
                updated[propertyName] = null;
            }

            return updated;
        });
    }
}