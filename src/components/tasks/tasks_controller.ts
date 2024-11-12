import { Request, Response } from "express";
import { hasPermission } from "../../utils/auth_util";
import { TasksService } from "./tasks_service";
import { ProjectsUtil } from "../projects/projects_controller";
import { UsersUtil } from "../users/users_controller";
import { NotificationUtil } from "../../utils/notification_util";
import { Projects } from "components/projects/projects_entity";
import { Tasks } from "./tasks_entity";

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

      const project = await ProjectsUtil.getProjectByProjectId(task.project_id);

      const isValidProject = project ? true : false;

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
      console.log(result);
      await TasksUtil.notifyUsers(project, task, "add");
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
    const project = await ProjectsUtil.getProjectByProjectId(task.project_id);
    res.status(result.statusCode).json(result);
    await TasksUtil.notifyUsers(project, task, "update");
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

    // Add notification to delete task? If so, need to pull task first based on the provided ID, to pass to the notify function.
  }
}

export class TasksUtil {
  public static async notifyUsers(
    project: Projects,
    task: Tasks,
    action: "add" | "update" | "delete"
  ) {
    if (project) {
      const userIds = project.user_ids;
      let subject: string, body: string;
      if (action === "add") {
        subject = "New Task Created";
        body = `A new task has been created with the title: ${task.name}`;
      } else if (action === "update") {
        subject = "Task Updated";
        body = `A new task has been updated with the title: ${task.name}`;
      } else if (action === "delete") {
        subject = "Task Deleted";
        body = `A task has been deleted with the title: ${task.name}`;
      }
      for (const userId of userIds) {
        const user = await UsersUtil.getUserById(userId);
        if (user) {
          await NotificationUtil.enqueueEmail(user.email, subject, body);
        }
      }
    }
  }
}
