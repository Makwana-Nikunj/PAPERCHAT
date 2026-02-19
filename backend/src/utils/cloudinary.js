// utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

const deleteLocalFile = (filePath) => {
    try {
        const normalizedPath = path.normalize(filePath);
        if (fs.existsSync(normalizedPath)) {
            fs.unlinkSync(normalizedPath);
            console.log("Local file deleted:", normalizedPath);
        }
    } catch (err) {
        console.error("Error deleting local file:", err.message);
    }
};

export const uploadOnCloudinary = async (
    localFilePath,
    resourceType = "auto",
    folder = ""
) => {
    try {
        if (!localFilePath) return null;

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: resourceType,
            folder: folder || undefined
        });

        // Delete local file after successful upload
        deleteLocalFile(localFilePath);

        return response;
    } catch (error) {
        // Delete local file even if upload fails
        deleteLocalFile(localFilePath);
        throw error;
    }
};

export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    try {
        if (!publicId) return null;
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });

        return response;
    } catch (error) {
        throw error;
    }
};