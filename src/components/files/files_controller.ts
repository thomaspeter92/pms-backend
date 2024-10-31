import { BaseController } from "../../utils/base_controller";
import { uploadFile } from "../../utils/multer";
import { Request, Response } from "express";
import { Files } from "./files_entity";
import { FilesService } from "./files_service";

export class FilesController extends BaseController {
  public async addHandler(req: Request, res: Response) {
    try {
      const fileDataFromMulter = uploadFile(req);
      const service = new FilesService();
      const fileData = new Files();
      fileData.file_name = fileDataFromMulter.filename;
      fileData.mime_type = fileDataFromMulter.mimetype;
      fileData.created_by = req?.user?.user_id ? req?.user?.user_id : null;
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

  public async getAllHandler(req: Request, res: Response) {}
  public async getOneHandler(req: Request, res: Response) {}
  public async updateHandler(req: Request, res: Response) {}
  public async deleteHandler(req: Request, res: Response) {}
}
