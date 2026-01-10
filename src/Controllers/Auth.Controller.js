import { asynchandler } from "../Utils/asynchandler.js";
import bimapi from "../Lib/AxiosClient.js";
import { checkMobileExistsSchema, signupSchema } from "../Utils/zodschemas.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { authtokens } from "../Models/Auth.Model.js";
import jwt from "jsonwebtoken"
import admin from "../Utils/firebase.js";


const normalize = (num) => num?.toString().replace(/\D/g, "").slice(-10);


// just an helper fuction to check mobile exist or not #currently not used anywhere
async function checkMobileNumberExists(mobile){
    try {
        if (!mobile && checkMobileExistsSchema.safeParse({mobile}).success) {
            return false
        }
        const response=await bimapi.post("/CheckMobileAccount",{mobile});
        return response.data.exists;

        
    } catch (error) {
        throw new Error("Error checking mobile number existence");
    }
}


const generateAccessAndRefreshToken = async (mobile) => {
  const author = await authtokens.findOne({ mobile });

  if (!author) throw new Error("Auth record not found");

  const accessToken = author.generateAccessToken();
  const refreshToken = author.generateRefreshToken();

  author.refreshToken = refreshToken;
  await author.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};


// This will be used wether a mobile number already exist on the salesforce db or not
export const checkMobileExist=asynchandler(async(req,res,next)=>{
    try {
        const {mobile}=req.body;
        if (!mobile) {
            return res.status(400).json(new ApiResponse(400,{},"Mobile number is required"));
        }
        if(!checkMobileExistsSchema.safeParse({mobile}).success){
            return res.status(400).json(new ApiResponse(400,{},"Invalid mobile number format"));
        }

        const response=await bimapi.post("/checkMobileAccount",{mobile});
        const result=JSON.parse(response.data);
        return res.status(200).json(new ApiResponse(200,result,"Mobile number check successful"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500,{},error.message || "Internal server error"));
    }
})


// Sign up and create an user account on the salesforce db
export const SignupUser=asynchandler(async(req,res,next)=>{
    try {
        const {mobile,name,source,password}=req.body;
        if (!!!signupSchema.safeParse({mobile,name,source,password}).success) {
            return  res.status(400).json(new ApiResponse(400,{},"Invalid signup data"));
        }
       
        const response=await bimapi.post("/accountSignupUser",{mobile,name,source,password});
        if (response.data.success ===null) {
            return res.status(400).json(new ApiResponse(400,{},response.data.message || "Mobile already exists"));
        } 
        await authtokens.findOneAndUpdate(
        { mobile },
        {},
        { upsert: true, new: true }
        );

        const {accessToken,refreshToken}= await generateAccessAndRefreshToken(mobile)     

        if(response.data.success){
            return res.status(200).json(new ApiResponse(200,{data:response.data,accessToken:accessToken,refreshToken:refreshToken},"User signup successful"));
        }
        
        return res.status(400).json(new ApiResponse(400,{},response.data.message || "Bad Request or Mobile already exists"));

        
    } catch (error) {
        return res.status(500).json(new ApiResponse(500,{},"Internal server error"));
    }
})
  

//This will be used to verify password and login the user
export const VerifyPassword=asynchandler(async(req,res,next)=>{
    try {
        const {mobile,encryptedPassword}=req.body;
        if (!mobile || !encryptedPassword ) {
            return res.status(400).json(new ApiResponse(400,{},"Mobile number and encrypted password are required"));
        }
        if (!checkMobileExistsSchema.safeParse({mobile}).success) {
            return res.status(400).json(new ApiResponse(400,{},"Invalid mobile number format"));
        }
        const response=await bimapi.post("/verifyPasswordAccount",{mobile,encryptedPassword});
        await authtokens.findOneAndUpdate(
            { mobile },
            {},
            { upsert: true, new: true }
            );

        
      
        if(!response.data.valid){
            return res.status(400).json(new ApiResponse(400,{},"Invalid mobile number or Wrong password"));
        }
        const {accessToken,refreshToken}= await generateAccessAndRefreshToken(mobile) 
        return res.status(200).json(new ApiResponse(200,{data:response.data,accessToken:accessToken,refreshToken:refreshToken},"Password verification successful"));
        
    } catch (error) {
        return res.status(500).json(new ApiResponse(500,{},error.message ||"Internal server error"));
    }
});


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
  
    const auth = await authtokens.findById(decoded._id);
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


  // this will be used by users who sign in using otp
export const getUserTokens =asynchandler(async(req,res) =>{
    const {mobile,token}=req.body;
    try {
        if (!mobile) {
            return res.status(400).json(new ApiResponse(400,{},"Mobile number is required"));
        } 
        if (!token) {
            return res.status(400).json(new ApiResponse(400,{},"Token is required"));
        }          
        const decoded = await admin.auth().verifyIdToken(token);

        if (normalize(decoded.phone_number) != normalize(mobile)){
            return res.status(400).json(new ApiResponse(400,{},"Invalid Token"))
        }
        await authtokens.findOneAndUpdate(
            { mobile:mobile },
            {},
            { upsert: true, new: true }
            );
        
        const {accessToken,refreshToken}= await generateAccessAndRefreshToken(mobile)
        return res.status(200).json(new ApiResponse(200,{accessToken:accessToken,refreshToken:refreshToken},"Tokens fetched successfully"))
        
        
        
    } catch (error) {
        return res.status(500).json(new ApiResponse(500,{},error.message || "Error while generating Tokens"))
    }

});






