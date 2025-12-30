
import jwt from "jsonwebtoken"
import {ApiResponse} from "../utils/ApiResponse.js"




export const verifyJWT=asynchandler(async(req,res,next)=>{
   try {
    
    const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
 
    if(!token){
     return res.status(401).json(new ApiResponse(401,{},"Unauthorized Access"))
    }
    const decoded=await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
    req.user=user;
    next()
 
   } catch (error) {
   return res.status(401).json(new ApiResponse(401,{},error?.message || "invalid access token"))
   }
})

