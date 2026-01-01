import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bimakart Backend API",
      version: "1.0.0",
      description: "API documentation for Bimakart backend",
    },
    servers: [
      {
        url: "https://bimakart-backend.onrender.com",
        description: "Production server",
      },
    ],
  },

  apis: [
    path.join(__dirname, "../Routes/**/*.js")
  ],
};



export const swaggerSpec = swaggerJSDoc(options);
