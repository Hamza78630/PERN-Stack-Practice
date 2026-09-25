import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Plain connection options (not a shared client) so that BullMQ's
// Queue and Worker can each open their own dedicated Redis connection,
// which is what BullMQ recommends instead of reusing one client.
export const redisConnection = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD || undefined,

    // Required by BullMQ: its blocking commands must be allowed to
    // wait indefinitely instead of giving up after a retry limit.
    maxRetriesPerRequest: null as null
};

// Single shared client used for simple response caching (GET/SET/DEL).
const redis = new Redis(redisConnection);

redis.on("error", (error: Error) => {
    console.error("Redis connection error:", error.message);
});

redis.on("connect", () => {
    console.log("Redis connected");
});

export default redis;
