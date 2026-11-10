"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchEmployeesThunk } from "@/redux/features/userSlice";
import {
  fetchDepartmentRoles,
  fetchDepartments,
  fetchSubDepartmentRoles,
} from "@/redux/features/department/departmentSlice";
import {
  fetchZoneCities,
  fetchCityById,
} from "@/redux/features/ZoneCity/zoneCitySlice";
import { fetchZonesByRegionId } from "@/redux/features/Zone/zoneSlice";
import { fetchRegionsByCountryId } from "@/redux/features/Region/regionSlice";
import { fetchCountries } from "@/redux/features/Country/countrySlice";
import {
  createAccessControlThunk,
  deleteAccessControlThunk,
  fetchAccessControlListThunk,
  updateAccessControlThunk,
} from "@/redux/features/Accesscontrol/accesscontrolSlice";
import type { EmployeeAssignmentForm } from "@/redux/features/Accesscontrol/accesscontrolApi";

// ============================
// Types
// ============================
type EmployeeAssignmentEntry = {
  id: number;
  employee_id: number;
  employeeName: string;
  department_id: number;
  departmentName: string;
  subDepartment_id: number;
  subDepartmentName: string;
  role_id: number;
  roleName: string;
  region_ids: number[];
  regionNames: string;
  zone_ids: number[];
  zoneNames: string;
  city_ids: number[];
  cityNames: string;
  manager_id: number | null;
  manager_name: string;
  country_id: number | null;
};

type FieldProps = {
  label: string;
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
};

type LocationVisibility = {
  showRegion: boolean;
  showZone: boolean;
  showCity: boolean;
};

// ============================
// MultiSelect Component
// ============================
type MultiSelectProps = {
  options: { id: number; name: string }[];
  selected: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  disabledIds?: Set<number>;
  fieldName?: string;
};

function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
  disabled,
  error,
  disabledIds = new Set(),
  fieldName = "field",
}: MultiSelectProps) {
  console.log(
    `MultiSelect [${fieldName}] rendering, disabledIds:`,
    Array.from(disabledIds),
  );

  const toggle = (id: number) => {
    if (disabledIds.has(id)) {
      console.log(
        `MultiSelect [${fieldName}]: ID ${id} is disabled, ignoring toggle`,
      );
      return;
    }
    console.log(`MultiSelect [${fieldName}] toggling ID:`, id);
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  };

  return (
    <div
      className={`rounded-md border ${error ? "border-red-500" : ""} ${
        disabled ? "pointer-events-none bg-muted opacity-50" : ""
      }`}
    >
      {options.length === 0 ? (
        <p className="p-3 text-xs text-muted-foreground">
          {placeholder || "No options available"}
        </p>
      ) : (
        <div className="max-h-36 overflow-y-auto">
          {options.map((opt) => {
            const isDisabled = disabledIds.has(opt.id);
            return (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center gap-2 border-b px-3 py-2 text-sm last:border-0 ${
                  isDisabled
                    ? "cursor-not-allowed bg-muted/50 opacity-50"
                    : "hover:bg-muted"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.id)}
                  onChange={() => toggle(opt.id)}
                  disabled={isDisabled}
                  className="rounded"
                />
                <span>{opt.name}</span>
                {isDisabled && (
                  <span className="ml-auto text-xs text-red-400">
                    Already assigned
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}
      {selected.length > 0 && (
        <p className="border-t bg-blue-50 px-3 py-1 text-xs text-blue-600">
          {selected.length} selected
        </p>
      )}
    </div>
  );
}

// ============================
// Location visibility rules
// ============================
const TELE_SALES_SUBDEPT = "tele-sales";
const PRE_SALES_SUBDEPT = "pre-sales";

function getLocationVisibility(
  subDepartmentName: string,
  roleName: string,
): LocationVisibility {
  const subDept = subDepartmentName.trim().toLowerCase();
  const role = roleName.trim().toLowerCase();

  if (subDept === TELE_SALES_SUBDEPT) {
    if (role === "city manager")
      return { showRegion: false, showZone: true, showCity: false };
    if (role === "team leader-sales" || role === "travel advisor")
      return { showRegion: false, showZone: false, showCity: true };
    if (role === "regional head-sales")
      return { showRegion: true, showZone: false, showCity: false };
    return { showRegion: true, showZone: true, showCity: true };
  }

  if (subDept === PRE_SALES_SUBDEPT) {
    if (role === "pre-sales manager")
      return { showRegion: true, showZone: false, showCity: false };
    if (role === "pre-sales team leader")
      return { showRegion: false, showZone: true, showCity: false };
    if (role === "pre-sales executive")
      return { showRegion: false, showZone: false, showCity: true };
    return { showRegion: true, showZone: true, showCity: true };
  }

  return { showRegion: true, showZone: true, showCity: true };
}

const defaultForm: EmployeeAssignmentForm = {
  employee_id: null,
  department_id: null,
  subDepartment_id: null,
  role_id: null,
  region_ids: [],
  zone_ids: [],
  city_ids: [],
  manager_id: null,
  manager_name: "",
  country_id: null,
};

function F({ label, required, error, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">This field is required</p>}
    </div>
  );
}

// ============================
// Main Component
// ============================
export default function EmployeeManager() {
  const dispatch = useAppDispatch();

  const { employees = [] } = useAppSelector((state: any) => state.user || {});
  const { departments = [] } = useAppSelector(
    (state: any) => state.department || {},
  );
  const { countries = [] } = useAppSelector(
    (state: any) => state.country || {},
  );
  const {
    accessControlList = [],
    loading: listLoading = false,
    createLoading = false,
    updateLoading = false,
    deleteLoading = false,
  } = useAppSelector((state: any) => state.accessControl || {});

  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [form, setForm] = useState<EmployeeAssignmentForm>(defaultForm);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const [subDepartments, setSubDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [currentSubDeptName, setCurrentSubDeptName] = useState("");
  const [currentRoleName, setCurrentRoleName] = useState("");

  const availableCountries = useMemo(() => {
    const countryMap = new Map<number, string>();
    employees.forEach((emp: any) => {
      const cid = Number(emp.country_id ?? emp.countryId ?? 0);
      if (cid) countryMap.set(cid, cid === 1 ? "India" : `Country ${cid}`);
    });
    if (!countryMap.has(1)) {
      countryMap.set(1, "India");
    }
    return Array.from(countryMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [employees]);

  const locationVisibility = useMemo(
    () => getLocationVisibility(currentSubDeptName, currentRoleName),
    [currentSubDeptName, currentRoleName],
  );

  // ============================
  // Already Assigned IDs
  // ============================
  const alreadyAssignedIds = useMemo(() => {
    const regionIds = new Set<number>();
    const zoneIds = new Set<number>();
    const cityIds = new Set<number>();

    const currentSubDeptId = form.subDepartment_id;
    const currentRoleId = form.role_id;

    if (!currentSubDeptId || !currentRoleId) {
      return { regionIds, zoneIds, cityIds };
    }

    // ✅ Allow duplicate city assignment for these roles
    const allowDuplicateCityRoles = ["travel advisor", "pre-sales executive"];
    const currentRoleLower = currentRoleName.trim().toLowerCase();

    if (allowDuplicateCityRoles.includes(currentRoleLower)) {
      console.log(
        `Role "${currentRoleName}" allows duplicate city assignment — skipping disabled IDs`,
      );
      return { regionIds, zoneIds, cityIds };
    }

    accessControlList.forEach((item: any) => {
      if (editId !== null && item.id === editId) return;

      const itemSubDeptId = Number(
        item.subdepartment_id || item.subDepartment_id,
      );
      const itemRoleId = Number(item.role_id);

      const isSameSubDeptAndRole =
        currentSubDeptId &&
        currentRoleId &&
        itemSubDeptId === Number(currentSubDeptId) &&
        itemRoleId === Number(currentRoleId);

      if (isSameSubDeptAndRole) {
        (item.region_ids || []).forEach((id: number) => regionIds.add(id));
        (item.zone_ids || []).forEach((id: number) => zoneIds.add(id));
        (item.city_ids || []).forEach((id: number) => cityIds.add(id));
      }
    });

    return { regionIds, zoneIds, cityIds };
  }, [
    accessControlList,
    editId,
    form.subDepartment_id,
    form.role_id,
    currentRoleName,
  ]);

  // ============================
  // Validation
  // ============================
  const errors = useMemo(() => {
    const obj: Record<string, boolean> = {};
    if (!form.employee_id) obj.employee_id = true;
    if (!form.department_id) obj.department_id = true;
    if (!form.subDepartment_id) obj.subDepartment_id = true;
    if (!form.role_id) obj.role_id = true;
    if (locationVisibility.showRegion && form.region_ids.length === 0)
      obj.region_ids = true;
    if (locationVisibility.showZone && form.zone_ids.length === 0)
      obj.zone_ids = true;
    if (locationVisibility.showCity && form.city_ids.length === 0)
      obj.city_ids = true;
    return obj;
  }, [form, locationVisibility]);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  useEffect(() => {
    console.log("=== Form state changed ===");
    console.log("subDepartment_id:", form.subDepartment_id);
    console.log("role_id:", form.role_id);
  }, [form.subDepartment_id, form.role_id]);

  useEffect(() => {
    dispatch(fetchEmployeesThunk());
    dispatch(fetchDepartments());
    dispatch(fetchAccessControlListThunk());
    dispatch(fetchCountries());
  }, [dispatch]);

  // ============================
  // Helpers
  // ============================
  const resetForm = () => {
    setForm(defaultForm);
    setEditId(null);
    setShowErrors(false);
    setShowCountryDropdown(false);
    setSubDepartments([]);
    setRoles([]);
    setRegions([]);
    setZones([]);
    setCities([]);
    setCurrentSubDeptName("");
    setCurrentRoleName("");
  };

  const getEmployeeFullName = (emp: any) => {
    const first = emp?.firstName || emp?.first_name || "";
    const last = emp?.lastName || emp?.last_name || "";
    return `${first} ${last}`.trim();
  };

  const getDepartmentName = (id: number | null) => {
    if (!id) return "";
    const d = departments.find((x: any) => Number(x.id) === Number(id));
    return d?.department_name || d?.name || "";
  };

  const loadRegionsByCountry = async (countryId: number) => {
    console.log("Loading regions for country:", countryId);
    try {
      const res: any = await dispatch(
        fetchRegionsByCountryId(countryId),
      ).unwrap();
      console.log("Regions API response:", res);
      const fetched = res?.data || res || [];
      console.log("Fetched regions:", fetched);
      setRegions(Array.isArray(fetched) ? fetched : []);
    } catch (err) {
      console.error("Error loading regions:", err);
      setRegions([]);
    }
  };

  // ============================
  // Manager location access
  // ============================
  const loadManagerLocationAccess = async (
    managerId: number,
    roleName: string,
    subDeptName: string,
  ) => {
    const roleLower = roleName.trim().toLowerCase();
    const subDeptLower = subDeptName.trim().toLowerCase();

    console.log("loadManagerLocationAccess called:", {
      roleLower,
      subDeptLower,
      managerId,
    });

    if (
      subDeptLower !== TELE_SALES_SUBDEPT &&
      subDeptLower !== PRE_SALES_SUBDEPT
    ) {
      console.log("SubDept not eligible, returning");
      return;
    }

    const managerAccess = accessControlList.find(
      (item: any) => Number(item.employee_id) === Number(managerId),
    );

    console.log(
      "Manager access FULL object:",
      JSON.stringify(managerAccess, null, 2),
    );

    if (!managerAccess) {
      console.warn("Manager access not found in accessControlList");
      console.log(
        "Available employee_ids in accessControlList:",
        accessControlList.map((i: any) => i.employee_id),
      );
      return;
    }

    const managerRegionIds: number[] = managerAccess.region_ids || [];
    const managerZoneIds: number[] = managerAccess.zone_ids || [];
    const managerCityIds: number[] = managerAccess.city_ids || [];

    console.log("=== Manager Location Data ===");
    console.log("Manager regions:", managerRegionIds);
    console.log("Manager zones:", managerZoneIds);
    console.log("Manager cities:", managerCityIds);

    try {
      const isTravelAdvisor = roleLower === "travel advisor";
      console.log("isTravelAdvisor:", isTravelAdvisor);

      // ============================
      // ✅ FIXED: Travel Advisor - Manager ke SAARE zone_ids se cities fetch karo
      // ============================
      if (isTravelAdvisor) {
        // CASE 1: Manager ke paas city_ids hain (Team Leader-Sales ka case)
        if (managerCityIds.length > 0) {
          console.log("=== Travel Advisor: Manager has direct city_ids ===");

          // ✅ FIX: Hardcoded zone 2 hataya — manager ke saare zones loop karo
          if (managerZoneIds.length > 0) {
            console.log(
              "=== Loading cities from manager's ALL zone_ids ===",
              managerZoneIds,
            );
            const allCities: any[] = [];

            for (const zoneId of managerZoneIds) {
              try {
                const res: any = await dispatch(
                  fetchZoneCities(zoneId),
                ).unwrap();
                const fetched = Array.isArray(res)
                  ? res
                  : Array.isArray(res?.data)
                    ? res.data
                    : [];
                console.log(`Cities from zone ${zoneId}:`, fetched.length);
                allCities.push(...fetched);
              } catch (err) {
                console.error(
                  "Error fetching cities for zone",
                  zoneId,
                  ":",
                  err,
                );
              }
            }

            // Sirf manager ke city_ids wali cities dikhao
            const filtered = allCities.filter((c: any) =>
              managerCityIds.includes(c.id),
            );
            console.log(
              "Filtered cities matching manager city_ids:",
              filtered.length,
            );

            setCities(filtered.length > 0 ? filtered : allCities);
            setZones(
              managerZoneIds.map((id) => ({ id, zone_name: `Zone ${id}` })),
            );
            setForm((prev) => ({ ...prev, city_ids: [] }));
            return;
          }

          // Fallback: manager ke zone nahi hain, regions se zones nikalo
          if (managerRegionIds.length > 0) {
            console.log(
              "=== Travel Advisor fallback: loading zones from manager regions ===",
            );
            const allZones: any[] = [];

            for (const regionId of managerRegionIds) {
              const res: any = await dispatch(
                fetchZonesByRegionId(regionId),
              ).unwrap();
              const fetched = Array.isArray(res)
                ? res
                : Array.isArray(res?.data)
                  ? res.data
                  : [];
              allZones.push(...fetched);
            }

            setZones(allZones);

            const zoneIds = allZones.map((z: any) => z.id).filter(Boolean);
            const allCities: any[] = [];

            for (const zoneId of zoneIds) {
              try {
                const res: any = await dispatch(
                  fetchZoneCities(zoneId),
                ).unwrap();
                const fetched = Array.isArray(res)
                  ? res
                  : Array.isArray(res?.data)
                    ? res.data
                    : [];
                allCities.push(...fetched);
              } catch (err) {
                console.error(
                  "Error fetching cities for zone",
                  zoneId,
                  ":",
                  err,
                );
              }
            }

            const filtered = allCities.filter((c: any) =>
              managerCityIds.includes(c.id),
            );
            setCities(filtered.length > 0 ? filtered : allCities);
            setForm((prev) => ({ ...prev, city_ids: [] }));
            return;
          }
        }

        // CASE 2: Manager ke paas zone_ids hain (City Manager ka case)
        if (managerZoneIds.length > 0) {
          console.log(
            "=== Travel Advisor: Loading cities from manager's zone_ids ===",
            managerZoneIds,
          );
          const allCities: any[] = [];

          for (const zoneId of managerZoneIds) {
            try {
              const res: any = await dispatch(fetchZoneCities(zoneId)).unwrap();
              const fetched = Array.isArray(res)
                ? res
                : Array.isArray(res?.data)
                  ? res.data
                  : [];
              console.log(`Cities for zone ${zoneId}:`, fetched.length);
              allCities.push(...fetched);
            } catch (err) {
              console.error("Error fetching cities for zone", zoneId, ":", err);
            }
          }

          console.log("Total cities loaded:", allCities.length);
          setCities(allCities);
          setZones(
            managerZoneIds.map((id) => ({ id, zone_name: `Zone ${id}` })),
          );
          setForm((prev) => ({ ...prev, city_ids: [] }));
          return;
        }

        // CASE 3: Manager ke paas sirf region_ids hain (Regional Head ka case)
        if (managerRegionIds.length > 0) {
          console.log("=== Travel Advisor: Loading from manager regions ===");
          const allZones: any[] = [];

          for (const regionId of managerRegionIds) {
            const res: any = await dispatch(
              fetchZonesByRegionId(regionId),
            ).unwrap();
            const fetched = Array.isArray(res)
              ? res
              : Array.isArray(res?.data)
                ? res.data
                : [];
            allZones.push(...fetched);
          }

          setZones(allZones);

          const zoneIds = allZones.map((z: any) => z.id).filter(Boolean);
          console.log("Zone IDs from manager regions:", zoneIds);

          const allCities: any[] = [];
          for (const zoneId of zoneIds) {
            try {
              const res: any = await dispatch(fetchZoneCities(zoneId)).unwrap();
              const fetched = Array.isArray(res)
                ? res
                : Array.isArray(res?.data)
                  ? res.data
                  : [];
              allCities.push(...fetched);
            } catch (err) {
              console.error("Error fetching cities for zone", zoneId, ":", err);
            }
          }

          console.log("Total cities from regions:", allCities.length);
          setCities(allCities);
          setForm((prev) => ({ ...prev, city_ids: [] }));
          return;
        }
      }

      // ============================
      // City Manager - load zones from manager's regions
      // ============================
      const isCityManager = roleLower === "city manager";
      console.log("isCityManager:", isCityManager);

      if (isCityManager) {
        console.log(
          "=== City Manager: Loading zones from manager's regions ===",
        );

        if (managerRegionIds.length > 0) {
          const allZones: any[] = [];

          for (const regionId of managerRegionIds) {
            const res: any = await dispatch(
              fetchZonesByRegionId(regionId),
            ).unwrap();
            const fetched = Array.isArray(res)
              ? res
              : Array.isArray(res?.data)
                ? res.data
                : [];
            console.log("Zones for region", regionId, ":", fetched.length);
            allZones.push(...fetched);
          }

          console.log("Total zones loaded:", allZones.length);
          setZones(allZones);
          setCities([]);
          setForm((prev) => ({ ...prev, zone_ids: [], city_ids: [] }));
          return;
        }

        console.log("Manager has no regions!");
        setZones([]);
        setCities([]);
      }

      // ============================
      // Team Leader / Pre-Sales Team Leader - load cities from manager's zones
      // ============================
      const isTeamLead = roleLower === "team leader-sales";
      const isPreSalesTeamLead = roleLower === "pre-sales team leader";
      console.log("isTeamLead:", isTeamLead);
      console.log("isPreSalesTeamLead:", isPreSalesTeamLead);

      if (isTeamLead || isPreSalesTeamLead) {
        if (managerZoneIds.length > 0) {
          console.log("=== Loading cities from manager's zones ===");
          const allCities: any[] = [];

          for (const zoneId of managerZoneIds) {
            try {
              const res: any = await dispatch(fetchZoneCities(zoneId)).unwrap();
              const fetched = Array.isArray(res)
                ? res
                : Array.isArray(res?.data)
                  ? res.data
                  : [];
              console.log("Cities for zone", zoneId, ":", fetched.length);
              allCities.push(...fetched);
            } catch (err) {
              console.error("Error fetching cities for zone", zoneId, ":", err);
            }
          }

          console.log("Total cities loaded:", allCities.length);
          setCities(allCities);
          setZones(
            managerZoneIds.map((id) => ({ id, zone_name: `Zone ${id}` })),
          );
          setForm((prev) => ({ ...prev, zone_ids: [], city_ids: [] }));
          return;
        }

        if (managerRegionIds.length > 0 && managerZoneIds.length === 0) {
          console.log("=== Loading from manager regions (no zones) ===");
          const allZones: any[] = [];

          for (const regionId of managerRegionIds) {
            const res: any = await dispatch(
              fetchZonesByRegionId(regionId),
            ).unwrap();
            const fetched = Array.isArray(res)
              ? res
              : Array.isArray(res?.data)
                ? res.data
                : [];
            console.log("Zones for region", regionId, ":", fetched.length);
            allZones.push(...fetched);
          }

          setZones(allZones);

          if (allZones.length === 0) {
            console.log("No zones found!");
            setCities([]);
            return;
          }

          const zoneIds = allZones.map((z: any) => z.id).filter(Boolean);
          const allCities: any[] = [];

          for (const zoneId of zoneIds) {
            try {
              const res: any = await dispatch(fetchZoneCities(zoneId)).unwrap();
              const fetched = Array.isArray(res)
                ? res
                : Array.isArray(res?.data)
                  ? res.data
                  : [];
              allCities.push(...fetched);
            } catch (err) {
              console.error("Error fetching cities for zone", zoneId, ":", err);
            }
          }

          console.log("Total cities from regions:", allCities.length);
          setCities(allCities);
          setForm((prev) => ({ ...prev, zone_ids: [], city_ids: [] }));
          return;
        }
      }

      // ============================
      // Pre-Sales Executive
      // ============================
      const isPreSalesExecutive = roleLower === "pre-sales executive";
      console.log("isPreSalesExecutive:", isPreSalesExecutive);

      if (isPreSalesExecutive && managerId) {
        const preSalesManagerAccess = accessControlList.find(
          (item: any) => Number(item.employee_id) === Number(managerId),
        );

        console.log(
          "managerAccess (Pre-Sales Team Leader):",
          preSalesManagerAccess,
        );

        if (!preSalesManagerAccess) {
          console.log("No access control found for Pre-Sales Team Leader");
          setCities([]);
          return;
        }

        const psZoneIds: number[] = preSalesManagerAccess.zone_ids || [];
        const psRegionIds: number[] = preSalesManagerAccess.region_ids || [];

        console.log("Pre-Sales TL zone_ids:", psZoneIds);
        console.log("Pre-Sales TL region_ids:", psRegionIds);

        if (psZoneIds.length > 0) {
          console.log(
            "=== Loading cities from Pre-Sales Team Leader's zones ===",
          );
          const allCities: any[] = [];

          for (const zoneId of psZoneIds) {
            try {
              const res: any = await dispatch(fetchZoneCities(zoneId)).unwrap();
              const fetched = Array.isArray(res)
                ? res
                : Array.isArray(res?.data)
                  ? res.data
                  : [];
              console.log(`Cities for zone ${zoneId}:`, fetched.length);
              allCities.push(...fetched);
            } catch (err) {
              console.error("Error fetching cities for zone", zoneId, ":", err);
            }
          }

          console.log("Total cities loaded:", allCities.length);
          setCities(allCities);
          setZones(
            psZoneIds.map((id: number) => ({ id, zone_name: `Zone ${id}` })),
          );
          setForm((prev) => ({ ...prev, city_ids: [] }));
          return;
        }

        if (psRegionIds.length > 0) {
          console.log(
            "=== Getting zones from Pre-Sales Team Leader's regions ===",
          );
          const allZones: any[] = [];

          for (const regionId of psRegionIds) {
            const res: any = await dispatch(
              fetchZonesByRegionId(regionId),
            ).unwrap();
            const fetched = Array.isArray(res)
              ? res
              : Array.isArray(res?.data)
                ? res.data
                : [];
            allZones.push(...fetched);
          }

          console.log("Zones from regions:", allZones.length);
          setZones(allZones);

          if (allZones.length === 0) {
            console.log("No zones found!");
            setCities([]);
            return;
          }

          const zoneIds = allZones.map((z: any) => z.id).filter(Boolean);
          const allCities: any[] = [];

          for (const zoneId of zoneIds) {
            try {
              const res: any = await dispatch(fetchZoneCities(zoneId)).unwrap();
              const fetched = Array.isArray(res)
                ? res
                : Array.isArray(res?.data)
                  ? res.data
                  : [];
              allCities.push(...fetched);
            } catch (err) {
              console.error("Error fetching cities for zone", zoneId, ":", err);
            }
          }

          console.log("Total cities:", allCities.length);
          setCities(allCities);
          setForm((prev) => ({ ...prev, city_ids: [] }));
          return;
        }

        console.log("Pre-Sales Team Leader has no zone or region access!");
        setCities([]);
      }
    } catch (e) {
      console.error("Manager location access error:", e);
    }
  };

  // ============================
  // Load dept/role/location
  // ============================
  const loadEmployeeDeptRoleLocation = async (
    departmentId: number,
    subDepartmentId: number,
    roleId: number,
    managerId: number | null,
    countryId: number | null,
    hasManager: boolean,
    prefilledRegionIds?: number[],
    prefilledZoneIds?: number[],
    prefilledCityIds?: number[],
  ) => {
    let fetchedSubDepts: any[] = [];
    let fetchedRoles: any[] = [];

    if (departmentId) {
      const deptRes: any = await dispatch(
        fetchDepartmentRoles(departmentId),
      ).unwrap();
      fetchedSubDepts =
        deptRes?.sub_department ||
        deptRes?.subDepartments ||
        deptRes?.data ||
        [];
      setSubDepartments(fetchedSubDepts);
    }

    if (subDepartmentId) {
      const roleRes: any = await dispatch(
        fetchSubDepartmentRoles(subDepartmentId),
      ).unwrap();
      fetchedRoles = roleRes?.roles || roleRes?.data || [];
      setRoles(fetchedRoles);
    }

    const subDept = fetchedSubDepts.find(
      (s: any) => Number(s.id) === subDepartmentId,
    );
    const subDeptName =
      subDept?.subDepartment_name ||
      subDept?.sub_department_name ||
      subDept?.name ||
      "";

    const role = fetchedRoles.find((r: any) => Number(r.id) === roleId);
    const roleName = role?.role_name || role?.name || "";

    console.log("subDeptName:", subDeptName);
    console.log("roleName:", roleName);
    console.log("managerId:", managerId);
    console.log("prefilledRegionIds:", prefilledRegionIds);
    console.log("prefilledZoneIds:", prefilledZoneIds);

    setCurrentSubDeptName(subDeptName);
    setCurrentRoleName(roleName);

    if (prefilledRegionIds && prefilledRegionIds.length > 0) {
      const allZones: any[] = [];
      for (const regionId of prefilledRegionIds) {
        const res: any = await dispatch(
          fetchZonesByRegionId(regionId),
        ).unwrap();
        const fetched = Array.isArray(res?.data || res) ? res?.data || res : [];
        allZones.push(...fetched);
      }
      setZones(allZones);
    }

    if (prefilledZoneIds && prefilledZoneIds.length > 0) {
      const allCities: any[] = [];
      for (const zoneId of prefilledZoneIds) {
        const res: any = await dispatch(fetchZoneCities(zoneId)).unwrap();
        const fetched = Array.isArray(res?.data || res) ? res?.data || res : [];
        allCities.push(...fetched);
      }
      setCities(allCities);
    }

    if (
      managerId &&
      roleName &&
      subDeptName &&
      !prefilledRegionIds?.length &&
      !prefilledZoneIds?.length
    ) {
      console.log("=== Calling loadManagerLocationAccess ===");
      await loadManagerLocationAccess(managerId, roleName, subDeptName);
    }

    if (!hasManager && countryId) {
      await loadRegionsByCountry(countryId);
    }
  };

  // ============================
  // Handlers
  // ============================
  const handleEmployeeChange = async (value: string) => {
    const employeeId = Number(value);
    const emp = employees.find((e: any) => Number(e.id) === employeeId);

    if (!emp) {
      setForm(defaultForm);
      setShowCountryDropdown(false);
      setSubDepartments([]);
      setRoles([]);
      setRegions([]);
      setZones([]);
      setCities([]);
      setCurrentSubDeptName("");
      setCurrentRoleName("");
      return;
    }

    const departmentId = Number(emp.department_id ?? emp.departmentId ?? 0);
    const subDepartmentId = Number(
      emp.subDepartment_id ?? emp.sub_department_id ?? emp.subDepartmentId ?? 0,
    );
    const roleId = Number(emp.role_id ?? emp.roleId ?? 0);
    const managerId = Number(emp.manager_id ?? emp.managerId ?? 0) || null;
    const managerName =
      emp.manager_name || emp.managerName || emp.reporting_manager || "";
    const hasManager = !!managerId || !!managerName;
    const countryId = Number(emp.country_id ?? emp.countryId ?? 0) || null;

    setForm((prev) => ({
      ...prev,
      employee_id: employeeId,
      department_id: departmentId || null,
      subDepartment_id: subDepartmentId || null,
      role_id: roleId || null,
      manager_id: managerId,
      manager_name: managerName,
      country_id: countryId,
      region_ids: [],
      zone_ids: [],
      city_ids: [],
    }));

    setShowCountryDropdown(!hasManager);
    setZones([]);
    setCities([]);
    setRegions([]);
    setCurrentSubDeptName("");
    setCurrentRoleName("");

    try {
      await loadEmployeeDeptRoleLocation(
        departmentId,
        subDepartmentId,
        roleId,
        managerId,
        countryId,
        hasManager,
      );
    } catch (error) {
      console.error("Employee change error:", error);
      setSubDepartments([]);
      setRoles([]);
    }
  };

  const handleCountryChange = async (value: string) => {
    const countryId = Number(value);
    setForm((prev) => ({
      ...prev,
      country_id: countryId,
      region_ids: [],
      zone_ids: [],
      city_ids: [],
    }));
    setZones([]);
    setCities([]);
    await loadRegionsByCountry(countryId);
  };

  const handleRegionToggle = async (ids: number[]) => {
    console.log("Selected region IDs:", ids);
    setForm((prev) => ({
      ...prev,
      region_ids: ids,
      zone_ids: [],
      city_ids: [],
    }));
    setZones([]);
    setCities([]);

    if (ids.length > 0) {
      try {
        const allZones: any[] = [];
        for (const regionId of ids) {
          const res: any = await dispatch(
            fetchZonesByRegionId(regionId),
          ).unwrap();
          const fetched = Array.isArray(res?.data || res)
            ? res?.data || res
            : [];
          allZones.push(...fetched);
        }
        setZones(allZones);
      } catch (err) {
        console.error("Error fetching zones:", err);
        setZones([]);
      }
    }
  };

  const handleZoneToggle = async (ids: number[]) => {
    console.log("Selected zone IDs:", ids);
    setForm((prev) => ({ ...prev, zone_ids: ids, city_ids: [] }));
    setCities([]);

    if (ids.length > 0) {
      try {
        const allCities: any[] = [];
        for (const zoneId of ids) {
          const res: any = await dispatch(fetchZoneCities(zoneId)).unwrap();
          const fetched = Array.isArray(res?.data || res)
            ? res?.data || res
            : [];
          allCities.push(...fetched);
        }
        setCities(allCities);
      } catch (err) {
        console.error("Error fetching cities:", err);
        setCities([]);
      }
    }
  };

  const openAddDialog = () => {
    resetForm();
    setOpenFormDialog(true);
  };

  // ============================
  // Edit Dialog Open
  // ============================
  const openEditDialog = async (item: EmployeeAssignmentEntry) => {
    resetForm();
    setEditId(item.id);
    setShowErrors(false);

    const hasManager = !!item.manager_id || !!item.manager_name;
    setShowCountryDropdown(!hasManager);

    setForm({
      employee_id: item.employee_id,
      department_id: item.department_id,
      subDepartment_id: item.subDepartment_id,
      role_id: item.role_id,
      manager_id: item.manager_id,
      manager_name: item.manager_name,
      country_id: item.country_id,
      region_ids: item.region_ids || [],
      zone_ids: item.zone_ids || [],
      city_ids: item.city_ids || [],
    });

    try {
      if (item.country_id) {
        await loadRegionsByCountry(item.country_id);
      }

      await loadEmployeeDeptRoleLocation(
        item.department_id,
        item.subDepartment_id,
        item.role_id,
        item.manager_id,
        item.country_id,
        hasManager,
        item.region_ids,
        item.zone_ids,
        item.city_ids,
      );
    } catch (error) {
      console.error("Edit dialog load error:", error);
    }

    setOpenFormDialog(true);
  };

  // ============================
  // Delete Confirm
  // ============================
  const openDeleteConfirm = (id: number) => {
    setDeleteTargetId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await dispatch(deleteAccessControlThunk(deleteTargetId)).unwrap();
      toast.success("Assignment deleted successfully");
    } catch (error: any) {
      toast.error(error?.message || "Delete failed");
    } finally {
      setOpenDeleteDialog(false);
      setDeleteTargetId(null);
    }
  };

  // ============================
  // Redux list -> UI table mapping
  // ============================
  const mappedAssignments: EmployeeAssignmentEntry[] = useMemo(() => {
    return (accessControlList || []).map((item: any) => {
      const employee = employees.find(
        (emp: any) => Number(emp.id) === Number(item.employee_id),
      );

      return {
        id: item.id,
        employee_id: item.employee_id,
        employeeName:
          item.employee_name ||
          item.employeeName ||
          getEmployeeFullName(employee),
        alias_name: item.alias_name,
        department_id: item.department_id,
        departmentName:
          item.department_name ||
          item.departmentName ||
          getDepartmentName(item.department_id),
        subDepartment_id: item.subdepartment_id || item.subDepartment_id,
        subDepartmentName:
          item.subdepartment_name ||
          item.subDepartmentName ||
          item.sub_department_name ||
          "",
        role_id: item.role_id,
        roleName: item.role_name || item.roleName || "",
        region_ids: item.region_ids || [],
        regionNames: item.region_names
          ? Array.isArray(item.region_names)
            ? item.region_names.join(", ")
            : item.region_names
          : Array.isArray(item.regions)
            ? item.regions
                .map((r: any) => r.region_name || r.name)
                .filter(Boolean)
                .join(", ")
            : "",
        zone_ids: item.zone_ids || [],
        zoneNames: item.zone_names
          ? Array.isArray(item.zone_names)
            ? item.zone_names.join(", ")
            : item.zone_names
          : Array.isArray(item.zones)
            ? item.zones
                .map((z: any) => z.zone_name || z.name)
                .filter(Boolean)
                .join(", ")
            : "",
        city_ids: item.city_ids || [],
        cityNames: item.city_names
          ? Array.isArray(item.city_names)
            ? item.city_names.join(", ")
            : item.city_names
          : Array.isArray(item.cities)
            ? item.cities
                .map((c: any) => c.city_name || c.name)
                .filter(Boolean)
                .join(", ")
            : "",
        manager_id: item.reporting_manager_id ?? item.manager_id ?? null,
        manager_name: item.manager_name || item.reporting_manager_name || "",
        country_id: item.country_id ?? null,
      };
    });
  }, [accessControlList, employees, departments]);

  // ============================
  // Submit (Create + Update)
  // ============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (hasErrors) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload: EmployeeAssignmentForm = {
      employee_id: form.employee_id,
      department_id: form.department_id,
      subDepartment_id: form.subDepartment_id,
      role_id: form.role_id,
      manager_id: form.manager_id,
      manager_name: form.manager_name,
      country_id: form.country_id,
      region_ids: locationVisibility.showRegion ? form.region_ids : [],
      zone_ids: locationVisibility.showZone ? form.zone_ids : [],
      city_ids: locationVisibility.showCity ? form.city_ids : [],
    };

    console.log("=== SUBMIT PAYLOAD ===");
    console.log("currentSubDeptName:", currentSubDeptName);
    console.log("currentRoleName:", currentRoleName);
    console.log("locationVisibility:", locationVisibility);
    console.log("Final payload:", payload);

    try {
      if (editId !== null) {
        await dispatch(
          updateAccessControlThunk({ id: editId, payload }),
        ).unwrap();
        await dispatch(fetchAccessControlListThunk()).unwrap();
        toast.success("Assignment updated successfully");
      } else {
        await dispatch(createAccessControlThunk(payload)).unwrap();
        await dispatch(fetchAccessControlListThunk()).unwrap();
        toast.success("Assignment saved successfully");
      }

      resetForm();
      setOpenFormDialog(false);
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error?.message || "Something went wrong");
    }
  };

  const isSubmitLoading = editId !== null ? updateLoading : createLoading;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Manager</h2>
          <p className="text-sm text-muted-foreground">
            Assign employee with department, sub department, role, region, zone
            and city
          </p>
        </div>
        <Button onClick={openAddDialog}>+ Add Employee Assignment</Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[1300px] border-collapse text-sm">
          <thead className="bg-muted/50">
            <tr>
              {[
                "Employee",
                " Alias Name",
                "Department",
                "Sub Department",
                "Role",
                "Reporting Manager",
                "Region",
                "Zone",
                "City",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="border-b px-4 py-3 text-left font-semibold"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listLoading ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Loading assignments...
                </td>
              </tr>
            ) : mappedAssignments.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No employee assignments found
                </td>
              </tr>
            ) : (
              mappedAssignments.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="border-b px-4 py-3">{item.employeeName}</td>
                  <td className="border-b px-4 py-3">{item.alias_name}</td>
                  <td className="border-b px-4 py-3">{item.departmentName}</td>
                  <td className="border-b px-4 py-3">
                    {item.subDepartmentName}
                  </td>
                  <td className="border-b px-4 py-3">{item.roleName}</td>
                  <td className="border-b px-4 py-3">
                    {item.manager_name || (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </td>
                  <td className="border-b px-4 py-3">
                    {item.regionNames || (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="border-b px-4 py-3">
                    {item.zoneNames || (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="border-b px-4 py-3">
                    {item.cityNames || (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="border-b px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteConfirm(item.id)}
                        disabled={deleteLoading}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog
        open={openFormDialog}
        onOpenChange={(open) => {
          setOpenFormDialog(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editId !== null
                ? "Edit Employee Assignment"
                : "Add Employee Assignment"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Employee */}
              <F
                label="Employee Name"
                required
                error={showErrors && !!errors.employee_id}
              >
                <Select
                  value={form.employee_id?.toString() || ""}
                  onValueChange={handleEmployeeChange}
                  disabled={editId !== null}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {getEmployeeFullName(emp) || `Employee #${emp.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </F>

              {/* Department (auto) */}
              <F
                label="Department"
                required
                error={showErrors && !!errors.department_id}
              >
                <Select value={form.department_id?.toString() || ""} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto selected" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments
                      ?.filter(
                        (d: any) =>
                          d?.is_active === 1 ||
                          d?.is_active === true ||
                          d?.is_active === undefined,
                      )
                      .map((dept: any) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.department_name || dept.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </F>

              {/* Sub Department (auto) */}
              <F
                label="Sub Department"
                required
                error={showErrors && !!errors.subDepartment_id}
              >
                <Select
                  value={form.subDepartment_id?.toString() || ""}
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auto selected" />
                  </SelectTrigger>
                  <SelectContent>
                    {subDepartments.map((sub: any) => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>
                        {sub.subDepartment_name ||
                          sub.sub_department_name ||
                          sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </F>

              {/* Role (auto) */}
              <F label="Role" required error={showErrors && !!errors.role_id}>
                <Select value={form.role_id?.toString() || ""} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto selected" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role: any) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.role_name || role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </F>

              {/* Reporting Manager OR Country */}
              {!showCountryDropdown ? (
                <F label="Reporting Manager">
                  <Select value={form.manager_id?.toString() || ""} disabled>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          form.manager_name
                            ? form.manager_name
                            : form.employee_id
                              ? "No manager assigned"
                              : "Auto selected"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {form.manager_id && (
                        <SelectItem value={form.manager_id.toString()}>
                          {form.manager_name || `Manager #${form.manager_id}`}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </F>
              ) : (
                <F label="Country (No Manager — Select to load Regions)">
                  <Select
                    value={form.country_id?.toString() || ""}
                    onValueChange={handleCountryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {(countries.length > 0
                        ? countries
                        : availableCountries
                      ).map((c: any) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.country_name || c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </F>
              )}

              {/* Region */}
              {locationVisibility.showRegion && (
                <F
                  label="Region"
                  required
                  error={showErrors && !!errors.region_ids}
                >
                  <MultiSelect
                    options={regions.map((r: any) => ({
                      id: r.id,
                      name: r.region_name || r.name,
                    }))}
                    selected={form.region_ids}
                    onChange={handleRegionToggle}
                    placeholder={
                      regions.length === 0
                        ? "Select country first"
                        : "Select regions"
                    }
                    disabled={regions.length === 0}
                    error={showErrors && !!errors.region_ids}
                    disabledIds={alreadyAssignedIds.regionIds}
                    fieldName="region"
                  />
                </F>
              )}

              {/* Zone */}
              {locationVisibility.showZone && (
                <F
                  label="Zone"
                  required
                  error={showErrors && !!errors.zone_ids}
                >
                  <MultiSelect
                    options={zones.map((z: any) => ({
                      id: z.id,
                      name: z.zone_name || z.name,
                    }))}
                    selected={form.zone_ids}
                    onChange={handleZoneToggle}
                    placeholder={
                      zones.length === 0
                        ? "Select region first"
                        : "Select zones"
                    }
                    disabled={zones.length === 0}
                    error={showErrors && !!errors.zone_ids}
                    disabledIds={alreadyAssignedIds.zoneIds}
                    fieldName="zone"
                  />
                </F>
              )}

              {/* City */}
              {locationVisibility.showCity && (
                <F
                  label="City"
                  required
                  error={showErrors && !!errors.city_ids}
                >
                  <MultiSelect
                    options={cities.map((c: any) => ({
                      id: c.id,
                      name: c.city_name || c.name,
                    }))}
                    selected={form.city_ids}
                    onChange={(ids) =>
                      setForm((prev) => ({ ...prev, city_ids: ids }))
                    }
                    placeholder={
                      cities.length === 0
                        ? "Select zone first"
                        : "Select cities"
                    }
                    disabled={cities.length === 0}
                    error={showErrors && !!errors.city_ids}
                    disabledIds={alreadyAssignedIds.cityIds}
                    fieldName="city"
                  />
                </F>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenFormDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitLoading}>
                {isSubmitLoading
                  ? editId !== null
                    ? "Updating..."
                    : "Saving..."
                  : editId !== null
                    ? "Update Assignment"
                    : "Save Assignment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={openDeleteDialog}
        onOpenChange={(open) => {
          setOpenDeleteDialog(open);
          if (!open) setDeleteTargetId(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Kya aap sure hain? Yeh action undo nahi hoga.
          </p>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteDialog(false);
                setDeleteTargetId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
