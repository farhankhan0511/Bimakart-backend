import { Router } from "express";
import { uploadimage} from "../Middlewares/upload.middleware.js";
import { DeleteBanner, getBanners, getLiveBanners, getTutorialVideos, ToggleBannerStatus, UploadBanner } from "../Controllers/Marketing.controller.js";

const router=Router();

/**
 * @openapi
 * /banners:
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
router.get("/banners",getLiveBanners);


/**
 * @openapi
 * /tutorial-videos:
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
 * /allbanners:
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
router.get("/allbanners",getBanners);


router.post("/uploadbanner",uploadimage.single("bannerImage"),UploadBanner)

router.post("/toggle-banner-status",ToggleBannerStatus);

router.post("/delete-banner",DeleteBanner);

export default router;