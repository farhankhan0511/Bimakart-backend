import { Router } from "express";
import { uploadimage} from "../Middlewares/upload.middleware.js";
import { DeleteBanner, getBanners, getLiveBanners, getTutorialVideos, ToggleBannerStatus, UploadBanner } from "../Controllers/Marketing.controller.js";

const router=Router();

router.get("/banners",getLiveBanners);
router.get("/tutorial-videos",getTutorialVideos);

router.get("/allbanners",getBanners);


router.post("/uploadbanner",uploadimage.single("bannerImage"),UploadBanner)

router.post("/toggle-banner-status",ToggleBannerStatus);

router.post("/delete-banner",DeleteBanner);

export default router;