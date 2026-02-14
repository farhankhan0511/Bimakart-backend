import 'dotenv/config';
import app from "./src/app.js";
import { connectDB } from './src/Db/Db.js';
import { fetchNewToken} from './src/Lib/TokenManager.js';

import logger from './src/Utils/logger.js';
import { cleanupStaleTokensJob } from './src/Lib/FCMTokencleanercron.js';
import { loadcoinSettingsCache } from './src/Lib/coinSettingCache.js';


const port = process.env.PORT || 8080;

async function bootstrap() {
  try {
    await connectDB();

    logger.info("DB connected");
    await loadcoinSettingsCache();
    logger.info("Coin settings cache loaded");
    await fetchNewToken();
    logger.info("Initial token fetched");
    app.listen(port,"0.0.0.0", () => {
      logger.info(`Server running at http://localhost:${port}`);
    });
    cleanupStaleTokensJob.start();
    logger.info("FCM token cleanup cron job started - runs daily at 2:00 AM IST");
    
  } catch (err) {
    logger.error(err,"Startup failed:");
    process.exit(1);
  }
}


process.on("SIGTERM", () => {
  logger.info("SIGTERM received, stopping cron jobs and shutting down...");
  cleanupStaleTokensJob.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, stopping cron jobs and shutting down...");
  cleanupStaleTokensJob.stop();
  process.exit(0);
});
bootstrap();
