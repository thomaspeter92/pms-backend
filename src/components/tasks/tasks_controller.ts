import { Request, Response } from "express";
import { hasPermission } from "../../utils/auth_util";
import { TasksService } from "./tasks_service";
import { ProjectsUtil } from "../projects/projects_controller";
import { UsersUtil } from "../users/users_controller";

export class TaskController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req?.user?.rights, "add_task")) {
      res
        .status(403)
        .send({ statusCode: 403, status: "error", message: "Unauthorised" });
      return;
    }

    try {
      let service = new TasksService();
      const task = req.body;

      // Project util ensures the project ID is valid
      const isValidProject = await ProjectsUtil.checkValidProjectIds([
        task?.project_id,
      ]);
      if (!isValidProject) {
        res.status(400).json({
          statusCode: 400,
          status: "error",
          message: "Invalid project_id",
        });
        return;
      }

      // Check user is valid and in the DB
      const isValidUser = await UsersUtil.checkValidUserIds([task.user_id]);
      if (!isValidUser) {
        res.status(400).json({
          statusCode: 400,
          status: "error",
          message: "Invalid user id",
        });
        return;
      }

      // If all is valid, create task
      const result = await service.create(task);
      res.status(200).json(result);
    } catch (error) {
      console.error(`Error while adding a new task`, error.message);
      res.status(500).json({
        statusCode: 500,
        status: "error",
        message: "Internal server error",
      });
    }
  }

  public async getAllHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, "get_all_tasks")) {
      res
        .status(403)
        .send({ statusCode: 403, status: "error", message: "Unauthorised" });
    }

    const service = new TasksService();
    const result = await service.findAll(req.query);
    res.status(200).json(result);

    return;
  }

  public async getDetailsHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, "get_details_task")) {
      res.status(403).send({
        statusCode: 403,
        status: "error",
        message: "Unauthorised",
      });
    }
    console.log(req.params.id);

    const service = new TasksService();
    const result = await service.findOne(req.params.id);
    res.status(200).json(result);
  }

  public async updateHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user?.rights, "edit_task")) {
      res.status(403).send({
        statusCode: 403,
        status: "error",
        message: "Unauthorised",
      });
    }
    const task = req.body;
    const service = new TasksService();
    const result = await service.update(req.params.id, task);
    res.status(result.statusCode).json(result);

    return;
  }

  public async deleteHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req?.user?.rights, "delete_task")) {
      res.status(403).send({
        statusCode: 403,
        status: "error",
        message: "Unauthorised",
      });
      return;
    }
    const service = new TasksService();
    const result = await service.delete(req.params.id);
    res.status(result.statusCode).json(result);
  }
}
