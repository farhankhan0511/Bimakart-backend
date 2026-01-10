import bimapi from "../Lib/AxiosClient.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asynchandler } from "../Utils/asynchandler.js";
import { checkMobileExistsSchema, updatesSchema } from "../Utils/zodschemas.js";


function calculateProfileCompletion(profile, fields) {
  let filledCount = 0;

  fields.forEach((field) => {
    const value = profile[field];

    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0)
    ) {
      filledCount++;
    }
  });

  const percentage = Math.round((filledCount / fields.length) * 100);

  return percentage;
}


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
        result.data.profilecompletionpercentage=calculateProfileCompletion(result.data,Object.keys(result.data))
        
        return res.status(200).json(new ApiResponse(200,result,"User details retrieved successfully"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500,{},error.message || "Internal server error"));
    }
})


export const updateUserDetails=asynchandler(async(req,res,next)=>{
    try {
        const {currentMobile,updates}=req.body;
        if (!currentMobile) {
            return res.status(400).json(new ApiResponse(400,{},"Mobile number is required"));
        }
        if(!checkMobileExistsSchema.safeParse({mobile:currentMobile}).success){
            return res.status(400).json(new ApiResponse(400,{},"Invalid mobile number format"));
        }
        if(!updates || !updatesSchema.safeParse(updates).success){
            return res.status(400).json(new ApiResponse(400,{},"Invalid updates format"));
        }
        const response=await bimapi.post("/updateUserRecord",{currentMobile:currentMobile,updates});   


        return res.status(200).json(new ApiResponse(200,response.data,"Operation completed successfully"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500,{},error.message || "Internal server error"));
    }
})




