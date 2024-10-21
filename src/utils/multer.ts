import { Request } from "express";
import multer from "multer";
import { IServerConfig } from "./config";
import * as config from "../../server_config.json";

export const multerConfig = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const server_config: IServerConfig = config;
      cb(null, server_config.attached_files_path);
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
