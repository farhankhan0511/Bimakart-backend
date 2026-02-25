import axios from "axios";
import { asynchandler } from "../Utils/asynchandler.js";
import { addReferralSchema, BimacoinRedeemSchema, ElderlyInsuranceSchema, HealthInsuranceSchema, LifeInsuranceSchema, MotorPolicySchema, PlanSchema, ReferandEarnSchema, RudrakshSchema } from "../Utils/zodschemas.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import bimapi from "../Lib/AxiosClient.js";
import { getcoinSetting } from "../Lib/coinSettingCache.js";



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
            params.append("00N5j00000JGYzW", "App");
            params.append("00N5j00000JGYtT", "Application - Motor Insurance");

            params.append("last_name", fullName);
            params.append("00N5j00000JGYtv", vehicleNumber);
            params.append("mobile", mobileNumber);
            params.append("00N5j00000JGYtw", whatsappNumber);
            params.append("vehicleType", vehicleType);
            params.append("00NC7000000P2Rp", paymentMode);

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
    params.append("00N5j00000JGYzW", "App");
    params.append("00N5j00000JGYtT", "Application - Health Insurance");
    params.append("first_name", firstName);
    params.append("last_name", lastName);
    params.append("00NTZ000002PRn3", insureFor);
    params.append("email", email);
    params.append("mobile", mobile);
    params.append("00N5j00000JGYtw", whatsappNumber);
    params.append("00NTZ000002EWrh", pinCode);

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
export const BuyLifePolicy = asynchandler(async (req, res) => {
    const parsed=LifeInsuranceSchema.safeParse(req.body);
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
    params.append("00N5j00000JGYzW", "App");
    params.append("00N5j00000JGYtT", "Application - LifeInsurance");
    params.append("first_name", firstName);
    params.append("last_name", lastName);
    params.append("00NTZ000002PRn3", insureFor);
    params.append("email", email);
    params.append("mobile", mobile);
    params.append("00N5j00000JGYtw", whatsappNumber);
    params.append("00NTZ000002EWrh", pinCode);

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
export const BuyElderPolicy = asynchandler(async (req, res) => {
    const parsed=ElderlyInsuranceSchema.safeParse(req.body);
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
    params.append("00N5j00000JGYzW", "App");
    params.append("00N5j00000JGYtT", "Application - Elderly Insurance");
    params.append("first_name", firstName);
    params.append("last_name", lastName);
    params.append("00NTZ000002PRn3", insureFor);
    params.append("email", email);
    params.append("mobile", mobile);
    params.append("00N5j00000JGYtw", whatsappNumber);
    params.append("00NTZ000002EWrh", pinCode);

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
    params.append("00NTZ000001VCCP", "Application - Rudraksh Insurance");
    params.append("00NTZ0000021o3F", "App");  
    params.append("00NS3000005zmxh", prefix);
    params.append("first_name", firstName);
    params.append("last_name", lastName);
    params.append("00NC7000000VNuO", dob);
    params.append("mobile", mobile);
    params.append("email", email);
    params.append("00NS3000005zo6f", gender);
    params.append("00N5j00000JGYth", pan);
    params.append("00NTZ0000021q0D", nomineeName);
    params.append("00NTZ0000021q3R", nomineeRelation);
    params.append("00NS3000005zoEj", nomineeAge.toString());
  
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
    params.append("00N5j00000JGYzW", "App");
    params.append("00N5j00000JGYtT", "Application - Membership Plan");
    params.append("first_name", firstName);
    params.append("last_name", lastName);
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
    params.append("refferedBy", req.mobile || "Unknown");
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


export const AddReferral = asynchandler(async(req,res)=>{
  try {
    const parsed=addReferralSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(new ApiResponse(400,{}, "Validation failed",));
    }
    const {source, referralCode, referrerNumber, referredNumber, relation, referralName}=parsed.data;

    const refferalresponse= await bimapi.post("/referralAPI",{source, referralCode, referrerNumber, referredNumber, relation, referralName,timestamp:new Date().toISOString().split('.')[0] + 'Z'});
    if(!refferalresponse.data.success){
      return res.status(400).json(new ApiResponse(400,{}, refferalresponse.data.message || "Failed to add referral"));
    }
      return res.status(200).json(new ApiResponse(200,{}, "Referral added successfully"));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500,{}, error.message || "Internal server error"));
  }
});


export const bimaCoinRedeem = asynchandler(async (req, res) => {

  const parsed = BimacoinRedeemSchema.safeParse(req.body);

  if (!parsed.success) {
    return res
      .status(400)
      .json(new ApiResponse(400,{}, "Validation failed"));
  }

  try {
    const {
      FirstName,
      LastName,
      MobilePhone,
      Policy_Category,
      Policy_Type,
      Bimacoins_Redeemed,
      Total_Discount,
      vehicleNumber,
      
    } = parsed.data;

    const refbimaCoins= Number(getcoinSetting("referral_bonus")) || 0;
    const params = new URLSearchParams();

    
    params.append("oid", "00DC3000002h1pJ");
    params.append("retURL", process.env.retURL || "");
    params.append("first_name", FirstName);
    params.append("last_name", LastName);
    params.append("mobile", MobilePhone);
    params.append("lead_source", "Digital Medium");
    params.append("source", "App")
    params.append("00NC30000038m49", Policy_Category); 
    params.append("00NC30000038m5l", Policy_Type);     
    params.append("00NC30000038m8z", Bimacoins_Redeemed?.toString() || "0");
    params.append("00NC30000038mCD", Total_Discount?.toString() || "0");
    params.append("bimacoins",refbimaCoins || "0");
    params.append("00NC30000038mFR", new Date().toISOString());

    if(vehicleNumber){
      params.append("00N5j00000JGYtv", vehicleNumber);
    }

    const response = await axios.post(process.env.PolicyPurchaseURL, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      responseType: "html",
    });

    if (response.status !== 200) {
      return res
        .status(502)
        .json(new ApiResponse(502,{}, "Failed to process the request"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Your data has been sent successfully"));

  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500,{},"Internal Server Error"));
  }

});

