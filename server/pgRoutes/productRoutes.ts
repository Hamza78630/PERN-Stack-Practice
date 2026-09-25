import express from "express";

import {
    createProduct,
    getProducts,
    createOrder,
    addProductToOrder,
    getOrderProducts
} from "../pgcontrollers/productController.js";

import {
    loginAuth
} from "../middleware/loginAuthenticator.js";

import {
    adminOnly
} from "../middleware/authorization.js";

import {
    validateBody,
    validateQuery,
    productSchema,
    productQuerySchema,
    orderSchema
} from "../middleware/validation.js";

import {
    cacheResponse
} from "../middleware/cache.js";

const router = express.Router();

/**
 * @swagger
 * /pg/products:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Premium Support
 *               description:
 *                 type: string
 *                 example: Technical support package
 *               price:
 *                 type: integer
 *                 example: 2000
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Server error
 */
router.post(
    "/",
    loginAuth,
    adminOnly,
    validateBody(productSchema),
    createProduct
);

/**
 * @swagger
 * /pg/products:
 *   get:
 *     summary: Get all products (paginated, searchable, filterable by price)
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           example: 10
 *         description: Number of products per page
 *
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *           example: support
 *         description: Matches against product name and description
 *
 *       - in: query
 *         name: minPrice
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *           example: 1000
 *         description: Minimum product price
 *
 *       - in: query
 *         name: maxPrice
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *           example: 5000
 *         description: Maximum product price
 *
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         headers:
 *           X-Cache:
 *             description: Indicates whether the response came from the Redis cache
 *             schema:
 *               type: string
 *               enum:
 *                 - HIT
 *                 - MISS
 *
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
 */
router.get(
    "/",
    validateQuery(productQuerySchema),
    cacheResponse(60),
    getProducts
);

/**
 * @swagger
 * /pg/products/orders:
 *   post:
 *     summary: Create a new order
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 2
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post(
    "/orders",
    loginAuth,
    validateBody(orderSchema),
    createOrder
);

/**
 * @swagger
 * /pg/products/orders/{orderId}/products:
 *   post:
 *     summary: Add a product to an order
 *     tags:
 *       - Products
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the order
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *
 *     responses:
 *       200:
 *         description: Product added to order
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Admin access required
 *
 *       404:
 *         description: Order or product not found
 *
 *       500:
 *         description: Server error
 */
router.post(
    "/orders/:orderId/products",
    loginAuth,
    adminOnly,
    addProductToOrder
);

/**
 * @swagger
 * /pg/products/orders/{orderId}/products:
 *   get:
 *     summary: Get products belonging to an order
 *     tags:
 *       - Products
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the order
 *     responses:
 *       200:
 *         description: Order with its products
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get(
    "/orders/:orderId/products",
    getOrderProducts
);

export default router;