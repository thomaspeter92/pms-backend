import { ProjectMemberController } from "./project_member_controller";
import { Express } from "express";
import { authorize } from "../../utils/auth_util";
import { validate } from "../../utils/validator";

export class ProjectMemberRouter {
  private baseEndpoint = "/api/project-members";

  constructor(app: Express) {
    const controller = new ProjectMemberController();

    app
      .route(this.baseEndpoint)
      .all(authorize)
      .get(controller.getAllHander)
      .post(controller.addHandler);

    app
      .route(this.baseEndpoint + "/:id")
      .all(authorize)
      .delete(controller.deleteHandler);
  }
}
