
/**
 * S3 Storage driver
 */
export const s3StorageDriver = {

    client: null,
    bucket: '',
    uploadsUrl: '',

    init: async (config) => {
        if (!config.bucket) throw new Error('S3 storage driver requires a bucket name.');
        if (!config.region) throw new Error('S3 storage driver requires a region.');
        if (!config.uploadsUrl) throw new Error('S3 storage driver requires an uploadsUrl.');

        const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = await import('@aws-sdk/client-s3');

        s3StorageDriver.S3Client = S3Client;
        s3StorageDriver.PutObjectCommand = PutObjectCommand;
        s3StorageDriver.GetObjectCommand = GetObjectCommand;
        s3StorageDriver.DeleteObjectCommand = DeleteObjectCommand;

        s3StorageDriver.bucket = config.bucket;
        s3StorageDriver.uploadsUrl = config.uploadsUrl;

        s3StorageDriver.client = new S3Client({
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey
            }
        });
    },

    upload: async ({ file, key, contentType }) => {
        const command = new s3StorageDriver.PutObjectCommand({
            Bucket: s3StorageDriver.bucket,
            Key: key,
            Body: file,
            ContentType: contentType
        });

        await s3StorageDriver.client.send(command);
        return key;
    },

    download: async ({ key, stream }) => {
        const command = new s3StorageDriver.GetObjectCommand({
            Bucket: s3StorageDriver.bucket,
            Key: key
        });

        const response = await s3StorageDriver.client.send(command);

        if (stream) {
            return response.Body;
        } else {
            const chunks = [];
            for await (const chunk of response.Body) chunks.push(chunk);
            return Buffer.concat(chunks);
        }
    },

    delete: async ({ key }) => {
        const command = new s3StorageDriver.DeleteObjectCommand({
            Bucket: s3StorageDriver.bucket,
            Key: key
        });
        await s3StorageDriver.client.send(command);
    },

    getUrl: async ({ key }) => {
        return `${s3StorageDriver.uploadsUrl}/${key}`;
    }
};
