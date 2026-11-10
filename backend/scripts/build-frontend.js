// Builds the React frontend and copies it into backend/public,
// so the backend can serve the app on the same port as the API.
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const frontendRoot = path.resolve(backendRoot, "../frontend");
const frontendDist = path.join(frontendRoot, "dist");
const targetPublic = path.join(backendRoot, "public");

const run = (cmd, cwd, extraEnv = {}) => {
  console.log(`\n▶ ${cmd}  (in ${cwd})`);
  execSync(cmd, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
  });
};

if (!fs.existsSync(path.join(frontendRoot, "package.json"))) {
  console.error(`❌ Frontend folder not found at ${frontendRoot}`);
  process.exit(1);
}

// Dev dependencies (vite, tailwind, etc.) are needed to build.
run("npm install --include=dev", frontendRoot, {
  NODE_ENV: "development",
  NPM_CONFIG_PRODUCTION: "false",
});

// Build into a clean dist folder.
fs.rmSync(frontendDist, { recursive: true, force: true });
run("npx vite build", frontendRoot, { NODE_ENV: "production" });

if (!fs.existsSync(path.join(frontendDist, "index.html"))) {
  console.error("❌ Build finished but frontend/dist/index.html is missing");
  process.exit(1);
}

// Replace backend/public with the fresh build.
fs.rmSync(targetPublic, { recursive: true, force: true });
fs.cpSync(frontendDist, targetPublic, { recursive: true });

console.log(`\n✅ Frontend built and copied to ${targetPublic}`);
