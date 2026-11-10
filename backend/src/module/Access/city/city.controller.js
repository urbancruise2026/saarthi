import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
  findCityByName,
  getCities,
  insertCity,
  getCityById,
} from "./city.model.js";

const createCity = asyncHandler(async (req, res) => {
  const { city_name, zone_id } = req.body;

  if (!city_name || !zone_id) {
    throw new ApiError(400, "All fields are required");
  }

  const existingCity = await findCityByName(city_name, zone_id);

  if (existingCity) {
    throw new ApiError(409, "City already exists in this zone");
  }

  const newCity = await insertCity({ city_name, zone_id });

  if (!newCity) {
    throw new ApiError(500, "City not created");
  }
  a;
  res
    .status(201)
    .json(new ApiResponse(201, newCity, "City created successfully"));
});

const getAllCity = asyncHandler(async (req, res) => {
  const { zoneId } = req.params;

  if (!zoneId || isNaN(zoneId)) {
    throw new ApiError(400, "Valid zoneId is required");
  }

  const cityList = await getCities(Number(zoneId));

  return res
    .status(200)
    .json(new ApiResponse(200, cityList || [], "Cities fetched successfully"));
});

const getCityByIdHandler = asyncHandler(async (req, res) => {
  const { cityId } = req.params;

  if (!cityId || isNaN(cityId)) {
    throw new ApiError(400, "Valid cityId is required");
  }

  const city = await getCityById(Number(cityId));

  if (!city) {
    throw new ApiError(404, "City not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, city, "City fetched successfully"));
});

export { createCity, getAllCity, getCityByIdHandler };
