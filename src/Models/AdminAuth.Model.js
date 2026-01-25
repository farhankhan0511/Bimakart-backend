import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";

const AdminSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
        unique: true,
        index: true,
        trim: true,
    },
    password:{
        type:String,
        required:true
    },
    refreshToken:{
        type:String
    }
  },
  
  { timestamps: true }
)

AdminSchema.pre("save",async function (){
    if(!this.isModified("password")) return 
    this.password=await bcrypt.hash(this.password,10);
    
})

AdminSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}


AdminSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        _id:this._id,
        userName:this.userName

    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

AdminSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      userName: this.userName,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};


export const Admin = mongoose.model("admins", AdminSchema);