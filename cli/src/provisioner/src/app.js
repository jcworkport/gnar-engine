import { mysqlService } from './services/mysql.js';
import { mongoService } from './services/mongodb.js';
import { secrets } from './services/secrets.js';

/**
 * Initialise service
 */
export const initService = async () => {

	console.log('G n a r  E n g i n e | Provisioner provisioning databases...');

    let provisionerSecrets;

    // get all secrets
    try {
        provisionerSecrets = JSON.parse(process.env.PROVISIONER_SECRETS);
    } catch (error) {
        console.error('Error parsing provisioner secrets', error);
        return;
    }

    // collate databases to provision from secrets
    const mysqlDatabases = secrets.collateMysqlDatabases(provisionerSecrets);
    const mongoDatabases = secrets.collateMongoDatabases(provisionerSecrets);

    // provision mysql databases
    if (mysqlDatabases) {
        for (const [key, value] of Object.entries(mysqlDatabases)) {
            mysqlService.provisionDatabase({
                host: value.host,
                database: value.database,
                user: value.user,
                password: value.password,
                rootPassword: provisionerSecrets.provision.MYSQL_ROOT_PASSWORD
            });
        }
    } else {
        console.log('No MySQL databases to provision.');
    }

    if (mongoDatabases) {
        for (const [key, value] of Object.entries(mongoDatabases)) {
            mongoService.provisionDatabase({
                host: value.host,
                database: value.database,
                user: value.user,
                password: value.password,
                rootPassword: provisionerSecrets.provision.MONGO_ROOT_PASSWORD
            })
        }
    } else {
        console.log('No MongoDB databases to provision.');
    }
}

initService();
