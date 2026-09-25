import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 1025,
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
        ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD
          }
        : undefined
});

const FROM_ADDRESS =
    process.env.EMAIL_FROM || "TechSolve <no-reply@techsolve.dev>";

export interface WelcomeEmailPayload {
    to: string;
    name: string;
}

export const sendWelcomeEmail = async ({ to, name }: WelcomeEmailPayload) => {
    await transporter.sendMail({
        from: FROM_ADDRESS,
        to,
        subject: "Welcome to TechSolve",
        text: `Hi ${name}, thanks for creating a TechSolve account.`,
        html: `<p>Hi ${name},</p><p>Thanks for creating a TechSolve account.</p>`
    });
};

export interface OrderConfirmationEmailPayload {
    to: string;
    name: string;
    orderId: number;
    amount: number;
    currency: string;
}

export const sendOrderConfirmationEmail = async ({
    to,
    name,
    orderId,
    amount,
    currency
}: OrderConfirmationEmailPayload) => {
    const formattedAmount = `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;

    await transporter.sendMail({
        from: FROM_ADDRESS,
        to,
        subject: `Order #${orderId} confirmed`,
        text: `Hi ${name}, your payment of ${formattedAmount} for order #${orderId} was received.`,
        html: `<p>Hi ${name},</p><p>Your payment of <strong>${formattedAmount}</strong> for order #${orderId} was received.</p>`
    });
};
