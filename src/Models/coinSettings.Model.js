import mongoose from "mongoose";

const coinSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    value: {
      type: Number,
      required: true
    },
  },
  { timestamps: true }
);

export const coinSettings = mongoose.model("coinSettings", coinSettingsSchema);
