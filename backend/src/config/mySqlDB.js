import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
const IST_TIMEZONE = "+05:30";
const poolConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: IST_TIMEZONE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10_000,
};

if (process.env.DB_SOCKET_PATH) {
  poolConfig.socketPath = process.env.DB_SOCKET_PATH;
} else {
  poolConfig.host = process.env.DB_HOST;
  poolConfig.port = Number(process.env.DB_PORT) || 3306;
}

console.log("[MySQL] connecting with:", {
  host: poolConfig.host,
  port: poolConfig.port,
  socketPath: poolConfig.socketPath,
  user: poolConfig.user,
  database: poolConfig.database,
  hasPassword: Boolean(poolConfig.password),
  passwordLength: poolConfig.password?.length ?? 0,
});

export const pool = mysql.createPool(poolConfig);

export const connectMySQL = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    console.log("✅ MySQL Connected Successfully!");
    connection.release();
  } catch (err) {
    console.error("❌ MySQL Connection Failed:", {
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      message: err.message,
    });
    throw err;
  }
};
