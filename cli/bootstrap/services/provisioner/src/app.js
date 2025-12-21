import { logger } from '@gnar-engine/core';
import { mysql } from 'services/mysql.js';
import { secrets } from 'services/secrets.js';

/**
 * Initialise service
 */
export const initService = async () => {

	logger.info('G n a r  E n g i n e | Provisioner provisioning databases...');

    // get all secrets
    try {
        const provisionerSecrets = JSON.parse(process.env.PROVISIONER_SECRETS);
    } catch (error) {
        logger.error('Error parsing provisioner secrets', error);
        return;
    }

    // collate mysql databases from secrets
    const mysqlDatabases = secrets.collateMysqlDatabases(provisionerSecrets);

    // provision mysql databases
    if (mysqlDatabases) {
        foreach (const [key, value] of Object.entries(mysqlDatabases)) {
            mysql.provisionDatabase(value.database, value.user, value.password);
        }
    } else {
        logger.info('No MySQL databases to provision.');
    }

    await mysql.provisionDatabases();
}

initService();
