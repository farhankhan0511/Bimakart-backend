import 'dotenv/config';
import app from "./src/app.js";
import { connectDB } from './src/Db/Db.js';
import { fetchNewToken} from './src/Lib/TokenManager.js';
<<<<<<< HEAD
=======
import logger from './src/Utils/logger.js';
>>>>>>> 8085e14 (added logging and removed locking bug)

const port = process.env.PORT || 8080;

async function bootstrap() {
  try {
    await connectDB();
<<<<<<< HEAD
    console.log("DB connected");
    await fetchNewToken();
    console.log("Initial token fetched");
    app.listen(port,"0.0.0.0", () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
=======
    logger.info("DB connected");
    await fetchNewToken();
    logger.info("Initial token fetched");
    app.listen(port,"0.0.0.0", () => {
      logger.info(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    logger.error(err,"Startup failed:");
>>>>>>> 8085e14 (added logging and removed locking bug)
    process.exit(1);
  }
}

bootstrap();
