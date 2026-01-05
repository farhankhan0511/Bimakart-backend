import { asynchandler } from "../Utils/asynchandler.js";
import bimapi from "../Lib/AxiosClient.js";
import { checkMobileExistsSchema, signupSchema } from "../Utils/zodschemas.js";
import { ApiResponse } from "../Utils/ApiResponse.js";



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
        if(response.data.success){
            return res.status(200).json(new ApiResponse(200,response.data,"User signup successful"));
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
      
        if(response.data.valid){
            return res.status(200).json(new ApiResponse(200,response.data,"Password verification successful"));
        }
        return res.status(400).json(new ApiResponse(400,{},"Invalid mobile number or Wrong password"));
        
    } catch (error) {
        return res.status(500).json(new ApiResponse(500,{},"Internal server error"));
    }
});









