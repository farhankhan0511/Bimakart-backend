import { Banner } from "../Models/Banner.Model.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asynchandler } from "../Utils/asynchandler.js";
import { deleteImageFromS3, deleteImageFromS3ByUrl, uploadImageToS3} from "../Utils/FileUpload.js";
import fs from "fs";
import logger from "../Utils/logger.js";

export const getLiveBanners=asynchandler(async(req,res)=>{
    try {
        const banners=await Banner.find({isActive:true});
        if(!banners){
            return  res.status(404).json(new ApiResponse(404,{},"No active banners found"));
        }
        res.status(200).json(new ApiResponse(200,banners,"Banners fetched successfully"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500,{},"Internal server error"));
    }
   
})


export const getBanners=asynchandler(async(req,res)=>{
    try {
        const banners=await Banner.find();
        if(!banners){
            return  res.status(404).json(new ApiResponse(404,{},"No banners found"));
        }
        res.status(200).json(new ApiResponse(200,banners,"Banners fetched successfully"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500,{},"Internal server error"));
    }
   
})

export const getTutorialVideos=asynchandler(async(req,res)=>{
    res.status(200).json(new ApiResponse(200,{
        "id": 1,
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    }
,"Tutorial videos fetched successfully"))
});


export const UploadBanner=asynchandler(async(req,res)=>{
    const imagePath=req.file?.path;
    const {web_url}=req.body;
    try {
        if(!imagePath){
            return res.status(400).json(new ApiResponse(400,{},"Image is required"))
        }
        if(!web_url){
            return res.status(400).json(new ApiResponse(400,{},"Web URL is required"))
        }
        const response= await uploadImageToS3(imagePath,req.file.filename);
        if(!response){
            logger.warn("Failed to upload banner image to S3");
            return res.status(500).json(new ApiResponse(500,{},"Failed to upload image"))
        }
        const newBanner= await Banner.create({
            imageUrl:response,
            webUrl:web_url,
            isActive:true
        });
        if(!newBanner){
            deleteImageFromS3ByUrl(response);
            return res.status(500).json(new ApiResponse(500,{},"Failed to create banner"))
        }
        res.status(200).json(new ApiResponse(200,newBanner,"Banner uploaded successfully"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500,{},"Internal Server Error"))
    }
    finally{
        if(fs.existsSync(imagePath)){
          fs.unlinkSync(imagePath);
        }
      }
});

export const ToggleBannerStatus=asynchandler(async(req,res)=>{
    const {bannerId}=req.body;
    try {
        if(!bannerId){
            return res.status(400).json(new ApiResponse(400,{},"Banner ID is required"))
        };
        const banner= await Banner.findById(bannerId);
        if(!banner){
            return res.status(404).json(new ApiResponse(404,{},"Banner not found"))
        }
        banner.isActive=!banner.isActive;
        await banner.save();
        res.status(200).json(new ApiResponse(200,banner,"Banner status updated successfully"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500,{},"Internal Server Error"))
    }
});

export const DeleteBanner=asynchandler(async(req,res)=>{
    const {bannerId}=req.body;
    try {
        if(!bannerId){
            return res.status(400).json(new ApiResponse(400,{},"Banner ID is required"))
        };
        const banner= await Banner.findById(bannerId);
        if(!banner){
            return res.status(404).json(new ApiResponse(404,{},"Banner not found"))
        }
        await Banner.findByIdAndDelete(bannerId);
        res.status(200).json(new ApiResponse(200,{},"Banner deleted successfully"));
    } catch (error) {
        res.status(500).json(new ApiResponse(500,{},"Internal Server Error"))
    }
});