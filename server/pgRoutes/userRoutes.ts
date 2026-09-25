import express from "express";

import upload from "../middleware/multer.js";

import {
    registerUser,
    loginUser,
    profileUser,
    getPgUserStats,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserOrders
} from "../pgcontrollers/userController.js";

import {
    validateBody,
    validateQuery,
    registrationSchema,
    loginSchema,
    statsQuerySchema
} from "../middleware/validation.js";

import {
    loginAuth
} from "../middleware/loginAuthenticator.js";

import {
    adminOnly
} from "../middleware/authorization.js";

import {
    authLimiter
} from "../middleware/rateLimiter.js";

const router = express.Router();

/**
 * @swagger
 * /pg/user/registration:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Test User
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *
 *               avatar:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       201:
 *         description: User registered successfully
 *
 *       400:
 *         description: Invalid request data
 *
 *       409:
 *         description: Email already exists
 *
 *       429:
 *         description: Too many registration attempts
 *
 *       500:
 *         description: Server error
 */
router.post(
    "/registration",
    authLimiter,
    upload.single("avatar"),
    validateBody(registrationSchema),
    registerUser
);

/**
 * @swagger
 * /pg/user/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Users
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *
 *                 role:
 *                   type: string
 *                   enum:
 *                     - User
 *                     - Admin
 *                   example: User
 *
 *       400:
 *         description: Invalid request data
 *
 *       401:
 *         description: Invalid email or password
 *
 *       429:
 *         description: Too many login attempts
 *
 *       500:
 *         description: Server error
 */
router.post(
    "/login",
    authLimiter,
    validateBody(loginSchema),
    loginUser
);

/**
 * @swagger
 * /pg/user/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: User not found
 *
 *       500:
 *         description: Server error
 */
router.get(
    "/profile",
    loginAuth,
    profileUser
);

/**
 * @swagger
 * /pg/user/stats:
 *   get:
 *     summary: Get user statistics by role
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: role
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - User
 *             - Admin
 *         description: Filter statistics by user role
 *         example: User
 *
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *
 *       400:
 *         description: Invalid query parameters
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Admin access required
 *
 *       500:
 *         description: Server error
 */
router.get(
    "/stats",
    loginAuth,
    adminOnly,
    validateQuery(statsQuerySchema),
    getPgUserStats
);

/**
 * @swagger
 * /pg/user/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *
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
 *           example: 10
 *         description: Number of users per page
 *
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *           example: hamza
 *         description: Search users by name or email
 *
 *       - in: query
 *         name: role
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - User
 *             - Admin
 *         description: Filter users by role
 *
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Admin access required
 *
 *       500:
 *         description: Server error
 */
router.get(
    "/users",
    loginAuth,
    adminOnly,
    getUsers
);

/**
 * @swagger
 * /pg/user/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: User ID
 *
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Admin access required
 *
 *       404:
 *         description: User not found
 *
 *       500:
 *         description: Server error
 */
router.get(
    "/users/:id",
    loginAuth,
    adminOnly,
    getUserById
);

/**
 * @swagger
 * /pg/user/users/{id}:
 *   patch:
 *     summary: Update a user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: User ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated User
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 example: updated@example.com
 *
 *               role:
 *                 type: string
 *                 enum:
 *                   - User
 *                   - Admin
 *                 example: User
 *
 *     responses:
 *       200:
 *         description: User updated successfully
 *
 *       400:
 *         description: Invalid request data
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Admin access required
 *
 *       404:
 *         description: User not found
 *
 *       500:
 *         description: Server error
 */
router.patch(
    "/users/:id",
    loginAuth,
    adminOnly,
    updateUser
);

/**
 * @swagger
 * /pg/user/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: User ID
 *
 *     responses:
 *       200:
 *         description: User deleted successfully
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Admin access required
 *
 *       404:
 *         description: User not found
 *
 *       500:
 *         description: Server error
 */
router.delete(
    "/users/:id",
    loginAuth,
    adminOnly,
    deleteUser
);

/**
 * @swagger
 * /pg/user/users/{id}/orders:
 *   get:
 *     summary: Get all orders belonging to a user
 *     tags:
 *       - Users
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: User ID
 *
 *     responses:
 *       200:
 *         description: User orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *
 *       401:
 *         description: Authentication required
 *
 *       403:
 *         description: Admin access required
 *
 *       404:
 *         description: User not found
 *
 *       500:
 *         description: Server error
 */
router.get(
    "/users/:id/orders",
    loginAuth,
    adminOnly,
    getUserOrders
);

export default router;