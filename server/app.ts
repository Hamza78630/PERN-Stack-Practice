import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import paymentRoutes from "./routes/paymentRoutes.js";
import { handleStripeWebhook } from "./controllers/paymentController.js";

import errorMiddleware from "./middleware/errorMiddleware.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

import productRoutes from "./pgRoutes/productRoutes.js";

import sequelize from "./db.js";

import pgUserRoutes from "./pgRoutes/userRoutes.js";

// Load Sequelize associations
import "./models/associations.js";

import { swaggerUi, swaggerSpec } from "./docs/swagger.js";

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error(
        "JWT_SECRET must be set and at least 32 characters long"
    );
}

const app = express();

app.disable("x-powered-by");

const allowedOrigin =
    process.env.CLIENT_URL || "http://localhost:5173";

app.use(helmet());

// HTTP request logging
app.use(
    morgan(
        process.env.NODE_ENV === "production"
            ? "combined"
            : "dev"
    )
);

app.use(
    cors({
        origin: allowedOrigin,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false
    })
);

// Stripe webhook needs the raw request body to verify
// the Stripe signature.
// It must be registered before express.json().
app.post(
    "/payment/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
);

app.use(express.json({ limit: "10kb" }));

// Serve uploaded avatar images.
app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"))
);

app.use("/payment", apiLimiter);
app.use("/pg/products", apiLimiter, productRoutes);
app.use("/pg/user", apiLimiter, pgUserRoutes);

app.get("/", (req, res) => {
    res.send("Backend is working!");
});

app.get("/test-db", async (req, res) => {
    try {
        await sequelize.authenticate();

        res.json({
            message: "PostgreSQL is working through Sequelize!"
        });
    } catch (error) {
        console.error(
            "PostgreSQL connection failed via /test-db:",
            (error as Error).message
        );

        res.status(500).json({
            message: "PostgreSQL connection failed",
            error: (error as Error).message
        });
    }
});

app.use("/payment", paymentRoutes);

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// Error-handling middleware must be registered last.
app.use(errorMiddleware);

export default app;
