import 'dotenv/config';
import app from "./src/app.js";
import { connectDB } from './src/Db/Db.js';
import { fetchNewToken} from './src/Lib/TokenManager.js';

const port = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await connectDB();
    console.log("DB connected");
    await fetchNewToken();
    console.log("Initial token fetched");
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

bootstrap();
