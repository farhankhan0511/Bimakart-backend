import mongoose from "mongoose";
import jwt from "jsonwebtoken"

const BannerSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
  },
    webUrl:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    }
  },
  
  { timestamps: true }
)

export const Banner = mongoose.model("banners", BannerSchema);