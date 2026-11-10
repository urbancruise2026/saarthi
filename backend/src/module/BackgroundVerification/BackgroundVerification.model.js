import { pool } from "../../config/mySqlDB.js";

export const insertBackgroundVerification = async ({
  employee_id,
  overall_status,
  remarks,
  alternate_number,
  contact_number,
  criminal_record,
  current_address,
  education_proof,
  father_contact,

  identity_proof,
  mother_contact,

  permanent_address,
  previous_employment,
  reference_check,
}) => {
  const query = `
    INSERT INTO background_verification (
      employee_id,
      overall_status,
      remarks,
      alternate_number,
      contact_number,
      criminal_record,
      current_address,
      education_proof,
      father_contact,
    
      identity_proof,
      mother_contact,

      permanent_address,
      previous_employment,
      reference_check
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,  ?, ?,  ?, ?, ?)
  `;

  const values = [
    employee_id,
    overall_status || null,
    remarks || null,
    alternate_number || null,
    contact_number || null,
    criminal_record || null,
    current_address || null,
    education_proof || null,
    father_contact || null,

    identity_proof || null,
    mother_contact || null,

    permanent_address || null,
    previous_employment || null,
    reference_check || null,
  ];

  const [result] = await pool.execute(query, values);

  return result.insertId;
};

export const getVerificationByEmployeeId = async (employee_id) => {
  const query = `
    SELECT id FROM background_verification 
    WHERE employee_id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(query, [employee_id]);
  return rows[0] || null;
};

export const getBackgroundVerifications = async ({
  page = 1,
  limit ,
  employee_id = null,
  overall_status = null,
} = {}) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];

  if (employee_id) {
    conditions.push("bv.employee_id = ?");
    values.push(employee_id);
  }

  if (overall_status) {
    conditions.push("bv.overall_status = ?");
    values.push(overall_status);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `
    SELECT COUNT(*) as total 
    FROM background_verification bv
    JOIN uc_staff_profile u ON u.id = bv.employee_id
    ${whereClause}
  `;
  const [countRows] = await pool.execute(countQuery, values);
  const total = countRows[0].total;

  const dataQuery = `
    SELECT 
      bv.id,
      bv.employee_id,
      u.firstName AS fullName,        
      bv.overall_status,
      bv.remarks,
      bv.alternate_number,
      bv.contact_number,
      bv.criminal_record,
      bv.current_address,
      bv.education_proof,
      bv.father_contact,
      bv.identity_proof,
      bv.mother_contact,
      bv.permanent_address,
      bv.previous_employment,
      bv.reference_check,
      bv.created_at,
      bv.updated_at
    FROM background_verification bv
    JOIN uc_staff_profile u ON u.id = bv.employee_id
    ${whereClause}
    ORDER BY bv.created_at DESC
    LIMIT ? OFFSET ?
  `;

  // MySQL 8 rejects LIMIT/OFFSET bound as prepared-statement parameters (MariaDB allowed it),
  // so this paginated query uses pool.query, which sends the numbers inline.
  const [rows] = await pool.query(dataQuery, [...values, Number(limit), Number(offset)]);

  return {
    data: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};
