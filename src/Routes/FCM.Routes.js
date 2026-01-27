
import { Router } from "express";

const router = Router();


import { verifyAdminJWT, verifyJWT } from "../Middlewares/auth.middleware.js";
import { deactivateFcmToken, getPastNotifications, saveandupdateFcmToken, sendFilteredNotification } from "../Controllers/Notification.Controller.js";

router.post("/saveorupdatetoken",verifyJWT,saveandupdateFcmToken);

router.post("/deactivatefcmtoken",verifyJWT,deactivateFcmToken);

router.post("/sendNotification",verifyAdminJWT,sendFilteredNotification);

router.get("/pastnotifications",verifyAdminJWT,getPastNotifications);


export default router;