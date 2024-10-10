import { Express } from "express";
import { body } from "express-validator";
import { ProjectsController } from "./projects_controller";
import { checkValidDate } from "../../utils/common";
import { authorize } from "../../utils/auth_util";
import { validate } from "../../utils/validator";

const validProjectInput = [
  body("name").trim().notEmpty().withMessage("Porject name required"),
  body("user_ids").isArray().withMessage("List of user_ids required"),
  body("start_time").custom((value) => {
    if (!checkValidDate(value)) {
      throw new Error("Invalid start date format");
    }
    const startTime = new Date(value);
    const currentTime = new Date();
    if (startTime <= currentTime) {
      throw new Error("Start time must be in the future");
    }
    return true;
  }),
  body("end_time").custom((value, { req }) => {
    if (!checkValidDate(value)) {
      throw new Error("Invalid end date format");
    }
    const startTime = new Date(req.body.start_time);
    const endTime = new Date(value);
    if (endTime <= startTime) {
      throw new Error("End time cannot be before start time");
    }
    return true;
  }),
];

export class ProjectsRouter {
  private baseEndpoint = "/api/projects";

  constructor(app: Express) {
    const controller = new ProjectsController();

    app
      .route(this.baseEndpoint)
      .all(authorize)
      .get(controller.getAllHandler)
      .post(validate(validProjectInput), controller.addHandler);

    app
      .route(this.baseEndpoint + "/:id")
      .get(controller.getDetailsHandler)
      .put(controller.updateHandler)
      .delete(controller.deleteHandler);
  }
}
