import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import paymentRoutes from "./routes/paymentRoutes.js";
import { handleStripeWebhook } from "./controllers/paymentController.js";

import errorMiddleware from "./middleware/errorMiddleware.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

import { createServer } from "http";
import { Server, type Socket } from "socket.io";

import productRoutes from "./pgRoutes/productRoutes.js";

import sequelize from "./db.js";

import pgUserRoutes from "./pgRoutes/userRoutes.js";

// Load Sequelize associations
import "./models/associations.js";

import { swaggerUi, swaggerSpec } from "./docs/swagger.js";

import type { AuthUser } from "./types/express.js";

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

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigin,
        methods: ["GET", "POST"],
        credentials: false
    }
});

io.use((socket: Socket, next) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(
                new Error("Authentication token required")
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string,
            {
                algorithms: ["HS256"]
            }
        ) as AuthUser;

        socket.user = decoded;

        next();
    } catch (error) {
        next(
            new Error(
                "Invalid or expired authentication token"
            )
        );
    }
});

io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    if (socket.user.role === "Admin") {
        socket.join("admins");

        console.log(
            `Admin joined admins room: ${socket.id}`
        );
    }

    socket.on("joinChat", (roomId: string) => {
        if (roomId !== "support-chat") {
            return;
        }

        socket.join(roomId);

        console.log(
            `${socket.user.email} joined ${roomId}`
        );
    });

    socket.on("leaveChat", (roomId: string) => {
        socket.leave(roomId);
    });

    socket.on("sendMessage", (data: {
        roomId?: string;
        text?: string;
        clientMessageId?: string;
    }) => {
        if (
            !data ||
            data.roomId !== "support-chat"
        ) {
            return;
        }

        const text =
            typeof data.text === "string"
                ? data.text.trim()
                : "";

        if (!text || text.length > 1000) {
            return;
        }

        const message = {
            roomId: "support-chat",
            text,
            clientMessageId:
                data.clientMessageId,

            senderId: socket.user.id,
            senderEmail: socket.user.email,
            senderRole: socket.user.role
        };

        io.to("support-chat").emit(
            "receiveMessage",
            message
        );

        socket.emit("persistMessage", {
            ...message,
            shouldPersist: true
        });
    });

    socket.on("disconnect", () => {
        console.log(
            `Socket disconnected: ${socket.id}`
        );
    });
});

app.set("io", io);

// Error-handling middleware must be registered last.
app.use(errorMiddleware);

const PORT = Number(process.env.PORT) || 3002;
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
    try {
        await sequelize.authenticate();

        console.log(
            "Sequelize connected to PostgreSQL successfully"
        );

        httpServer.listen(
            PORT,
            HOST,
            () => {
                console.log(
                    `Server running on ${HOST}:${PORT}`
                );
            }
        );
    } catch (error) {
        console.error(
            "Sequelize PostgreSQL connection failed:",
            (error as Error).message
        );

        process.exit(1);
    }
};

startServer();
