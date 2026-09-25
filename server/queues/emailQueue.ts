import { Queue } from "bullmq";

import { redisConnection } from "../config/redis.js";

export interface WelcomeEmailJobData {
    type: "welcome";
    to: string;
    name: string;
}

export interface OrderConfirmationEmailJobData {
    type: "orderConfirmation";
    to: string;
    name: string;
    orderId: number;
    amount: number;
    currency: string;
}

export type EmailJobData =
    | WelcomeEmailJobData
    | OrderConfirmationEmailJobData;

// Emails are sent from the worker process (workers/emailWorker.ts),
// never inline in a request handler, so a slow/down SMTP server can
// never slow down or fail an API response.
export const emailQueue = new Queue<EmailJobData>("emails", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000
        },
        removeOnComplete: 100,
        removeOnFail: 500
    }
});
