import axios from "axios";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asynchandler } from "../Utils/asynchandler.js";
import { loanRequestSchema } from "../Utils/zodschemas.js";

export const Preapprovalcheck = asynchandler(async(req,res,next)=>{
    const {pan,mobileNo,pinCode,dob,loanAmount,customerName}=req.body;
    try {
    
        if(!loanRequestSchema.safeParse(req.body).success){
            return res.status(400).json(new ApiResponse(400,{},"Invalid loan request format"));
        }
        const response=await axios.post(`${process.env.PAYMENT_API}/preapprovalCheck`,{
            pan,
            mobileNo,
            pinCode,
            dob,
            loanAmount,
            customerName
        },{
            headers:{
                'Content-Type':'application/json',
                "Authorization": `${process.env.PAYMENT_API_KEY}`
            },
           
        });

        if (!response.data.status===200) {
            return res.status(400).json(new ApiResponse(400,{},"Pre-approval check failed"));
        }
        return res.status(200).json(new ApiResponse(200,response.data.entity,"Pre-approval check completed successfully"));

                
        } catch (error) {
        return res.status(500).json(new ApiResponse(500,{},"Internal server error"));
        }

});