import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { findZoneByName, insertZone, getZones } from "./zone.model.js";

// ✅ Create Zone
const createZone = asyncHandler(async (req, res) => {
  const { zone_name, region_id, zone_manager_id } = req.body;

  // Basic validation
  if (!zone_name || !region_id) {
    throw new ApiError(400, "Zone name and region are required");
  }

  // Duplicate check (same region)
  const existingZone = await findZoneByName(zone_name, region_id);
  if (existingZone) {
    throw new ApiError(409, "Zone already exists in this region");
  }

  // Insert zone
  const newZone = await insertZone({
    zone_name,
    region_id,
    zone_manager_id: zone_manager_id || null,
  });

  if (!newZone) {
    throw new ApiError(500, "Zone not created");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newZone, "Zone created successfully"));
});

// ✅ Get All Zones



const getAllZone = asyncHandler(async (req, res) => {
  const { regionId } = req.params;

  if (!regionId || isNaN(regionId)) {
    throw new ApiError(400, "Valid regionId is required");
  }

  const zoneList = await getZones(Number(regionId));

  return res.status(200).json(
    new ApiResponse(200, zoneList || [], "Zone list fetched successfully")
  );
});
export { createZone, getAllZone };
