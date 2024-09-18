import { Express } from "express";
import { UsersController } from "./users_controller";

export class UsersRouter {
  private baseEndpoint = "/api/users";

  constructor(app: Express) {
    const controller = new UsersController();

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
