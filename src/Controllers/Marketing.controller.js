import { ApiResponse } from "../Utils/ApiResponse.js";
import { asynchandler } from "../Utils/asynchandler.js";

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