import { pool } from "../../config/mySqlDB.js";
import { generateUUID } from "../../utils/uuid.js";

export const LEAD_TABLE = "leads";

export const LEAD_COLUMNS = {
  ID: "id",
  UUID: "uuid",
  DATE: "date",
  ENQUIRY_TIME: "enquiryTime",
  NAME: "customerName",
  PHONE: "customerPhone",
  EMAIL: "customerEmail",
  COMPANY_NAME: "companyName",
  SOURCE: "source",
  TELESALES: "telecaller",
  STATUS: "status",
  CUSTOMER_TYPE: "customerType",
  CUSTOMER_CATEGORY_TYPE: "customerCategoryType",
  SERVICE_TYPE: "serviceType",
  VEHICLE_CATEGORY1: "category1",
  VEHICLE_TYPE: "vehicles",
  VEHICLE_CATEGORY2: "category2",
  REQUIREMENT_VEHICLE: "requirementVehicle",
  OCCASION_TYPE: "occasion",
  PICKUP_DATETIME: "pickupDateTime",
  DROP_DATETIME: "dropDateTime",
  DAYS: "days",
  PICKUP_ADDRESS: "pickupAddress",
  DROP_ADDRESS: "dropAddress",
  PASSENGER_TOTAL: "passengerTotal",
  PETS_NUMBER: "petsNumber",
  PETS_NAMES: "petsNames",
  KM: "km",
  SMALL_BAGGAGE: "smallBaggage",
  MEDIUM_BAGGAGE: "mediumBaggage",
  LARGE_BAGGAGE: "largeBaggage",
  AIRPORT_BAGGAGE: "airportBaggage",
  TOTAL_BAGGAGE: "totalBaggage",
  ITINERARY: "itinerary",
  TRIP_TYPE: "tripType",
  REMARKS: "remarks",
  MESSAGE: "message",
  DROP_CITY: "dropcity",
  PICKUP_CITY: "pickupcity",
  LOST_REASON: "lost_reason",
  CITY: "city",
  ALTERNATE_PHONE: "alternatePhone",
  COUNTRY_NAME: "countryName",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
};

// export const insertLead = async (data) => {
//   try {
//     const {
//       customer_id,

//       date,
//       enquiryTime,
//       source,
//       telecaller,
//       status,
//       serviceType,
//       category1,
//       vehicles,
//       category2,
//       requirementVehicle,
//       occasion,
//       pickupDateTime,
//       dropDateTime,
//       days,
//       pickupAddress,
//       dropAddress,
//       passengerTotal,
//       petsNumber,
//       petsNames,
//       km,
//       smallBaggage,
//       mediumBaggage,
//       largeBaggage,
//       airportBaggage,
//       totalBaggage,
//       itinerary,
//       tripType,
//       remarks,
//       message,
//       dropcity,
//       pickupcity,
//       lost_reason,
//       city,
//     } = data;

//     const leadUuid = generateUUID();

//     const values = [
//       leadUuid,
//       customer_id || null,
//       date || null,
//       enquiryTime || null,
//       source || null,
//       telecaller || null,
//       status || null,
//       serviceType || null,
//       category1 || null,
//       vehicles || null,
//       category2 || null,
//       requirementVehicle || null,
//       occasion || null,
//       pickupDateTime || null,
//       dropDateTime || null,
//       days || 0,
//       pickupAddress || null,
//       dropAddress || null,
//       passengerTotal || 0,
//       petsNumber || 0,
//       petsNames || null,
//       km || "0",
//       smallBaggage || 0,
//       mediumBaggage || 0,
//       largeBaggage || 0,
//       airportBaggage || 0,
//       totalBaggage || 0,
//       itinerary ? JSON.stringify(itinerary) : null,
//       tripType || null,
//       remarks || null,
//       message || null,
//       dropcity || null,
//       pickupcity || null,
//       lost_reason || null,
//       city || null,
//     ];

//     const sql = `
//       INSERT INTO ${LEAD_TABLE} (
//         ${LEAD_COLUMNS.UUID},
//         ${LEAD_COLUMNS.CUSTOMER_ID},
//         ${LEAD_COLUMNS.DATE},
//         ${LEAD_COLUMNS.ENQUIRY_TIME},
//         ${LEAD_COLUMNS.SOURCE},
//         ${LEAD_COLUMNS.TELESALES},
//         ${LEAD_COLUMNS.STATUS},
//         ${LEAD_COLUMNS.SERVICE_TYPE},
//         ${LEAD_COLUMNS.VEHICLE_CATEGORY1},
//         ${LEAD_COLUMNS.VEHICLE_TYPE},
//         ${LEAD_COLUMNS.VEHICLE_CATEGORY2},
//         ${LEAD_COLUMNS.REQUIREMENT_VEHICLE},
//         ${LEAD_COLUMNS.OCCASION_TYPE},
//         ${LEAD_COLUMNS.PICKUP_DATETIME},
//         ${LEAD_COLUMNS.DROP_DATETIME},
//         ${LEAD_COLUMNS.DAYS},
//         ${LEAD_COLUMNS.PICKUP_ADDRESS},
//         ${LEAD_COLUMNS.DROP_ADDRESS},
//         ${LEAD_COLUMNS.PASSENGER_TOTAL},
//         ${LEAD_COLUMNS.PETS_NUMBER},
//         ${LEAD_COLUMNS.PETS_NAMES},
//         ${LEAD_COLUMNS.KM},
//         ${LEAD_COLUMNS.SMALL_BAGGAGE},
//         ${LEAD_COLUMNS.MEDIUM_BAGGAGE},
//         ${LEAD_COLUMNS.LARGE_BAGGAGE},
//         ${LEAD_COLUMNS.AIRPORT_BAGGAGE},
//         ${LEAD_COLUMNS.TOTAL_BAGGAGE},
//         ${LEAD_COLUMNS.ITINERARY},
//         ${LEAD_COLUMNS.TRIP_TYPE},
//         ${LEAD_COLUMNS.REMARKS},
//         ${LEAD_COLUMNS.MESSAGE},
//         ${LEAD_COLUMNS.DROP_CITY},
//         ${LEAD_COLUMNS.PICKUP_CITY},
//         ${LEAD_COLUMNS.LOST_REASON},
//         ${LEAD_COLUMNS.CITY}
//       ) VALUES (${values.map(() => "?").join(", ")})
//     `;

//     const [result] = await pool.execute(sql, values);

//     return {
//       success: true,
//       id: result.insertId,
//       uuid: leadUuid,
//       customer_id,
//       status,
//       serviceType,
//     };
//   } catch (error) {
//     console.error("Insert Lead Error:", error);
//     throw error;
//   }
// };

export const findLeadByUUID = async (uuid) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM ${LEAD_TABLE} WHERE ${LEAD_COLUMNS.UUID} = ?`,
      [uuid],
    );

    return rows[0] || null;
  } catch (error) {
    console.error("Find Lead Error:", error);
    throw error;
  }
};

export const getLeads = async (page = 1, limit = 15, cities = []) => {
  try {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    if (isNaN(pageNumber) || pageNumber < 1)
      throw new Error("Invalid page number");
    if (isNaN(limitNumber) || limitNumber < 1)
      throw new Error("Invalid limit number");

    const offset = (pageNumber - 1) * limitNumber;

    let whereClause = "";

    if (cities && Array.isArray(cities) && cities.length > 0) {
      const validCities = cities.filter(
        (city) => typeof city === "string" && city.trim(),
      );
      if (validCities.length > 0) {
        const escapedCities = validCities.map(
          (city) => `'${city.replace(/'/g, "''")}'`,
        );
        whereClause = `WHERE city IN (${escapedCities.join(",")})`;
      }
    }

    const sql = `SELECT * FROM leads 
                 ${whereClause} 
                 ORDER BY created_at DESC 
                 LIMIT ${limitNumber} OFFSET ${offset}`;

    const [rows] = await pool.query(sql);

    const countSql = `SELECT COUNT(*) as count FROM leads ${whereClause}`;
    const [totalRows] = await pool.query(countSql);

    const total = totalRows[0] ? totalRows[0].count : 0;

    return {
      leads: rows,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
    };
  } catch (error) {
    console.error("getLeads error:", error);
    throw error;
  }
};

export const updateLeadById = async (leadId, data) => {
  try {
    const fieldsToExclude = ["created_at", "id", "uuid"];
    fieldsToExclude.forEach((field) => {
      delete data[field];
    });

    const dateFields = ["enquiryTime", "pickupDateTime", "dropDateTime"];
    dateFields.forEach((field) => {
      if (data[field]) {
        data[field] = new Date(data[field]).toISOString().split("T")[0];
      }
    });

    if (Object.keys(data).length === 0) {
      return { affectedRows: 0 };
    }

    const setFields = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(", ");

    const values = Object.values(data);

    const [result] = await pool.execute(
      `UPDATE leads SET ${setFields}, updated_at = NOW() WHERE id = ?`,
      [...values, leadId],
    );

    return result;
  } catch (error) {
    console.error("updateUserById error:", error);
    throw error;
  }
};

export const createUnwantedLead = async (data) => {
  try {
    if (!["wanted", "unwanted"].includes(data.status)) {
      throw new Error("Invalid status value");
    }

    const fields = Object.keys(data).join(", ");
    const placeholders = Object.keys(data)
      .map(() => "?")
      .join(", ");

    const values = Object.values(data);

    const [result] = await pool.execute(
      `INSERT INTO unwanted_leads (${fields}) VALUES (${placeholders})`,
      values,
    );

    return result;
  } catch (error) {
    console.error("create UnwantedLead error:", error);
    throw error;
  }
};

export const createCustomers = async (data) => {
  try {
    // Dynamic duplicate check
    let checkSql = `
      SELECT id, uuid, customerName, customerPhone, customerEmail
      FROM customers
      WHERE customerPhone = ?
    `;

    const params = [data.customerPhone];

    if (data.customerEmail) {
      checkSql += ` OR customerEmail = ?`;
      params.push(data.customerEmail);
    }

    checkSql += ` LIMIT 1`;

    const [existing] = await pool.execute(checkSql, params);

    // If customer already exists
    if (existing.length > 0) {
      return {
        success: true,
        isExisting: true,
        message: "Customer already exists",
        customerId: existing[0].id,
        uuid: existing[0].uuid,
        existingCustomer: existing[0],
      };
    }

    // Create new customer
    const customerUuid = generateUUID();

    const insertSql = `
      INSERT INTO customers (
        uuid,
        customerName,
        customerPhone,
        customerEmail,
        companyName,
        customerType,
        customerCategoryType,
         alternatePhone,
        countryName,
        customerCity
        address,
        date_of_birth,
        anniversary,
        gender,
        state,
        pincode,
       
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      customerUuid,
      data.customerName || null,
      data.customerPhone || null,
      data.customerEmail || null,
      data.companyName || null,
      data.customerType || null,
      data.customerCategoryType || null,
      data.alternatePhone || null,
      data.countryName || null,
      data.customerCity || null,
      data.address || null,
      data.date_of_birth || null,
      data.anniversary || null,
      data.gender || null,
      data.state || null,
      data.pincode || null,
    ];

    const [result] = await pool.execute(insertSql, values);

    return {
      success: true,
      isExisting: false,
      message: "Customer created successfully",
      customerId: result.insertId,
      uuid: customerUuid,
    };
  } catch (error) {
    console.error("Create Customer Error:", error);
    throw error;
  }
};

export const insertLead = async (data) => {
  try {
    const {
      customer_id, // 👈 add this

      date,
      enquiryTime,
      customerName,

      source,
      telecaller,
      status,

      serviceType,
      vehicle2,
      vehicles,
      vehicle3,
      requirementVehicle,
      occasion,
      pickupDateTime,
      dropDateTime,
      days,
      pickupAddress,
      dropAddress,
      passengerTotal,
      petsNumber,
      petsNames,
      km,
      smallBaggage,
      mediumBaggage,
      largeBaggage,
      airportBaggage,
      totalBaggage,
      itinerary,
      tripType,
      remarks,
      message,
      dropcity,
      pickupcity,
      lost_reason,

      city,

      vehicle1Quantity,
      vehicle2Quantity,
      vehicle3Quantity,
    } = data;

    const leadUuid = generateUUID();

    // STRING SAFE
    const safe = (v) => (v === "" || v === undefined ? null : v);

    // INTEGER SAFE
    const int = (v) => Number(v) || 0;

    const values = [
      leadUuid,
      int(customer_id), // 👈 add here

      safe(date),
      safe(enquiryTime),

      safe(source),
      safe(telecaller),
      safe(status),

      safe(serviceType),
      safe(vehicle2),
      safe(vehicles),
      safe(vehicle3),
      safe(requirementVehicle),
      safe(occasion),
      safe(pickupDateTime),
      safe(dropDateTime),

      int(days),

      safe(pickupAddress),
      safe(dropAddress),

      int(passengerTotal),
      int(petsNumber),

      safe(petsNames),

      int(km),

      int(smallBaggage),
      int(mediumBaggage),
      int(largeBaggage),
      int(airportBaggage),
      int(totalBaggage),

      itinerary && Array.isArray(itinerary) ? JSON.stringify(itinerary) : null,

      safe(tripType),
      safe(remarks),
      safe(message),
      safe(dropcity),
      safe(pickupcity),
      safe(lost_reason),

      safe(city),

      int(vehicle1Quantity),
      int(vehicle2Quantity),
      int(vehicle3Quantity),
    ];

    const sql = `
      INSERT INTO ${LEAD_TABLE} (
        ${LEAD_COLUMNS.UUID},
        ${LEAD_COLUMNS.CUSTOMER_ID}, -- 👈 add this

        ${LEAD_COLUMNS.DATE},
        ${LEAD_COLUMNS.ENQUIRY_TIME},

        ${LEAD_COLUMNS.SOURCE},
        ${LEAD_COLUMNS.TELESALES},
        ${LEAD_COLUMNS.STATUS},

        ${LEAD_COLUMNS.SERVICE_TYPE},
        ${LEAD_COLUMNS.VEHICLE_vehicle2},
        ${LEAD_COLUMNS.VEHICLE_TYPE},
        ${LEAD_COLUMNS.VEHICLE_vehicle3},
        ${LEAD_COLUMNS.REQUIREMENT_VEHICLE},
        ${LEAD_COLUMNS.OCCASION_TYPE},
        ${LEAD_COLUMNS.PICKUP_DATETIME},
        ${LEAD_COLUMNS.DROP_DATETIME},
        ${LEAD_COLUMNS.DAYS},
        ${LEAD_COLUMNS.PICKUP_ADDRESS},
        ${LEAD_COLUMNS.DROP_ADDRESS},
        ${LEAD_COLUMNS.PASSENGER_TOTAL},
        ${LEAD_COLUMNS.PETS_NUMBER},
        ${LEAD_COLUMNS.PETS_NAMES},
        ${LEAD_COLUMNS.KM},
        ${LEAD_COLUMNS.SMALL_BAGGAGE},
        ${LEAD_COLUMNS.MEDIUM_BAGGAGE},
        ${LEAD_COLUMNS.LARGE_BAGGAGE},
        ${LEAD_COLUMNS.AIRPORT_BAGGAGE},
        ${LEAD_COLUMNS.TOTAL_BAGGAGE},
        ${LEAD_COLUMNS.ITINERARY},
        ${LEAD_COLUMNS.TRIP_TYPE},
        ${LEAD_COLUMNS.REMARKS},
        ${LEAD_COLUMNS.MESSAGE},
        ${LEAD_COLUMNS.DROP_CITY},
        ${LEAD_COLUMNS.PICKUP_CITY},
        ${LEAD_COLUMNS.LOST_REASON},

        ${LEAD_COLUMNS.CITY},

        ${LEAD_COLUMNS.VEHICLE1QUANTITY},
        ${LEAD_COLUMNS.VEHICLE2QUANTITY},
        ${LEAD_COLUMNS.VEHICLE3QUANTITY}
      )
      VALUES (${values.map(() => "?").join(", ")})
    `;

    const [result] = await pool.execute(sql, values);

    return {
      success: true,
      id: result.insertId,
      uuid: leadUuid,
      customer_id, // 👈 return this also
      status,
      serviceType,
    };
  } catch (error) {
    console.error("Insert Lead Error:", error);
    throw error;
  }
};

export const searchCustomers = async ({ search }) => {
  try {
    const searchTerm = `%${search || ""}%`;

    const sql = `
      SELECT 
        id,
        uuid,
        customerName,
        customerPhone,
        customerEmail,
        companyName,
        customerType,
        customerCategoryType,
        alternatePhone,
        countryName,
        customerCity,
        address,
        date_of_birth,
        anniversary,
        gender,
        state,
        pincode
      FROM customers
      WHERE 
        customerName    LIKE ? OR
        customerPhone   LIKE ? OR
        companyName     LIKE ?
      ORDER BY customerName ASC
    `;

    const [rows] = await pool.execute(sql, [
      searchTerm,
      searchTerm,
      searchTerm,
    ]);

    return { customers: rows };
  } catch (error) {
    console.error("Search Customer Error:", error);
    throw error;
  }
};


export const getAllCustomers = async () => {
  try {
    const sql = `
      SELECT 
        id,
        uuid,
        customerName,
        customerPhone,
        customerEmail,
        companyName,
        customerType,
        customerCategoryType,
        alternatePhone,
        countryName,
        customerCity,
        address,
        date_of_birth,
        anniversary,
        gender,
        state,
        pincode
      FROM customers
      ORDER BY customerName ASC
    `;

    const [rows] = await pool.execute(sql);

    return { customers: rows };
  } catch (error) {
    console.error("Get All Customers Error:", error);
    throw error;
  }
};
