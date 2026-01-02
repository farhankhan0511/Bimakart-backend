import { time } from "console";
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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOAD_DIR = path.join(__dirname, "../downloads");
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}


const MAX_GLOBAL_DOWNLOADS = Math.max(2, os.cpus().length);
const globalDownloadLimit = pLimit(MAX_GLOBAL_DOWNLOADS);

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

          console.log(`✓ Downloaded: ${path.basename(filePath)} (${stats.size} bytes)`);
          return filePath;
          
        } catch (err) {
          // Clean up partial file on error
          if (fs.existsSync(filePath)) {
            try {
              await fs.promises.unlink(filePath);
            } catch (unlinkErr) {
              console.error(`Failed to cleanup partial file ${filePath}:`, unlinkErr.message);
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
    console.log("No URLs to download");
    return [];
  }

  console.log(`Starting download of ${urls.length} files...`);
  
  const tasks = urls.map((url, index) => {
    const fileName = `file_${index + 1}.pdf`;
    const filePath = path.join(downloadDir, fileName);
    
    return downloadPDF(url, filePath)
      .catch(err => {
        console.error(`Failed to download ${url}:`, err.message);
        return null; // Return null instead of failing entire batch
      });
  });

  const results = await Promise.all(tasks);
  
  // Filter out failed downloads (null values)
  const successfulDownloads = results.filter(Boolean);
  
  console.log(`Downloaded ${successfulDownloads.length}/${urls.length} files successfully`);
  
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
  const result = await UserPolicies.findOneAndUpdate(
    {
      mobile,
      "processing.inProgress": { $ne: true }
    },
    {
      $set: {
        "processing.inProgress": true,
        "processing.startedAt": new Date(),
      }
    },
    { upsert: true, new: true }
  );

  return result?.processing?.inProgress === true;
}

async function releaseLock(mobile, error = null) {
  await UserPolicies.updateOne(
    { mobile },
    {
      $set: {
        "processing.inProgress": false,
        
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
    console.log("Valid URLs:", validUrls);
  

    const downloadedFiles = await downloadPDFs(validUrls, DOWNLOAD_DIR);
    console.log("Downloaded Files from URL API:", downloadedFiles); 
    const savedFiles = downloadedFiles.map(filePath => path.relative(process.cwd(), filePath));
    console.log("Downloaded Files:", savedFiles);
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




export const getUserPolicies=asynchandler(async(req,res,next)=>{
    const {mobile,refresh}=req.body;
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
        const existingRecord=await UserPolicies.findOne({mobile});
        console.log("here")
        if (existingRecord && existingRecord?.policies?.length > 0 && !refresh) {
            return res.status(200).json(new ApiResponse(200,{source:"cache",data:existingRecord},"User policies retrieved successfully from cache"));
        }
        console.log("No cached record or refresh requested, proceeding to fetch policies from APIs");
        if (existingRecord && existingRecord?.processing?.inProgress) {
            return res.status(409).json(new ApiResponse(409,{},"Policy retrieval already in progress for this mobile number"));
        }
        console.log("No ongoing processing, attempting to acquire lock");
        let lockAcquired;
        if (existingRecord) {
        lockAcquired = await acquireLock(mobile);
        } else {
        lockAcquired = true;
        }
        if (!lockAcquired) {
            return res.status(409).json(new ApiResponse(409,{},"Policy retrieval already in progress for this mobile number"));
        }
        console.log("Lock acquired for mobile:", mobile);
        // As now that the lock is acquired it means no redundant process and hence safe to start
        // firstly getting policies from api which gives uls
        savedFiles = await getPoliciesfromURLApi(mobile);
        console.log("Files downloaded from URL API:", savedFiles);
        // now getting policies from basecode api
        const basecodeFiles = await getPoliciesfrombasecodeApi(mobile);
        console.log("Files downloaded from Basecode API:", basecodeFiles);
        savedFiles = savedFiles.concat(basecodeFiles);
        if(savedFiles.length===0){
            return res.status(404).json(new ApiResponse(404,{},"No policies found for this mobile number"));
        }

        // Now running the ocr service on each file to extract policy details
        const allPolicies = [];
        for (const filePath of savedFiles) {
            try {
                
                const policyDetails = await extractPolicyDetailsFromFile(filePath);
                console.log(`Extracted policy details from file ${filePath}:`, policyDetails);
                if (policyDetails) {
                    policyDetails.source = filePath.endsWith(".txt") ? "basecode" : "url";
                   
                    allPolicies.push(policyDetails);
                }
            } catch (err) {
                console.error(`Error extracting policy from file ${filePath}:`, err.message);
            }
        }
       
        
       
        
        // return res.status(200).json(new ApiResponse(200,{source:"api",data:allPolicies},"User policies retrieved successfully from API"));
        if (existingRecord) {
         const newlyUpdatedRecord = await UserPolicies.findOneAndUpdate(
            { mobile },
            {
                $set: {
                    policies: allPolicies,
                    "processing.inProgress": false,
                }
            },
           { returnDocument: "after" }
        );  
       
        return res.status(200).json(new ApiResponse(200,{source:"api",data:newlyUpdatedRecord},"User policies retrieved successfully from API"));
        }
        else {
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
       releaseLock(mobile);
    await cleanupFiles(savedFiles);

    }

});