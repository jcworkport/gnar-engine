import mysql from 'mysql2/promise';

const retryInterval = 5000;
const maxRetries = 5;

export const mysqlService = {

    /**
 * Provision database and users
     *
     * @param {string} database - The database name
     * @param {string} user - The database user
     * @param {string} password - The database user password
     */
    provisionDatabase: async ({host, database, user, password, rootPassword}) => {
        let retries = 0;

        while (retries < maxRetries) {
            try {
                const conn = await mysql.createConnection({
                    host: host || 'db-mysql',
                    user: 'root',
                    password: rootPassword
                });

                await conn.query(`CREATE DATABASE IF NOT EXISTS ${mysql.escapeId(database)};`);
                await conn.query(`CREATE USER IF NOT EXISTS ${mysql.escape(user)}@'%' IDENTIFIED BY ${mysql.escape(password)};`);
                await conn.query(`GRANT ALL PRIVILEGES ON ${mysql.escapeId(database)}.* TO ${mysql.escape(user)}@'%';`);
                await conn.query(`FLUSH PRIVILEGES;`);

                console.log(`Successfully provisioned MySQL database: ${database} and user: ${user}`);
                await conn.end();

                return;

            } catch (error) {
                console.error(`Failed provisioning MySQL database "${database}" for user "${user}" ": ${error.message}`);
                retries++;

                if (retries >= maxRetries) {
                    console.error(`Max retries reached. Could not provision database "${database}".`);
                    return;
                }

                await new Promise(resolve => setTimeout(resolve, retryInterval));
            }
        }
    }
}
