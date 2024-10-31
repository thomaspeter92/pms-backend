import { Express } from "express";
import { FilesController } from "./files_controller";
import { authorize } from "../../utils/auth_util";
import { fileUploadMiddleware } from "../../utils/multer";

// TO_DO: Need to add validator for file uplaod request
// const validFileInput = [
//   ];

export class FilesRouter {
  private baseEndpoint = "/api/files";

  constructor(app: Express) {
    const controller = new FilesController();

    app
      .route(this.baseEndpoint)
      .all(authorize)
      .post(fileUploadMiddleware, controller.addHandler);
  }
}
