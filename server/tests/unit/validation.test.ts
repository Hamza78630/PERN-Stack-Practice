import { describe, it, expect } from "vitest";

import {
    registrationSchema,
    loginSchema,
    productSchema,
    productQuerySchema,
    statsQuerySchema
} from "../../middleware/validation.js";

describe("registrationSchema", () => {
    it("accepts a valid registration payload", () => {
        const result = registrationSchema.safeParse({
            name: "Hamza",
            email: "hamza@example.com",
            password: "password123"
        });

        expect(result.success).toBe(true);
    });

    it("rejects a name shorter than 2 characters", () => {
        const result = registrationSchema.safeParse({
            name: "H",
            email: "hamza@example.com",
            password: "password123"
        });

        expect(result.success).toBe(false);
    });

    it("rejects an invalid email", () => {
        const result = registrationSchema.safeParse({
            name: "Hamza",
            email: "not-an-email",
            password: "password123"
        });

        expect(result.success).toBe(false);
    });

    it("rejects a password shorter than 8 characters", () => {
        const result = registrationSchema.safeParse({
            name: "Hamza",
            email: "hamza@example.com",
            password: "short"
        });

        expect(result.success).toBe(false);
    });

    it("rejects unknown fields (schema is .strict())", () => {
        const result = registrationSchema.safeParse({
            name: "Hamza",
            email: "hamza@example.com",
            password: "password123",
            role: "Admin"
        });

        expect(result.success).toBe(false);
    });
});

describe("loginSchema", () => {
    it("accepts a valid login payload", () => {
        const result = loginSchema.safeParse({
            email: "hamza@example.com",
            password: "anything"
        });

        expect(result.success).toBe(true);
    });

    it("rejects an empty password", () => {
        const result = loginSchema.safeParse({
            email: "hamza@example.com",
            password: ""
        });

        expect(result.success).toBe(false);
    });
});

describe("productSchema", () => {
    it("accepts a valid product payload and coerces price to a number", () => {
        const result = productSchema.safeParse({
            name: "Premium Support",
            description: "Priority support",
            price: "2000"
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.price).toBe(2000);
        }
    });

    it("rejects a non-positive price", () => {
        const result = productSchema.safeParse({
            name: "Premium Support",
            price: 0
        });

        expect(result.success).toBe(false);
    });

    it("rejects a non-integer price", () => {
        const result = productSchema.safeParse({
            name: "Premium Support",
            price: 19.99
        });

        expect(result.success).toBe(false);
    });
});

describe("productQuerySchema", () => {
    it("accepts an empty query (all fields optional)", () => {
        const result = productQuerySchema.safeParse({});

        expect(result.success).toBe(true);
    });

    it("coerces page/limit/minPrice/maxPrice from query strings", () => {
        const result = productQuerySchema.safeParse({
            page: "2",
            limit: "25",
            minPrice: "100",
            maxPrice: "500"
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.page).toBe(2);
            expect(result.data.limit).toBe(25);
        }
    });

    it("rejects a limit above 100", () => {
        const result = productQuerySchema.safeParse({ limit: "101" });

        expect(result.success).toBe(false);
    });
});

describe("statsQuerySchema", () => {
    it("accepts a valid role", () => {
        expect(statsQuerySchema.safeParse({ role: "Admin" }).success).toBe(true);
    });

    it("rejects a role outside the enum", () => {
        expect(statsQuerySchema.safeParse({ role: "SuperAdmin" }).success).toBe(false);
    });
});
