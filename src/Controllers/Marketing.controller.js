import { ApiResponse } from "../Utils/ApiResponse.js";
import { asynchandler } from "../Utils/asynchandler.js";
import { uploadPdfToS3 } from "../Utils/FileUpload.js";

export const getBanners=asynchandler(async(req,res)=>{
    res.status(200).json(new ApiResponse(200,[{
        "id": 1,
        "image_url": "https://user-policy-pdfs-prod.s3.ap-south-1.amazonaws.com/banner.jpeg",
        "web_url": "https://bimakart.in/",
        "is_active": true
    },
    {
        "id": 2,
        "image_url": "https://user-policy-pdfs-prod.s3.ap-south-1.amazonaws.com/banner.jpeg",
        "web_url": "https://bimakart.in/",
        "is_active": true
    },
    {
        "id": 3,
        "image_url": "https://user-policy-pdfs-prod.s3.ap-south-1.amazonaws.com/banner.jpeg",
        "web_url": "https://bimakart.in/",
        "is_active": true
    },
    {
        "id": 4,
        "image_url": "https://user-policy-pdfs-prod.s3.ap-south-1.amazonaws.com/banner.jpeg",
        "web_url": "https://bimakart.in/",
        "is_active": true
    },
    {
        "id": 5,
        "image_url": "https://user-policy-pdfs-prod.s3.ap-south-1.amazonaws.com/banner.jpeg",
        "web_url": "https://bimakart.in/",
        "is_active": true
    },
  ],"Banners fetched successfully"  ))
})

export const getTutorialVideos=asynchandler(async(req,res)=>{
    res.status(200).json(new ApiResponse(200,[{
        "id": 1,
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    {
        "id": 2,
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    }
],"Tutorial videos fetched successfully"))
});


// export const UploadBanner=asynchandler(async(req,res)=>{
//     const imagePath=req.file?.path;
//     const {web_url}=req.body;
//     if(!imagePath){
//         return res.status(400).json(new ApiResponse(400,{},"Image is required"))
//     }
//     if(!web_url){
//         return res.status(400).json(new ApiResponse(400,{},"Web URL is required"))
//     }
//     const response= uploadPdfToS3(imagePath,"banner-images");

// });
