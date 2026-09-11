import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, type Consumer, type Producer } from 'kafkajs';

const TOPIC = process.env.KAFKA_TOPIC || 'littleroyals.school';
const GROUP = process.env.KAFKA_GROUP || 'littleroyals-api';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(KafkaService.name);
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private connected = false;
  private lastError = '';

  brokers() {
    return (process.env.KAFKA_BROKERS || '127.0.0.1:9092')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  status() {
    return {
      ok: this.connected,
      brokers: this.brokers(),
      topic: TOPIC,
      consumer: !!this.consumer,
      lastError: this.lastError || undefined,
    };
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    if (this.consumer) await this.consumer.disconnect().catch(() => undefined);
    if (this.producer) {
      try {
        await this.producer.disconnect();
      } catch {
        /* broker already down */
      }
    }
    this.connected = false;
    this.producer = null;
    this.consumer = null;
  }

  async publish(type: string, payload: unknown) {
    const producer = await this.connect();
    if (!producer) return;
    try {
      await producer.send({
        topic: TOPIC,
        messages: [
          {
            key: type,
            value: JSON.stringify({ type, at: new Date().toISOString(), payload }),
          },
        ],
      });
      this.connected = true;
      this.lastError = '';
    } catch (err) {
      this.connected = false;
      this.lastError = err instanceof Error ? err.message : 'Publish failed';
      this.log.warn('Kafka publish skipped: ' + this.lastError);
    }
  }

  private async connect() {
    if (this.producer && this.connected) return this.producer;
    try {
      const kafka = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID || 'littleroyals',
        brokers: this.brokers(),
        connectionTimeout: 2500,
        requestTimeout: 4000,
        retry: { retries: 1 },
      });
      const producer = kafka.producer();
      await producer.connect();
      this.producer = producer;
      this.connected = true;
      this.lastError = '';
      this.log.log('Kafka connected · ' + this.brokers().join(','));
      void this.consume(kafka);
      return producer;
    } catch (err) {
      this.connected = false;
      this.lastError = err instanceof Error ? err.message : 'Broker unreachable';
      this.log.warn('Kafka offline — school writes still persist: ' + this.lastError);
      return null;
    }
  }

  private async consume(kafka: Kafka) {
    try {
      const consumer = kafka.consumer({ groupId: GROUP });
      await consumer.connect();
      await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
      await consumer.run({
        eachMessage: async ({ message }) => {
          const type = message.key?.toString() || 'event';
          this.log.debug('Kafka consumed ' + type);
        },
      });
      this.consumer = consumer;
    } catch (err) {
      this.log.warn('Kafka consumer skipped: ' + (err instanceof Error ? err.message : 'failed'));
    }
  }
}
