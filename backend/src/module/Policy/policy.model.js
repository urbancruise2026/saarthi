import { pool } from "../../config/mySqlDB.js";

export const insertPolicy = async (data) => {
  const query = `
    INSERT INTO policies
    (
      title,
      category,
      description,
      fileUrl,
      version,
      lastUpdated,
      status,
      hr_head_status,
      hr_head_remark,
      sho_status,
      sho_remark,
      policy1
      
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    data.title,
    data.category,
    data.description,
    data.fileUrl || null,
    data.version || "1.0",
    data.lastUpdated || new Date(),
    data.status || "pending",

    // HR Head
    "pending",
    null,

    // SHO
    "pending",
    null,

    // Policy fields
    data.policy1 || null,
  ];

  const [result] = await pool.execute(query, values);

  return result.insertId;
};
export const updateShoApproval = async ({ id, sho_status, sho_remark }) => {
  const query = `
    UPDATE policies 
    SET sho_status = ?, sho_remark = ?
    WHERE id = ?
  `;

  await pool.execute(query, [sho_status, sho_remark || null, id]);

  const [rows] = await pool.execute(
    `SELECT hr_head_status, sho_status FROM policies WHERE id = ?`,
    [id],
  );

  const policy = rows[0];

  let finalStatus = "pending";

  if (
    policy.hr_head_status === "approved" &&
    policy.sho_status === "approved"
  ) {
    finalStatus = "active";
  }

  if (
    policy.hr_head_status === "rejected" ||
    policy.sho_status === "rejected"
  ) {
    finalStatus = "inactive";
  }

  // Step 4: Update final status
  await pool.execute(`UPDATE policies SET status = ? WHERE id = ?`, [
    finalStatus,
    id,
  ]);

  return {
    id,
    sho_status,
    finalStatus,
  };
};

export const updateHrApproval = async ({
  id,
  hr_head_status,
  hr_head_remark,
}) => {
  console.log("id", id, "hr_head_status", hr_head_status, "hr_head_remark");
  if (!id || !hr_head_status) {
    throw new Error("ID and status are required");
  }

  if (hr_head_status === "rejected" && !hr_head_remark) {
    throw new Error("Remark is required when rejecting");
  }

  const finalRemark = hr_head_status === "rejected" ? hr_head_remark : null;

  const query = `
    UPDATE policies 
    SET hr_head_status = ?, hr_head_remark = ?
    WHERE id = ?
  `;

  await pool.execute(query, [hr_head_status ?? null, finalRemark, id]);

  return {
    id,
    hr_head_status: hr_head_status,
    hr_head_remark: finalRemark,
  };
};

// Get Policies with Pagination
export const getPolicies = async (category = "all") => {
  let query = `SELECT * FROM policies`;
  let values = [];

  if (category !== "all") {
    query += ` WHERE category = ?`;
    values.push(category);
  }

  query += ` ORDER BY created_at DESC`;

  const [rows] = await pool.execute(query, values);

  return rows;
};

export const getAllPolicies = async ({ page = 1, limit = 10, category }) => {
  const offset = (page - 1) * limit;

  let query = `SELECT * FROM policies`;
  let values = [];

  if (category) {
    query += ` WHERE category = ?`;
    values.push(category);
  }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  values.push(Number(limit), Number(offset));

  // MySQL 8 rejects LIMIT/OFFSET bound as prepared-statement parameters (MariaDB allowed it),
  // so this paginated query uses pool.query, which sends the numbers inline.
  const [rows] = await pool.query(query, values);

  return rows;
};

// Get Policy By ID
export const getPolicyById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT * FROM policies WHERE id = ? LIMIT 1`,
    [id],
  );

  return rows[0];
};

// Check Duplicate Policy
export const findPolicyByTitle = async (title) => {
  const [rows] = await pool.execute(
    `SELECT id FROM policies WHERE title = ? LIMIT 1`,
    [title],
  );

  return rows[0];
};

// Update Policy
export const updatePolicy = async (id, data) => {
  const query = `
    UPDATE policies
    SET title=?, category=?, description=?, fileUrl=?, version=?, lastUpdated=?, status=?
    WHERE id=?
  `;

  const values = [
    data.title,
    data.category,
    data.description,
    data.fileUrl,
    data.version,
    data.lastUpdated,
    data.status,
    id,
  ];

  const [result] = await pool.execute(query, values);

  return result.affectedRows;
};

// Delete Policy
export const deletePolicy = async (id) => {
  const [result] = await pool.execute(`DELETE FROM policies WHERE id = ?`, [
    id,
  ]);

  return result.affectedRows;
};
