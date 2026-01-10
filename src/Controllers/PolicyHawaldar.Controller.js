import axios from "axios";
import { asynchandler } from "../Utils/asynchandler.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import FormData from "form-data";
import fs from "fs";


export const policyanalysis=asynchandler(async(req,res)=>{
    const Policypath=req.file?.path;
    try {
        if(!Policypath){
            return res.status(400).json(new ApiResponse(400,{},"Policy not found"))
        }
        const form = new FormData();
        form.append("file", fs.createReadStream(Policypath));
const response = await axios.post(
  `${process.env.PolicyHawaldarURL}/api/v1/conversation`,
  form,
  {
    headers: {
      ...form.getHeaders(), 
    },
  }
);

<<<<<<< HEAD
        console.log(response)
=======
        
>>>>>>> 8085e14 (added logging and removed locking bug)
        if(response.status!==200){
            res.status(500).json(new ApiResponse(500,{},"Error getting response"))
        }
        res.status(200).json(new ApiResponse(200,response.data,"Operation Successful"))


        
    } catch (error) {
        res.status(500).json(new ApiResponse(500,{},error.message || "Internal Server Error"))
    }

})