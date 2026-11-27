// middlewares/multer.middleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Ensure folder exists
const uploadPath = "./public/temp";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ Storage config (images, pdf aur video sab ke liye same)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// ✅ File filter (only images + pdf)  -- pehle jaisa hi
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, PDF files are allowed"), false);
  }
};

// ✅ Export upload (images + pdf, 5MB)  -- pehle jaisa hi, kuch change nahi
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// ======================================================
// 🎥 NEW: Training video upload
// ======================================================

// ✅ File filter (only videos)
const videoFileFilter = (req, file, cb) => {
  const allowedVideoTypes = [
    "video/mp4",
    "video/quicktime", // .mov
    "video/webm",
    "video/x-matroska", // .mkv
    "video/x-msvideo", // .avi
  ];

  if (allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only MP4, MOV, WEBM, MKV, AVI videos are allowed"), false);
  }
};

// ✅ Export uploadVideo (100MB - Cloudinary free plan limit)
export const uploadVideo = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// ======================================================
// 📊 NEW: Training file upload (Video + PPT dono)
// ======================================================

const PPT_EXT = /\.(pptx?|ppsx?)$/i;

const trainingFileFilter = (req, file, cb) => {
  const isVideo = file.mimetype.startsWith("video/");
  // PPT ka MIME type browsers me alag-alag aata hai, isliye extension se check
  const isPpt = PPT_EXT.test(file.originalname);

  if (isVideo || isPpt) {
    cb(null, true);
  } else {
    cb(new Error("Only video or PPT/PPTX files are allowed"), false);
  }
};

// ✅ Export uploadTrainingFile (max 100MB; PPT ki 20MB limit controller me check hoti hai)
export const uploadTrainingFile = multer({
  storage,
  fileFilter: trainingFileFilter,
  limits: {
    fileSize: 400 * 1024 * 1024,
  },
});
