import { Express } from "express";
import { CommentsController } from "./comments_controller";
import { authorize } from "../../utils/auth_util";
import { body } from "express-validator";
import { validate } from "../../utils/validator";

const validCommentsInput = [
  body("comment").trim().notEmpty().withMessage("Comment is required"),
  // body("user_id").trim().notEmpty().withMessage("User ID is required"),
  body("task_id").trim().notEmpty().withMessage("Task Id is required"),
];

export class CommentsRouter {
  private baseEndpoint = "/api/comments";

  constructor(app: Express) {
    const controller = new CommentsController();

    app
      .route(this.baseEndpoint)
      .all(authorize)
      .get(controller.getAllHandler)
      .post(validate(validCommentsInput), controller.addHandler);

    app
      .route(this.baseEndpoint + "/:id")
      .all(authorize)
      .get(controller.getDetailsHandler)
      .put(controller.updateHandler)
      .delete(controller.deleteHandler);
  }
}
