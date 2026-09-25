import { Worker } from "bullmq";
import dotenv from "dotenv";

import { redisConnection } from "../config/redis.js";
import {
    sendWelcomeEmail,
    sendOrderConfirmationEmail
} from "../services/emailService.js";
import type { EmailJobData } from "../queues/emailQueue.js";

dotenv.config();

// Runs as its own process (`npm run worker`), separate from the API
// process, so it can be scaled or restarted independently of server.ts.
const worker = new Worker<EmailJobData>(
    "emails",
    async (job) => {
        const data = job.data;

        switch (data.type) {
            case "welcome":
                await sendWelcomeEmail({ to: data.to, name: data.name });
                break;

            case "orderConfirmation":
                await sendOrderConfirmationEmail({
                    to: data.to,
                    name: data.name,
                    orderId: data.orderId,
                    amount: data.amount,
                    currency: data.currency
                });
                break;
        }
    },
    {
        connection: redisConnection,
        concurrency: 5
    }
);

worker.on("completed", (job) => {
    console.log(`Email job ${job.id} (${job.data.type}) sent to ${job.data.to}`);
});

worker.on("failed", (job, error) => {
    console.error(`Email job ${job?.id} failed:`, error.message);
});

console.log("Email worker started, waiting for jobs...");
