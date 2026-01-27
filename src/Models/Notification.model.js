// Models/FcmToken.model.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
 title: { type: String, required: true },
 body: { type: String, required: true },
 filters: {
   state: String,
    city: String,
    occupation: String,
    platform: { type: String, enum: ["android", "ios"] },
    interests: [String],
    },
}, { timestamps: true });



export const Notifications = mongoose.model("Notifications", NotificationSchema);
