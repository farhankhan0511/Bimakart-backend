import { Router } from "express";

const router = Router();

import { BuyHealthPolicy, BuyMemebershipPlan, BuyMotorPolicy, BuyRudrakshPolicy, ReferandEarn } from "../Controllers/PurchasePolicy.Controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

router.post("/buymotorpolicy",verifyJWT, BuyMotorPolicy);
router.post("/buyhealthpolicy", verifyJWT, BuyHealthPolicy);
router.post("/buyrudrakshpolicy", verifyJWT, BuyRudrakshPolicy);
router.post("/buymembership", verifyJWT, BuyMemebershipPlan);
router.post("/referandearn", verifyJWT, ReferandEarn);


export default router;