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


const getImageMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";

  throw new Error("Unsupported image type");
};

export const uploadImageToS3 = async (localFilePath, fileName) => {
  try {
    if (!fs.existsSync(localFilePath)) {
      throw new Error("File does not exist");
    }

    const fileBuffer = fs.readFileSync(localFilePath);
    const mimeType = getImageMimeType(localFilePath);

    const key = `images/${Date.now()}-${path.basename(fileName)}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      ContentLength: fileBuffer.length,
      ACL: "public-read",
    });

    await s3.send(command);

    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const deleteImageFromS3 = async (key) => {
  try {
    if (!key) throw new Error("S3 key is required");

    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    await s3.send(command);

    logger.warn("S3 image deleted:", key);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const deleteImageFromS3ByUrl = async (imageUrl) => {
  try {
    const url = new URL(imageUrl);
    const key = decodeURIComponent(url.pathname.substring(1));

    await deleteImageFromS3(key);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
