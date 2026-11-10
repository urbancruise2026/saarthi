import cron from "node-cron";
import { syncAttendance } from "./attendanceSync.service.js";
import { runAutoAttendanceMarking } from "./attendance.model.js";

const SYNC_CRON_EXPRESSION_SLOT1 = "35 11 * * *";
const SYNC_CRON_EXPRESSION_SLOT2 = "15 14 * * *";
const SYNC_CRON_EXPRESSION_SLOT3 = "35 18 * * *";
const SYNC_CRON_EXPRESSION_SLOT4 = "10 22 * * *";

const AUTO_ATTENDANCE_CRON_EXPRESSION = "11 16 * * *";

let tasks = [];

const runSync = async (slotLabel) => {
  const startedAt = Date.now();
  try {
    await syncAttendance();
  } catch (err) {
    console.error(`[AttendanceSyncCron:${slotLabel}] sync failed:`, err);
  } finally {
    const durationMs = Date.now() - startedAt;
    if (durationMs > 50000) {
      console.warn(
        `[AttendanceSyncCron:${slotLabel}] sync took ${durationMs}ms — consider increasing interval`,
      );
    }
  }
};

const runAutoMarking = async () => {
  const startedAt = Date.now();
  try {
    const result = await runAutoAttendanceMarking();
    console.log(
      `[AutoAttendanceMarkingCron:2:30PM] done —`,
      JSON.stringify(result),
    );
  } catch (err) {
    console.error(`[AutoAttendanceMarkingCron:1:00PM] failed:`, err);
  } finally {
    const durationMs = Date.now() - startedAt;
    if (durationMs > 50000) {
      console.warn(
        `[AutoAttendanceMarkingCron:1:00PM] took ${durationMs}ms — consider optimizing query`,
      );
    }
  }
};

export const startAttendanceSyncCron = () => {
  if (tasks.length) {
    console.log("Attendance sync cron already running, skipping re-init");
    return;
  }

  const slot1Task = cron.schedule(
    SYNC_CRON_EXPRESSION_SLOT1,
    () => runSync("11:30AM"),
    { timezone: "Asia/Kolkata" },
  );

  const slot2Task = cron.schedule(
    SYNC_CRON_EXPRESSION_SLOT2,
    () => runSync("2:00PM"),
    { timezone: "Asia/Kolkata" },
  );

  const slot3Task = cron.schedule(
    SYNC_CRON_EXPRESSION_SLOT3,
    () => runSync("6:30PM"),
    { timezone: "Asia/Kolkata" },
  );

  const slot4Task = cron.schedule(
    SYNC_CRON_EXPRESSION_SLOT4,
    () => runSync("10:00PM"),
    { timezone: "Asia/Kolkata" },
  );

  const autoAttendanceTask = cron.schedule(
    AUTO_ATTENDANCE_CRON_EXPRESSION,
    runAutoMarking,
    { timezone: "Asia/Kolkata" },
  );

  tasks = [slot1Task, slot2Task, slot3Task, slot4Task, autoAttendanceTask];
};

export const stopAttendanceSyncCron = () => {
  if (tasks.length) {
    tasks.forEach((task) => task.stop());
    tasks = [];
    console.log("[AttendanceSyncCron] stopped");
  }
};
