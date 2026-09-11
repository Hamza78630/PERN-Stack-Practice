import express from "express";

import {
    createProduct,
    getProducts,
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
    productQuerySchema
} from "../middleware/validation.js";

const router = express.Router();

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Products
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
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post("/", loginAuth, adminOnly, validateBody(productSchema), createProduct);


/**
 * @swagger
 * /product:
 *   get:
 *     summary: Get all products (paginated, searchable, filterable by price)
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Matches against product name and description
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
 */
router.get("/", validateQuery(productQuerySchema), getProducts);


/**
 * @swagger
 * /product/orders/{orderId}/products:
 *   post:
 *     summary: Add a product to an order
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
 *     responses:
 *       200:
 *         description: Product added to order
 *       404:
 *         description: Order or product not found
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
 * /product/orders/{orderId}/products:
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