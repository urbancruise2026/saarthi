

import axios from "axios";

const BASE_URL =
  process.env.ETIMEOFFICE_BASE_URL || "https://api.etimeoffice.com/api";

const OFFICE_CONFIGS = {
  delhi: {
    corporateId: process.env.ETIMEOFFICE_CORPORATE_ID,
    username: process.env.ETIMEOFFICE_USERNAME,
    password: process.env.ETIMEOFFICE_PASSWORD,
  },
  mumbai: {
    corporateId: process.env.ETIMEOFFICE_MUMBAI_CORPORATE_ID,
    username: process.env.ETIMEOFFICE_MUMBAI_USERNAME,
    password: process.env.ETIMEOFFICE_MUMBAI_PASSWORD,
  },
};

const getAuthHeader = (creds) => {
  const raw = `${creds.corporateId}:${creds.username}:${creds.password}:True`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
};

export const getLatestPunches = async (officeKey, lastRecord) => {
  const creds = OFFICE_CONFIGS[officeKey];
  if (!creds) throw new Error(`Unknown office: ${officeKey}`);

  try {
    const response = await axios.get(`${BASE_URL}/DownloadLastPunchData`, {
      params: {
        Empcode: "ALL",
        LastRecord: lastRecord,
      },
      headers: {
        Authorization: getAuthHeader(creds),
        "Content-Type": "application/json",
      },
    });

    const data = response.data;
    if (data.Error) {
      throw new Error(data.Msg || "etimeoffice API returned an error");
    }
    return data;
  } catch (err) {
    if (err.response) {
      console.error(
        `[etimeoffice:${officeKey}] API error ${err.response.status}:`,
        err.response.data,
      );
    } else {
      console.error(`[etimeoffice:${officeKey}] Request failed:`, err.message);
    }
    throw err;
  }
};
