import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger.js";
<<<<<<< HEAD
=======
import logger from "../src/Utils/logger.js"
>>>>>>> 8085e14 (added logging and removed locking bug)


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


<<<<<<< HEAD
app.set("trust proxy", true);
//temporary for swagger hai
=======

>>>>>>> 8085e14 (added logging and removed locking bug)

import AuthRoutes from "./Routes/Auth.Routes.js";
import UserRoutes from "./Routes/User.Routes.js";
import PaymentRoutes from "./Routes/Payment.Routes.js";
import PurchaseRoutes from "./Routes/Purchase.Routes.js";
import MarketRoutes from "./Routes/Market.Routes.js"
import PolicyhawaldarRoutes from "./Routes/PolicyHawaldar.Routes.js"
<<<<<<< HEAD
=======
import { pinoHttp } from "pino-http";

app.use(pinoHttp({ logger }));
app.use((err, req, res, next) => {
  logger.error(
    {
      err: err.message,
      stack: err.stack,
      path: req.originalUrl,
    },
    "Unhandled error"
  );

  res.status(500).json({ message: "Internal Server Error" });
});
>>>>>>> 8085e14 (added logging and removed locking bug)


app.use("/api/auth", AuthRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/payment", PaymentRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/marketing",MarketRoutes)
app.use("/api/policyhawaldar",PolicyhawaldarRoutes)
app.use("/api/purchase", PurchaseRoutes);

export default app;

