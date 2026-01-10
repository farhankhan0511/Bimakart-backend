
import jwt from "jsonwebtoken"
import {ApiResponse} from "../Utils/ApiResponse.js"
import { authtokens } from "../Models/Auth.Model.js"
import { asynchandler } from "../Utils/asynchandler.js";

export const verifyJWT = asynchandler(async (req, res, next) => {
  const token =
    req.headers.authorization?.replace("Bearer ", "") 

  if (!token) {
    return res.status(401).json(new ApiResponse(401, {}, "Unauthorized"));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const auth = await authtokens.findById(decoded._id);
    if (!auth) {
      return res.status(401).json(new ApiResponse(401, {}, "Invalid token"));
    }
   
    req.decodedmobile=decoded.mobile;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(422)
        .json(new ApiResponse(422, {}, "Token expired"));
    }
    return res.status(401).json(new ApiResponse(401, {}, "Token invalid"));
  }
});


