import { Router } from "express";

const router = Router();

import { AddReferral, BuyElderPolicy, BuyHealthPolicy, BuyLifePolicy, BuyMemebershipPlan, BuyMotorPolicy, BuyRudrakshPolicy, policyRenewal, ReferandEarn } from "../Controllers/PurchasePolicy.Controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

/**
 * @openapi
 * /api/purchase/buymotorpolicy:
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
 * /api/purchase/buyhealthpolicy:
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
 * /api/purchase/buylifepolicy:
 *   post:
 *     summary: Purchase a life insurance policy
 *     description: Submits a life insurance policy purchase request with personal and coverage details.
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
router.post("/buylifepolicy", verifyJWT, BuyLifePolicy);



/**
 * @openapi
 * /api/purchase/buyelderlypolicy:
 *   post:
 *     summary: Purchase an elderly insurance policy
 *     description: Submits an elderly insurance policy purchase request with personal and coverage details.
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
router.post("/buyelderlypolicy", verifyJWT, BuyElderPolicy);




/**
 * @openapi
 * /api/purchase/buyrudrakshpolicy:
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
 * /api/purchase/buymembership:
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
 * /api/purchase/referandearn:
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


/**
 * @openapi
 * /api/purchase/addreferral:
 *   post:
 *     summary: Add a referral
 *     description: Submits a referral with source code and contact details. The referrer's mobile is captured from JWT.
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
 *               - source
 *               - referralCode
 *               - referrerNumber
 *               - referredNumber
 *               - relation
 *               - referralName
 *             properties:
 *               source:
 *                 type: string
 *                 example: "web"
 *               referralCode:
 *                 type: string
 *                 example: "REF123456"
 *               referrerNumber:
 *                 type: string
 *                 example: "9876543210"
 *               referredNumber:
 *                 type: string
 *                 example: "9123456789"
 *               relation:
 *                 type: string
 *                 example: "Friend"
 *               referralName:
 *                 type: string
 *                 example: "John Doe"
 *     responses:
 *       200:
 *         description: Referral added successfully
 *       400:
 *         description: Validation failed or Failed to add referral
 *       500:
 *         description: Internal server error
 */
router.post("/addreferral", verifyJWT, AddReferral);


/**
 * @openapi
 * /api/purchase/policyrenewal:
 *   post:
 *     summary: Renew an existing insurance policy
 *     description: Submits a policy renewal request with policy and contact details.
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
 *               - FirstName
 *               - LastName
 *               - MobilePhone
 *               - Policy_Category
 *               - Policy_Type
 *             properties:
 *               FirstName:
 *                 type: string
 *                 example: "Raj"
 *               LastName:
 *                 type: string
 *                 example: "Kumar"
 *               MobilePhone:
 *                 type: string
 *                 example: "9876543210"
 *               Policy_Category:
 *                 type: string
 *                 enum:
 *                   - NEW_POLICY
 *                   - POLICY_RENEWAL
 *                 example: "POLICY_RENEWAL"
 *               Policy_Type:
 *                 type: string
 *                 enum:
 *                   - VEHICLE
 *                   - LIFE
 *                   - HEALTH
 *                   - PA
 *                   - OTHER
 *                 example: "VEHICLE"
 *               Bimacoins_Redeemed:
 *                 type: number
 *                 example: 100
 *               Total_Discount:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Policy renewal data submitted successfully
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Server error
 */
router.post("/policyrenewal", verifyJWT, policyRenewal);


export default router;