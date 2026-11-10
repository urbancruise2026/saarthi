// Loads backend/.env before anything else runs.
// Uses an absolute path, so it works no matter which folder you start the server from.
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`[env] loaded ${envPath}`);
} else {
  console.warn(
    `[env] ${envPath} not found — using system environment variables only`,
  );
}
