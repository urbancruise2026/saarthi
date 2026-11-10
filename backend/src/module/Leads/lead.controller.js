import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createCustomers,
  createUnwantedLead,
  getLeads,
  insertLead,
  updateLeadById,
} from "./lead.model.js";

const createLeads = asyncHandler(async (req, res) => {
  const data = req.body;
  const city = req.user.city;

  // Basic validation
  if (!data.customerName || !data.customerPhone) {
    throw new ApiError(400, "Name, Phone are required");
  }

  // Step 1: Create customer or get existing customer
  const customerResult = await createCustomers({
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    companyName: data.companyName,
    customerType: data.customerType,
    customerCategoryType: data.customerCategoryType,
    address: data.address,
    date_of_birth: data.date_of_birth,
    anniversary: data.anniversary,
    gender: data.gender,
    state: data.state,
    pincode: data.pincode,
    alternatePhone: data.alternatePhone,
    countryName: data.countryName,
    customerCity: data.customerCity || city,
  });

  if (!customerResult?.customerId) {
    throw new ApiError(400, "Customer could not be created or fetched");
  }

  // Step 2: Prepare lead data with customer_id
  const leadData = {
    ...data,
    city,
    customer_id: customerResult.customerId,
  };

  // Optional: remove customer-only fields before lead insert
  delete leadData.customerName;
  delete leadData.customerPhone;
  delete leadData.customerEmail;
  delete leadData.companyName;
  delete leadData.customerType;
  delete leadData.customerCategoryType;
  delete leadData.address;
  delete leadData.date_of_birth;
  delete leadData.anniversary;
  delete leadData.gender;
  delete leadData.state;
  delete leadData.pincode;
  delete leadData.alternatePhone;
  delete leadData.countryName;
  delete leadData.customerCity;

  // Step 3: Insert lead
  const newLead = await insertLead(leadData);

  if (!newLead) {
    throw new ApiError(400, "Lead could not be created");
  }

  // Step 4: Final response
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        customer: {
          customerId: customerResult.customerId,
          uuid: customerResult.uuid,
          isExisting: customerResult.isExisting,
          message: customerResult.message,
        },
        lead: newLead,
      },
      "Lead created successfully",
    ),
  );
});

const listLeads = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 13;

  const role = req.user.role;
  const city = req.user.city;

  let cities = [];

  if (role === "BDM") {
    cities = ["Patna", "Delhi"];
  } else {
    cities = [city];
  }

  const leadsData = await getLeads(page, limit, cities);

  if (!leadsData || leadsData.leads.length === 0) {
    throw new ApiError(404, "Lead data not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, leadsData, "Leads fetched successfully"));
});

const updateLeadByIdController = asyncHandler(async (req, res) => {
  const leadId = req.params.id;
  const updateData = req.body;

  if (!leadId) {
    throw new ApiError(400, null, "Lead ID is required");
  }

  const updatedUser = await updateLeadById(leadId, updateData);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

const craetetUnwantedLead = asyncHandler(async (req, res) => {
  const { lead_id, status, reason } = req.body;

  if (!lead_id || !status || !reason) {
    throw new ApiError(400, "All fields required");
  }

  const unwantedData = await createUnwantedLead(data);

  if (!unwantedData) {
    throw new ApiError(404, " unwantedData is not created");
  }

  res.status(201).json(new ApiResponse(201, "Unwanted move successfully"));
});

export const searchCustomerController = asyncHandler(async (req, res) => {
  const { search = "" } = req.query;

  const result = await searchCustomers({ search: search.trim() });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Customers fetched successfully"));
});

export const getAllCustomersController = asyncHandler(async (req, res) => {
  const result = await getAllCustomers();

  return res
    .status(200)
    .json(new ApiResponse(200, result, "All customers fetched successfully"));
});

export {
  createLeads,
  listLeads,
  updateLeadByIdController,
  craetetUnwantedLead,
};
