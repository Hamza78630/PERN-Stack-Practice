import Stripe from "stripe";
import dotenv from "dotenv";
import type { Request, Response, NextFunction } from "express";
import type { Server } from "socket.io";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import sequelize from "../db.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const SUPPORT_PRICE_CENTS = 2000;
const SUPPORT_PRODUCT_NAME = "TechSolve Premium Support";

// The site currently sells one fixed product (no cart UI yet), but it's
// still a real row in `products` and gets linked to the order through
// `orderitems` — the same many-to-many path a multi-item cart would use —
// rather than being a hardcoded line item disconnected from the schema.
const getSupportProduct = () =>
    Product.findOrCreate({
        where: { name: SUPPORT_PRODUCT_NAME },
        defaults: {
            name: SUPPORT_PRODUCT_NAME,
            description: "Priority TechSolve support, one-time purchase.",
            price: SUPPORT_PRICE_CENTS
        }
    }).then(([product]) => product);

// ==========================================
// Create a Stripe Checkout session
// Called from an authenticated frontend request
// (POST /payment/create-checkout-session)
// ==========================================

export const createCheckoutSession = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let order: Order | undefined;

    try {
        const userId = req.user!.id;
        const quantity = (req.body?.quantity as number | undefined) || 1;

        const product = await getSupportProduct();
        const amount = product.price * quantity;

        // Order creation and linking it to the product it's for must
        // succeed together or not at all.
        order = await sequelize.transaction(async (t) => {
            const newOrder = await Order.create(
                {
                    userid: Number(userId),
                    amount,
                    currency: "usd",
                    status: "pending"
                },
                { transaction: t }
            );

            await newOrder.addProduct(
                product,
                {
                    through: { quantity },
                    transaction: t
                }
            );

            return newOrder;
        });

        const session = await stripe.checkout.sessions.create({
            mode: "payment",

            line_items: [
                {
                    price_data: {
                        currency: "usd",

                        product_data: {
                            name: product.name,
                            description: product.description || undefined
                        },

                        unit_amount: product.price
                    },

                    quantity
                }
            ],

            metadata: {
                orderId: order.orderid.toString(),
                userId: userId.toString(),
                productId: product.productid.toString()
            },

            success_url:
                `${process.env.CLIENT_URL}/userdashboard?payment=success`,

            cancel_url:
                `${process.env.CLIENT_URL}/userdashboard?payment=cancelled`
        });

        await order.update({
            stripesessionid: session.id
        });

        return res.json({
            success: true,
            url: session.url
        });

    } catch (error) {
        // If the order was created but Stripe failed (or the update above
        // failed), don't leave a "pending" order with no session behind it.
        if (order && !order.stripesessionid) {
            await order
                .update({ status: "failed" })
                .catch((updateError) => {
                    console.error(
                        "Failed to mark order as failed after checkout error:",
                        updateError
                    );
                });
        }

        next(error);
    }
};


// ==========================================
// Stripe webhook
// Called by Stripe itself, not by the frontend
// (POST /payment/webhook, raw body only)
// ==========================================

export const handleStripeWebhook = async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Stripe webhook signature verification failed:", message);
        return res.status(400).send(`Webhook Error: ${message}`);
    }

    try {
        switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded": {
                const session = event.data.object as Stripe.Checkout.Session;

                await markOrderPaid(session, req.app.get("io"));
                break;
            }

            case "checkout.session.async_payment_failed":
            case "checkout.session.expired": {
                const session = event.data.object as Stripe.Checkout.Session;

                await markOrderFailed(session);
                break;
            }

            default:
                // Unhandled event types are fine to ignore.
                break;
        }

        // Stripe only cares that we return 2xx quickly; it will retry
        // on anything else (or on timeouts), so the handler above must
        // be idempotent.
        return res.json({ received: true });

    } catch (error) {
        console.error("Error while processing Stripe webhook event:", error);

        // Returning a 500 tells Stripe to retry the event later.
        return res.status(500).json({ received: false });
    }
};

const markOrderPaid = async (
    session: Stripe.Checkout.Session,
    io: Server | undefined
) => {
    const order = await Order.findOne({
        where: { stripesessionid: session.id }
    });

    if (!order) {
        console.error(
            `Stripe webhook: no order found for session ${session.id}`
        );
        return;
    }

    // Idempotency guard: Stripe can deliver the same event more than once.
    if (order.status === "paid") {
        return;
    }

    await sequelize.transaction(async (t) => {
        await order.update(
            { status: "paid" },
            { transaction: t }
        );
    });

    if (io) {
        io.to("admins").emit("paymentReceived", {
            orderId: order.orderid,
            userId: order.userid,
            amount: order.amount,
            currency: order.currency
        });
    }
};

const markOrderFailed = async (session: Stripe.Checkout.Session) => {
    const order = await Order.findOne({
        where: { stripesessionid: session.id }
    });

    if (!order || order.status === "paid") {
        return;
    }

    await order.update({ status: "failed" });
};
