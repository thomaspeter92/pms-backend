import { Request } from "express";
import multer from "multer";
import { IServerConfig } from "./config";
import * as config from "../../server_config.json";

export const multerConfig = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const server_config: IServerConfig = config;
      cb(null, "/Users/thomasbuckley/Desktop/pms-backend/attachedFiles");
    },
    filename: (req, file, cb) => {
      const uniqueFileName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueFileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only, jpeg, png, pdf allowed."), false);
    }
  },
};

const upload = multer(multerConfig);

// Export multer middleware
export const fileUploadMiddleware = upload.single("file");

export const uploadFile = (req: Request) => {
  console.log(req.file);
  if (!req.file) {
    throw new Error("No file provided");
  }
  const fileData = req.file;
  return fileData;
};
