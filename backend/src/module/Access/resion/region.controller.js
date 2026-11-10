import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
  findRegionByName,
  getRegions,
  insertRegion,
  updateRegionById,
} from "./region.model.js";

const createRegion = asyncHandler(async (req, res) => {
  const { region_name, bdm_id } = req.body;

  if (!region_name) {
    throw new ApiError(400, "Region name is required");
  }

  const existingRegion = await findRegionByName(region_name, bdm_id);
  if (existingRegion) {
    throw new ApiError(409, "Region already exists for this BDM");
  }
  const newRegion = await insertRegion({ region_name, bdm_id });

  if (!newRegion) {
    throw new ApiError(500, "Region not created");
  }

  res
    .status(201)
    .json(new ApiResponse(201, newRegion, "Region created successfully"));
});

const allRegion = asyncHandler(async (req, res) => {
  const { countryId } = req.params;
  console.log(countryId);
  if (!countryId) {
    throw new ApiError(400, [], "countryId is required");
  }

  const regionList = await getRegions(countryId);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        regionList || [],
        "Region list fetched successfully",
      ),
    );
});

const updateRegion = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const { region_name, bdm_id } = req.body;

  if (!uuid) {
    throw new ApiError(400, "UUID is invalid");
  }

  if (!region_name && bdm_id === undefined) {
    throw new ApiError(400, "At least one field is required to update");
  }
  b;
  const updated = await updateRegionById(uuid, {
    region_name,
    bdm_id,
  });

  if (!updated) {
    throw new ApiError(404, "Region not found or no changes made");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Region updated successfully"));
});

export { createRegion, allRegion, updateRegion };
