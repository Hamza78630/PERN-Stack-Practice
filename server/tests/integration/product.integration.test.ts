import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../../app.js";
import sequelize from "../../db.js";
import Product from "../../models/Product.js";

// These tests hit a real Postgres database (see the `test` block in
// config/config.cjs and docker-compose.yml's `postgres` service).
// Run `npm run migrate` against it first, or let CI's workflow do it.
// If no database is reachable — e.g. running `npm test` locally
// without `docker compose up -d postgres` — these are skipped rather
// than failing the whole suite.

let dbAvailable = true;

const signAdminToken = () =>
    jwt.sign(
        { id: "1", email: "admin@example.com", role: "Admin" },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h", algorithm: "HS256" }
    );

beforeAll(async () => {
    try {
        await sequelize.authenticate();
    } catch {
        dbAvailable = false;
        console.warn(
            "Skipping product integration tests: no test database reachable."
        );
    }
});

afterAll(async () => {
    if (dbAvailable) {
        await sequelize.close();
    }
});

describe("Product API (integration)", () => {
    it("creates a product as admin, then finds it in a filtered, paginated list", async () => {
        if (!dbAvailable) return;

        const token = signAdminToken();
        const uniqueName = `Integration Test Widget ${Date.now()}`;

        const createResponse = await request(app)
            .post("/pg/products")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: uniqueName,
                description: "Created by the integration test suite",
                price: 4200
            });

        expect(createResponse.status).toBe(201);
        expect(createResponse.body.data.name).toBe(uniqueName);

        const listResponse = await request(app).get(
            `/pg/products?search=${encodeURIComponent(uniqueName)}&minPrice=4000&maxPrice=4500&page=1&limit=10`
        );

        expect(listResponse.status).toBe(200);
        expect(listResponse.body.pagination).toBeDefined();

        const found = listResponse.body.data.find(
            (product: { name: string }) => product.name === uniqueName
        );

        expect(found).toBeTruthy();

        // Clean up so repeated test runs don't accumulate rows.
        await Product.destroy({ where: { name: uniqueName } });
    });

    it("rejects product creation without an admin token", async () => {
        if (!dbAvailable) return;

        const response = await request(app)
            .post("/pg/products")
            .send({ name: "Should Fail", price: 100 });

        expect(response.status).toBe(401);
    });

    it("returns 404 when adding a product to a non-existent order", async () => {
        if (!dbAvailable) return;

        const token = signAdminToken();

        const product = await Product.create({
            name: `Order Test Product ${Date.now()}`,
            price: 500
        });

        const response = await request(app)
            .post("/pg/products/orders/999999999/products")
            .set("Authorization", `Bearer ${token}`)
            .send({ productId: product.productid });

        expect(response.status).toBe(404);

        await product.destroy();
    });
});
