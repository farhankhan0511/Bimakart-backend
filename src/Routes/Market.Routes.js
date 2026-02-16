import { Router } from "express";
import { uploadimage} from "../Middlewares/upload.middleware.js";
import { DeleteBanner, getBanners, getcoinSettings, getLiveBanners, getTutorialVideos, ToggleBannerStatus, updateSetting, updateTutorialVideo, UploadBanner } from "../Controllers/Marketing.controller.js";
import { verifyAdminJWT } from "../Middlewares/auth.middleware.js";

const router=Router();

/**
 * @openapi
 * /api/marketing/banners:
 *   get:
 *     summary: Get active banners
 *     description: Returns all active banners for display.
 *     tags:
 *       - Market
 *     responses:
 *       200:
 *         description: Banners fetched successfully
 *       404:
 *         description: No active banners found
 *       500:
 *         description: Internal server error
 */
router.get("/banners", getLiveBanners);


/**
 * @openapi
 * /api/marketing/tutorial-videos:
 *   get:
 *     summary: Get tutorial videos
 *     description: Returns an array of tutorial videos and metadata.
 *     tags:
 *       - Market
 *     responses:
 *       200:
 *         description: Tutorial videos fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get("/tutorial-videos",getTutorialVideos);


/**
 * @openapi
 * /api/marketing/allbanners:
 *   get:
 *     summary: Get all banners
 *     description: Returns all banners (active and inactive). Intended for admin use.
 *     tags:
 *       - Market
 *     responses:
 *       200:
 *         description: Banners fetched successfully
 *       404:
 *         description: No banners found
 *       500:
 *         description: Internal server error
 */
router.get("/allbanners",verifyAdminJWT,getBanners);


/**
 * @openapi
 * /api/marketing/uploadbanner:
 *   post:
 *     summary: Upload a banner image
 *     description: Uploads a banner image and creates a banner record. Expects multipart/form-data with `bannerImage` and `web_url`.
 *     tags:
 *       - Market
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - bannerImage
 *               - web_url
 *             properties:
 *               bannerImage:
 *                 type: string
 *                 format: binary
 *               web_url:
 *                 type: string
 *                 example: "https://example.com/landing"
 *     responses:
 *       200:
 *         description: Banner uploaded successfully
 *       400:
 *         description: Image or web_url missing
 *       500:
 *         description: Internal server error or S3 upload failure
 */
router.post("/uploadbanner",verifyAdminJWT,uploadimage.single("bannerImage"),UploadBanner)


/**
 * @openapi
 * /api/marketing/toggle-banner-status:
 *   patch:
 *     summary: Toggle banner active status
 *     description: Toggles the `isActive` flag for a banner by ID.
 *     tags:
 *       - Market
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bannerId
 *             properties:
 *               bannerId:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       200:
 *         description: Banner status updated successfully
 *       400:
 *         description: Banner ID is required
 *       404:
 *         description: Banner not found
 *       500:
 *         description: Internal server error
 */
router.patch("/toggle-banner-status",verifyAdminJWT,ToggleBannerStatus);


/**
 * @openapi
 * /api/marketing/delete-banner:
 *   delete:
 *     summary: Delete a banner
 *     description: Deletes a banner by ID.
 *     tags:
 *       - Market
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bannerId
 *             properties:
 *               bannerId:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       200:
 *         description: Banner deleted successfully
 *       400:
 *         description: Banner ID is required
 *       404:
 *         description: Banner not found
 *       500:
 *         description: Internal server error
 */
router.delete("/delete-banner",verifyAdminJWT,DeleteBanner);


/**
 * @openapi
 * /api/marketing/coin-settings:
 *   get:
 *     summary: Get coin settings
 *     description: Returns all coin settings including key-value pairs.
 *     tags:
 *       - Market
 *     responses:
 *       200:
 *         description: Coin settings fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get("/coin-settings",getcoinSettings)


/**
 * @openapi
 * /api/marketing/update-coin-setting:
 *   put:
 *     summary: Update a coin setting
 *     description: Updates the value of a specific coin setting by key. Requires admin authentication.
 *     tags:
 *       - Market
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *                 example: "coinConversionRate"
 *               value:
 *                 type: number
 *                 example: 100
 *     responses:
 *       200:
 *         description: Setting updated successfully
 *       400:
 *         description: Key and value are required
 *       404:
 *         description: Setting not found
 *       500:
 *         description: Internal server error
 */
router.put("/update-coin-setting",verifyAdminJWT,updateSetting);

router.put("/update-tutorial-video",verifyAdminJWT,updateTutorialVideo);

export default router;