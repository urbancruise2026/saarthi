import {
  getAllStates,
  getAllCities,
  getStatesByCity,
  getGrades,
} from "./state.model.js";

import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const fetchStates = asyncHandler(async (req, res) => {
  const states = await getAllStates();

  return res
    .status(200)
    .json(new ApiResponse(200, states, "States fetched successfully"));
});

const fetchcityBystate = asyncHandler(async (req, res) => {
  const { cityName } = req.params;

  if (!cityName) {
    throw new ApiError(400, "City name is required");
  }

  const result = await getStatesByCity(cityName);
  console.log(result);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "State fetched successfully"));
});

const fetchAllCities = asyncHandler(async (req, res) => {
  const cities = await getAllCities();

  return res
    .status(200)
    .json(new ApiResponse(200, cities, "All cities fetched successfully"));
});
const getAllGareds = asyncHandler(async (req, res) => {
  const gradeList = await getGrades();

  res
    .status(200)
    .json(new ApiResponse(200, gradeList || [], "Grades fetched successfully"));
});

export { fetchStates, fetchcityBystate, fetchAllCities, getAllGareds };
