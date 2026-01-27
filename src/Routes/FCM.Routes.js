
import { Router } from "express";

const router = Router();


import { verifyAdminJWT, verifyJWT } from "../Middlewares/auth.middleware.js";
import { deactivateFcmToken, getPastNotifications, saveandupdateFcmToken, sendFilteredNotification } from "../Controllers/Notification.Controller.js";

/**
 * @openapi
 * /saveorupdatetoken:
 *   post:
 *     summary: Save or update FCM token
 *     description: Stores or updates the FCM token for the authenticated user's device.
 *     tags:
 *       - FCM
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *               - platform
 *               - fcmToken
 *             properties:
 *               deviceId:
 *                 type: string
 *                 example: "device-abc-123"
 *               platform:
 *                 type: string
 *                 enum: [android, ios]
 *                 example: "android"
 *               fcmToken:
 *                 type: string
 *                 example: "eJhbGciOi..."
 *     responses:
 *       200:
 *         description: FCM token saved successfully
 *       400:
 *         description: Missing or invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/saveorupdatetoken",verifyJWT,saveandupdateFcmToken);


/**
 * @openapi
 * /deactivatefcmtoken:
 *   post:
 *     summary: Deactivate an FCM token
 *     description: Marks the provided device's FCM token as inactive for the authenticated user.
 *     tags:
 *       - FCM
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *             properties:
 *               deviceId:
 *                 type: string
 *                 example: "device-abc-123"
 *     responses:
 *       200:
 *         description: FCM token deactivated
 *       400:
 *         description: Device ID is required
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal server error
 */
router.post("/deactivatefcmtoken",verifyJWT,deactivateFcmToken);


/**
 * @openapi
 * /sendNotification:
 *   post:
 *     summary: Send filtered notification (admin)
 *     description: Sends a notification to devices matching provided filters. Admin-only route.
 *     tags:
 *       - FCM
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Offer"
 *               body:
 *                 type: string
 *                 example: "Flat 20% off on select items"
 *               platform:
 *                 type: string
 *                 example: "android"
 *               state:
 *                 type: string
 *                 example: "Karnataka"
 *               city:
 *                 type: string
 *                 example: "Bengaluru"
 *               occupation:
 *                 type: string
 *                 example: "Engineer"
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["gold","savings"]
 *     responses:
 *       200:
 *         description: Notification sent successfully with summary
 *       400:
 *         description: Validation failed or invalid filters
 *       404:
 *         description: No matching devices found
 *       500:
 *         description: Failed to send notification
 */
router.post("/sendNotification",verifyAdminJWT,sendFilteredNotification);


/**
 * @openapi
 * /pastnotifications:
 *   get:
 *     summary: Get past notifications (admin)
 *     description: Returns a list of previously sent notifications. Admin-only route.
 *     tags:
 *       - FCM
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get("/pastnotifications",verifyAdminJWT,getPastNotifications);


export default router;