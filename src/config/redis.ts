import Redis from 'ioredis';
import "dotenv/config";

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

let redis: Redis;
redis = new Redis({
    host: redisHost,
    port: redisPort,
});

redis.on('connect', () => console.error(`[REDIS] server connected ✔️ , listening on ${redisHost}:${redisPort}`));
redis.on('error', (error) => console.error(`[REDIS] server connection failed : ${error}`));

export { redis }
