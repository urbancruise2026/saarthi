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

run("npm install --include=dev --production=false", frontendRoot, {
  NODE_ENV: "development",
  NPM_CONFIG_PRODUCTION: "false",
});
run("npx vite build", frontendRoot, { NODE_ENV: "production" });

fs.rmSync(targetPublic, { recursive: true, force: true });
fs.mkdirSync(targetPublic, { recursive: true });
fs.cpSync(frontendDist, targetPublic, { recursive: true });

console.log(`\n✅ Frontend built and copied to ${targetPublic}`);
