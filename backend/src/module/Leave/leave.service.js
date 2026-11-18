import { pool } from "../../config/mySqlDB.js";
import { ApiError } from "../../utils/ApiError.js";
import { getCompOffBalance } from "../CompOff/compOff.model.js";
import { getPendingDays } from "./leaveApplication.model.js";
import { getAvailableBalance } from "./leaveBalance.model.js";

export const COMP_OFF_CODE = "CO";
export const UNPAID_CODE = "UL";

// Unpaid leave ke alawa har type ka balance track hota hai
export const tracksBalanceFor = (leaveCode) => leaveCode !== UNPAID_CODE;

// Dynamic UPDATE ke liye helper: sirf allowed aur defined fields lega
export const buildUpdate = (data = {}, allowed = []) => {
  const fields = [];
  const values = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  return { fields, values };
};

/**
 * employeeId kabhi numeric id (70) aata hai, kabhi employee code (UCDEL000006).
 * comp_offs / leave balance tables numeric uc_staff.id use karte hain,
 * isliye hamesha numeric id mein convert karte hain.
 */
export const resolveEmployeeId = async (employeeId) => {
  if (employeeId === null || employeeId === undefined || employeeId === "") {
    throw new ApiError(400, "employeeId is required");
  }

  // Already numeric (number ya "70" jaisi string)
  if (/^\d+$/.test(String(employeeId))) {
    return Number(employeeId);
  }

  // Employee code (UCDEL000006) -> numeric uc_staff.id
  const [rows] = await pool.query(
    "SELECT id FROM uc_staff WHERE employee_id = ? LIMIT 1",
    [employeeId],
  );

  if (!rows.length) {
    throw new ApiError(404, `Employee not found: ${employeeId}`);
  }

  return rows[0].id;
};

// Selected leave type ka available balance check karta hai
export const assertBalance = async ({
  employeeId,
  leaveTypeId,
  leaveCode,
  year,
  days,
  excludeId = null,
}) => {
  // Hamesha numeric id use karo
  const empId = await resolveEmployeeId(employeeId);

  if (leaveCode === COMP_OFF_CODE) {
    const available = await getCompOffBalance(empId); // already number

    if (available < days) {
      throw new ApiError(
        400,
        available === 0
          ? "You do not have any Comp Off balance"
          : `You only have ${available} Comp Off day(s) available, so you cannot apply for ${days} day(s)`,
      );
    }
    return;
  }

  if (!tracksBalanceFor(leaveCode)) return;

  const closing = await getAvailableBalance(empId, leaveTypeId, year);
  const pending = await getPendingDays(empId, leaveTypeId, year, excludeId);
  const available = Math.max(closing - pending, 0);

  if (available < days) {
    const pendingNote =
      pending > 0 ? ` (${pending} day(s) of leave are already pending)` : "";

    throw new ApiError(
      400,
      available === 0
        ? `You do not have any ${leaveCode} balance${pendingNote}`
        : `You only have ${available} ${leaveCode} day(s) available${pendingNote}, so you cannot apply for ${days} day(s)`,
    );
  }
};

/**
 * Advance notice check:
 * 1 day  -> 24 hours pehle
 * 2 days -> 48 hours pehle
 * 3 days -> 72 hours pehle
 * >3 days -> 1 month pehle
 */
export const validateAdvanceNotice = (
  fromDate,
  totalDays,
  now = new Date(),
) => {
  const from = new Date(fromDate);
  const days = Number(totalDays);

  let minNoticeDate;
  let ruleText;

  if (days > 3) {
    // 1 month advance (calendar month)
    minNoticeDate = new Date(now);
    minNoticeDate.setMonth(minNoticeDate.getMonth() + 1);
    ruleText =
      "more than 3 days leave must be applied at least 1 month in advance";
  } else {
    // 1 day = 24h, 2 days = 48h, 3 days = 72h
    const hoursRequired = Math.ceil(days) * 24;
    minNoticeDate = new Date(now.getTime() + hoursRequired * 60 * 60 * 1000);
    ruleText = `${days} day leave must be applied at least ${hoursRequired} hours in advance`;
  }

  if (from < minNoticeDate) {
    return { valid: false, message: `Advance notice required: ${ruleText}` };
  }

  return { valid: true, message: null };
};
