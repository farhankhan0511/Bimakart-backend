import { Router } from "express";
import { getUserDetails, updateUserDetails } from "../Controllers/User.Controller.js";
import { getUserPolicies, removeuploadedpolicy, UploadPolicy } from "../Controllers/Policy.Controller.js";
import { upload } from "../Middlewares/upload.middleware.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";


const router=Router()

/**
 * @openapi
 * /api/user/getUserDetails:
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
router.post("/getUserDetails", verifyJWT,getUserDetails);


/**
 * @openapi
 * /api/user/updateUserDetails:
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
router.post("/updateUserDetails", verifyJWT, updateUserDetails);



/**
 * @openapi
 * /api/user/policydata:
 *   post:
 *     summary: Get user policies
 *     description: Retrieves policies for a user. Can optionally refresh policies from external APIs. Uses file locking to prevent redundant requests.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
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
 *               refresh:
 *                 type: boolean
 *                 default: false
 *                 description: Force refresh policies from external APIs instead of using cache
 *     responses:
 *       200:
 *         description: Policies retrieved successfully (from cache or API)
 *       400:
 *         description: Invalid mobile number or refresh parameter
 *       404:
 *         description: No policies found
 *       409:
 *         description: Policy retrieval already in progress for this mobile
 *       500:
 *         description: Internal server error
 */
router.post("/policydata", verifyJWT, getUserPolicies);



/**
 * @openapi
 * /api/user/uploadpolicy:
 *   post:
 *     summary: Upload a policy document
 *     description: Uploads a policy PDF document, extracts policy details via OCR and AI analysis, and stores it against the user's mobile number. Expects multipart/form-data with `newpolicy` file and `mobile` field.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *               - newpolicy
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               newpolicy:
 *                 type: string
 *                 format: binary
 *                 description: Policy PDF file to upload
 *     responses:
 *       200:
 *         description: Policy uploaded and processed successfully
 *       400:
 *         description: Invalid mobile format or policy already exists
 *       404:
 *         description: Policy file not found
 *       500:
 *         description: Error during upload or policy extraction
 */
router.post("/uploadpolicy",verifyJWT,upload.single("newpolicy"),UploadPolicy);


/**
 * @openapi
 * /api/user/removepolicy:
 *   post:
 *     summary: Remove a policy document
 *     description: Removes a user's uploaded policy by setting its visibility to hidden (0).
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *               - policyNumber
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               policyNumber:
 *                 type: string
 *                 example: "POL123456"
 *     responses:
 *       200:
 *         description: Policy removed successfully
 *       400:
 *         description: Mobile and Policy Number are required
 *       404:
 *         description: No policies found or Policy not found
 *       500:
 *         description: Internal server error
 */
router.post("/removepolicy",verifyJWT,removeuploadedpolicy);






export default router;