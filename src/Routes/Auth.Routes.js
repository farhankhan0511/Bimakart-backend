import { Router } from "express";
import { checkMobileExist, getUserTokens, refreshAccessToken, SignupUser,VerifyPassword } from "../Controllers/Auth.Controller.js";


const router=Router()

/**
 * @openapi
 * /auth/check-mobile:
 *   post:
 *     summary: Check if mobile number exists
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: Mobile exists
 *       400:
 *         description: Invalid input
 */
router.post("/checkmobileexist",checkMobileExist)


/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: Signup and create a new user
 *     description: Creates a new user account in the Salesforce database.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *               - name
 *               - source
 *               - password
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               name:
 *                 type: string
 *                 example: "Farhan Khan"
 *               source:
 *                 type: string
 *                 example: "web"
 *               password:
 *                 type: string
 *                 example: "Password123"
 *     responses:
 *       200:
 *         description: User signup successful
 *       400:
 *         description: Invalid signup data or mobile already exists
 *       500:
 *         description: Internal server error
 */
router.post("/signup", SignupUser);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Verify password and login user
 *     description: Verifies the encrypted password and authenticates the user.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *               - encryptedPassword
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               encryptedPassword:
 *                 type: string
 *                 example: "U2FsdGVkX1+abc123xyz"
 *     responses:
 *       200:
 *         description: Password verification successful
 *       401:
 *         description: Invalid mobile number or wrong password
 *       400:
 *         description: Missing or invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/login", VerifyPassword);


/**
 * @openapi
 * /auth/refreshaccesstoken:
 *   post:
 *     summary: Refresh access token
 *     description: Exchanges a refresh token for a new access token.
 *     tags:
 *       - Auth
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
 *       500:
 *         description: Internal server error
 */
router.post("/refreshaccesstoken",refreshAccessToken)


/**
 * @openapi
 * /auth/getuserTokens:
 *   get:
 *     summary: Get tokens for OTP sign-in
 *     description: Verifies Firebase token and returns access and refresh tokens for the provided mobile number.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: mobile
 *         schema:
 *           type: string
 *         required: true
 *         description: User mobile number
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Firebase ID token
 *     responses:
 *       200:
 *         description: Tokens fetched successfully
 *       400:
 *         description: Missing or invalid mobile/token
 *       500:
 *         description: Error while generating tokens
 */
router.get("/getuserTokens",getUserTokens)


export default router;