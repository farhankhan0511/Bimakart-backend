import { Router } from "express";

const router = Router();

import { verifyAdminJWT } from "../Middlewares/auth.middleware.js";
import { adminLogin, adminSignup, refreshAccessToken } from "../Controllers/AdminAuth.Controller.js";

/**
 * @openapi
 * /signup:
 *   post:
 *     summary: Register a new admin
 *     description: Creates a new admin account and returns access and refresh tokens.
 *     tags:
 *       - AdminAuth
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
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 example: "StrongP@ssw0rd"
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Admin already exists
 *       500:
 *         description: Internal server error
 */
router.post("/signup",adminSignup);


/**
 * @openapi
 * /login:
 *   post:
 *     summary: Admin login
 *     description: Authenticates admin credentials and returns access and refresh tokens.
 *     tags:
 *       - AdminAuth
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
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 example: "StrongP@ssw0rd"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Missing or invalid input
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */
router.post("/login",adminLogin);


/**
 * @openapi
 * /refreshtoken:
 *   post:
 *     summary: Refresh admin access token
 *     description: Exchanges a valid refresh token for a new access token. Requires an admin access token in the `Authorization` header as an additional guard.
 *     tags:
 *       - AdminAuth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Refresh token missing, invalid or expired
 *       422:
 *         description: Access token expired (when provided)
 *       500:
 *         description: Internal server error
 */
router.post("/refreshtoken",verifyAdminJWT,refreshAccessToken)


export default router;