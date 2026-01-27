import { Router } from "express";

const router = Router();

import { BuyHealthPolicy, BuyMemebershipPlan, BuyMotorPolicy, BuyRudrakshPolicy, ReferandEarn } from "../Controllers/PurchasePolicy.Controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

/**
 * @openapi
 * /buymotorpolicy:
 *   post:
 *     summary: Purchase a motor insurance policy
 *     description: Submits a motor insurance policy purchase request with vehicle and contact details.
 *     tags:
 *       - Purchase
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - vehicleNumber
 *               - mobileNumber
 *               - whatsappNumber
 *               - vehicleType
 *               - paymentMode
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Raj Kumar"
 *               vehicleNumber:
 *                 type: string
 *                 example: "MH02AB1234"
 *               mobileNumber:
 *                 type: string
 *                 example: "9876543210"
 *               whatsappNumber:
 *                 type: string
 *                 example: "9876543210"
 *               vehicleType:
 *                 type: string
 *                 example: "Car"
 *               paymentMode:
 *                 type: string
 *                 example: "Monthly"
 *     responses:
 *       200:
 *         description: Motor policy purchase data submitted successfully
 *       400:
 *         description: Missing fields or validation failed
 *       500:
 *         description: Server error
 */
router.post("/buymotorpolicy",verifyJWT, BuyMotorPolicy);


/**
 * @openapi
 * /buyhealthpolicy:
 *   post:
 *     summary: Purchase a health insurance policy
 *     description: Submits a health insurance policy purchase request with personal and coverage details.
 *     tags:
 *       - Purchase
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - mobile
 *               - insureFor
 *               - whatsappNumber
 *               - pinCode
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Priya"
 *               lastName:
 *                 type: string
 *                 example: "Singh"
 *               email:
 *                 type: string
 *                 example: "priya@example.com"
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               insureFor:
 *                 type: string
 *                 example: "Self"
 *               whatsappNumber:
 *                 type: string
 *                 example: "9876543210"
 *               pinCode:
 *                 type: string
 *                 example: "400001"
 *     responses:
 *       200:
 *         description: Health policy purchase data submitted successfully
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Server error
 */
router.post("/buyhealthpolicy", verifyJWT, BuyHealthPolicy);


/**
 * @openapi
 * /buyrudrakshpolicy:
 *   post:
 *     summary: Purchase a Rudraksh insurance policy
 *     description: Submits a Rudraksh insurance policy purchase request with personal, nominee, and coverage details.
 *     tags:
 *       - Purchase
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prefix
 *               - firstName
 *               - lastName
 *               - dob
 *               - mobile
 *               - gender
 *               - email
 *               - pan
 *               - nomineeName
 *               - nomineeRelation
 *               - nomineeAge
 *             properties:
 *               prefix:
 *                 type: string
 *                 example: "Mr."
 *               firstName:
 *                 type: string
 *                 example: "Arjun"
 *               lastName:
 *                 type: string
 *                 example: "Patel"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-15"
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               gender:
 *                 type: string
 *                 example: "Male"
 *               email:
 *                 type: string
 *                 example: "arjun@example.com"
 *               pan:
 *                 type: string
 *                 example: "ABCDE1234F"
 *               nomineeName:
 *                 type: string
 *                 example: "Pooja Patel"
 *               nomineeRelation:
 *                 type: string
 *                 example: "Spouse"
 *               nomineeAge:
 *                 type: integer
 *                 example: 28
 *     responses:
 *       200:
 *         description: Rudraksh policy purchase data submitted successfully
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Server error
 */
router.post("/buyrudrakshpolicy", verifyJWT, BuyRudrakshPolicy);


/**
 * @openapi
 * /buymembership:
 *   post:
 *     summary: Purchase a membership plan
 *     description: Submits a membership plan purchase request.
 *     tags:
 *       - Purchase
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - mobile
 *               - plan
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Ananya"
 *               lastName:
 *                 type: string
 *                 example: "Nair"
 *               email:
 *                 type: string
 *                 example: "ananya@example.com"
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               plan:
 *                 type: string
 *                 example: "Premium"
 *     responses:
 *       200:
 *         description: Membership plan purchase data submitted successfully
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Server error
 */
router.post("/buymembership", verifyJWT, BuyMemebershipPlan);


/**
 * @openapi
 * /referandearn:
 *   post:
 *     summary: Refer a contact for insurance
 *     description: Submits a referral request for an insurance product. The referring user's mobile is captured from JWT.
 *     tags:
 *       - Purchase
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - contactNumber
 *               - relationship
 *               - insuranceType
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Vikram Sharma"
 *               contactNumber:
 *                 type: string
 *                 example: "9876543210"
 *               relationship:
 *                 type: string
 *                 example: "Friend"
 *               insuranceType:
 *                 type: string
 *                 example: "Motor"
 *     responses:
 *       200:
 *         description: Referral submitted successfully
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Server error
 */
router.post("/referandearn", verifyJWT, ReferandEarn);


export default router;