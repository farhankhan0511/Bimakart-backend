import { ApiResponse } from "../Utils/ApiResponse.js";
import { asynchandler } from "../Utils/asynchandler.js";

export const getBanners=asynchandler(async(req,res)=>{
    res.status(200).json(new ApiResponse(200,{

  "id":1,

  "image_url": "https://cdn.bimakart.in/banners/exclusive_deal_1.png",

  "web_url": "https://cdn.bimakart.in/banners/exclusive_deal_1.png",

  "is_active": true

},"Banners fetched successfully"  ))
})