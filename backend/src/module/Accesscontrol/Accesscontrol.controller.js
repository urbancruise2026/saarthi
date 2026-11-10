import {
  getAllAccessControls,
  getAccessControlByEmployeeId,
  insertAccessControl,
  updateAccessControl,
  deleteAccessControl,
} from "./Accesscontrol.model.js";
import { pool } from "../../config/mySqlDB.js";

// HELPER: Role name fetch karo
// ==============================
const getRoleName = async (roleId) => {
  const [rows] = await pool.query(`SELECT role_name FROM roles WHERE id = ?`, [
    roleId,
  ]);
  return rows[0]?.role_name?.trim().toLowerCase() || "";
};

// HELPER: SubDept name fetch karo
// ==============================
const getSubDeptName = async (subdeptId) => {
  const [rows] = await pool.query(
    `SELECT subDepartment_name FROM sub_department WHERE id = ?`,
    [subdeptId],
  );
  return rows[0]?.subDepartment_name?.trim().toLowerCase() || "";
};

// HELPER: Manager ka access control
// ==============================
const getManagerAccess = async (managerId) => {
  return await getAccessControlByEmployeeId(managerId);
};

// ==============================
const validateAndResolveLocation = async (payload, roleName, subDeptName) => {
  const role = roleName.trim().toLowerCase();
  const subDept = subDeptName.trim().toLowerCase();

  const {
    reporting_manager_id,
    region_ids = [],
    zone_ids = [],
    city_ids = [],
  } = payload;

  // ── Tele-Sales ──────────────────────────────────────
  if (subDept === "tele-sales") {
    // Regional Head → regions free select, no validation needed
    if (role === "regional head-sales") {
      if (region_ids.length === 0) {
        throw new Error(
          "Regional Head ko kam se kam ek region assign karna zaroori hai",
        );
      }
      return { region_ids, zone_ids: [], city_ids: [] };
    }

    // City Manager → zones must belong to manager's regions
    if (role === "city manager") {
      if (zone_ids.length === 0) {
        throw new Error(
          "City Manager ko kam se kam ek zone assign karna zaroori hai",
        );
      }
      if (!reporting_manager_id) {
        throw new Error("City Manager ke liye reporting manager required hai");
      }

      const managerAccess = await getManagerAccess(reporting_manager_id);
      if (!managerAccess || managerAccess.region_ids.length === 0) {
        throw new Error("Manager ka region access nahi mila");
      }

      // Validate: selected zones manager ke regions ke under hain?
      const [validZones] = await pool.query(
        `SELECT id FROM zones 
         WHERE id IN (?) AND region_id IN (?)`,
        [zone_ids, managerAccess.region_ids],
      );

      if (validZones.length !== zone_ids.length) {
        throw new Error(
          "Selected zones manager ke assigned regions ke bahar hain",
        );
      }

      // Auto-resolve: in zones ki region_ids set karo
      const [zoneRegions] = await pool.query(
        `SELECT DISTINCT region_id FROM zones WHERE id IN (?)`,
        [zone_ids],
      );
      const resolvedRegionIds = zoneRegions.map((r) => r.region_id);

      return { region_ids: resolvedRegionIds, zone_ids, city_ids: [] };
    }

    // Team Leader / Travel Advisor → cities from manager's zones (no validation needed)
    if (role === "team leader-sales" || role === "travel advisor") {
      if (!reporting_manager_id) {
        throw new Error("Reporting manager required hai");
      }

      const managerAccess = await getManagerAccess(reporting_manager_id);
      if (!managerAccess || managerAccess.zone_ids.length === 0) {
        throw new Error("Manager ka zone access nahi mila");
      }

      // Auto-resolve zone_ids from selected cities
      const [cityZones] = await pool.query(
        `SELECT DISTINCT zone_id FROM city WHERE id IN (?)`,
        [city_ids],
      );
      const resolvedZoneIds = cityZones.map((z) => z.zone_id);

      // Auto-resolve region_ids from zones
      const [zoneRegions] = await pool.query(
        `SELECT DISTINCT region_id FROM zones WHERE id IN (?)`,
        [resolvedZoneIds],
      );
      const resolvedRegionIds = zoneRegions.map((r) => r.region_id);

      return {
        region_ids: resolvedRegionIds,
        zone_ids: resolvedZoneIds,
        city_ids,
      };
    }
  }

  // ── Pre-Sales ────────────────────────────────────────
  if (subDept === "pre-sales") {
    // Pre-Sales Manager → region_ids free select
    if (role === "pre-sales manager") {
      if (region_ids.length === 0) {
        throw new Error("Pre-Sales Manager ko kam se kam ek region chahiye");
      }
      return { region_ids, zone_ids: [], city_ids: [] };
    }

    // Pre-Sales Team Leader → zones freely selectable
    if (role === "pre-sales team leader") {
      if (zone_ids.length === 0) {
        throw new Error("Pre-Sales Team Leader ko kam se kam ek zone chahiye");
      }
      if (!reporting_manager_id) {
        throw new Error("Reporting manager required hai");
      }

      const managerAccess = await getManagerAccess(reporting_manager_id);
      if (!managerAccess || managerAccess.region_ids.length === 0) {
        throw new Error("Manager ka region access nahi mila");
      }

      // Get all zones from manager's regions for validation
      const [zonesFromRegions] = await pool.query(
        `SELECT id FROM zones WHERE region_id IN (?)`,
        [managerAccess.region_ids],
      );
      const validZoneIds = zonesFromRegions.map((z) => z.id);

      // Validate selected zones are from manager's regions
      const selectedZoneIds = zone_ids.map((id) => Number(id));
      const invalidZones = selectedZoneIds.filter(
        (zid) => !validZoneIds.includes(zid),
      );

      if (invalidZones.length > 0) {
        throw new Error(
          "Selected zones manager ke assigned regions ke bahar hain",
        );
      }

      // Auto-resolve region_ids from selected zones
      const [zoneRegions] = await pool.query(
        `SELECT DISTINCT region_id FROM zones WHERE id IN (?)`,
        [zone_ids],
      );
      const resolvedRegionIds = zoneRegions.map((r) => r.region_id);

      return {
        region_ids: resolvedRegionIds,
        zone_ids,
        city_ids: [],
      };
    }

    // Pre-Sales Executive → cities from manager's zones
    if (role === "pre-sales executive") {
      if (city_ids.length === 0) {
        throw new Error("Pre-Sales Executive ko kam se kam ek city chahiye");
      }
      if (!reporting_manager_id) {
        throw new Error("Reporting manager required hai");
      }

      const managerAccess = await getManagerAccess(reporting_manager_id);
      if (!managerAccess) {
        throw new Error("Manager ka access control nahi mila");
      }

      console.log("=== PRE-SALES EXECUTIVE VALIDATION ===");
      console.log("managerAccess.region_ids:", managerAccess.region_ids);
      console.log("managerAccess.zone_ids:", managerAccess.zone_ids);

      // Get valid city IDs from manager's zones OR manager's regions
      let validCityIds = [];

      // If manager has direct zone_ids, get cities from those zones
      if (managerAccess.zone_ids && managerAccess.zone_ids.length > 0) {
        const [citiesFromZones] = await pool.query(
          `SELECT id FROM city WHERE zone_id IN (?)`,
          [managerAccess.zone_ids],
        );
        validCityIds = citiesFromZones.map((c) => Number(c.id));
        console.log("Valid city IDs from manager zones:", validCityIds);
      }

      // If manager has regions (and no zones or still need more cities), get cities from regions too
      if (managerAccess.region_ids && managerAccess.region_ids.length > 0) {
        const [citiesFromRegions] = await pool.query(
          `SELECT c.id FROM city c
           JOIN zones z ON c.zone_id = z.id
           WHERE z.region_id IN (?)`,
          [managerAccess.region_ids],
        );
        const cityIdsFromRegions = citiesFromRegions.map((c) => Number(c.id));

        // Merge unique city IDs
        if (validCityIds.length > 0) {
          validCityIds = [...new Set([...validCityIds, ...cityIdsFromRegions])];
        } else {
          validCityIds = cityIdsFromRegions;
        }
        console.log("Valid city IDs from manager regions:", cityIdsFromRegions);
        console.log("Combined valid city IDs:", validCityIds);
      }

      if (validCityIds.length === 0) {
        throw new Error("Manager ke zones ya regions mein koi city nahi mili");
      }

      // Check if selected cities are valid
      const numericSelected = city_ids.map((id) => Number(id));
      const numericValid = validCityIds.map((id) => Number(id));

      console.log("Selected city IDs:", numericSelected);
      console.log("Valid city IDs:", numericValid);

      const invalidCities = numericSelected.filter(
        (id) => !numericValid.includes(id),
      );

      if (invalidCities.length > 0) {
        console.log("Invalid cities:", invalidCities);
        throw new Error(
          "Selected cities manager ke zones/regions ke bahar hain",
        );
      }

      // Auto-resolve zone_ids and region_ids from selected cities
      const [cityZones] = await pool.query(
        `SELECT DISTINCT zone_id FROM city WHERE id IN (?)`,
        [city_ids],
      );
      const resolvedZoneIds = cityZones.map((z) => z.zone_id);

      const [zoneRegions] = await pool.query(
        `SELECT DISTINCT region_id FROM zones WHERE id IN (?)`,
        [resolvedZoneIds],
      );
      const resolvedRegionIds = zoneRegions.map((r) => r.region_id);

      console.log("resolvedZoneIds:", resolvedZoneIds);
      console.log("resolvedRegionIds:", resolvedRegionIds);

      return {
        region_ids: resolvedRegionIds,
        zone_ids: resolvedZoneIds,
        city_ids,
      };
    }
  }

  // Default: jo aaya woh store karo
  return { region_ids, zone_ids, city_ids };
};

// GET ALL
// GET /api/access-control
// ==============================
export const getAll = async (req, res) => {
  try {
    const data = await getAllAccessControls();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getAll error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET BY EMPLOYEE ID
// GET /api/access-control/employee/:employeeId
// ==============================
export const getByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const data = await getAccessControlByEmployeeId(Number(employeeId));

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Employee ka access control nahi mila",
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getByEmployeeId error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE
// POST /api/access-control
// ==============================
export const create = async (req, res) => {
  try {
    const {
      employee_id,
      department_id,
      subdepartment_id,
      role_id,
      reporting_manager_id,
      region_ids = [],
      zone_ids = [],
      city_ids = [],
    } = req.body;

    // Basic validation
    if (!employee_id || !department_id || !subdepartment_id) {
      return res.status(400).json({
        success: false,
        message: "employee_id, department_id, subdepartment_id required hain",
      });
    }

    // Get role name if provided (for validation logic)
    let roleName = "";
    if (role_id) {
      roleName = await getRoleName(role_id);
    }

    const subDeptName = await getSubDeptName(subdepartment_id);

    // Location validate aur resolve karo
    const resolvedLocation = await validateAndResolveLocation(
      { reporting_manager_id, region_ids, zone_ids, city_ids },
      roleName,
      subDeptName,
    );

    const ac_id = await insertAccessControl({
      employee_id,
      department_id,
      subdepartment_id,
      role_id,
      reporting_manager_id: reporting_manager_id || null,
      ...resolvedLocation,
    });

    return res.status(201).json({
      success: true,
      message: "Access control successfully create hua",
      data: { id: ac_id },
    });
  } catch (error) {
    console.error("create error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// UPDATE
// PUT /api/access-control/:id
// ==============================
export const update = async (req, res) => {
  try {
    const ac_id = Number(req.params.id);
    const {
      employee_id,
      department_id,
      subdepartment_id,
      role_id,
      reporting_manager_id,
      region_ids = [],
      zone_ids = [],
      city_ids = [],
    } = req.body;

    if (!employee_id || !department_id || !subdepartment_id) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    let roleName = "";
    if (role_id) {
      roleName = await getRoleName(role_id);
    }

    const subDeptName = await getSubDeptName(subdepartment_id);

    const resolvedLocation = await validateAndResolveLocation(
      { reporting_manager_id, region_ids, zone_ids, city_ids },
      roleName,
      subDeptName,
    );

    await updateAccessControl(ac_id, {
      employee_id,
      department_id,
      subdepartment_id,
      role_id,
      reporting_manager_id: reporting_manager_id || null,
      ...resolvedLocation,
    });

    return res.status(200).json({
      success: true,
      message: "Access control successfully update hua",
    });
  } catch (error) {
    console.error("update error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE
// DELETE /api/access-control/:id
// ==============================
export const remove = async (req, res) => {
  try {
    const ac_id = Number(req.params.id);
    await deleteAccessControl(ac_id);
    return res.status(200).json({
      success: true,
      message: "Access control successfully delete hua",
    });
  } catch (error) {
    console.error("remove error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
