import axios from "axios";
import { asynchandler } from "../Utils/asynchandler.js";
import { HealthInsuranceSchema, MotorPolicySchema, PlanSchema, ReferandEarnSchema, RudrakshSchema } from "../Utils/zodschemas.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { success } from "zod";


export const BuyMotorPolicy = asynchandler(async (req, res) => {
    const {fullName,vehicleNumber,mobileNumber,whatsappNumber,vehicleType,paymentMode} =req.body;
    try {
        if(!fullName || !vehicleNumber || !mobileNumber || !whatsappNumber || !vehicleType || !paymentMode){
            return res.status(400).json({message:"All fields are required"});
        }
        const parsed=MotorPolicySchema.safeParse(req.body);
        if (!parsed.success) {
            return  res.status(400).json({message:"Validation failed"});
          }

           const params = new URLSearchParams();
            params.append("retURL", process.env.retURL || "");
            params.append("oid", process.env.OID || "");
            params.append("lead_source", "Digital Medium");
            params.append("source", "App");
            params.append("Policy", "Application - Motor Insurance");

            params.append("fullName", fullName);
            params.append("vehicleNumber", vehicleNumber);
            params.append("mobileNumber", mobileNumber);
            params.append("whatsappNumber", whatsappNumber);
            params.append("vehicleType", vehicleType);
            params.append("paymentMode", paymentMode);

          const response =await axios.post(process.env.PolicyPurchaseURL, params.toString(),  {headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      responseType: "html", 
      maxRedirects: 5,
      timeout: 15000,
    });
    if (response.status !== 200) {
        return res.status(502).json(new ApiResponse(false, "Failed to process the policy purchase", null));
    }
        return res.status(200).json(new ApiResponse(200,{success:true},"Your data has been sent successfully "))


    } catch (error) {
        return res.status(500).json({message:"Server Error", error:error.message});
    }

});

export const BuyHealthPolicy = asynchandler(async (req, res) => {
    const parsed=HealthInsuranceSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(new ApiResponse(false,  "Validation failed", null));
      }
      try {
        const {
    firstName,
    lastName,
    email,
    mobile,
    insureFor,
    whatsappNumber,
    pinCode,
  } = parsed.data;

  const params = new URLSearchParams();
    params.append("oid", process.env.OID || "");
    params.append("retURL", process.env.retURL);
    params.append("lead_source", "Digital Medium");
    params.append("source", "App");
    params.append("Policy", "Application - Health Insurance");
    params.append("firstName", firstName);
    params.append("lastName", lastName);
    params.append("insureFor", insureFor);
    params.append("email", email);
    params.append("mobile", mobile);
    params.append("whatsappNumber", whatsappNumber);
    params.append("pinCode", pinCode);

    const response = await axios.post(process.env.PolicyPurchaseURL, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      responseType: "html",
    });
        if (response.status !== 200) {
            return res.status(502).json(new ApiResponse(false, "Failed to process the policy purchase", null));
        }
           return res.status(200).json(new ApiResponse(200,{success:true},"Your data has been sent successfully "))
      } catch (error) {
        return res.status(500).json(new ApiResponse(false, "Server Error", null));
      }

});


export const BuyRudrakshPolicy = asynchandler(async (req, res) => {
    const parsed=RudrakshSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(new ApiResponse(false, "Validation failed", null));
      }
      try {
        const {
      prefix,
      firstName,
      lastName,
      dob,
      mobile,
      gender,
      email,
      pan,
      nomineeName,
      nomineeRelation,
      nomineeAge,
    } = parsed.data;
     const params = new URLSearchParams();
  
    // Required Salesforce fields
    params.append("oid", process.env.OID || "");
    params.append("retURL", process.env.retURL);
    params.append("lead_source", "Digital Medium");
    params.append("Policy", "Application - Rudraksh Insurance");
    params.append("source", "App");
  
    params.append("prefix", prefix);
    params.append("firstName", firstName);
    params.append("lastName", lastName);
    params.append("dob", dob);
    params.append("mobile", mobile);
    params.append("gender", gender);
    params.append("email", email);
    params.append("pan", pan);
    params.append("nomineeName", nomineeName);
    params.append("nomineeRelation", nomineeRelation);
    params.append("nomineeAge", nomineeAge.toString());
  
    const response = await axios.post(process.env.PolicyPurchaseURL, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      responseType: "html", 
      maxRedirects: 5,
      timeout: 15000,
    });
      if (response.status !== 200) {
          return res.status(502).json(new ApiResponse(false, "Failed to process the policy purchase", null));
      }
           return res.status(200).json(new ApiResponse(200,{success:true},"Your data has been sent successfully "))
      } catch (error) {
        return res.status(500).json(new ApiResponse(false, "Server Error", null));
      }
});



export const BuyMemebershipPlan = asynchandler(async (req, res) => {
    const parsed=PlanSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(new ApiResponse(false,  "Validation failed", null));
      }
      try {
        const {
    firstName,
    lastName,
    email,
    mobile,
    plan,
  } = parsed.data;

  const params = new URLSearchParams();
    params.append("oid", process.env.OID || "");
    params.append("retURL", process.env.retURL);
    params.append("lead_source", "Digital Medium");
    params.append("source", "App");
    params.append("Policy", "Application - Membership Plan");
    params.append("firstName", firstName);
    params.append("lastName", lastName);
    params.append("email", email);
    params.append("mobile", mobile);
    params.append("plan", plan);   

    const response = await axios.post(process.env.PolicyPurchaseURL, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      responseType: "html",
    });
        if (response.status !== 200) {
            return res.status(502).json(new ApiResponse(false, "Failed to process the policy purchase", null));
        }
           return res.status(200).json(new ApiResponse(200,{success:true},"Your data has been sent successfully "))
      } catch (error) {
        return res.status(500).json(new ApiResponse(false, "Server Error", null));
      }

});

export const ReferandEarn = asynchandler(async (req, res) => {
    const parsed=ReferandEarnSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(new ApiResponse(false,  "Validation failed", null));
      }
      try {
        const {
    fullName,
    contactNumber,
    relationship,
    insuranceType,
  } = parsed.data;

  const params = new URLSearchParams();
    params.append("oid", process.env.OID || "");
    params.append("retURL", process.env.retURL);
    params.append("lead_source", "Digital Medium");
    params.append("source", "App");
    params.append("Policy", "Application - Referral");
    params.append("refferedBy", req.decodedmobile || "Unknown");
    params.append("fullName", fullName);
    params.append("contactNumber", contactNumber);
    params.append("relationship", relationship);
    params.append("insuranceType", insuranceType);


    
   

    const response = await axios.post(process.env.PolicyPurchaseURL, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      responseType: "html",
    });
        if (response.status !== 200) {
            return res.status(502).json(new ApiResponse(false, "Failed to process the policy purchase", null));
        }
           return res.status(200).json(new ApiResponse(200,{success:true},"Your data has been sent successfully "))
      } catch (error) {
        return res.status(500).json(new ApiResponse(false, "Server Error", null));
      }

});


