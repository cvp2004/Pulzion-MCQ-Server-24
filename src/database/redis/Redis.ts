// redis.ts
import { createClient } from 'redis';
const REDIS_URL = 'redis://redis:6379';
const client = createClient({
  url: 'redis://localhost:6379',
  //url: REDIS_URL
});

client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));
client.on('ready', () => console.log('Redis Client Ready'));
client.on('reconnecting', () => console.log('Redis Client Reconnecting'));
client.on('end', () => console.log('Redis Client Connection Ended'));

async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
  }
}

async function disconnectRedis() {
  if (client.isOpen) {
    await client.disconnect();
  }
}

export { client, connectRedis, disconnectRedis };