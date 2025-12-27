
/**
 * Storage Driver: local filesystem
 */
export const localStorageDriver = {

    fs: null,
    path: null,
    uploadsDir: '',
    uploadsUrl: '',

    init: async (config) => {
        localStorageDriver.fs = await import('fs').then(mod => mod.promises);
        localStorageDriver.path = await import('path');

        if (!config.uploadsUrl) {
            throw new Error('Local storage driver requires an uploadsUrl configuration.');
        }

        localStorageDriver.uploadsUrl = config.uploadsUrl;

        if (!config.uploadsDir) {
            throw new Error('Local storage driver requires an uploadsDir configuration.');
        }

        localStorageDriver.uploadsDir = config.uploadsDir;

        // Assert upload directories
        const publicDirPath = localStorageDriver.path.join(localStorageDriver.uploadsDir, 'public');
        const privateDirPath = localStorageDriver.path.join(localStorageDriver.uploadsDir, 'private');
        await localStorageDriver.fs.mkdir(publicDirPath, { recursive: true });
        await localStorageDriver.fs.mkdir(privateDirPath, { recursive: true });
    },

    upload: async ({file, key, contentType, metadata}) => {
        const fullPath = localStorageDriver.path.join(localStorageDriver.uploadsDir, key);
        await localStorageDriver.fs.mkdir(localStorageDriver.path.dirname(fullPath), { recursive: true });
        await localStorageDriver.fs.writeFile(fullPath, file);

        return fullPath;
    },

    download: async ({key, stream}) => {
        const fullPath = localStorageDriver.path.join(localStorageDriver.uploadsDir, key);

        if (stream) {
            return localStorageDriver.fs.createReadStream(fullPath);
        } else {
            return await localStorageDriver.fs.readFile(fullPath);
        }
    },

    delete: async ({key}) => {
        const fullPath = localStorageDriver.path.join(localStorageDriver.uploadsDir, key);
        await localStorageDriver.fs.unlink(fullPath);
    },

    getUrl: ({key}) => {
        return `${localStorageDriver.uploadsUrl}/${key}`;
    }
}
