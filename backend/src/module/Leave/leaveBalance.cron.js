import cron from "node-cron";
import { carryForwardLeave, creditMonthlyLeave } from "./leaveBalance.model.js";
// apne leave balance model ka sahi path yahan set karo

// Carry forward: har 1 January ko 12:10 AM (pehle chalega)
const CARRY_FORWARD_CRON_EXPRESSION = "10 0 1 1 *";
// Monthly credit: har mahine ki 1 tareekh ko 12:30 AM
const MONTHLY_CREDIT_CRON_EXPRESSION = "30 0 1 * *";

let tasks = [];

// IST ke hisaab se current year/month (server UTC ho to bhi sahi aayega)
const getISTYearMonth = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  return {
    year: Number(parts.find((p) => p.type === "year").value),
    month: Number(parts.find((p) => p.type === "month").value),
  };
};

const runCarryForward = async () => {
  const startedAt = Date.now();
  try {
    const { year } = getISTYearMonth();
    // 1 Jan ko chalta hai, isliye pichle saal se agle saal me carry forward
    const result = await carryForwardLeave(year - 1);
    console.log(
      `[CarryForwardCron] ${year - 1} -> ${year} done —`,
      JSON.stringify(result),
    );
  } catch (err) {
    console.error("[CarryForwardCron] failed:", err);
  } finally {
    const durationMs = Date.now() - startedAt;
    if (durationMs > 50000) {
      console.warn(`[CarryForwardCron] took ${durationMs}ms`);
    }
  }
};

const runMonthlyCredit = async () => {
  const startedAt = Date.now();
  try {
    const { year, month } = getISTYearMonth();
    const result = await creditMonthlyLeave(year, month);
    console.log(
      `[MonthlyLeaveCreditCron] ${year}-${month} done —`,
      JSON.stringify(result),
    );
  } catch (err) {
    console.error("[MonthlyLeaveCreditCron] failed:", err);
  } finally {
    const durationMs = Date.now() - startedAt;
    if (durationMs > 50000) {
      console.warn(`[MonthlyLeaveCreditCron] took ${durationMs}ms`);
    }
  }
};

export const startLeaveBalanceCron = () => {
  if (tasks.length) {
    console.log("Leave balance cron already running, skipping re-init");
    return;
  }

  const carryForwardTask = cron.schedule(
    CARRY_FORWARD_CRON_EXPRESSION,
    runCarryForward,
    { timezone: "Asia/Kolkata" },
  );

  const monthlyCreditTask = cron.schedule(
    MONTHLY_CREDIT_CRON_EXPRESSION,
    runMonthlyCredit,
    { timezone: "Asia/Kolkata" },
  );

  tasks = [carryForwardTask, monthlyCreditTask];
};

export const stopLeaveBalanceCron = () => {
  if (tasks.length) {
    tasks.forEach((task) => task.stop());
    tasks = [];
    console.log("[LeaveBalanceCron] stopped");
  }
};
