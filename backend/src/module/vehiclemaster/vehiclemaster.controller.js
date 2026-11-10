import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getVehicles } from "./vehiclemaster.model.js";

const getVehicleCodeList = asyncHandler(async (req, res) => {
  const vehicleList = await getVehicles();

  if (!vehicleList || vehicleList.length === 0) {
    throw new ApiError(404, "Vehicle list not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, vehicleList, "Vehicle list fetched successfully"),
    );
});

export { getVehicleCodeList };
