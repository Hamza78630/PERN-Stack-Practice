import type { Request, Response, NextFunction } from "express";

import redis from "../config/redis.js";

const DEFAULT_TTL_SECONDS = 60;

// Caches a GET endpoint's JSON response in Redis, keyed by the full
// request URL (path + query string) so pagination/search/filter
// combinations each get their own cache entry.
export const cacheResponse = (ttlSeconds: number = DEFAULT_TTL_SECONDS) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const key = `cache:${req.originalUrl}`;

        try {
            const cached = await redis.get(key);

            if (cached) {
                res.setHeader("X-Cache", "HIT");
                return res.json(JSON.parse(cached));
            }
        } catch (error) {
            // Redis being unavailable should never break the request —
            // fall through and serve the uncached response instead.
            console.error("Cache read failed:", (error as Error).message);
        }

        const originalJson = res.json.bind(res);

        res.json = ((body: unknown) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                redis
                    .set(key, JSON.stringify(body), "EX", ttlSeconds)
                    .catch((error: Error) =>
                        console.error("Cache write failed:", error.message)
                    );
            }

            res.setHeader("X-Cache", "MISS");
            return originalJson(body);
        }) as typeof res.json;

        next();
    };
};

// Clears every cached response under a key prefix (e.g. every cached
// /pg/products listing) — call after a write that makes those pages
// stale. Uses SCAN rather than KEYS so it doesn't block Redis.
export const invalidateCache = async (prefix: string) => {
    try {
        const stream = redis.scanStream({ match: `cache:${prefix}*` });
        const keysToDelete: string[] = [];

        for await (const keys of stream) {
            keysToDelete.push(...(keys as string[]));
        }

        if (keysToDelete.length > 0) {
            await redis.del(...keysToDelete);
        }
    } catch (error) {
        console.error("Cache invalidation failed:", (error as Error).message);
    }
};
