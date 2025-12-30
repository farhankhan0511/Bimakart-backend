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
        url: process.env.DEPLOYED_URL || "https://bimakart-backend.onrender.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [path.join(__dirname, "../routes/**/*.js")],
};

export const swaggerSpec = swaggerJSDoc(options);
