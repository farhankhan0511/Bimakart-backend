import { Router } from "express";
import { Preapprovalcheck } from "../Controllers/Payment.Controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const router=Router()

/**
 * @openapi
 * /preapprovalcheck:
 *   post:
 *     summary: Loan pre-approval check
 *     description: Performs a pre-approval check for a loan based on user details like PAN, DOB, loan amount, and contact information.
 *     tags:
 *       - Loan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pan
 *               - mobileNo
 *               - pinCode
 *               - dob
 *               - loanAmount
 *               - customerName
 *             properties:
 *               pan:
 *                 type: string
 *                 example: "BNMPS1565C"
 *               mobileNo:
 *                 type: string
 *                 example: "9921337592"
 *               pinCode:
 *                 type: string
 *                 example: "411018"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1984-02-10"
 *               loanAmount:
 *                 type: string
 *                 example: "50000"
 *               customerName:
 *                 type: string
 *                 example: "SACHIN BALKRUSHNA SHELAR"
 *     responses:
 *       200:
 *         description: Pre-approval check completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     payLoad:
 *                       type: object
 *                       properties:
 *                         amount:
 *                           type: number
 *                           example: 20000
 *                         status:
 *                           type: string
 *                           example: "approved"
 *                 message:
 *                   type: string
 *                   example: "Pre-approval check completed successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid loan request format or pre-approval failed
 *       500:
 *         description: Internal server error
 */
router.post("/preapprovalcheck", verifyJWT, Preapprovalcheck);


export default router;