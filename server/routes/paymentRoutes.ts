import express from "express";

import {
    createCheckoutSession
} from "../controllers/paymentController.js";

import {
    loginAuth
} from "../middleware/loginAuthenticator.js";

import {
    validateBody,
    checkoutSchema
} from "../middleware/validation.js";

const router = express.Router();

/**
 * @swagger
 * /payment/create-checkout-session:
 *   post:
 *     summary: Create a Stripe checkout session
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *
 *     responses:
 *       200:
 *         description: Stripe checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 url:
 *                   type: string
 *                   format: uri
 *                   example: "https://checkout.stripe.com/example"
 *
 *       400:
 *         description: Invalid request data
 *
 *       401:
 *         description: Authentication required
 *
 *       500:
 *         description: Payment session creation failed
 */
router.post(
    "/create-checkout-session",
    loginAuth,
    validateBody(checkoutSchema),
    createCheckoutSession
);

export default router;