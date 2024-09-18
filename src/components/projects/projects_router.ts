import { Express } from "express";
import { ProjectsController } from "./projects_controller";

export class ProjectsRouter {
  private baseEndpoint = "/api/projects";

  constructor(app: Express) {
    const controller = new ProjectsController();

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
