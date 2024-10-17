import { Express } from "express";
import { TaskController } from "./tasks_controller";
import { body } from "express-validator";
import { checkValidDate } from "../../utils/common";
import { validate } from "../../utils/validator";
import { authorize } from "../../utils/auth_util";

const validTaskInput = [
  body("name").trim().notEmpty().withMessage("Task name is required"),
  body("project_id").trim().notEmpty().withMessage("Project ID is required"),
  body("user_id").trim().notEmpty().withMessage("User ID is required"),
  body("estimated_start_time")
    .trim()
    .notEmpty()
    .withMessage("Start time is required"),
  body("estimated_end_time")
    .trim()
    .notEmpty()
    .withMessage("End time is required"),
  body("estimated_start_time").custom((val) => {
    if (!checkValidDate(val)) {
      throw new Error("Invalid date format YYYY-MM-DD HH:mm:ss");
    }
    const startTime = new Date(val);
    const currentTime = new Date();
    if (startTime <= currentTime) {
      throw new Error("Start time must be in the future");
    }
    return true;
  }),
  body("estimated_end_time").custom((val, { req }) => {
    if (!checkValidDate(val)) {
      throw new Error("Invalid date format YYYY-MM-DD HH:mm:ss");
    }
    const startTime = new Date(req.body.start_time);
    const endTime = new Date();
    if (endTime <= startTime) {
      throw new Error("End time must be later than start time");
    }
    return true;
  }),
];

const updateTaskInput = [
  body("estimated_start_time").custom((val, { req }) => {
    if (!checkValidDate(val)) {
      throw new Error("Invalid date format YYYY-MM-DD HH:mm:ss");
    }
    const startTime = new Date(val);
    const currentTime = new Date();
    if (startTime <= currentTime) {
      throw new Error("Start time must be in the future");
    }
    return true;
  }),
  body("estimated_end_time").custom((val, { req }) => {
    if (!checkValidDate(val)) {
      throw new Error("Invalid date format YYYY-MM-DD HH:mm:ss");
    }
    const startTime = new Date(req.body.start_time);
    const endTime = new Date();
    if (endTime <= startTime) {
      throw new Error("End time must be later than start time");
    }
    return true;
  }),
];

export class TasksRouter {
  private baseEndpoint = "/api/tasks";

  constructor(app: Express) {
    const controller = new TaskController();

    app
      .route(this.baseEndpoint)
      .all(authorize)
      .get(controller.getAllHandler)
      .post(validate(validTaskInput), controller.addHandler);

    app
      .route(this.baseEndpoint + "/:id")
      .all(authorize)
      .get(controller.getDetailsHandler)
      .put(validate(updateTaskInput), controller.updateHandler)
      .delete(controller.deleteHandler);
  }
}
