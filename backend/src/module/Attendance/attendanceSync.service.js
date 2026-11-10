import { pool } from "../../config/mySqlDB.js";

import { markAttendance, updatePunchOut } from "./attendance.model.js";
import { getLatestPunches } from "./etimeoffice.service.js";

let isSyncing = false;

const OFFICE_KEYS = ["delhi", "mumbai"];

const OFFICE_BRANCH_ID_MAP = {
  delhi: 1,
  mumbai: 2,
};

export const syncAttendance = async () => {
  if (isSyncing) {
    console.log("syncAttendance: previous run still in progress, skipping");
    return;
  }
  isSyncing = true;

  try {
    for (const officeKey of OFFICE_KEYS) {
      try {
        await syncOfficeAttendance(officeKey);
      } catch (officeErr) {
        console.error(`syncAttendance failed for ${officeKey}:`, officeErr);
      }
    }
    console.log("Sync Completed for all offices");
  } catch (err) {
    console.error("syncAttendance failed:", err);
    throw err;
  } finally {
    isSyncing = false;
  }
};

// Helper: "DD/MM/YYYY HH:mm:ss" -> { attendanceDate: "YYYY-MM-DD", time: "HH:mm:ss", dateObj: Date }
const parsePunch = (punchDateStr) => {
  if (!punchDateStr || !punchDateStr.includes("/")) {
    return null;
  }

  const [datePart, timePart] = punchDateStr.split(" ");
  if (!datePart || !timePart) return null;

  const [day, month, year] = datePart.split("/");
  if (!day || !month || !year) return null;

  const paddedDay = day.padStart(2, "0");
  const paddedMonth = month.padStart(2, "0");
  const attendanceDate = `${year}-${paddedMonth}-${paddedDay}`;

  const dateObj = new Date(`${attendanceDate}T${timePart}`);
  if (isNaN(dateObj.getTime())) return null;

  return { attendanceDate, time: timePart, dateObj };
};

const syncOfficeAttendance = async (officeKey) => {
  const [syncRows] = await pool.query(
    "SELECT last_record FROM attendance_sync WHERE office_key=? LIMIT 1",
    [officeKey],
  );

  if (!syncRows.length) {
    console.log(`No sync row found for office: ${officeKey}`);
    return;
  }

  const branchOfficeId = OFFICE_BRANCH_ID_MAP[officeKey];
  if (!branchOfficeId) {
    console.error(`No branchOffice_id mapped for officeKey: ${officeKey}`);
    return;
  }

  const lastRecord = syncRows[0].last_record;
  const response = await getLatestPunches(officeKey, lastRecord);

  if (!response.PunchData || response.PunchData.length === 0) {
    console.log(`No new punches for ${officeKey}`);
    return;
  }

  const punchesWithParsed = response.PunchData.map((punch) => ({
    punch,
    parsed: parsePunch(punch.PunchDate),
  })).filter(({ parsed }) => parsed !== null);

  punchesWithParsed.sort(
    (a, b) => a.parsed.dateObj.getTime() - b.parsed.dateObj.getTime(),
  );

  let hadFailure = false;

  for (const { punch, parsed } of punchesWithParsed) {
    try {
      const { attendanceDate, time, dateObj: currentPunchTime } = parsed;

      const [users] = await pool.query(
        "SELECT id FROM uc_staff_profile WHERE emp_code=? AND branchOffice_id=? LIMIT 1",
        [punch.Empcode, branchOfficeId],
      );

      if (!users.length) {
        console.log(
          `No matching user for emp_code: ${punch.Empcode} in branchOffice_id: ${branchOfficeId} (${officeKey})`,
        );
        continue;
      }

      const employeeId = users[0].id;

      const [attendance] = await pool.query(
        `SELECT id, punch_in, punch_out FROM attendance WHERE employee_id=? AND attendance_date=?`,
        [employeeId, attendanceDate],
      );

      if (!attendance.length) {
        await markAttendance({
          employeeId,
          attendanceDate,
          status: "Present",
          punchIn: time,
        });
      } else {
        const punchInTime = new Date(
          `${attendanceDate}T${attendance[0].punch_in}`,
        );

        if (currentPunchTime > punchInTime) {
          await updatePunchOut({
            employeeId,
            attendanceDate,
            punch_out: time,
          });
        } else {
          console.log(
            `Punch ignored (not later than punch_in): emp ${employeeId} on ${attendanceDate}`,
          );
        }
      }
    } catch (punchErr) {
      console.error(
        `Failed to process punch for emp_code ${punch.Empcode} (${officeKey}):`,
        punchErr,
      );

      hadFailure = true;
      break;
    }
  }

  if (hadFailure) {
    console.warn(
      `Sync for ${officeKey} stopped early due to a failure. last_record NOT advanced to MaxRecord; will retry from previous point next run.`,
    );
    // last_record intentionally left untouched here.
    return;
  }

  await pool.query(
    "UPDATE attendance_sync SET last_record=? WHERE office_key=?",
    [response.MaxRecord, officeKey],
  );

  console.log(`Sync Completed for ${officeKey}`);
};
