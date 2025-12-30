import { Router } from "express";
import { getUserDetails } from "../Controllers/User.Controller.js";

const router=Router()

/**
 * @swagger
 * /auth/getUserDetails:
 *   post:
 *     summary: Get user details by mobile number
 *     description: Retrieves user details if the mobile number exists.
 *     tags:
 *       - User
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
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 *       400:
 *         description: Invalid mobile number format
 *       500:
 *         description: Internal server error
 */
router.post("/getUserDetails", getUserDetails);


export default router;