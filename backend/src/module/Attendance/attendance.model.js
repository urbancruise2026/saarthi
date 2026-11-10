import { pool } from "../../config/mySqlDB.js";
import { createCompOffIfEligible } from "../CompOff/compOff.model.js";

export const getAttendanceByDate = async (filters = {}) => {
  try {
    const {
      attendanceDate,
      startDate,
      endDate,
      employeeId,
      branchId,
      departmentId,
      managerId,
      status,
    } = filters;

    const conditions = ["u.is_active = 1"];
    const params = [];

    let attendanceJoin = `
      LEFT JOIN attendance a
        ON a.employee_id = u.id
    `;

    if (startDate && endDate) {
      attendanceJoin += ` AND a.attendance_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else if (attendanceDate) {
      attendanceJoin += ` AND a.attendance_date = ?`;
      params.push(attendanceDate);
    }

    if (employeeId) {
      conditions.push("u.id = ?");
      params.push(employeeId);
    }
    if (branchId) {
      conditions.push("u.branchOffice_id = ?");
      params.push(branchId);
    }
    if (departmentId) {
      conditions.push("u.department_id = ?");
      params.push(departmentId);
    }
    if (managerId) {
      conditions.push("(u.manager_id = ? OR u.id = ?)");
      params.push(managerId, managerId);
    }
    if (status && status !== "All") {
      conditions.push("LOWER(COALESCE(a.status, 'Absent')) = LOWER(?)");
      params.push(status);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `
      SELECT
        u.id AS employee_id,

        TRIM(
  CONCAT(
    COALESCE(u.firstName,''),
    ' ',
    COALESCE(u.lastName,'')
  )
) AS full_name,
        u.firstName,
        u.middleName,
        u.lastName,

        u.department_id,
        d.department_name,

        u.branchOffice_id,
        b.branch_name,

        u.workShift AS permanent_shift_type,
        u.shiftTiming AS permanent_shift_timing,

        eso.shift_type AS temporary_shift_type,
        eso.shift_timing AS temporary_shift_timing,
        eso.week_off,
        eso.from_date,
        eso.to_date,

        -- CHANGED: attendance table me jo shift_timing us din ke liye save hui thi,
        -- usko priority do (actual saved shift), warna override/user table se fallback lo
        COALESCE(a.shift_timing, eso.shift_timing, u.shiftTiming) AS shift_timing,
        a.shift_timing AS attendance_shift_timing,

        CASE
          WHEN eso.id IS NOT NULL THEN 'Temporary'
          ELSE 'Permanent'
        END AS shift_source,

        a.id AS attendance_id,
        a.attendance_date,
        COALESCE(a.status, 'Pending') AS status,
        a.punch_in,
        a.punch_out,
        a.leave_type,
        a.remarks,

        -- CHANGED: attendance table ke calculated fields ab yahan se select ho rahe hain
        a.worked_minutes,
        a.overtime_minutes,
        a.short_minutes,
        a.late_minutes,
        a.early_exit_minutes

      FROM uc_staff_profile u

      LEFT JOIN departments d
        ON d.id = u.department_id

      LEFT JOIN branches b
        ON b.id = u.branchOffice_id

      ${attendanceJoin}

      LEFT JOIN employee_shift_override eso
        ON eso.employee_id = u.id
        AND eso.is_active = 1
        AND (
            a.attendance_date BETWEEN eso.from_date AND eso.to_date
            OR (
                a.attendance_date IS NULL
                AND CURDATE() BETWEEN eso.from_date AND eso.to_date
            )
        )

      ${whereClause}

      ORDER BY
        STR_TO_DATE(
          TRIM(
            SUBSTRING_INDEX(
              COALESCE(eso.shift_timing, u.shiftTiming),
              '-',
              1
            )
          ),
          '%h:%i %p'
        ) ASC,
        u.firstName ASC,
        a.attendance_date DESC;
    `;

    const [rows] = await pool.execute(sql, params);

    // ---------- SUMMARY CALCULATION ----------

    const uniqueEmployees = new Set();
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let lwpCount = 0;

    for (const row of rows) {
      uniqueEmployees.add(row.employee_id);

      const status = (row.status || "").toLowerCase();

      if (status === "present") presentCount++;
      else if (status === "absent") absentCount++;
      else if (status === "leave") leaveCount++;
      else if (status === "lwp") lwpCount++;
    }

    const compOffConditions = ["co.status = 'Available'"];
    const compOffParams = [];

    if (employeeId) {
      compOffConditions.push("co.employee_id = ?");
      compOffParams.push(employeeId);
    }
    if (branchId) {
      compOffConditions.push("u.branchOffice_id = ?");
      compOffParams.push(branchId);
    }
    if (departmentId) {
      compOffConditions.push("u.department_id = ?");
      compOffParams.push(departmentId);
    }
    if (managerId) {
      compOffConditions.push("(u.manager_id = ? OR u.id = ?)");
      compOffParams.push(managerId, managerId);
    }

    const compOffSql = `
      SELECT COUNT(*) AS compOffCount
      FROM comp_offs co
      JOIN uc_staff_profile u ON u.id = co.employee_id
      WHERE ${compOffConditions.join(" AND ")}
    `;

    const [compOffRows] = await pool.execute(compOffSql, compOffParams);
    const compOffCount = compOffRows[0]?.compOffCount || 0;

    const summary = {
      month: new Date().toISOString().slice(0, 7),
      totalEmployee: uniqueEmployees.size,
      present: presentCount,
      absent: absentCount,
      leave: leaveCount,
      compOff: compOffCount,
      lwp: lwpCount,
    };

    return {
      data: rows,
      summary,
    };
  } catch (error) {
    console.error("getAttendanceByDate error:", error);
    throw error;
  }
};

export const getAttendanceByMonth = async (filters = {}) => {
  try {
    const {
      startDate,
      endDate,
      employeeId,
      branchId,
      departmentId,
      managerId,
      hodId,
      zonalHeadId,
    } = filters;

    if (!startDate || !endDate) {
      throw new Error("startDate and endDate are required");
    }

    const conditions = ["u.is_active = 1"];
    const params = [startDate, endDate];

    if (employeeId) {
      conditions.push("u.id = ?");
      params.push(employeeId);
    }

    if (branchId) {
      conditions.push("u.branchOffice_id = ?");
      params.push(branchId);
    }

    if (departmentId) {
      conditions.push("u.department_id = ?");
      params.push(departmentId);
    }

    if (managerId) {
      conditions.push("(u.manager_id = ? OR u.id = ?)");
      params.push(managerId, managerId);
    }

    if (hodId) {
      conditions.push("(u.hod_id = ? OR u.id = ?)");
      params.push(hodId, hodId);
    }

    if (zonalHeadId) {
      conditions.push("(u.zonal_head_id = ? OR u.id = ?)");
      params.push(zonalHeadId, zonalHeadId);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `
      WITH RECURSIVE calendar AS (
        SELECT CAST(? AS DATE) AS dt

        UNION ALL

        SELECT DATE_ADD(dt, INTERVAL 1 DAY)
        FROM calendar
        WHERE dt < CAST(? AS DATE)
      )

      SELECT
        u.id AS employee_id,

        TRIM(
          CONCAT(
            COALESCE(u.firstName, ''),
            ' ',
            COALESCE(u.middleName, ''),
            ' ',
            COALESCE(u.lastName, '')
          )
        ) AS full_name,

        u.firstName,
        u.middleName,
        u.lastName,

        u.department_id,
        d.department_name,

        u.branchOffice_id,
        b.branch_name,

        /* Permanent Shift */
        u.workShift AS permanent_shift_type,
        u.shiftTiming AS permanent_shift_timing,

        /* Temporary Shift */
        eso.shift_type AS temporary_shift_type,
        eso.shift_timing AS temporary_shift_timing,
        eso.week_off,
        eso.from_date,
        eso.to_date,

        /* Final Shift (LIVE / current, for display only) */
        COALESCE(eso.shift_type, u.workShift) AS shift_type,
        COALESCE(eso.shift_timing, u.shiftTiming) AS shift_timing,

        CASE
          WHEN eso.id IS NOT NULL THEN 'Temporary'
          ELSE 'Permanent'
        END AS shift_source,

        a.id AS attendance_id,
        calendar.dt AS attendance_date,

        COALESCE(a.status, 'Absent') AS status,
        a.punch_in,
        a.punch_out,
        a.leave_type,
        a.remarks,
        a.early_exit_reason,
        a.early_exit_approved_by,
        /* Shift jo us din punch-in ke time attendance row me FREEZE ho chuka tha.
           Late calculation isी se hoga — baad me shift change hone se
           purane din ka late status nahi badlega. */
        a.shift_timing AS stored_shift_timing,

        /* Attendance Calculation */
        COALESCE(a.late_minutes, 0) AS late_minutes,
        COALESCE(a.early_exit_minutes, 0) AS early_exit_minutes,
        COALESCE(a.worked_minutes, 0) AS worked_minutes,
        COALESCE(a.overtime_minutes, 0) AS overtime_minutes,
        COALESCE(a.short_minutes, 0) AS short_minutes

      FROM calendar

      CROSS JOIN uc_staff_profile u

      LEFT JOIN attendance a
        ON a.employee_id = u.id
       AND a.attendance_date = calendar.dt

      LEFT JOIN departments d
        ON d.id = u.department_id

      LEFT JOIN branches b
        ON b.id = u.branchOffice_id

      /* Temporary Shift Override */
      LEFT JOIN employee_shift_override eso
        ON eso.employee_id = u.id
       AND eso.is_active = 1
       AND calendar.dt BETWEEN eso.from_date AND eso.to_date

      ${whereClause}

      ORDER BY
        u.firstName ASC,
        calendar.dt ASC;
    `;

    const [rows] = await pool.execute(sql, params);

    // --------------------------------------------------
    // Format Minutes
    // --------------------------------------------------
    const formatMinutes = (minutes) => {
      if (minutes == null) return "00:00";

      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
        2,
        "0",
      )}`;
    };

    // --------------------------------------------------
    // Shift Start Time
    // --------------------------------------------------
    const getShiftStartMinutes = (shiftTiming) => {
      if (!shiftTiming) return null;

      const startPart = shiftTiming.split("-")[0]?.trim();

      if (!startPart) return null;

      const match = startPart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);

      if (!match) return null;

      let [, hh, mm, meridian] = match;

      hh = parseInt(hh, 10);
      mm = parseInt(mm, 10);

      if (meridian) {
        meridian = meridian.toUpperCase();

        if (meridian === "PM" && hh !== 12) {
          hh += 12;
        }

        if (meridian === "AM" && hh === 12) {
          hh = 0;
        }
      }

      return hh * 60 + mm;
    };

    // --------------------------------------------------
    // Punch In Time
    // --------------------------------------------------
    const getPunchInMinutes = (punchIn) => {
      if (!punchIn) return null;

      const parts = String(punchIn).split(":");

      const hh = parseInt(parts[0], 10);
      const mm = parseInt(parts[1], 10);

      if (Number.isNaN(hh) || Number.isNaN(mm)) {
        return null;
      }

      return hh * 60 + mm;
    };

    const LATE_GRACE_MINUTES = 10;

    // --------------------------------------------------
    // Enrich Rows
    // --------------------------------------------------
    const enrichedRows = rows.map((row) => {
      // Late calculation ke liye us din ka FROZEN shift use karo.
      // Agar attendance row me shift_timing store nahi hai (purane records,
      // ya attendance hi mark nahi hui), to live/current shift pe fallback karo.
      const shiftForLateCalc = row.stored_shift_timing || row.shift_timing;

      const shiftStartMinutes = getShiftStartMinutes(shiftForLateCalc);

      const punchInMinutes = getPunchInMinutes(row.punch_in);

      let isLate = false;

      if (
        row.status === "Present" &&
        shiftStartMinutes != null &&
        punchInMinutes != null
      ) {
        const diff = punchInMinutes - shiftStartMinutes;

        isLate = diff > LATE_GRACE_MINUTES;
      }

      return {
        ...row,

        late_time: formatMinutes(row.late_minutes),
        early_exit_time: formatMinutes(row.early_exit_minutes),
        worked_time: formatMinutes(row.worked_minutes),
        overtime_time: formatMinutes(row.overtime_minutes),
        short_time: formatMinutes(row.short_minutes),

        is_late: isLate,
      };
    });

    // --------------------------------------------------
    // Employee-wise Month Summary
    // --------------------------------------------------
    const summaryMap = new Map();

    for (const row of enrichedRows) {
      if (!summaryMap.has(row.employee_id)) {
        summaryMap.set(row.employee_id, {
          employeeId: row.employee_id,
          fullName: row.full_name,

          totalMinutes: 0,

          present: 0,
          absent: 0,
          halfDay: 0,

          leave: 0,
          compOff: 0,
          extraWork: 0,

          lateMarks: 0,
        });
      }

      const emp = summaryMap.get(row.employee_id);

      // Total worked minutes
      emp.totalMinutes += row.worked_minutes || 0;

      // -----------------------------------------------
      // Status Counts
      // -----------------------------------------------

      if (row.status === "Present") {
        emp.present++;

        if (row.is_late) {
          emp.lateMarks++;
        }
      } else if (row.status === "Absent") {
        emp.absent++;
      } else if (row.status === "Half Day") {
        emp.halfDay++;
      } else if (row.status === "Leave") {
        emp.leave++;
      } else if (row.status === "CompOff") {
        emp.compOff++;
      } else if (row.status === "Extra Work") {
        emp.extraWork++;
      }
    }

    // --------------------------------------------------
    // Final Employee Summary
    // --------------------------------------------------
    const summary = Array.from(summaryMap.values()).map((emp) => ({
      ...emp,

      totalHours: formatMinutes(emp.totalMinutes),
    }));

    // --------------------------------------------------
    // Overall Summary
    // --------------------------------------------------
    const overallSummary = summary.reduce(
      (acc, emp) => {
        acc.totalMinutes += emp.totalMinutes;

        acc.present += emp.present;
        acc.absent += emp.absent;
        acc.halfDay += emp.halfDay;

        acc.leave += emp.leave;
        acc.compOff += emp.compOff;
        acc.extraWork += emp.extraWork;

        acc.lateMarks += emp.lateMarks;

        return acc;
      },
      {
        totalMinutes: 0,

        present: 0,
        absent: 0,
        halfDay: 0,

        leave: 0,
        compOff: 0,
        extraWork: 0,

        lateMarks: 0,
      },
    );

    overallSummary.totalHours = formatMinutes(overallSummary.totalMinutes);

    // --------------------------------------------------
    // Return
    // --------------------------------------------------
    return {
      data: enrichedRows,

      summary,

      overallSummary,
    };
  } catch (error) {
    console.error("getAttendanceByMonth error:", error);
    throw error;
  }
};
// export const markAttendance = async ({
//   employeeId,
//   attendanceDate,
//   status,
//   punchIn = null,
// }) => {
//   try {
//     // Get Employee Shift (Temporary > Permanent)
//     const [shiftRows] = await pool.execute(
//       `
//       SELECT
//         COALESCE(eso.shift_timing, u.shiftTiming) AS shift_timing
//       FROM uc_staff_profile u
//       LEFT JOIN employee_shift_override eso
//         ON eso.employee_id = u.id
//        AND eso.is_active = 1
//        AND ? BETWEEN eso.from_date AND eso.to_date
//       WHERE u.id = ?
//       `,
//       [attendanceDate, employeeId],
//     );

//     let lateMinutes = 0;
//     let shiftTimingToSave = null; // <-- naya variable

//     // Sunday check
//     const isSunday = new Date(attendanceDate).getDay() === 0; // 0 = Sunday

//     if (isSunday) {
//       // Sunday shift fixed timing
//       shiftTimingToSave = "10:30 AM - 06:30 PM"; // apna actual Sunday timing yaha likho
//     } else if (shiftRows.length && shiftRows[0].shift_timing) {
//       shiftTimingToSave = shiftRows[0].shift_timing;
//     }

//     if (punchIn && shiftTimingToSave) {
//       let shiftStart;

//       if (isSunday) {
//         shiftStart = "10:30 AM";
//       } else {
//         shiftStart = shiftTimingToSave.split("-")[0].trim();
//       }

//       const shiftStartDate = new Date(`${attendanceDate} ${shiftStart}`);
//       const punchInDate = new Date(`${attendanceDate}T${punchIn}`);

//       lateMinutes = Math.max(
//         0,
//         Math.floor((punchInDate - shiftStartDate) / 60000),
//       );
//     }

//     const sql = `
//       INSERT INTO attendance
//       (
//         employee_id,
//         attendance_date,
//         status,
//         punch_in,
//         late_minutes,
//         shift_timing
//       )
//       VALUES (?, ?, ?, ?, ?, ?)

//       ON DUPLICATE KEY UPDATE
//         status = VALUES(status),
//         punch_in = VALUES(punch_in),
//         late_minutes = VALUES(late_minutes),
//         shift_timing = VALUES(shift_timing)
//     `;

//     const [result] = await pool.execute(sql, [
//       employeeId,
//       attendanceDate,
//       status,
//       punchIn,
//       lateMinutes,
//       shiftTimingToSave,
//     ]);

//     return {
//       ...result,
//       late_minutes: lateMinutes,
//       shift_timing: shiftTimingToSave,
//     };
//   } catch (error) {
//     console.error("markAttendance error:", error);
//     throw error;
//   }
// };

export const markAttendance = async ({
  employeeId,
  attendanceDate,
  status,
  punchIn = null,
}) => {
  try {
    const [shiftRows] = await pool.execute(
      `
      SELECT
        COALESCE(eso.shift_timing, u.shiftTiming) AS shift_timing,
        u.branchOffice_id AS branch_id,
        u.weeklyoff AS week_off_day
      FROM uc_staff_profile u
      LEFT JOIN employee_shift_override eso
        ON eso.employee_id = u.id
       AND eso.is_active = 1
       AND ? BETWEEN eso.from_date AND eso.to_date
      WHERE u.id = ?
      `,
      [attendanceDate, employeeId],
    );

    let lateMinutes = 0;
    let shiftTimingToSave = null;
    let finalStatus = status;

    const branchId = shiftRows.length ? shiftRows[0].branch_id : null;
    const weekOffDay = shiftRows.length ? shiftRows[0].week_off_day : null;

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const attendanceDayName = dayNames[new Date(attendanceDate).getDay()];

    // Employee ka apna weekly-off day match ho raha hai ya nahi (kisi bhi din ho sakta hai)
    const isWeekOff =
      !!weekOffDay &&
      weekOffDay.trim().toLowerCase() === attendanceDayName.toLowerCase();

    // Sirf Sunday hone ka check (fixed timing ke liye)
    const isSunday = attendanceDayName === "Sunday";

    // Branch-wise holiday check
    let isHoliday = false;
    if (branchId) {
      const [holidayRows] = await pool.execute(
        `
        SELECT id
        FROM holidays
        WHERE branch_id = ?
          AND date = ?
          AND is_active = 1
        LIMIT 1
        `,
        [branchId, attendanceDate],
      );
      isHoliday = holidayRows.length > 0;
    }

    // Sirf Sunday ko fixed timing lagao, kisi aur week-off din ko nahi
    if (isSunday) {
      shiftTimingToSave = "10:30 AM - 06:30 PM";
    } else if (shiftRows.length && shiftRows[0].shift_timing) {
      shiftTimingToSave = shiftRows[0].shift_timing;
    }

    if (punchIn && shiftTimingToSave) {
      let shiftStart;

      if (isSunday) {
        shiftStart = "10:30 AM";
      } else {
        shiftStart = shiftTimingToSave.split("-")[0].trim();
      }

      const shiftStartDate = new Date(`${attendanceDate} ${shiftStart}`);
      const punchInDate = new Date(`${attendanceDate}T${punchIn}`);

      lateMinutes = Math.max(
        0,
        Math.floor((punchInDate - shiftStartDate) / 60000),
      );
    }

    // Extra Work logic: employee apne weekly-off din pe aaya YA branch holiday pe aaya
    if (punchIn && (isWeekOff || isHoliday)) {
      finalStatus = "Extra Work";
    }

    const sql = `
      INSERT INTO attendance
      (
        employee_id,
        attendance_date,
        status,
        punch_in,
        late_minutes,
        shift_timing
      )
      VALUES (?, ?, ?, ?, ?, ?)

      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        punch_in = VALUES(punch_in),
        late_minutes = VALUES(late_minutes),
        shift_timing = VALUES(shift_timing)
    `;

    const [result] = await pool.execute(sql, [
      employeeId,
      attendanceDate,
      finalStatus,
      punchIn,
      lateMinutes,
      shiftTimingToSave,
    ]);

    return {
      ...result,
      status: finalStatus,
      late_minutes: lateMinutes,
      shift_timing: shiftTimingToSave,
      is_holiday: isHoliday,
      is_week_off: isWeekOff,
      week_off_day: weekOffDay,
    };
  } catch (error) {
    console.error("markAttendance error:", error);
    throw error;
  }
};

export const updateStatus = async ({ employeeId, attendanceDate, status }) => {
  try {
    const sql = `
      UPDATE attendance
      SET status = ?
      WHERE employee_id = ? 
        AND attendance_date = ?
    `;

    const [result] = await pool.execute(sql, [
      status,
      employeeId,
      attendanceDate,
    ]);

    return result;
  } catch (error) {
    console.error("updateStatus error:", error);
    throw error;
  }
};

export const updatePunchOut = async ({
  employeeId,
  attendanceDate,
  punch_out,
}) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT
          a.id,
          a.punch_in,
          COALESCE(eso.shift_timing, u.shiftTiming) AS shift_timing,
          u.branchOffice_id,
          h.id AS holiday_id
      FROM attendance a
      JOIN uc_staff_profile u
        ON u.id = a.employee_id

      LEFT JOIN employee_shift_override eso
        ON eso.employee_id = u.id
       AND eso.is_active = 1
       AND ? BETWEEN eso.from_date AND eso.to_date

      LEFT JOIN holidays h
        ON h.branch_id = u.branchOffice_id
       AND h.date = ?
       AND h.is_active = 1

      WHERE a.employee_id = ?
        AND a.attendance_date = ?
      `,
      [attendanceDate, attendanceDate, employeeId, attendanceDate],
    );

    if (!rows.length) {
      throw new Error("Attendance not found.");
    }

    const attendance = rows[0];

    // Sunday check
    const isSunday = new Date(attendanceDate).getDay() === 0; // 0 = Sunday

    // Branch holiday check (from holidays table join)
    const isBranchHoliday = attendance.holiday_id != null;

    const isHoliday = isSunday || isBranchHoliday;

    let workedMinutes = 0;
    let overtimeMinutes = 0;
    let shortMinutes = 0;
    let earlyExitMinutes = 0;

    // 8:00 on Sunday/branch holiday, else 8:30
    const REQUIRED_MINUTES = isHoliday ? 8 * 60 : 8 * 60 + 30;

    const formatMinutes = (minutes) => {
      if (minutes == null || minutes < 0) return "00:00";

      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
        2,
        "0",
      )}`;
    };

    if (attendance.punch_in) {
      const punchIn = new Date(`${attendanceDate} ${attendance.punch_in}`);
      const punchOut = new Date(`${attendanceDate} ${punch_out}`);

      // Worked Minutes
      workedMinutes = Math.max(0, Math.floor((punchOut - punchIn) / 60000));

      // Overtime
      overtimeMinutes = Math.max(0, workedMinutes - REQUIRED_MINUTES);

      // Short Hours
      shortMinutes = Math.max(0, REQUIRED_MINUTES - workedMinutes);

      // Early Exit
      if (isSunday) {
        // Sunday shift is fixed: 10:30 AM start, 8 hours duration -> 06:30 PM end
        const shiftEndTime = new Date(`${attendanceDate} 06:30 PM`);

        earlyExitMinutes = Math.max(
          0,
          Math.floor((shiftEndTime - punchOut) / 60000),
        );
      } else if (attendance.shift_timing) {
        // Format: 09:00 AM - 05:30 PM
        const [, shiftEnd] = attendance.shift_timing
          .split("-")
          .map((item) => item.trim());

        const shiftEndTime = new Date(`${attendanceDate} ${shiftEnd}`);

        earlyExitMinutes = Math.max(
          0,
          Math.floor((shiftEndTime - punchOut) / 60000),
        );
      }

      console.log({
        isHoliday,
        isSunday,
        isBranchHoliday,
        requiredMinutes: REQUIRED_MINUTES,
        shiftTiming: isSunday
          ? "10:30 AM - 06:30 PM (fixed)"
          : attendance.shift_timing,
        punchIn,
        punchOut,
        workedMinutes,
        overtimeMinutes,
        shortMinutes,
        earlyExitMinutes,
        workedTime: formatMinutes(workedMinutes),
        overtimeTime: formatMinutes(overtimeMinutes),
        shortTime: formatMinutes(shortMinutes),
        earlyExitTime: formatMinutes(earlyExitMinutes),
      });
    }

    const sql = `
      UPDATE attendance
      SET
          punch_out = ?,
          
          worked_minutes = ?,
          overtime_minutes = ?,
          short_minutes = ?,
          early_exit_minutes = ?
      WHERE employee_id = ?
        AND attendance_date = ?
    `;

    const [result] = await pool.execute(sql, [
      punch_out,

      workedMinutes,
      overtimeMinutes,
      shortMinutes,
      earlyExitMinutes,
      employeeId,
      attendanceDate,
    ]);

    if (workedMinutes >= 465) {
      await createCompOffIfEligible(employeeId, attendanceDate, workedMinutes);
    }
    return {
      success: result.affectedRows > 0,

      is_holiday: isHoliday,
      required_minutes: REQUIRED_MINUTES,

      worked_minutes: workedMinutes,
      overtime_minutes: overtimeMinutes,
      short_minutes: shortMinutes,
      early_exit_minutes: earlyExitMinutes,

      worked_time: formatMinutes(workedMinutes),
      overtime_time: formatMinutes(overtimeMinutes),
      short_time: formatMinutes(shortMinutes),
      early_exit_time: formatMinutes(earlyExitMinutes),
    };
  } catch (error) {
    console.error("updatePunchOut error:", error);
    throw error;
  }
};

export const runAutoAttendanceMarking = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const now = new Date();

    const todayDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(now);

    const todayDayName = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
    }).format(now);

    const dayAliases = {
      sun: "sunday",
      sunday: "sunday",
      mon: "monday",
      monday: "monday",
      tue: "tuesday",
      tues: "tuesday",
      tuesday: "tuesday",
      wed: "wednesday",
      wednesday: "wednesday",
      thu: "thursday",
      thur: "thursday",
      thurs: "thursday",
      thursday: "thursday",
      fri: "friday",
      friday: "friday",
      sat: "saturday",
      saturday: "saturday",
    };
    const normalizeDay = (d) =>
      dayAliases[String(d).trim().toLowerCase()] ||
      String(d).trim().toLowerCase();

    const todayNormalized = normalizeDay(todayDayName);
    const isSundayToday = todayNormalized === "sunday";

    // Get all branches that have an active holiday today (single query,
    // avoids N+1 queries inside the loop below)
    const [holidayRows] = await connection.execute(
      `
      SELECT branch_id
      FROM holidays
      WHERE date = ?
        AND is_active = 1
      `,
      [todayDate],
    );
    const holidayBranchIds = new Set(
      holidayRows.map((row) => String(row.branch_id)),
    );

    const [employees] = await connection.execute(
      `
      SELECT
        u.id AS employee_id,
        u.weeklyOff AS permanent_week_off,
        u.shiftTiming AS permanent_shift_timing,
        u.branchOffice_id AS branch_id,

        eso.id AS eso_id,
        eso.week_off AS temp_week_off,
        eso.shift_timing AS temp_shift_timing,
        eso.is_active AS eso_active,
        eso.from_date,
        eso.to_date,

        a.id AS attendance_id,
        a.punch_in,
        a.status AS existing_status

      FROM uc_staff_profile u

      LEFT JOIN employee_shift_override eso
        ON eso.employee_id = u.id
        AND eso.is_active = 1
        AND ? BETWEEN eso.from_date AND eso.to_date

      LEFT JOIN attendance a
        ON a.employee_id = u.id
        AND a.attendance_date = ?

      WHERE u.is_active = 1
      `,
      [todayDate, todayDate],
    );

    let weekOffCount = 0;
    let holidayCount = 0;
    let absentCount = 0;
    let skippedCount = 0;

    for (const emp of employees) {
      if (emp.attendance_id) {
        skippedCount++;
        continue;
      }

      const hasOverrideWeekOff =
        emp.eso_id != null &&
        emp.temp_week_off != null &&
        String(emp.temp_week_off).trim() !== "";

      const sourceWeekOffRaw = hasOverrideWeekOff
        ? emp.temp_week_off
        : emp.permanent_week_off || "";

      const source = hasOverrideWeekOff ? "shift_override" : "users_table";

      const weekOffDays = String(sourceWeekOffRaw)
        .split(",")
        .map((d) => normalizeDay(d))
        .filter(Boolean);

      const isWeekOffToday = weekOffDays.includes(todayNormalized);

      const isHolidayToday =
        emp.branch_id != null && holidayBranchIds.has(String(emp.branch_id));

      // Priority: WeekOff > Holiday > Absent
      let finalStatus;
      if (isWeekOffToday) {
        finalStatus = "WeekOff";
      } else if (isHolidayToday) {
        finalStatus = "Holiday";
      } else {
        finalStatus = "Absent";
      }

      if (finalStatus === "WeekOff") weekOffCount++;
      else if (finalStatus === "Holiday") holidayCount++;
      else absentCount++;

      let shiftTimingToSave;
      if (isSundayToday) {
        shiftTimingToSave = "10:30 AM - 06:00 PM";
      } else {
        shiftTimingToSave =
          emp.temp_shift_timing || emp.permanent_shift_timing || null;
      }

      let remarks;
      if (finalStatus === "WeekOff") {
        remarks = `Auto-marked Week Off (source: ${source})`;
      } else if (finalStatus === "Holiday") {
        remarks = `Auto-marked Holiday (branch_id: ${emp.branch_id})`;
      } else {
        remarks = "Auto-marked by system (no punch-in till 1:00 PM)";
      }

      await connection.execute(
        `INSERT INTO attendance
          (employee_id, attendance_date, status, remarks, shift_timing, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [emp.employee_id, todayDate, finalStatus, remarks, shiftTimingToSave],
      );
    }

    await connection.commit();

    return {
      date: todayDate,
      day: todayDayName,
      totalChecked: employees.length,
      markedAbsent: absentCount,
      markedWeekOff: weekOffCount,
      markedHoliday: holidayCount,
      skipped: skippedCount,
    };
  } catch (error) {
    await connection.rollback();
    console.error("runAutoAttendanceMarking error:", error);
    throw error;
  } finally {
    connection.release();
  }
};
export const updateEarlyExitDetails = async ({
  attendanceId,
  earlyExitReason,
  earlyExitApprovedBy,
}) => {
  try {
    const sql = `
      UPDATE attendance
      SET
        early_exit_reason = ?,
        early_exit_approved_by = ?
      WHERE id = ?
    `;

    const [result] = await pool.execute(sql, [
      earlyExitReason,
      earlyExitApprovedBy ?? null,
      attendanceId,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("Attendance record not found");
    }

    return result;
  } catch (error) {
    console.error("updateEarlyExitDetails error:", error);
    throw error;
  }
};
