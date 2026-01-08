import { Router } from "express";

const router=Router()

import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/upload.middleware.js";
import { policyanalysis } from "../Controllers/PolicyHawaldar.Controller.js";

router.post("/policyanalysis",verifyJWT, upload.single("file"),policyanalysis)

export default router;