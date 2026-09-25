import { describe, it, expect } from "vitest";
import request from "supertest";

import app from "../../app.js";

describe("POST /pg/user/login validation", () => {
    it("rejects a missing password before touching the database", async () => {
        const response = await request(app)
            .post("/pg/user/login")
            .send({ email: "hamza@example.com" });

        expect(response.status).toBe(400);
    });

    it("rejects an invalid email format", async () => {
        const response = await request(app)
            .post("/pg/user/login")
            .send({ email: "not-an-email", password: "password123" });

        expect(response.status).toBe(400);
    });
});

describe("protected routes without a token", () => {
    it("rejects GET /pg/user/profile with 401", async () => {
        const response = await request(app).get("/pg/user/profile");

        expect(response.status).toBe(401);
    });

    it("rejects GET /pg/user/users (admin-only) with 401", async () => {
        const response = await request(app).get("/pg/user/users");

        expect(response.status).toBe(401);
    });

    it("rejects an invalid bearer token with 401", async () => {
        const response = await request(app)
            .get("/pg/user/profile")
            .set("Authorization", "Bearer not-a-real-token");

        expect(response.status).toBe(401);
    });
});

describe("authLimiter rate limiting on /pg/user/login", () => {
    it("returns 429 after exceeding the auth rate limit", async () => {
        const attempts = Array.from({ length: 11 }, () =>
            request(app)
                .post("/pg/user/login")
                .send({ email: "ratelimit-test@example.com", password: "wrongpassword" })
        );

        const responses = [];

        // Sequential on purpose: the rate limiter counts requests as
        // they arrive, so firing them one at a time gives a
        // deterministic result instead of a race.
        for (const attempt of attempts) {
            responses.push(await attempt);
        }

        const rateLimited = responses.filter((res) => res.status === 429);

        expect(rateLimited.length).toBeGreaterThan(0);
    });
});
