import { time } from "console";
import bimapi from "../Lib/AxiosClient.js";
import { UserPolicies } from "../Models/UseerPolicies.Model.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asynchandler } from "../Utils/asynchandler.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { withRetry } from "../Utils/Retry.js";
import { checkMobileExistsSchema } from "../Utils/zodschemas.js";
import FormData from "form-data";
import { file } from "zod";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOAD_DIR = path.join(__dirname, "../downloads");
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}
async function downloadPDF(url, filename) {
  const filePath = path.join(DOWNLOAD_DIR, filename);

  await withRetry(async () => {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
      timeout: 15000,
    });

    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  }, 3, 1500);
  return filePath;
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
    const savedFiles = [];

    for (let i = 0; i < validUrls.length; i++) {
        const url = validUrls[i];

        const filename = `policy_${mobile}_${i + 1}.pdf`;
        const filePath = await downloadPDF(url, filename);

        // store RELATIVE path
        savedFiles.push(path.relative(process.cwd(), filePath));
    }
    return savedFiles;
    
}

async function getPoliciesfrombasecodeApi(mobile){
    if(!mobile) throw new Error("Mobile number is required");
    const response=await bimapi.post("/policiesPDFs",{mobile});
    const policies = response.data.policies || [];
    console.log("Policies from Basecode API:", policies);
    const savedFiles = [];

  for (let i = 0; i < policies.length; i++) {
    const base64 = policies[i]["pdf"];
    if (!base64) continue;

    const filename = `policy_${mobile}_${i + 1}.txt`;
    const filePath = path.join(DOWNLOAD_DIR, filename);

    await withRetry(() => {
      return fs.promises.writeFile(filePath, base64, "utf8");
    }, 3, 1000);

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

  const response = await axios.post(
    process.env.OCR_SERVICE_URL,
    form,
    {
      headers: {
        ...form.getHeaders(),
      },
      timeout: 20000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    }
  );

  return response.data;
}



export const getUserPolicies=asynchandler(async(req,res,next)=>{
    const {mobile,refresh}=req.body;
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
        let savedFiles = await getPoliciesfromURLApi(mobile);
        console.log("Files downloaded from URL API:", savedFiles);
        // now getting policies from basecode api
        const basecodeFiles = await getPoliciesfrombasecodeApi(mobile);
        console.log("Files downloaded from Basecode API:", basecodeFiles);
        savedFiles = savedFiles.concat(basecodeFiles);

        // Now running the ocr service on each file to extract policy details
        const allPolicies = [];
        for (const filePath of savedFiles) {
            try {
                
                const policyDetails = await extractPolicyDetailsFromFile(filePath);
                console.log(`Extracted policy details from file ${filePath}:`, policyDetails);
                if (policyDetails) {
                    if (filePath.endsWith(".txt")) {
                        policyDetails.source = "basecode";
                    } else {
                        policyDetails.source = "url";
                    }
                    delete policyDetails["validation"];
                    delete policyDetails["empty_datasets"];
                    allPolicies.push(policyDetails);
                }
            } catch (err) {
                console.error(`Error extracting policy from file ${filePath}:`, err.message);
            }
        }
        //for testing purpose only
         await releaseLock(mobile);
        await cleanupFiles(savedFiles);

        
        // return res.status(200).json(new ApiResponse(200,{source:"api",data:allPolicies},"User policies retrieved successfully from API"));
        if (existingRecord) {
         await UserPolicies.updateOne(
            { mobile },
            {
                $set: {
                    policies: allPolicies,
                    "processing.inProgress": false,
                }
            }
        );  
        const newlyUpdatedRecord = await UserPolicies.findOne({ mobile });
        return res.status(200).json(new ApiResponse(200,{source:"api",data:newlyUpdatedRecord},"User policies retrieved successfully from API"));
        }
        else {
        await UserPolicies.create({
            mobile,
            policies: allPolicies,
        });
        const newlyCreatedRecord = await UserPolicies.findOne({ mobile });

        return res.status(200).json(new ApiResponse(200,{source:"api",data:newlyCreatedRecord},"User policies retrieved successfully from API"));
        }        

        
    } catch (error) {
        return res.status(500).json(new ApiResponse(500,{},error.message || "Internal server error"));
    }
    finally {
       releaseLock(mobile);
    }

});