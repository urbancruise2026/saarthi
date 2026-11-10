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

// Selected leave type ka available balance check karta hai
export const assertBalance = async ({
  employeeId,
  leaveTypeId,
  leaveCode,
  year,
  days,
  excludeId = null,
}) => {
  if (leaveCode === COMP_OFF_CODE) {
    const compOff = await getCompOffBalance(employeeId);
    const available = Number(compOff?.balance || 0);

    if (available < days) {
      throw new ApiError(
        400,
        available === 0
          ? "Aapke paas Comp Off balance nahi hai"
          : `Aapke paas sirf ${available} Comp Off hai, aap ${days} din ka apply nahi kar sakte`,
      );
    }
    return;
  }

  if (!tracksBalanceFor(leaveCode)) return;

  const closing = await getAvailableBalance(employeeId, leaveTypeId, year);
  const pending = await getPendingDays(
    employeeId,
    leaveTypeId,
    year,
    excludeId,
  );
  const available = Math.max(closing - pending, 0);

  if (available < days) {
    const pendingNote =
      pending > 0 ? ` (${pending} din ki leave pehle se pending hai)` : "";

    throw new ApiError(
      400,
      available === 0
        ? `Aapke paas ${leaveCode} balance nahi hai${pendingNote}`
        : `Aapke paas sirf ${available} ${leaveCode} hai${pendingNote}, aap ${days} din ka apply nahi kar sakte`,
    );
  }
};
