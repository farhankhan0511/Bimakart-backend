
import bimapi from "../Lib/AxiosClient.js";
import { UserPolicies } from "../Models/UseerPolicies.Model.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asynchandler } from "../Utils/asynchandler.js";
import os from "os";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { withRetry } from "../Utils/Retry.js";
import { checkMobileExistsSchema } from "../Utils/zodschemas.js";
import FormData from "form-data";
import pLimit from "p-limit";
import { deletePdfFromS3ByUrl, uploadPdfToS3 } from "../Utils/FileUpload.js";
import mongoose from "mongoose";
import logger from "../Utils/logger.js";
import { isAnalysisDown, isOCRDown, markAnalysisDown, markOCRDown } from "../Lib/Providerhealth.js";

const LOCK_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOAD_DIR = path.join(__dirname, "../downloads");
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}
const MAX_GLOBAL_DOWNLOADS = Math.max(2, os.cpus().length);
const globalDownloadLimit = pLimit(MAX_GLOBAL_DOWNLOADS);


const POLICY_KEYS = [
  "motorInsurancePolicy",
  "lifeInsurancePolicy",
  "healthInsurancePolicy",
  "membershipBenefits",
  "personalAccidentPolicy",
];

const getPlanFromPremium = (grossPremium) => {
  if (grossPremium === 130) return "Gold";
  if (grossPremium === 5) return "Silver";
  return "NA";
};


export async function downloadPDF(url, filePath) {
  return globalDownloadLimit(() =>
    withRetry(
      async () => {
        const controller = new AbortController();
        // Increased timeout for production environments
        const HARD_TIMEOUT = 60000; // 60 seconds
        const STREAM_TIMEOUT = 30000; // 30 seconds
        
        const hardTimeout = setTimeout(() => controller.abort(), HARD_TIMEOUT);

        let writer;
        let streamTimeout;

        try {
          const response = await axios.get(url, {
            responseType: "stream",
            signal: controller.signal,
            timeout: 50000, // Add axios timeout
            maxRedirects: 5,
          });

          await new Promise((resolve, reject) => {
            writer = fs.createWriteStream(filePath);

            // Define fail function AFTER reject is available
            const fail = (err) => {
              clearTimeout(streamTimeout);
              clearTimeout(hardTimeout);
              writer?.destroy();
              reject(err);
            };

            // Stream inactivity watchdog
            const resetStreamTimeout = () => {
              clearTimeout(streamTimeout);
              streamTimeout = setTimeout(
                () => fail(new Error("Stream stalled - no data received")),
                STREAM_TIMEOUT
              );
            };

            resetStreamTimeout();

            response.data.on("data", resetStreamTimeout);
            response.data.on("error", fail);

            writer.on("finish", () => {
              clearTimeout(streamTimeout);
              clearTimeout(hardTimeout);
              resolve();
            });
            writer.on("error", fail);

            response.data.pipe(writer);
          });

          // Verify file was created and has content
          const stats = await fs.promises.stat(filePath);
          if (stats.size === 0) {
            throw new Error("Downloaded file is empty");
          }


          return filePath;
          
        } catch (err) {
          // Clean up partial file on error
          if (fs.existsSync(filePath)) {
            try {
              await fs.promises.unlink(filePath);
            } catch (unlinkErr) {

              logger.error(unlinkErr,`Failed to cleanup partial file ${filePath}:`);

            }
          }

          if (err.name === "AbortError" || err.code === "ECONNABORTED") {
            throw new Error(`Download timeout exceeded for ${url}`);
          }
          if (err.code === "ECONNRESET" || err.code === "ETIMEDOUT") {
            throw new Error(`Network error downloading ${url}: ${err.message}`);
          }
          throw err;
        } finally {
          clearTimeout(hardTimeout);
          clearTimeout(streamTimeout);
          if (writer && !writer.destroyed) {
            writer.destroy();
          }
        }
      },
      { retries: 3, delay: 2000, label: `PDF-DOWNLOAD(${path.basename(filePath)})` }
    )
  );
}

// Improved parallel download with better error handling
export async function downloadPDFs(urls, downloadDir) {
  if (!urls || urls.length === 0) {

    logger.warn("No URLs to download");
    return [];
  }

  

  
  const tasks = urls.map((url, index) => {
    const fileName = `file_${index + 1}.pdf`;
    const filePath = path.join(downloadDir, fileName);
    
    return downloadPDF(url, filePath)
      .catch(err => {

        logger.error(`Failed to download ${url}:`, err);

        return null; // Return null instead of failing entire batch
      });
  });

  const results = await Promise.all(tasks);
  
  // Filter out failed downloads (null values)
  const successfulDownloads = results.filter(Boolean);
  

  logger.info(`Downloaded ${successfulDownloads.length}/${urls.length} files successfully`);

  return successfulDownloads;
}



export async function cleanupFiles(filePaths = []) {
  for (const filePath of filePaths) {
    const absolutePath = path.join(process.cwd(), filePath);

    if (fs.existsSync(absolutePath)) {
      await fs.promises.unlink(absolutePath);
    }
  }
}



// this are helper functions for locking and making this process non-redundant and safer
async function acquireLock(mobile) {

  const now = new Date();
  const staleTime = new Date(now.getTime() - LOCK_TIMEOUT_MS);
  const lockId = new mongoose.Types.ObjectId().toString();


 try {
   const result = await UserPolicies.findOneAndUpdate(
     {
       mobile,
       $or: [
         { "processing.inProgress": { $ne: true } },
         {
            "processing.inProgress": true,
            "processing.startedAt": { $lt: staleTime }
          }
       ]
     },
     {
       $set: {
         mobile,
         "processing.inProgress": true,
         "processing.startedAt": now,
         "processing.lockId": lockId
       }
     },
     {
       new: false,
       upsert: true,
     }
    );
    if (!result) {
      return { acquired: true, lockId };
    }

    // If the document existed but wasn't locked, we got it
    if (!result.processing?.inProgress) {
      return { acquired: true, lockId };
    }

    // If it was locked but stale, we got it
    if (result.processing.startedAt < staleTime) {
      return { acquired: true, lockId };
    }

    // It was actively locked by someone else
    return { acquired: false, lockId: null };

  } catch (err) {
    logger.error("Lock acquisition error:", err);
    return { acquired: false, lockId: null };
  }

}


async function releaseLock(mobile, lockId) {
  
  await UserPolicies.updateOne(
    { 
      mobile,
      "processing.lockId": lockId // Ensure we own this lock
    },
    {
      $set: {
        "processing.inProgress": false,
        "processing.startedAt": null,
        "processing.lockId": null

      }
    }
  );
}


async function getPoliciesfromURLApi(mobile){
    if(!mobile) throw new Error("Mobile number is required");

    const response=await bimapi.post("/policiesUrl",{mobile});
     const policies = response.data.policies || [];
     // filtering the valid urls as some urls are empty
      const validUrls = policies
    .map(p => p.downloadUrl)
    .filter(Boolean);

    
  

    const downloadedFiles = await downloadPDFs(validUrls, DOWNLOAD_DIR);

    const savedFiles = downloadedFiles.map(filePath => path.relative(process.cwd(), filePath));
    

    return savedFiles;
    
}

async function getPoliciesfrombasecodeApi(mobile){
    if(!mobile) throw new Error("Mobile number is required");
    const response=await bimapi.post("/policiesPDFs",{mobile});
    const policies = response.data.policies || [];
   
    const savedFiles = [];

  for (let i = 0; i < policies.length; i++) {
    const base64 = policies[i]["pdf"];
    if (!base64) continue;
    let cleanBase64 = base64.replace(/^data:.*;base64,/, "");
    cleanBase64 = cleanBase64.replace(/[\r\n\s]/g, '');

    const buffer = Buffer.from(cleanBase64, "base64");
    if (buffer.length === 0) {
      logger.warn(`Empty base64 PDF for policy ${i + 1}`);
      continue;
    }
    const pdfHeader = buffer.slice(0, 4).toString();
    if (!pdfHeader.includes('%PDF')) {
      logger.warn(`Invalid PDF format for policy ${i + 1}, header: ${pdfHeader}`);
      continue;
    }
    let policystype=policies[i]["policyType"] || "Other";
    let policyvisibility=policies[i]["visibility"] || "1";
    const filename = `base64_${mobile}_${i + 1}_${policystype}_${policyvisibility}.pdf`;
    const filePath = path.join(DOWNLOAD_DIR, filename);

    await withRetry(() => {
     return  fs.promises.writeFile(filePath, buffer)
    }, 2, 1500);

    savedFiles.push(path.relative(process.cwd(), filePath));
  }

  return savedFiles;
}

// policy hawaldar function
const getpolicyanalysis=async(Policypath)=>{
  if(isAnalysisDown()){
    logger.warn("Policy analysis service is marked down, skipping analysis for file:", Policypath);
    throw new Error("Policy analysis service is currently unavailable");
  }
    if (!Policypath) throw new Error("File path is required");

    const absolutePath = path.isAbsolute(Policypath)
      ? Policypath
      : path.join(process.cwd(), Policypath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error("File does not exist");
    }
    
        try {
          const form = new FormData();
          form.append("file", fs.createReadStream(Policypath));
          logger.info(process.env.PolicyHawaldarURL,"Sending policy for analysis to Hawaldar:");
              const response = await axios.post(
              `${process.env.PolicyHawaldarURL}/api/v1/conversation`,
              form,
              {
                  headers: {
                  ...form.getHeaders(), 
  
                  },
                  timeout: 70000, // 70 seconds timeout for analysis
              }
              );
              return response.data;
        } catch (err) {
          if (
      err.response?.status === 503 ||
      err.response?.status === 429 ||
      err.code === "ECONNABORTED"
    ) {
      logger.warn("Analysis service unhealthy, opening circuit");
      markAnalysisDown();
    }

    logger.warn("Policy analysis failed:", err.message);
    throw err; 
        }
    }
  

export async function extractPolicyDetailsFromFile(filePath) {
  if(isOCRDown()){
    logger.warn("OCR service is marked down, skipping OCR for file:", filePath);
    throw new Error("OCR service is currently unavailable");
  }
  if (!filePath) throw new Error("File path is required");

  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error("File does not exist");
  }

  const form = new FormData();
  form.append("pdf_data", fs.createReadStream(absolutePath));

  return withRetry(
    async () => {
      try {
        const response = await axios.post(
          process.env.OCR_SERVICE_URL,
          form,
          {
            headers: {
              ...form.getHeaders(),
            },
            
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            timeout: 60000, // 60 seconds timeout for OCR processing
          }
        );
        
  
        return response.data;
      } catch (err) {
        if (
          err.response?.status === 503 ||
          err.response?.status === 429 ||
          err.code === "ECONNABORTED"
        ) {
          logger.warn("OCR service unhealthy, opening circuit");
          markOCRDown();
        }

        logger.warn("OCR extraction failed:", err.message);
        throw err;
        
      }
    },
    { retries: 1, delay: 1500, label: "OCR-REQUEST" }
  );
}




export const getUserPolicies=asynchandler(async(req,res)=>{
    const {mobile,refresh}=req.body;

    let lockInfo = { acquired: false, lockId: null };

    let savedFiles = [];
    let basecodeFiles=[];
    try {
      
        if (!mobile) {
            return res.status(400).json(new ApiResponse(400,{},"Mobile number is required"));
        }
        if (!checkMobileExistsSchema.safeParse({mobile}).success) {
            return res.status(400).json(new ApiResponse(400,{},"Invalid mobile number format"));
        }
        if (typeof refresh !== "boolean") {
            return res.status(400).json(new ApiResponse(400,{},"Refresh must be a boolean"));
        }
        
        
        const existingRecord=await UserPolicies.findOne({mobile});
        if (existingRecord && (existingRecord?.policies?.length > 0) && !refresh) {
           
            return res.status(200).json(new ApiResponse(200,{source:"cache",data:existingRecord},"User policies retrieved successfully from cache"));
        }
        if(isOCRDown()){
                logger.warn("OCR service is marked down");
                return res.status(200).json(new ApiResponse(200,{source:"cache",data:(existingRecord?existingRecord:{})},"Service unavailable returning cached data"))
              }

        lockInfo = await acquireLock(mobile);
        if (!lockInfo.acquired) {
          return res.status(409).json(
            new ApiResponse(409, {}, "Policy retrieval already in progress")
          );
        }
        
        logger.info({mobile},"Lock acquired for mobile:");
        // As now that the lock is acquired it means no redundant process and hence safe to start
        // firstly getting policies from api which gives urls

        const [urlFiles, baseFiles] = await Promise.allSettled([getPoliciesfromURLApi(mobile), getPoliciesfrombasecodeApi(mobile)]);
        if (urlFiles.status === 'rejected') {
          logger.warn("Failed to get policies from URL API:", urlFiles.reason?.message);
        }
        if (baseFiles.status === 'rejected') {
          logger.warn("Failed to get policies from basecode API:", baseFiles.reason?.message);
        }
        savedFiles = urlFiles.status === 'fulfilled' ? urlFiles.value : [];
        basecodeFiles = baseFiles.status === 'fulfilled' ? baseFiles.value : [];
        

        savedFiles = savedFiles.concat(basecodeFiles);
        

        // Now running the ocr service on each file to extract policy details
        const allPolicies = [];
        for (const filePath of savedFiles) {          
            try {
              const tasks = [
                extractPolicyDetailsFromFile(filePath)
              ];

              if (!isAnalysisDown()) {
                tasks.push(getpolicyanalysis(filePath));
              }
              const results = await Promise.allSettled(tasks);

              const detailsResult = results[0];
              const analysisResult = results[1];
                let policyanalysis = null;
                let policyDetails = null;

                 if (detailsResult.status === 'fulfilled') {
                  policyDetails = detailsResult.value;
                } else {
                  logger.warn(`Extraction failed for ${filePath}: ${detailsResult.reason?.message}`);
                }

                if (!policyDetails) {
                  continue; // Skip this policy, move to next
                }

                if (analysisResult && analysisResult.status === 'fulfilled') {
                  policyanalysis = analysisResult.value;
                } else {
                  logger.warn(`Analysis failed for ${filePath}: ${analysisResult.reason?.message}`);
                }

                    policyDetails.policyAnalysis=policyanalysis;
                    const filename = path.basename(filePath, ".pdf");
                    policyDetails.source = filename.startsWith("base64") ? "basecode" : "url";
                   if (policyDetails?.source === "url") {
                        policyDetails.policyType="Salesforce";
                        for (const key of POLICY_KEYS) {
                          const policy = policyDetails?.[key];
                          if (!policy) continue;
                          let plan = null;
                          if(policy.grossPremium){
                            plan = getPlanFromPremium(policy.grossPremium);
                          }
                          if (plan) {                            
                            policyDetails.plan = plan;
                            policyDetails.planStartDate=policy.policyStartDate;
                            policyDetails.planEndDate=policy.policyEndDate;

                            break;  
                          }
                        }
                      }
                    else{
                      // get policy type and visibility from filename for basecode policies as they are not coming in response
                      
                      const parts = filename.split("_");
                      if (parts.length >= 5) {
                        const policystype = parts[3];
                        const policyvisibility = parts[4];
                        policyDetails.policyType = policystype;
                        policyDetails.visibility = policyvisibility;
                      }
                    }

                   
                    allPolicies.push(policyDetails);
                
            } catch (err) {

                logger.error(
                `Error extracting policy from file ${filePath}`,
                { message: err.message, stack: err.stack }
              );


            }
        }
        if(isOCRDown()){
                logger.warn("OCR service is marked down, some policies may not have been processed");
                return res.status(200).json(new ApiResponse(200,{data:(existingRecord?existingRecord:{})},"Service unavailable returning cached data")) 
              }
       
        
        if (existingRecord) {
         const newlyUpdatedRecord = await UserPolicies.findOneAndUpdate(
            { mobile },
            {
                $set: {
                    policies: allPolicies,

                }
            },
           { returnDocument: "after" }
        );  
       
        return res.status(200).json(new ApiResponse(200,{source:"api",data:newlyUpdatedRecord},"User policies retrieved successfully from API"));
        }
        else {
          if(savedFiles.length===0){
            return res.status(404).json(new ApiResponse(404,{},"No policies found for this mobile number"));
        }
         const newlyCreatedRecord =await UserPolicies.create({
            mobile,
            policies: allPolicies,
        },
   );
       

        return res.status(200).json(new ApiResponse(200,{source:"api",data:newlyCreatedRecord},"User policies retrieved successfully from API"));
        }        

        
    } catch (error) {
        return res.status(500).json(new ApiResponse(500,{},error.message || "Internal server error"));
    }
    finally {

      if (lockInfo.acquired) {
      await releaseLock(mobile, lockInfo.lockId);
    }
    await cleanupFiles(savedFiles);

    }

});

export const UploadPolicy=asynchandler(async(req,res,)=>{
  const Policypath=req.file?.path;
  const policyFileName=req.file?.filename;
  const {mobile,policyType}=req.body;
  try {
   
    
    if (!mobile) {
            return res.status(400).json(new ApiResponse(400,{},"Mobile number is required"));
        }
        if (!checkMobileExistsSchema.safeParse({mobile}).success) {
            return res.status(400).json(new ApiResponse(400,{},"Invalid mobile number format"));
        }
      if(isOCRDown()){
      logger.warn("OCR service is marked down, cannot process upload for mobile:", mobile);
      return res.status(503).json(new ApiResponse(503,{},"Service unavailable"))
    }
    if(!Policypath){
      return res.status(404).json(new ApiResponse(404,{},"Policy not found"))
    }
    if (!["Myself", "Other"].includes(policyType)) {
      return res.status(400).json(new ApiResponse(400,{},"Policy type is required")) }
    

    const newPolicy= await uploadPdfToS3(Policypath,req.file?.filename); 


    if(!newPolicy ){
      return res.status(500).json(new ApiResponse(500,{},"Error while uploading the Policy"));
    }

      
     

              let policyanalysis = null;
              let extractedPolicy = null;

               

                try {
                  extractedPolicy = await extractPolicyDetailsFromFile(Policypath)
                } catch (e) {
                  logger.warn(`Policy extraction failed for ${Policypath}: ${e.message}`);
                }

    //  extractedPolicy.url=newPolicy;
    if(!extractedPolicy){
      deletePdfFromS3ByUrl(newPolicy);
      return res.status(500).json(new ApiResponse(500,{},"Error while extracting the policy"))
    }
     
     extractedPolicy.policyType=policyType;
    extractedPolicy.visibility="1"; 

  const duplicateActive = await UserPolicies.findOne({
        mobile,
        policies: {
          $elemMatch: {
            id: extractedPolicy.id,
            source: "basecode",
            visibility: "1"
          }
        }
      });


      if (duplicateActive) {
        return res
          .status(409)
          .json(new ApiResponse(409, {}, "Policy already exists"));
      }


     if(extractedPolicy.motorInsurancePolicy){
      try {
        await webleadTOSurepassexternalPolicy(mobile,extractedPolicy.motorInsurancePolicy.vehicleNumber,extractedPolicy.motorInsurancePolicy.customerName,extractedPolicy.motorInsurancePolicy.policyEndDate);    
      } catch (err) {
        logger.error("Failed to create weblead for surepass:", err);
      } 
    }
    const updateResult = await UserPolicies.updateOne(
    { mobile, policies: {
      $elemMatch: {
        id: extractedPolicy.id,
        visibility: "0"
      }
    } },
    { $set: { "policies.$.visibility": "1" } },
  );

  if (updateResult.matchedCount > 0) {
    try {
    await bimapi.patch("/policiesPDFs", {
      policyNumber: extractedPolicy.id,
      mobile: mobile,
      visibility: "1",
      policyType: policyType,
    });
  } catch (err) {
    logger.warn("Basecode restore failed but DB updated:", err.message);
  }
    return res
      .status(200)
      .json(new ApiResponse(200, extractedPolicy, "Policy restored successfully"));
  }
    
    const uploadstatusresponse= await bimapi.post("/uploadPolicyPDF",
          {
            policyNumber:extractedPolicy.id,
  mobileNumber: mobile,
  policyType: policyType,
  fileName: policyFileName,
  policyDocumentUrl: newPolicy
          }
        );
        const uploadstatus=uploadstatusresponse.data.success;
        if(uploadstatus !== true){
          logger.warn(uploadstatusresponse.data.message,"Failed to upload policy to basecode:");
          
          deletePdfFromS3ByUrl(newPolicy);
           return res.status(500).json(new ApiResponse(500,{},uploadstatusresponse.data.message || "Error while uploading the policy to basecode"))
        }
    try {
      if(!isAnalysisDown()){
    policyanalysis = await getpolicyanalysis(Policypath);
  }
} catch (e) {
  logger.warn(`Policy analysis failed for ${Policypath}: ${e.message}`);
}
extractedPolicy.policyAnalysis=policyanalysis;

     try { 
  await UserPolicies.updateOne(
    { mobile },
    { $push: { policies: extractedPolicy } },
    { upsert: true }
  );

} catch (error) {
  logger.error("Error while saving policy:", error);
  return res
    .status(500)
    .json(new ApiResponse(500, {}, "Internal Server Error"));
}


      return res.status(200).json(new ApiResponse(200,extractedPolicy,"Policy added successfully"))
}  
  

    
   catch (error) {
    logger.error("Error in UploadPolicy:", error);
    res.status(500).json(new ApiResponse(500,{},"Internal Server Error"))
  }
  finally{
    if(fs.existsSync(Policypath)){
       fs.unlinkSync(Policypath);
    }
    
  }

})


async function webleadTOSurepassexternalPolicy(mobile,rc_number,name,expiryDate){
  const params = new URLSearchParams();
      params.append("oid", process.env.OID || "");
      params.append("retURL", process.env.retURL);
      params.append("lead_source", "Digital Medium");
      params.append("source", "App");
      params.append("Policy", "Application - External Motor Policy");
      params.append("policyUploader",mobile);
      params.append("rc_number",rc_number); 
      params.append("customer_name",name);
      params.append("policy_expiry_date",expiryDate);
  
      
     
  
      const response = await axios.post(process.env.PolicyPurchaseURL, params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        responseType: "html",
      });
          if (response.status !== 200) {
            throw new Error(`Failed to create weblead: ${response.status} ${response.statusText}`);
          }
          logger.info("Weblead created successfully for surepass external policy");
           
};


export const removeuploadedpolicy = asynchandler(async(req,res)=>{
  const {mobile,policyNumber}=req.body;
  try {
    if(!mobile || !policyNumber){
      return res.status(400).json(new ApiResponse(400,{},"Mobile and Policy Number are required"))
    }
    if(!checkMobileExistsSchema.safeParse({mobile}).success){
      return res.status(400).json(new ApiResponse(400,{},"Invalid mobile format"))
    }
    const existingRecord=await UserPolicies.findOne({mobile});
    if(!existingRecord){
      return res.status(404).json(new ApiResponse(404,{},"No policies found for this mobile number"))
    }
    const policiesArray=existingRecord.policies || [];
    const policyToRemove=policiesArray.find(p=>p.id === policyNumber);
    if(!policyToRemove){
      return res.status(404).json(new ApiResponse(404,{},"Policy not found"))
    }
    const removestatus= await bimapi.patch("/policiesPDFs",{
      policyNumber:policyNumber,
      mobile:mobile,
      policyType: policyToRemove.policyType || "Other",
      visibility:"0"
    });
    if (removestatus.data.success !== true) {
      return res.status(500).json(new ApiResponse(500,{},removestatus.data.message || "Error while removing the policy from basecode"))
    }
    
   UserPolicies.updateOne(
  { mobile, "policies.id": policyNumber },
  {
    $set: { "policies.$.visibility": "0" }
  }
).catch(err => {
  logger.error("Visibility update failed:", err);
});


    return res.status(200).json(new ApiResponse(200,{},"Policy removed successfully"))

    } catch (error) {
    logger.error("Error in removeuploadedpolicy:", error);
    res.status(500).json(new ApiResponse(500,{},"Internal Server Error"))
  }
})
export const updatePolicyType = asynchandler(async(req,res)=>{
  const {mobile,policyNumber,policyType}=req.body;
  try {
    if(!mobile || !policyNumber || !policyType){
      return res.status(400).json(new ApiResponse(400,{},"Mobile, Policy Number and Policy Type are required"))
    }
    if(!checkMobileExistsSchema.safeParse({mobile}).success){
      return res.status(400).json(new ApiResponse(400,{},"Invalid mobile format"))
    }
    const existingRecord=await UserPolicies.findOne({mobile});
    if(!existingRecord){
      return res.status(404).json(new ApiResponse(404,{},"No policies found for this mobile number"))
    }
    const policiesArray=existingRecord.policies || [];
    const policyToRemove=policiesArray.find(p=>p.id === policyNumber);
    if(!policyToRemove){
      return res.status(404).json(new ApiResponse(404,{},"Policy not found"))
    }
    const removestatus= await bimapi.patch("/policiesPDFs",{
      policyNumber:policyNumber,
      mobile:mobile,
      policyType: policyType,
      visibility:"1"
    });
    if (removestatus.data.success !== true) {
      return res.status(500).json(new ApiResponse(500,{},removestatus.data.message || "Error while updating the policy type in basecode"))
    }
    
   UserPolicies.updateOne(
  { mobile, "policies.id": policyNumber },
  {
    $set: { "policies.$.policyType": policyType }
  }
).catch(err => {
  logger.error("Policy type update failed:", err);
});


    return res.status(200).json(new ApiResponse(200,{},"Policy Type Updated successfully")) 

    } catch (error) {
    logger.error("Error in updatePolicyType:", error);
    res.status(500).json(new ApiResponse(500,{},"Internal Server Error"))
  }
})

