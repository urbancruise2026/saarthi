// PM2 settings for Saarthi on the server.
// Lives at /home/urbancruise-saarthi/htdocs/saarthi.urbancruise.org/shared/ecosystem.config.cjs
const path = require("path");

// The folder that holds releases/, current and shared/
const APP_ROOT = path.resolve(__dirname, "..");

module.exports = {
  apps: [
    {
      name: "saarthi",
      // Always run from "current", so every restart picks up the newest release.
      // backend/.env is loaded by src/config/env.js, so no --env-file here.
      cwd: path.join(APP_ROOT, "current", "backend"),
      script: path.join(APP_ROOT, "current", "backend", "src", "server.js"),
      env: { NODE_ENV: "production" },

      // ONE process only: Socket.IO + cron jobs (attendance, leave credit)
      exec_mode: "fork",
      instances: 1,

      autorestart: true,
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 2000,
      max_memory_restart: "500M",

      // server.js forces exit after 10 s; give it 15 s before SIGKILL
      kill_timeout: 15000,

      time: true,
    },
  ],
};
