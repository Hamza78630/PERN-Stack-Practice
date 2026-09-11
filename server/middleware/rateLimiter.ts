import rateLimit from "express-rate-limit";

// General protection for API endpoints.
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        status: "fail",
        message: "Too many requests. Please try again later."
    }
});

// Stricter limit for authentication endpoints to slow brute-force attempts.
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        status: "fail",
        message: "Too many authentication attempts. Please try again later."
    }
});
