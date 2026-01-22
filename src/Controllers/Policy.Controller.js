
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

    const filename = `policy_${mobile}_${i + 1}.txt`;
    const filePath = path.join(DOWNLOAD_DIR, filename);

    await withRetry(() => {
      return fs.promises.writeFile(filePath, base64, "utf8");
    }, 2, 1500);

    savedFiles.push(path.relative(process.cwd(), filePath));
  }

  return savedFiles;
}

// policy hawaldar function
const getpolicyanalysis=async(Policypath)=>{
    if (!Policypath) throw new Error("File path is required");

    const absolutePath = path.isAbsolute(Policypath)
      ? Policypath
      : path.join(process.cwd(), Policypath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error("File does not exist");
    }
    
        const form = new FormData();
        form.append("file", fs.createReadStream(Policypath));
            const response = await axios.post(
            `${process.env.PolicyHawaldarURL}/api/v1/conversation`,
            form,
            {
                headers: {
                ...form.getHeaders(), 
                },
            }
            );
        return response.data;
    }
  





export async function extractPolicyDetailsFromFile(filePath) {
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
      const response = await axios.post(
        process.env.OCR_SERVICE_URL,
        form,
        {
          headers: {
            ...form.getHeaders(),
          },
          
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      return response.data;
    },
    { retries: 2, delay: 1500, label: "OCR-REQUEST" }
  );
}




export const getUserPolicies=asynchandler(async(req,res)=>{
    const {mobile,refresh}=req.body;

    let lockInfo = { acquired: false, lockId: null };

    let savedFiles = [];
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
        
        lockInfo = await acquireLock(mobile);
        if (!lockInfo.acquired) {
          return res.status(409).json(
            new ApiResponse(409, {}, "Policy retrieval already in progress")
          );
        }
        const existingRecord=await UserPolicies.findOne({mobile});
        if (existingRecord && (existingRecord?.uploadedpolicy?.length>0 ||existingRecord?.policies?.length > 0) && !refresh) {
           
            return res.status(200).json(new ApiResponse(200,{source:"cache",data:existingRecord},"User policies retrieved successfully from cache"));
        }

        
        logger.info({mobile},"Lock acquired for mobile:");
        // As now that the lock is acquired it means no redundant process and hence safe to start
        // firstly getting policies from api which gives uls
        savedFiles = await getPoliciesfromURLApi(mobile);
        
        // now getting policies from basecode api
        const basecodeFiles = await getPoliciesfrombasecodeApi(mobile);
        

        savedFiles = savedFiles.concat(basecodeFiles);
        

        // Now running the ocr service on each file to extract policy details
        const allPolicies = [];
        for (const filePath of savedFiles) {
            try {
                let policyanalysis = null;
                let policyDetails = null;

                try {
                  policyanalysis = await getpolicyanalysis(filePath);
                } catch (e) {
                  logger.warn(`Policy analysis failed for ${filePath}: ${e.message}`);
                }

                try {
                  policyDetails = await extractPolicyDetailsFromFile(filePath);
                } catch (e) {
                  logger.warn(`Policy extraction failed for ${filePath}: ${e.message}`);
                }

                if (policyDetails) {
                    policyDetails.policyAnalysis=policyanalysis;
                    policyDetails.source = filePath.endsWith(".txt") ? "basecode" : "url";
                   if (policyDetails?.source === "url") {
                        for (const key of POLICY_KEYS) {
                          const policy = policyDetails?.[key];
                          if (!policy) continue;
                          let plan = null;
                          if(policy.grossPremium){
                            plan = getPlanFromPremium(policy.grossPremium);
                          }
                          else {
                            plan = getPlanFromPremium((policy.premiumBreakup?.grossPremium) ? policy.premiumBreakup?.grossPremium : policy.premiumBreakup?.totalPremium);
                          }

                           
                          if (plan) {                            
                            policyDetails.plan = plan;
                            policyDetails.planStartDate=policy.policyStartDate;
                            policyDetails.planEndDate=policy.policyEndDate;

                            break;  
                          }
                        }
                      }

                   
                    allPolicies.push(policyDetails);
                }
            } catch (err) {

                logger.error(
                `Error extracting policy from file ${filePath}`,
                { message: err.message, stack: err.stack }
              );


            }
        }
       
        
       
        
        // return res.status(200).json(new ApiResponse(200,{source:"api",data:allPolicies},"User policies retrieved successfully from API"));
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

      // release locks and cleanfiles 
      if (lockInfo.acquired) {
      await releaseLock(mobile, lockInfo.lockId);
    }
    await cleanupFiles(savedFiles);

    }

});

export const UploadPolicy=asynchandler(async(req,res,)=>{
  const Policypath=req.file?.path;

  const {mobile}=req.body;
  try {
   
    if(!checkMobileExistsSchema.safeParse({mobile}).success){
      return res.status(400).json(new ApiResponse(400,{},"Invalid mobile format"))
    }
    if(!Policypath){
      return res.status(404).json(new ApiResponse(404,{},"Policy not found"))
    }

    const newPolicy= await uploadPdfToS3(Policypath,req.file?.filename); 


    if(!newPolicy ){
      return res.status(500).json(new ApiResponse(500,{},"Error while uploading the Policy"));
    }
      
     

              let policyanalysis = null;
              let extractedPolicy = null;

                try {
                  policyanalysis = await getpolicyanalysis(Policypath);
                } catch (e) {
                  logger.warn(`Policy analysis failed for ${Policypath}: ${e.message}`);
                }

                try {
                  extractedPolicy = await extractPolicyDetailsFromFile(Policypath)
                } catch (e) {
                  logger.warn(`Policy extraction failed for ${Policypath}: ${e.message}`);
                }

     extractedPolicy.url=newPolicy;
     extractedPolicy.policyAnalysis=policyanalysis;
    if (!extractedPolicy){
      return res.status(500).json(new ApiResponse(500,{},"Error while extracting the policy"))
    }
    const existingRecord=await UserPolicies.findOne({mobile})

    if(existingRecord){
    const updatedPolicy= await UserPolicies.findOneAndUpdate({ mobile ,"uploadedpolicy.id": { $ne: extractedPolicy.id }},
            {
                $push: {
                    uploadedpolicy: extractedPolicy                 
                }
            },
           { returnDocument: "after" }
        ); 
      
      if(updatedPolicy === null){
        await deletePdfFromS3ByUrl(newPolicy);
        
        return res.status(400).json(new ApiResponse(400,{},"Policy already Exists"))
      }
        return res.status(200).json(new ApiResponse(200,{extractedPolicy},"Policy added successfully")) 
      }
    else{
      await UserPolicies.create({mobile,uploadedpolicy:extractedPolicy})
      return res.status(200).json(new ApiResponse(200,extractedPolicy,"Policy added successfully"))
    }
      

    
  } catch (error) {
    logger.error("Error in UploadPolicy:", error);
    res.status(500).json(new ApiResponse(500,{},"Internal Server Error"))
  }
  finally{
    if(fs.existsSync(Policypath)){
      fs.unlinkSync(Policypath)
    }
  }

})