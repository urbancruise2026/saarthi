import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import {
  findCountryByName,
  getCountries,
  insertCountry,
} from "./country.model.js";

const createCountry = asyncHandler(async (req, res) => {
  const { country_name, ceo_id } = req.body;

  if (!country_name || !ceo_id) {
    throw new ApiError(400, "All fields are required");
  }

  const existingCountry = await findCountryByName(country_name, ceo_id);

  if (existingCountry) {
    throw new ApiError(409, "Country already exists in this zone");
  }

  const newCountry = await insertCountry({ country_name, ceo_id });

  if (!newCountry) {
    throw new ApiError(500, "Country not created");
  }

  res
    .status(201)
    .json(new ApiResponse(201, newCountry, "Country created successfully"));
});

const getAllCountry = asyncHandler(async (req, res) => {
  const CountryList = await getCountries();

  res
    .status(200)
    .json(
      new ApiResponse(200, CountryList || [], "Cities fetched successfully"),
    );
});

export { createCountry, getAllCountry };
