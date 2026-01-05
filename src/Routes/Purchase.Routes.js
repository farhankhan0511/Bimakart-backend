import { Router } from "express";

const router = Router();

import { BuyHealthPolicy, BuyMotorPolicy, BuyRudrakshPolicy } from "../Controllers/PurchasePolicy.Controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

router.post("/buymotorpolicy",verifyJWT, BuyMotorPolicy);
router.post("/buyhealthpolicy", verifyJWT, BuyHealthPolicy);
router.post("/buyrudrakshpolicy", verifyJWT, BuyRudrakshPolicy);


export default router;