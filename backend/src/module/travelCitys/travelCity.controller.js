import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getTravelCities } from "./travelCity.model.js";

export const createTravelCity = asyncHandler(async (req, res) => {
  const { cityName } = req.body;

  if (!cityName || !cityName.trim()) {
    throw new ApiError(400, "City name is required");
  }

  const existingCity = await findTravelCityByName(cityName.trim());
  if (existingCity) {
    throw new ApiError(409, "Travel city already exists");
  }

  const travelCity = await insertTravelCity({
    cityName: cityName.trim(),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, travelCity, "Travel city created successfully"));
});

export const travelCityList = asyncHandler(async (req, res) => {
  console.log("travelCityList", travelCityList);
  const travelCities = await getTravelCities();

  return res
    .status(200)
    .json(
      new ApiResponse(200, travelCities, "Travel cities fetched successfully"),
    );
});

export const getTravelCity = asyncHandler(async (req, res) => {
  const { uuid } = req.params;

  const travelCity = await getTravelCityByUUID(uuid);

  if (!travelCity) {
    throw new ApiError(404, "Travel city not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, travelCity, "Travel city fetched successfully"));
});

export const updateTravelCityController = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const { cityName } = req.body;

  if (!cityName || !cityName.trim()) {
    throw new ApiError(400, "City name is required");
  }

  const existingCity = await getTravelCityByUUID(uuid);
  if (!existingCity) {
    throw new ApiError(404, "Travel city not found");
  }

  const duplicateCity = await findTravelCityByName(cityName.trim());
  if (duplicateCity && duplicateCity.uuid !== uuid) {
    throw new ApiError(409, "Another travel city with same name exists");
  }

  await updateTravelCity(uuid, cityName.trim());

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Travel city updated successfully"));
});

export const deleteTravelCityController = asyncHandler(async (req, res) => {
  const { uuid } = req.params;

  const existingCity = await getTravelCityByUUID(uuid);
  if (!existingCity) {
    throw new ApiError(404, "Travel city not found");
  }

  await deleteTravelCity(uuid);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Travel city deleted successfully"));
});
