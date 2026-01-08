import { Router } from "express";
import { getBanners } from "../Controllers/Marketing.controller.js";

const router=Router();

router.get("/banners",getBanners)

export default router;