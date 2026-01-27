import { Router } from "express";

const router=Router()

import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/upload.middleware.js";
import { policyanalysis } from "../Controllers/PolicyHawaldar.Controller.js";

/**
 * @openapi
 * /policyanalysis:
 *   post:
 *     summary: Analyze a policy document
 *     description: Uploads a policy document and performs AI-driven analysis. Expects multipart/form-data with a `file` field.
 *     tags:
 *       - PolicyHawaldar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Policy document file to analyze
 *     responses:
 *       200:
 *         description: Policy analysis completed successfully
 *       400:
 *         description: Policy file not found
 *       500:
 *         description: Error during analysis or internal server error
 */
router.post("/policyanalysis",verifyJWT, upload.single("file"),policyanalysis)

export default router;