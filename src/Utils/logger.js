<<<<<<< HEAD
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname since you're using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve path to logs directory (../logs from utils)
const logDir = path.resolve(__dirname, "../logs");

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Path to the log file
const logFilePath = path.join(logDir, "employee_errors.log");

// Ensure the file exists
if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, "", { encoding: "utf8" });
}

/**
 * Logs a message to the employee_errors.log file with timestamp and ID
 * @param {string} id - Mongoose _id
 * @param {string} name - Entity name or action
 */
export function logAction(id, name ) {
  const entry = {
    timestamp: new Date().toISOString(),
    id,
    name
  };
  fs.appendFileSync(logFilePath, JSON.stringify(entry) + "\n", "utf8");
}
=======
import pino from "pino";

const logger = pino({
  level:  "info",
  transport:{
          target: "pino-pretty",
          options: { colorize: true }
        }
      
});

export default logger;
>>>>>>> 8085e14 (added logging and removed locking bug)
