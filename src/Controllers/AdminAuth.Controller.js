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

const generateAccessAndRefreshToken = async (userName) => {
    const author = await Admin.findOne({ userName: userName });
  
    if (!author) throw new Error("Auth record not found");
  
    const accessToken = author.generateAccessToken();
    const refreshToken = author.generateRefreshToken();
  
    author.refreshToken = refreshToken;
    await author.save({ validateBeforeSave: false });
  
    return { accessToken, refreshToken };
  };

export const adminSignup=asynchandler(async(req,res)=>{
    const {userName,password}=req.body;
    try {
        if(!userName || !password){
            return res.status(400).json(new ApiResponse(400,{},"Username and password are required"));
        }
            if(!adminsignupSchema.safeParse({userName,password}).success){
            return res.status(400).json(new ApiResponse(400,{},"Invalid username or password format")); 
        }
        const admin=await Admin.findOne({userName:userName});
        if(admin){
            return res.status(401).json(new ApiResponse(401,{},"Admin already exists"));
        };
        
        const newAdmin=await Admin.create({userName,password});
        const {accessToken,refreshToken}=  await generateAccessAndRefreshToken(userName);
        
        return res.status(201).json(new ApiResponse(201,{userName:newAdmin.userName,accessToken,refreshToken},"Admin created successfully"));
    } catch (error) {
        logger.error(error);
        return res.status(500).json(new ApiResponse(500,{},"Internal server error"))
    }
});

export const adminLogin = asynchandler(async (req, res) => {
    const { userName, password } = req.body;
    try {
        if (!userName || !password) {
            return res.status(400).json(new ApiResponse(400, {},"Username and password are required"));
        };
        if(!adminsignupSchema.safeParse({userName,password}).success){
            return res.status(400).json(new ApiResponse(400,{},"Invalid username or password format")); 
        };
        const admin = await Admin.findOne({ userName: userName });
        if (!admin) {
            return res.status(401).json(new ApiResponse(401, {},"Invalid username or password"));
        }
        const validpassword=await admin.isPasswordCorrect(password)

        

        if(!validpassword){
            return res.status(401).json(new ApiResponse(401, {},"Invalid username or password"));
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(userName);

        return res.status(200).json(new ApiResponse(200, { userName: admin.userName, accessToken, refreshToken },"Login successful"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500,{},"Internal server error"))
    }
});