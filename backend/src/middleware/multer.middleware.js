import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../public/temp");

// Ensure upload directory exists (fixes ENOENT on Render deploys)
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    const imageExt = [".jpg", ".jpeg", ".png", ".webp"];

    // For any other field, check if it's a valid image
    if (imageExt.includes(ext)) {
        return cb(null, true);
    }

    // Reject if not a valid image or video
    return cb(new Error(`Invalid file format for field: ${file.fieldname}`), false);
}

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit for video files
    }
});