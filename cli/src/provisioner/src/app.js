import { mysqlService } from './services/mysql.js';
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

    // collate mysql databases from secrets
    const mysqlDatabases = secrets.collateMysqlDatabases(provisionerSecrets);

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

}

initService();
