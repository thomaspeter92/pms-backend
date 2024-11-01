import { Express } from "express";
import { FilesController } from "./files_controller";
import { authorize } from "../../utils/auth_util";
import { fileUploadMiddleware } from "../../utils/multer";
import { body } from "express-validator";
import { validate } from "../../utils/validator";
// TO_DO: Need to add validator for file uplaod request
const validFileInput = [
  body("task_id").trim().notEmpty().withMessage("Task ID is required"),
];

export class FilesRouter {
  private baseEndpoint = "/api/files";

  constructor(app: Express) {
    const controller = new FilesController();

    app.route(this.baseEndpoint).all(authorize).post(
      // validate(validFileInput),
      fileUploadMiddleware,
      controller.addHandler
    );

    app
      .route(this.baseEndpoint + "/:id")
      .all(authorize)
      .get(controller.getOneHandler);
  }
}
