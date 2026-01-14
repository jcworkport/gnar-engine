import Docker from 'dockerode';
import { Writable } from 'stream';
import path from 'path';
import fs from 'fs';

const docker = new Docker();

/**
 * Build Docker image
 *
 * @param {Object} options
 * @param {string} options.context - The build context directory
 * @param {string} options.dockerfile - The Dockerfile path relative to the context
 * @param {string} options.imageTag - The tag to assign to the built image
 */
export async function buildImage({ context, dockerfile, imageTag }) {

    console.log('Building image...', imageTag);

    const tarStream = await docker.buildImage(
        {
            context: context,
            src: fs.readdirSync(context)
        },
        {
            t: imageTag,
            dockerfile
        }
    );

    await new Promise((resolve, reject) => {
        docker.modem.followProgress(tarStream, (err) => (err ? reject(err) : resolve()));
    });

    console.log('Built image:', imageTag);
}

/**
 * Create & start docker container
 *
 * @param {Object} options
 * @param {string} options.name - Container name
 * @param {string} options.image - Docker image to use
 * @param {Array} [options.command] - Command to run in the container
 * @param {Object} [options.env] - Environment variables
 * @param {Object} [options.ports] - Port mappings (containerPort: hostPort)
 * @param {Array} [options.binds] - Volume bindings
 * @param {string} [options.restart] - Restart policy
 * @param {boolean} [options.attach] - Whether to attach to container output
 * @param {string} [options.network] - Network name
 * @returns {Promise<Docker.Container>} - The started container
 */
export async function upContainer({ name, image, command = [], env = {}, ports = {}, binds = [], restart = 'always', attach = true, network }) {

    // remove container first
    try {
        const existingContainer = docker.getContainer(name);
        await existingContainer.remove({ force: true });
    } catch (err) {
        // Container does not exist, ignore
    }

    // create container
    const container = await docker.createContainer({
        name,
        Image: image,
        Cmd: command,
        Env: Object.entries(env).map(([k, v]) => `${k}=${v}`),
        HostConfig: {
            RestartPolicy: { Name: restart },
            Binds: binds,
            PortBindings: Object.fromEntries(
                Object.entries(ports).map(([cPort, hPort]) => [
                    `${cPort}/tcp`,
                    [{ HostPort: String(hPort) }]
                ])
            ),
            NetworkMode: network,
        },
        ExposedPorts: Object.fromEntries(
            Object.keys(ports).map(p => [`${p}/tcp`, {}])
        )
    });

    // Attach logs before starting the container
    if (attach) {
        const stream = await container.attach({ stream: true, stdout: true, stderr: true, logs: true });
        const stdoutStream = createPrefixStream(name, process.stdout);
        const stderrStream = createPrefixStream(name, process.stderr);

        container.modem.demuxStream(stream, stdoutStream, stderrStream);
    }

    await container.start();

    return container;
}

/**
 * Create network
 *
 * @param {String} name - Network name
 */
export async function createBridgeNetwork({ name }) {
    try {
        await docker.createNetwork({
            Name: name,
            Driver: 'bridge',
            CheckDuplicate: true
        });
    } catch (err) {
        console.error(err);
    }
}

/**
 * Tansform stream
 *
 * @param {String} name - Container name
 * @returns {Transform} - Transform stream
 */
function createPrefixStream(name, targetStream) {
    const color = colorForName(name);

    return new Writable({
        write(chunk, encoding, callback) {
            const lines = chunk.toString().split(/\r?\n/);
            for (const line of lines) {
                if (line.trim()) {
                    targetStream.write(`${color}[${name}]${RESET} ${line}\n`);
                }
            }
            callback();
        }
    });
}

/**
 * Colours for container name
 */
const COLORS = [
    '\x1b[31m', // red
    '\x1b[32m', // green
    '\x1b[33m', // yellow
    '\x1b[34m', // blue
    '\x1b[35m', // magenta
    '\x1b[36m', // cyan
    '\x1b[37m', // white
];

const RESET = '\x1b[0m';

function colorForName(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
}
