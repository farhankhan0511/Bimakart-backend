import bimapi from "../Lib/AxiosClient.js";
import { FcmToken } from "../Models/FCM.Model.js";
import { UserPolicies } from "../Models/UseerPolicies.Model.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asynchandler } from "../Utils/asynchandler.js";
import { checkMobileExistsSchema, referralSchema, updatesSchema } from "../Utils/zodschemas.js";
import logger from "../Utils/logger.js";


const PROFILE_FIELDS = [
  "name",
  "mobile",
  "email",
  "state",
  "city",
  "dob",
  "gender",
  "occupation",
  "interests",
  "heardFrom",
];


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
        result.data.profilecompletionpercentage=calculateProfileCompletion(result.data.profile,PROFILE_FIELDS);
        const plancount={"Gold":0,"Silver":0,"NA":0};
        const policydata= await UserPolicies.findOne({mobile:mobile}).lean();

        
        const policyDetails=policydata?.policies ;
        

        for (let policy of policyDetails || []) {
            if (policy.source ==="basecode") {
                continue; 
            }
           
            if (policy.plan) {
                plancount[policy.plan] = (plancount[policy.plan] || 0) + 1;
            }
        }
     
        if(plancount["Gold"]>0){
            result.data.MembershipPlan="Gold"
        }
        else if(plancount["Silver"]>0){
            result.data.MembershipPlan="Silver"
        }
        else{
            result.data.MembershipPlan="NA"
        }
        
        
        
        return res.status(200).json(new ApiResponse(200,result,"User details retrieved successfully"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500,{},error.message || "Internal server error"));
    }
})


export const updateUserDetails=asynchandler(async(req,res,next)=>{
    try {
        const {currentMobile,updates,referral}=req.body;
        if (!currentMobile) {
            return res.status(400).json(new ApiResponse(400,{},"Mobile number is required"));
        }
        if(!checkMobileExistsSchema.safeParse({mobile:currentMobile}).success){
            return res.status(400).json(new ApiResponse(400,{},"Invalid mobile number format"));
        }
        if(!updates || !updatesSchema.safeParse(updates).success){
            return res.status(400).json(new ApiResponse(400,{},"Invalid updates format"));
        }
        if(referral && !referralSchema.safeParse(referral).success){
            return res.status(400).json(new ApiResponse(400,{},"Invalid referral data format"));
        }
        let response;
        if(referral){
            response=await bimapi.post("/updateUserRecord",{currentMobile:currentMobile,updates, referral}); 
        }
        else{
         response=await bimapi.post("/updateUserRecord",{currentMobile:currentMobile,updates}); 
        }
        if (!response.data.success) {
            return res.status(400).json(new ApiResponse(400,{},response.data.message || "Failed to update user details"));
        }

         try {
            const fcmUpdateData = {};
            
            
            if (updates.state !== undefined) fcmUpdateData.state = updates.state;
            if (updates.city !== undefined) fcmUpdateData.city = updates.city;
            if (updates.occupation !== undefined) fcmUpdateData.occupation = updates.occupation;
            if (updates.interests !== undefined) fcmUpdateData.interests = updates.interests;

            
            if (Object.keys(fcmUpdateData).length > 0) {
                const fcmResult = await FcmToken.updateMany(
                    { mobile: currentMobile },
                    { $set: fcmUpdateData }
                );

                logger.info(
                    `Synced profile data to ${fcmResult.modifiedCount} FCM tokens for mobile: ${currentMobile}`,
                    { updatedFields: Object.keys(fcmUpdateData) }
                );
            }
        } catch (fcmError) {
            // Log FCM sync error but don't fail the main operation
            logger.error(
                `Failed to sync profile data to FCM tokens for mobile: ${currentMobile}`,
                fcmError
            ); 
         }


        return res.status(200).json(new ApiResponse(200,response.data,"Operation completed successfully"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500,{},error.message || "Internal server error"));
    }
})




