import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import { createServer } from "http";
import { Server, type Socket } from "socket.io";

import app from "./app.js";
import sequelize from "./db.js";

import type { AuthUser } from "./types/express.js";

dotenv.config();

const allowedOrigin =
    process.env.CLIENT_URL || "http://localhost:5173";

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
