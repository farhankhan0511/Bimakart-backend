import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger.js";


const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100,
  message: "Too many requests, please try again later.",
});
const app = express();
const corsOptions = {
  origin: process.env.FEND_URL,  
  allowedHeaders: 'Content-Type,Authorization',
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(apiLimiter)
app.use(express.static("public"))
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));


app.set("trust proxy", true);
//temporary for swagger hai

import AuthRoutes from "./Routes/Auth.Routes.js";
import UserRoutes from "./Routes/User.Routes.js";
import PaymentRoutes from "./Routes/Payment.Routes.js";
import PurchaseRoutes from "./Routes/Purchase.Routes.js";


app.use("/api/auth", AuthRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/payment", PaymentRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/purchase", PurchaseRoutes);

export default app;

