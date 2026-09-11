import { z, type ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";

export const registrationSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(50),
    email: z.string().trim().email("Invalid email format").max(100),
    password: z.string().min(8, "Password must be at least 8 characters").max(128)
}).strict();

export const loginSchema = z.object({
    email: z.string().trim().email("Invalid email format").max(100),
    password: z.string().min(1, "Password is required").max(128)
}).strict();

export const statsQuerySchema = z.object({
    role: z.enum(["User", "Admin"]).optional()
}).strict();

export const productSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    description: z.string().trim().max(2000).optional(),
    price: z.coerce.number().int("Price must be an integer number of cents").positive("Price must be greater than 0")
}).strict();

export const productQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().max(100).optional(),
    minPrice: z.coerce.number().int().min(0).optional(),
    maxPrice: z.coerce.number().int().min(0).optional()
}).strict();

export const checkoutSchema = z.object({
    // No body is required today (checkout is a fixed-price "Premium Support"
    // purchase), but accepting an optional quantity keeps this endpoint
    // ready for a real multi-item cart without another breaking change.
    quantity: z.coerce.number().int().min(1).max(10).optional()
}).strict();

export const validateBody = <T>(schema: ZodType<T>) =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                status: "fail",
                message: "Invalid request data",
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message
                }))
            });
        }

        // Only validated fields continue to the controller.
        req.body = result.data;
        next();
    };

export const validateQuery = <T extends Record<string, unknown>>(schema: ZodType<T>) =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.query);

        if (!result.success) {
            return res.status(400).json({
                status: "fail",
                message: "Invalid query parameters",
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message
                }))
            });
        }

        req.validatedQuery = result.data;
        next();
    };
