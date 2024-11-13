import { BaseController } from "../../utils/base_controller";
import { uploadFile } from "../../utils/multer";
import { Request, Response } from "express";
import { Files } from "./files_entity";
import { FilesService } from "./files_service";
import { IServerConfig } from "utils/config";
import config from "../../../server_config.json";

export class FilesController extends BaseController {
  // TODO: Add the file_id to tasks-->supported_files?
  public async addHandler(req: Request, res: Response) {
    try {
      const fileDataFromMulter = uploadFile(req);
      const service = new FilesService();
      const fileData = new Files();
      fileData.file_name = fileDataFromMulter.filename;
      fileData.mime_type = fileDataFromMulter.mimetype;
      fileData.created_by = req?.user?.user_id ? req?.user?.user_id : null;
      fileData.task_id = req.body?.task_id;
      let db = await service.create(fileData);
      console.log(db);
      res
        .status(200)
        .json({ message: "File upload success", status: "success", fileData });
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .send({ statusCode: 400, status: "error", message: error.message });
    }
  }

  public async getOneHandler(req: Request, res: Response) {
    try {
      const service = new FilesService();
      const server_config: IServerConfig = config;
      const result = await service.findOne(req.params.id);

      const file_path = `${server_config.attached_files_url}/${result.data.file_name}`;
      res.sendFile(file_path, (err) => {
        if (err) {
          console.error("Error sending file", err);
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(200).end();
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: error, status: "error" });
    }
  }

  public async getAllHandler(req: Request, res: Response) {}
  public async updateHandler(req: Request, res: Response) {}
  public async deleteHandler(req: Request, res: Response) {}
}
