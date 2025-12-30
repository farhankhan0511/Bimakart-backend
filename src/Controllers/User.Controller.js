import bimapi from "../Lib/AxiosClient.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../Utils/asynchandler.js";
import { checkMobileExistsSchema } from "../Utils/zodschemas.js";

// This is an api to get user details from salesforce
export const getUserDetails=asynchandler(async(req,res,next)=>{
    try {
        const {mobile}=req.body;
        if (!mobile) {
            return res.status(400).json(new ApiResponse(400,{},"Mobile number is required"));
        }
        if(!checkMobileExistsSchema.safeParse({mobile}).success){
            return res.status(400).json(new ApiResponse(400,{},"Invalid mobile number format"));
        }
        const response=await bimapi.post("/getUserDetails",{mobile});    
        const result=JSON.parse(response.data);        
        if (!result.found) {
            return res.status(404).json(new ApiResponse(404,{},"User not found"));
        }
        return res.status(200).json(new ApiResponse(200,result,"User details retrieved successfully"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500,{},error.message || "Internal server error"));
    }
})

