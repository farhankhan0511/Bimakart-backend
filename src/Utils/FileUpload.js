import fs from "fs";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./S3.js";
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
    });

    const response = await s3.send(command);
    console.log("S3 upload response:", response);

    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("S3 UPLOAD ERROR ↓↓↓");
    console.error(error);
    throw error; // IMPORTANT
  }
};
