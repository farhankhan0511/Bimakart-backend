// Models/FcmToken.model.js
import mongoose from "mongoose";

const fcmTokenSchema = new mongoose.Schema({
  mobile: { type: String, required: true, index: true },
  deviceId: { type: String, required: true },
  platform: { type: String, enum: ["android", "ios"], required: true },
  fcmToken: { type: String, required: true },
  state: String,
  city: String,
  occupation: String,
  interests: [String],
  isActive: { type: Boolean, default: true },
  lastSeenAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Composite unique index (acts like composite primary key)
fcmTokenSchema.index({ mobile: 1, deviceId: 1 }, { unique: true });

// Useful extra indexes
fcmTokenSchema.index({ platform: 1, isActive: 1 });
fcmTokenSchema.index({ state: 1 });
fcmTokenSchema.index({ city: 1 });
fcmTokenSchema.index({ interests: 1 });

export const FcmToken = mongoose.model("FcmToken", fcmTokenSchema);
