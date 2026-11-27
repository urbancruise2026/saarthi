// utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const removeLocalFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error("Temp file delete error:", err);
  }
};

/**
 * Purana code waisa hi chalega: uploadOnCloudinary(path)
 * Naya: uploadOnCloudinary(path, { folder: "hrms/training/sales/telesales", resourceType: "video" | "raw" })
 */
const uploadOnCloudinary = async (localFilePath, options = {}) => {
  const {
    folder = "hrms/employees",
    resourceType = "auto",
    extra = {},
  } = options;

  try {
    if (!localFilePath) {
      console.error("No local file path provided.");
      return null;
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
      folder,
      ...extra, // e.g. { use_filename: true, unique_filename: true }
    });

    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  } finally {
    removeLocalFile(localFilePath); // success ho ya fail, temp file hata do
  }
};

// Video delete karne ke liye
const deleteFromCloudinary = async (publicId, resourceType = "video") => {
  try {
    if (!publicId) return null;
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
