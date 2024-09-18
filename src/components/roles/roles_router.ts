import { Express } from "express";
import { RoleController } from "./role_controller";

export class RolesRouter {
  private baseEndpoint = "/api/roles";

  constructor(app: Express) {
    const controller = new RoleController();

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
