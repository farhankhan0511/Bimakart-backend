import { Router } from "express";

const router = Router();

import { BuyHealthPolicy, BuyMotorPolicy, BuyRudrakshPolicy } from "../Controllers/PurchasePolicy.Controller.js";

router.post("/buymotorpolicy", BuyMotorPolicy);
router.post("/buyhealthpolicy", BuyHealthPolicy);
router.post("/buyrudrakshpolicy", BuyRudrakshPolicy);


export default router;