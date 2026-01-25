import { Router } from "express";

const router = Router();

import { verifyAdminJWT } from "../Middlewares/auth.middleware.js";
import { adminLogin, adminSignup, refreshAccessToken } from "../Controllers/AdminAuth.Controller.js";

router.post("/signup",adminSignup);

router.post("/login",adminLogin);

router.post("/refreshtoken",verifyAdminJWT,refreshAccessToken)






export default router;