import { Router } from "express";
import { getUserDetails, updateUserDetails } from "../Controllers/User.Controller.js";
import { getUserPolicies } from "../Controllers/Policy.Controller.js";


const router=Router()

/**
 * @openapi
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


/**
 * @openapi
 * /updateUserDetails:
 *   post:
 *     summary: Update user details
 *     description: Updates user profile information using current mobile number.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentMobile
 *               - updates
 *             properties:
 *               currentMobile:
 *                 type: string
 *                 example: "9876543666"
 *               updates:
 *                 type: object
 *                 properties:
 *                   mobile:
 *                     type: string
 *                     example: "9123456878"
 *                   name:
 *                     type: string
 *                     example: "Amit Shah"
 *                   email:
 *                     type: string
 *                     example: "test@test.com"
 *                   dob:
 *                     type: string
 *                     format: date
 *                     example: "1995-01-01"
 *                   gender:
 *                     type: string
 *                     example: "Male"
 *                   occupation:
 *                     type: string
 *                     example: "Engineer"
 *                   password:
 *                     type: string
 *                     example: "GUyhkfgbuigiwGIUgui"
 *     responses:
 *       200:
 *         description: User details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentMobile:
 *                   type: string
 *                 updates:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/updateUserDetails", updateUserDetails);

/**
 * @openapi
 * /policydata:
 *   post:
 *     summary: Get user policy data
 *     description: Retrieves user details along with all associated motor insurance policies.
 *     tags:
 *       - Policy
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
 *                 example: "9770942698"
 *               refresh:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User policies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User policies retrieved successfully from API
 *                 data:
 *                   type: object
 *                   properties:
 *                     source:
 *                       type: string
 *                       example: api
 *                     data:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "69567864964afdd1965d3730"
 *                         mobile:
 *                           type: string
 *                           example: "9770942698"
 *                         processing:
 *                           type: object
 *                           properties:
 *                             inProgress:
 *                               type: boolean
 *                               example: false
 *                         policies:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "215067/50/26/000005/000025"
 *                               fileName:
 *                                 type: string
 *                                 example: "policy_9770942698_1.pdf"
 *                               timestamp:
 *                                 type: string
 *                                 format: date-time
 *                               manual_id:
 *                                 type: string
 *                               source:
 *                                 type: string
 *                                 example: url
 *                               motorInsurancePolicy:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   customerName:
 *                                     type: string
 *                                   contactNumber:
 *                                     type: string
 *                                     nullable: true
 *                                   policyNumber:
 *                                     type: string
 *                                   policyType:
 *                                     type: string
 *                                     nullable: true
 *                                   policyStartDate:
 *                                     type: string
 *                                     format: date
 *                                   policyEndDate:
 *                                     type: string
 *                                     format: date
 *                                   emailId:
 *                                     type: string
 *                                   vehicleMakeModel:
 *                                     type: string
 *                                     nullable: true
 *                                   policyIssueDate:
 *                                     type: string
 *                                     format: date
 *                                   totalIdv:
 *                                     type: number
 *                                     nullable: true
 *                                   netPremium:
 *                                     type: number
 *                                   grossPremium:
 *                                     type: number
 *                                   insurerName:
 *                                     type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Invalid request payload
 *       500:
 *         description: Internal server error
 */


router.post("/policydata", getUserPolicies);




export default router;