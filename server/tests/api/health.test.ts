import { describe, it, expect } from "vitest";
import request from "supertest";

import app from "../../app.js";

describe("GET /", () => {
    it("returns the health check message", async () => {
        const response = await request(app).get("/");

        expect(response.status).toBe(200);
        expect(response.text).toBe("Backend is working!");
    });
});

describe("GET /api-docs", () => {
    it("serves the Swagger UI", async () => {
        const response = await request(app).get("/api-docs/");

        expect(response.status).toBe(200);
        expect(response.text).toContain("swagger");
    });
});

describe("unknown routes", () => {
    it("returns a 404 for a route that doesn't exist", async () => {
        const response = await request(app).get("/this-route-does-not-exist");

        expect(response.status).toBe(404);
    });
});
