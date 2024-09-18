import { Express } from "express";
import { CommentsController } from "./comments_controller";

export class CommentsRouter {
  private baseEndpoint = "/api/comments";

  constructor(app: Express) {
    const controller = new CommentsController();

    app
      .route(this.baseEndpoint)
      .get(controller.getAllHandler)
      .post(controller.addHandler);

    app
      .route(this.baseEndpoint + "/:id")
      .get(controller.getDetailsHandler)
      .put(controller.updateHandler)
      .delete(controller.deleteHandler);
  }
}
