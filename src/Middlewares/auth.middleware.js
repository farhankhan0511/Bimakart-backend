
import jwt from "jsonwebtoken"
import {ApiResponse} from "../Utils/ApiResponse.js"
import { authtokens } from "../Models/Auth.Model.js"
import { asynchandler } from "../Utils/asynchandler.js";
import { Admin } from "../Models/AdminAuth.Model.js";

export const verifyJWT = asynchandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    const token = parts[1];

  if (!token) {
    return res.status(401).json(new ApiResponse(401, {}, "Unauthorized"));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const auth = await authtokens.findById(decoded._id);
    if (!auth) {
      return res.status(401).json(new ApiResponse(401, {}, "Invalid token"));
    }
   
    req.mobile = decoded.mobile;
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


export const verifyAdminJWT = asynchandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    const token = parts[1];

  if (!token) {
    return res.status(401).json(new ApiResponse(401, {}, "Unauthorized"));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const auth = await Admin.findOne({ email: decoded.email });
    if (!auth) {
      return res.status(401).json(new ApiResponse(401, {}, "Invalid token"));
    }
   
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


