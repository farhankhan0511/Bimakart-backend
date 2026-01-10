import fs from "fs";
import path from "path";
import { PutObjectCommand,DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./S3.js";

import logger from "./logger.js";
export const uploadPdfToS3 = async (localFilePath, fileName) => {
  try {
    if (!fs.existsSync(localFilePath)) {
      throw new Error("File does not exist");
    }

    const fileBuffer = fs.readFileSync(localFilePath);

    const key = `policies/${Date.now()}-${path.basename(fileName)}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: "application/pdf",
      ContentLength: fileBuffer.length,
       ACL: "public-read",
    });

    const response = await s3.send(command);

    

    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
   
    logger.error(error);
    throw error; 
  }
};

export const deletePdfFromS3 = async (key) => {
  try {
    if (!key) throw new Error("S3 key is required");

    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    await s3.send(command);

    logger.warn("S3 file deleted:", key);
  } catch (error) {
    
    logger.error(error);
    throw error;
  }
};



export const deletePdfFromS3ByUrl = async (fileUrl) => {
  try {
    const url = new URL(fileUrl);
    const key = decodeURIComponent(url.pathname.substring(1));

    await deletePdfFromS3(key);
  } catch (error) {

    
    logger.error(error);
    throw error;
  }
};