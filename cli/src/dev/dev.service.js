import { spawn } from "child_process";
import Docker from "dockerode";
import process from "process";
import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";
import { gnarEngineCliConfig } from "../config.js";

const docker = new Docker();

/**
 * Start the application locally
 * - Creates a dynamic docker-compose file based on deploy.localdev.yml and secrets.localdev.yml
 * - Runs docker-compose up
 *
 * @param {object} options
 * @param {string} options.projectDir - The project directory
 * @param {boolean} [options.build=false] - Whether to re-build images
 * @param {boolean} [options.detached=false] - Whether to run containers in background
 * @param {boolean} [options.coreDev=false] - Whether to run in core development mode (requires access to core source)
 */
export async function up({ projectDir, build = false, detached = false, coreDev = false }) {
    
    // core dev
    if (coreDev) {
        const fileDir = path.dirname(new URL(import.meta.url).pathname);
        projectDir = path.resolve(fileDir, "../../bootstrap/");
    }

    // parse config
    const configPath = path.join(projectDir, "deploy.localdev.yml");
    const secretsPath = path.join(projectDir, "secrets.localdev.yml");

    const parsedConfig = yaml.load(await fs.readFile(configPath, "utf8"));
    const parsedSecrets = yaml.load(await fs.readFile(secretsPath, "utf8"));

    // assert .gnarengine directory in projectDir
    const gnarHiddenDir = path.join(projectDir, ".gnarengine");
    await assertGnarEngineHiddenDir(gnarHiddenDir);

    // create nginx.conf dynamically from configPath
    const nginxConfPath = path.join(gnarHiddenDir, "nginx", "nginx.conf");
    const serviceConfDir = path.join(gnarHiddenDir, "nginx", "service_conf")
    await fs.mkdir(serviceConfDir, { recursive: true });

    const nginxConf = await createDynamicNginxConf({
        config: parsedConfig.config,
        projectDir: projectDir,
        serviceConfDir: serviceConfDir
    });
    await fs.writeFile(nginxConfPath, nginxConf);

    // create docker-compose.yml dynamically from parsed config and secrets
    const dockerComposePath = path.join(gnarHiddenDir, "docker-compose.dev.yml");
    const dockerCompose = await createDynamicDockerCompose({
        config: parsedConfig.config,
        secrets: parsedSecrets,
        gnarHiddenDir: gnarHiddenDir,
        projectDir: projectDir,
        coreDev: coreDev
    });
    await fs.writeFile(dockerComposePath, yaml.dump(dockerCompose));

    // up docker-compose
    const args = ["-f", dockerComposePath, "up"];

    if (build) {
        args.push("--build");
    }

    if (detached) {
        args.push("-d");
    }

    const processRef = spawn(
        "docker-compose",
        args,
        {
            cwd: projectDir,
            stdio: "inherit",
            shell: "/bin/sh"
        }
    );

    // handle exit
    const exitCode = await new Promise((resolve) => {
        processRef.on("close", resolve);
    });

    if (exitCode !== 0) {
        throw new Error(`docker-compose up exited with code ${exitCode}`);
    }
}

/**
 * Down the containers
 *
 * @param {object} options
 * @param {string} options.projectDir - The project directory
 * @param {boolean} [options.allContainers=false] - Stop all running containers (not just Gnar Engine ones)
 */
export async function down({ projectDir, allContainers = false }) {
    // list all containers
    const containers = await docker.listContainers();

    // filter containers by image name
    if (!allContainers) {
        const containers = containers.filter(c => c.Image.includes("ge-dev"));
    }

    if (containers.length === 0) {
        console.log("No running containers found.");
        return;
    }

    console.log('Stopping containers...');
    containers.forEach(c => {
        console.log(` - ${c.Names[0]} (${c.Id})`);
    });

    // stop each container
    await Promise.all(
        containers.map(c => {
            const container = docker.getContainer(c.Id);
            return container.stop().catch(err => {
                console.error(`Failed to stop ${c.Names[0]}: ${err.message}`);
            });
        })
    );
}

/**
 * Create dynamic nginx.conf file for running application locally
 * 
 * @param {object} config
 * @param {string} serviceConfDir
 * @param {string} projectDir
 */
export async function createDynamicNginxConf({ config, serviceConfDir, projectDir }) {
    // Start with the static parts of nginx.conf
    let nginxConf = `
        events { worker_connections 1024; }

        http {
            server {
                listen 80;
                server_name ${config.namespace};
                include /etc/nginx/service_conf/*.conf;

    `;

    // Loop over each service
    for (const service of config.services || []) {
        // Check if override is present and add conf to service_conf dir
        const serviceDir = path.join(projectDir, 'services', service.name);

        if (await fs.stat(serviceDir).then(() => true).catch(() => false)) {
            const overridePath = path.join(serviceDir, 'nginx.conf');
            if (await fs.stat(overridePath).then(() => true).catch(() => false)) {
                const overrideConf = await fs.readFile(overridePath, 'utf8');

                // write to service_conf directory
                const serviceConfPath = path.join(serviceConfDir, `${service.name}.conf`);
                await fs.writeFile(serviceConfPath, overrideConf);

                continue;
            }
        }

        // Otherwise create generic conf block
        const serviceName = service.name;
        const paths = service.listener_rules?.paths || [];
        const containerPort = service.ports && service.ports.length > 0 ? service.ports[0].split(':')[1] : '3000';

        for (const p of paths) {
            // normalize path without trailing slash
            const cleanPath = p.replace(/\/+$/, '');

            // build location block
            nginxConf += `
                # ${serviceName} service
                location ${cleanPath} {
                    rewrite ^${cleanPath}$ ${cleanPath}/ break;
                    proxy_pass http://${serviceName}-service:${containerPort}${cleanPath};
                }
            `;
        }
    }

    // Close server and http blocks
    nginxConf += `
            }
        }
    `;

    return nginxConf;
}

/**
 * Create dynamic docker compose file for running application locally
 * 
 * @param {object} config
 * @param {object} secrets
 * @param {string} gnarHiddenDir
 * @param {string} projectDir
 * @param {boolean} coreDev - Whether to volume mount the core source code
 */
async function createDynamicDockerCompose({ config, secrets, gnarHiddenDir, projectDir, coreDev = false }) {
    let mysqlPortsCounter = 3306;
    let mongoPortsCounter = 27017;
    const services = {};

    // provision the provisioner service
    services['provisioner'] = {
        container_name: `ge-${config.environment}-${config.namespace}-provisioner`,
        image: `ge-${config.environment}-${config.namespace}-provisioner`,
        build: {
            context: projectDir,
            dockerfile: `./services/${svc.name}/Dockerfile`
        },
        environment: {
            PROVISIONER_SECRETS: JSON.stringify(secrets)
        },
        restart: 'no'
    }

    // nginx
    services['nginx'] = {
        image: 'nginx:latest',
        container_name: `ge-${config.environment}-${config.namespace}-nginx`,
        ports: [
            "80:80",
            "443:443"
        ],
        volumes: [
            `${gnarHiddenDir}/nginx/nginx.conf:/etc/nginx/nginx.conf`,
            `${gnarHiddenDir}/nginx/service_conf:/etc/nginx/service_conf`
        ],
        restart: 'always'
    }

    // rabbit
    services['rabbitmq'] = {
        image: 'rabbitmq:management',
        container_name: `ge-${config.environment}-${config.namespace}-rabbitmq`,
        ports: [
            "5672:5672",
            "15672:15672"
        ],
        environment: {
            RABBITMQ_DEFAULT_USER: secrets.global.RABBITMQ_USER || '',
            RABBITMQ_DEFAULT_PASS: secrets.global.RABBITMQ_PASS || ''
        },
        restart: 'always'
    }

    // services
    for (const svc of config.services) {

        // env variables
        const serviceEnvVars = secrets.services?.[svc.name] || {};
        const localisedServiceEnvVars = {};
        
        for (const [key, value] of Object.entries(serviceEnvVars)) {
            localisedServiceEnvVars[svc.name.toUpperCase() + '_' + key] = value;
        }

        const env = {
            ...(secrets.global || {}),
            ...(localisedServiceEnvVars || {})
        };

        // service block
        services[`${svc.name}-service`] = {
            container_name: `ge-${config.environment}-${config.namespace}-${svc.name}`,
            image: `ge-${config.environment}-${config.namespace}-${svc.name}`,
            build: {
                context: projectDir,
                dockerfile: `./services/${svc.name}/Dockerfile`
            },
            command: svc.command || [],
            environment: env,
            ports: svc.ports || [],
            depends_on: svc.depends_on || [],
            volumes: [
                `${projectDir}/services/${svc.name}/src:/usr/gnar_engine/app/src`
            ],
            restart: 'always'
        };

        // add the core source code mount if in coreDev mode
        if (coreDev) {
            services[`${svc.name}-service`].volumes.push(`../../../core/:${gnarEngineCliConfig.corePath}`);
        }

        console.table(serviceEnvVars);

        // add a mysql instance if required
        if (
            serviceEnvVars.MYSQL_HOST &&
            serviceEnvVars.MYSQL_DATABASE &&
            serviceEnvVars.MYSQL_USER &&
            serviceEnvVars.MYSQL_PASSWORD
            !services[serviceEnvVars.MYSQL_HOST]
        ) {
            services[serviceEnvVars.MYSQL_HOST] = {
                container_name: `ge-${config.environment}-${config.namespace}-${svc.name}-db`,
                image: 'mysql',
                ports: [
                    `${mysqlPortsCounter}:${mysqlPortsCounter}`
                ],
                restart: 'always',
                environment: {
                    MYSQL_HOST: serviceEnvVars.MYSQL_HOST,
                    MYSQL_DATABASE: serviceEnvVars.MYSQL_DATABASE,
                    MYSQL_USER: serviceEnvVars.MYSQL_USER,
                    MYSQL_PASSWORD: serviceEnvVars.MYSQL_PASSWORD,
                    MYSQL_ROOT_PASSWORD: serviceEnvVars.MYSQL_ROOT_PASSWORD,
                },
                volumes: [
                    `${gnarHiddenDir}/data/${svc.name}-db-data:/var/lib/mysql`
                ]
            }; 

            // increment mysql port for next service as required
            mysqlPortsCounter++;
        }

        // add a mongodb instance if required
        if (
            serviceEnvVars.MONGO_HOST &&
            serviceEnvVars.MONGO_ROOT_PASSWORD &&
            serviceEnvVars.MONGO_DATABASE &&
            serviceEnvVars.MONGO_USER &&
            serviceEnvVars.MONGO_PASSWORD &&
            !serviceEnvVars[MONGO_HOST]
        ) {
            // add mongo init scripts to hidden dir
            fs.mkdir(path.join(gnarHiddenDir, 'mongo-init-scripts'), { recursive: true });
            const mongoInitScript = `
                db = db.getSiblingDB("invoice_db");
                db.createUser({
                    user: "${serviceEnvVars.MONGO_USER}",
                    pwd: "${serviceEnvVars.MONGO_PASSWORD}",
                    roles: [{ role: "readWrite", db: "${serviceEnvVars.MONGO_DATABASE}" }]
                });

                print("Created user ${serviceEnvVars.MONGO_USER} with access to database ${serviceEnvVars.MONGO_DATABASE}");
            `;
            await fs.writeFile(path.join(gnarHiddenDir, 'mongo-init-scripts', `${svc.name}-init.js`), mongoInitScript);

            // create mongo service
            const mongoUrl = `mongodb://${serviceEnvVars.MONGO_USER}:${serviceEnvVars.MONGO_PASSWORD}@${serviceEnvVars.MONGO_HOST}:27017/${serviceEnvVars.MONGO_DATABASE}`;

            services[serviceEnvVars.MONGO_HOST] = {
                container_name: `ge-${config.environment}-${config.namespace}-${svc.name}-mongo`,
                image: 'mongo:latest',
                ports: [
                    `${mongoPortsCounter}:27017`
                ],
                restart: 'always',
                environment: {
                    MONGO_INITDB_ROOT_USERNAME: 'root',
                    MONGO_INITDB_ROOT_PASSWORD: serviceEnvVars.MONGO_ROOT_PASSWORD,
                    MONGO_INITDB_DATABASE: serviceEnvVars.MONGO_DATABASE,
                    DB_USER: serviceEnvVars.MONGO_USER,
                    DB_PASSWORD: serviceEnvVars.MONGO_PASSWORD,
                },
                volumes: [
                    `${gnarHiddenDir}/data/${svc.name}-mongo-data:/data/db`,
                    './mongo-init-scripts:/docker-entrypoint-initdb.d'
                ]
            };

            // increment mongo port for next service as required
            mongoPortsCounter++;
        }
    }

    return {
        version: "3.9",
        services
    }
}

/**
 * Assert the .gnarengine directory in the project directory
 */
async function assertGnarEngineHiddenDir(gnarHiddenDir) {
    await fs.mkdir(gnarHiddenDir, { recursive: true });
}

