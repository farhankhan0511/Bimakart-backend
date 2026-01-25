import { Admin } from "../Models/AdminAuth.Model.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asynchandler } from "../Utils/asynchandler.js";
import logger from "../Utils/logger.js";
import { adminsignupSchema } from "../Utils/zodschemas.js";
import jwt from "jsonwebtoken";


export const refreshAccessToken = asynchandler(async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      return res.status(401).json(new ApiResponse(401, {}, "Refresh token required"));
    }
  
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json(
        new ApiResponse(401, {}, "Refresh token expired or invalid")
      );
    }
  
    const auth = await Admin.findById(decoded._id);
    if (!auth || auth.refreshToken !== refreshToken) {
      return res.status(401).json(new ApiResponse(401, {}, "Invalid refresh token"));
    }
  
    const newAccessToken = auth.generateAccessToken();
  
    return res.status(200).json(
      new ApiResponse(200, { accessToken: newAccessToken }, "Token refreshed")
    );
  
  } catch (error) {
    return res.status(500).json(new ApiResponse(500,{},"Internal server error"))
  }});

const generateAccessAndRefreshToken = async (email) => {
    const author = await Admin.findOne({ email: email });
  
    if (!author) throw new Error("Auth record not found");
  
    const accessToken = author.generateAccessToken();
    const refreshToken = author.generateRefreshToken();
  
    author.refreshToken = refreshToken;
    await author.save({ validateBeforeSave: false });
  
    return { accessToken, refreshToken };
  };

export const adminSignup=asynchandler(async(req,res)=>{
    const {email,password}=req.body;
    try {
        if(!email || !password){
            return res.status(400).json(new ApiResponse(400,{},"Email and password are required"));
        }
            if(!adminsignupSchema.safeParse({email,password}).success){
            return res.status(400).json(new ApiResponse(400,{},"Invalid email or password format")); 
        }
        const admin=await Admin.findOne({email:email});
        if(admin){
            return res.status(401).json(new ApiResponse(401,{},"Admin already exists"));
        };
        
        const newAdmin=await Admin.create({email,password});
        const {accessToken,refreshToken}=  await generateAccessAndRefreshToken(email);

        return res.status(201).json(new ApiResponse(201,{email:newAdmin.email,accessToken,refreshToken},"Admin created successfully"));
    } catch (error) {
        logger.error(error);
        return res.status(500).json(new ApiResponse(500,{},"Internal server error"))
    }
});

export const adminLogin = asynchandler(async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json(new ApiResponse(400, {},"Email and password are required"));
        };
        if(!adminsignupSchema.safeParse({email,password}).success){
            return res.status(400).json(new ApiResponse(400,{},"Invalid email or password format")); 
        };
        const admin = await Admin.findOne({ email: email });
        if (!admin) {
            return res.status(401).json(new ApiResponse(401, {},"Invalid email or password"));
        }
        const validpassword=await admin.isPasswordCorrect(password)

        

        if(!validpassword){
            return res.status(401).json(new ApiResponse(401, {},"Invalid email or password"));
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(email);

        return res.status(200).json(new ApiResponse(200, { email: admin.email, accessToken, refreshToken },"Login successful"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500,{},"Internal server error"))
    }
});