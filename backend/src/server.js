import "./config/env.js"; // must be first: loads backend/.env
import http from "http";
import { app } from "./app.js";
import { connectMySQL, pool } from "./config/mySqlDB.js";
import {
  registerHealthCheck,
  setShuttingDown,
} from "./module/Health/health.route.js";
import { initSocket } from "./socket/socket.js";
import {
  startAttendanceSyncCron,
  stopAttendanceSyncCron,
} from "./module/Attendance/corn.service.js";
import {
  startLeaveBalanceCron,
  stopLeaveBalanceCron,
} from "./module/Leave/leaveBalance.cron.js";

const PORT = process.env.PORT || 5000;

process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});

connectMySQL().catch?.((err) => console.error("[connectMySQL] failed:", err));

// /health/ready returns 503 when MySQL does not answer.
registerHealthCheck("mysql", async () => {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
});

// The deploy smoke test starts a second copy of the app with DISABLE_CRON=1,
// so attendance sync and leave credit jobs never run twice.
const CRON_ENABLED = process.env.DISABLE_CRON !== "1";

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  if (CRON_ENABLED) {
    startAttendanceSyncCron();
    startLeaveBalanceCron();
  } else {
    console.log("⏸️  Cron jobs disabled (DISABLE_CRON=1)");
  }
});
let shuttingDown = false;
const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  setShuttingDown(); // /health/ready now returns 503
  console.log(`${signal} received — shutting down gracefully`);
  stopAttendanceSyncCron();
  stopLeaveBalanceCron();
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
