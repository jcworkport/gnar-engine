import amqp from 'amqplib';

export class RabbitLogsTransport {
    exchangeName = '';
    exchangeType = 'topic';
    channel = null;
    connection = null;
    rabbitUrl = '';
    projectId = '';

    /**
     * Initialize transport with remote RabbitMQ
     * @param {Object} params
     * @param {string} params.rabbitUrl - AMQP URL to the Gnar Cloud RabbitMQ
     * @param {string} params.exchangeName - Exchange name to publish logs to
     * @param {string} params.projectId - Tenant project ID
     */
    async init({ rabbitUrl, exchangeName, projectId }) {
        this.rabbitUrl = rabbitUrl;
        this.exchangeName = exchangeName;
        this.projectId = projectId;

        this.connection = await amqp.connect(this.rabbitUrl);
        this.channel = await this.connection.createChannel();
    }

    /**
     * Publish a batch of logs to the topic exchange
     * @param {Array<Object>} batch - array of structured log objects
     */
    async flush(batch) {
        if (!this.channel || !batch || batch.length === 0) return;

        try {
            for (const log of batch) {
                const routingKey = `project.${this.projectId}.${log.serviceName || 'unknown'}.${log.level || 'info'}`;

                const result = this.channel.publish(
                    this.exchangeName,
                    routingKey,
                    Buffer.from(JSON.stringify(log)),
                    { persistent: true }
                );

                if (!result) {
                    console.warn('RabbitLogsTransport: publish returned false, message may be buffered');
                }
            }
        } catch (err) {
            console.error('RabbitLogsTransport flush error:', err);
            // Optional: implement retry logic here
        }
    }

    /**
     * Close the connection gracefully
     */
    async close() {
        if (this.channel) await this.channel.close().catch(() => {});
        if (this.connection) await this.connection.close().catch(() => {});
    }
}
