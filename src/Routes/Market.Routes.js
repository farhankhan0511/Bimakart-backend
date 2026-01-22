import { Router } from "express";
import { getBanners, getTutorialVideos } from "../Controllers/Marketing.controller.js";

const router=Router();

router.get("/banners",getBanners);

router.get("/tutorial-videos",getTutorialVideos);

export default router;