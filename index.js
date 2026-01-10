import 'dotenv/config';
import app from "./src/app.js";
import { connectDB } from './src/Db/Db.js';
import { fetchNewToken} from './src/Lib/TokenManager.js';

import logger from './src/Utils/logger.js';


const port = process.env.PORT || 8080;

async function bootstrap() {
  try {
    await connectDB();

    logger.info("DB connected");
    await fetchNewToken();
    logger.info("Initial token fetched");
    app.listen(port,"0.0.0.0", () => {
      logger.info(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    logger.error(err,"Startup failed:");
    process.exit(1);
  }
}

bootstrap();
