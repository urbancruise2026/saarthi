import http from "http";
import { app } from "./app.js";
import { connectMySQL } from "./config/mySqlDB.js";
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

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  startAttendanceSyncCron();
  startLeaveBalanceCron();
});
const shutdown = (signal) => {
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
