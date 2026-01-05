import mongoose from "mongoose";
import jwt from "jsonwebtoken"

const AuthSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
        unique: true,
        index: true,
        trim: true,
    },
    refreshToken:{
        type:String
    }
  },
  
  { timestamps: true }
)

AuthSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        _id:this._id,
        mobile:this.mobile

    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

AuthSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      mobile: this.mobile,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};


export const authtokens = mongoose.model("authokens", AuthSchema);