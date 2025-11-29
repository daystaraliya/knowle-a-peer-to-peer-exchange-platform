import multer from "multer";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";

// Ensure the temp directory exists
const dir = "./public/temp";
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedAudioTypes = ['audio/webm', 'audio/mpeg', 'audio/mp4', 'audio/ogg'];

    if (file.fieldname === 'avatar' && allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
    } else if (file.fieldname === 'audio' && allowedAudioTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, "Invalid file type. Only specific image and audio formats are allowed."), false);
    }
};

export const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 
            // 5 MB for avatars
            // 20 MB for audio recordings
            5 * 1024 * 1024
    }
});